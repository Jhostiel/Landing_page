import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateClientConfirmationEmailHtml, generateAdminNotificationEmailHtml } from './src/emailTemplates';
import { LeadData, AgencySiteConfig } from './src/types';
import { DEFAULT_AGENCY_CONFIG } from './src/adminDefaults';

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CONFIG_FILE = path.join(DATA_DIR, 'agency_config.json');
const LOGS_FILE = path.join(DATA_DIR, 'notification_logs.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers to read/write persistent files
function getStoredLeads(): LeadData[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading leads file:', err);
  }
  return [];
}

function saveStoredLeads(leads: LeadData[]) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving leads file:', err);
  }
}

function getStoredConfig(): AgencySiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return DEFAULT_AGENCY_CONFIG;
}

function saveStoredConfig(config: AgencySiteConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config file:', err);
  }
}

function logNotificationServer(item: any) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    }
    logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...item,
    });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving notification log:', e);
  }
}

// Google Workspace Token & Gmail API dispatch
let serverWorkspaceToken: string | null = null;
let serverWorkspaceEmail: string | null = 'infinityimpactagency@gmail.com';

async function sendViaGmailApi(token: string, to: string, subject: string, html: string) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: "Infinity Impact Agency" <infinityimpactagency@gmail.com>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    html,
  ];
  const message = messageParts.join('\r\n');
  const raw = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API HTTP ${res.status}: ${errText}`);
  }
  return await res.json();
}

// Nodemailer transport setup
async function createMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || 'infinityimpactagency@gmail.com').trim();
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

  if (pass) {
    if (host.includes('gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // If no SMTP_PASS provided, create an ethereal test account for local dev / preview fallback
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (e) {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
    });
  }
}

// Function to send confirmation and alert emails
async function dispatchBookingEmails(lead: LeadData, agencyConfig: AgencySiteConfig, req: Request) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  const confirmUrl = `${baseUrl}/?action=confirm_booking&id=${lead.id}&email=${encodeURIComponent(lead.email)}`;
  const adminUrl = `${baseUrl}/#/admind`;
  const meetingLink = agencyConfig.notifications.customMeetingLink || 'https://meet.google.com/infinity-impact-call';

  const clientHtml = generateClientConfirmationEmailHtml({
    lead,
    agencyConfig,
    confirmUrl,
    meetingLink,
  });

  const adminHtml = generateAdminNotificationEmailHtml({
    lead,
    agencyConfig,
    confirmUrl,
    meetingLink,
    adminUrl,
  });

  let clientEmailSent = false;
  let adminEmailSent = false;
  let clientPreviewUrl: string | undefined;

  try {
    const fromAddress = process.env.SMTP_FROM || `"${agencyConfig.agencyName}" <infinityimpactagency@gmail.com>`;
    const adminEmail = agencyConfig.notifications.adminEmail || 'infinityimpactagency@gmail.com';

    // A. Priority 1: Send via official Google Workspace / Gmail API if authenticated
    if (serverWorkspaceToken) {
      try {
        if (lead.email) {
          await sendViaGmailApi(
            serverWorkspaceToken,
            lead.email,
            `✅ Confirmación: Tu Llamada Estratégica con ${agencyConfig.agencyName}`,
            clientHtml
          );
          clientEmailSent = true;
          logNotificationServer({
            type: 'client_confirmation',
            recipient: lead.email,
            title: `Confirmación enviada (Gmail API) a ${lead.name}`,
            message: `Correo oficial con branding enviado desde infinityimpactagency@gmail.com a ${lead.email}`,
            status: 'enviado',
            leadId: lead.id,
          });
        }

        if (adminEmail) {
          await sendViaGmailApi(
            serverWorkspaceToken,
            adminEmail,
            `🔔 [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || 'Nuevo Cliente'} (${lead.date} ${lead.timeSlot} hrs)`,
            adminHtml
          );
          adminEmailSent = true;
          logNotificationServer({
            type: 'admin_alert',
            recipient: adminEmail,
            title: `Alerta enviada a ${adminEmail}`,
            message: `Cita agendada por ${lead.name} enviada directamente a la bandeja de ${adminEmail}`,
            status: 'enviado',
            leadId: lead.id,
          });
        }

        return {
          clientEmailSent,
          adminEmailSent,
          confirmUrl,
        };
      } catch (gmailErr: any) {
        console.warn('Gmail API dispatch encountered an issue, trying SMTP transporter:', gmailErr.message);
      }
    }

    // B. Priority 2: Send via SMTP Transporter (smtp.gmail.com:465)
    const transporter = await createMailTransporter();

    // 1. Send to Client
    if (lead.email) {
      const clientInfo = await transporter.sendMail({
        from: fromAddress,
        to: lead.email,
        subject: `✅ Confirmación: Tu Llamada Estratégica con ${agencyConfig.agencyName}`,
        html: clientHtml,
      });

      clientEmailSent = true;
      const preview = nodemailer.getTestMessageUrl(clientInfo);
      if (preview) {
        clientPreviewUrl = preview;
      }

      logNotificationServer({
        type: 'client_confirmation',
        recipient: lead.email,
        title: `Confirmación enviada a ${lead.name}`,
        message: `Correo oficial enviado desde infinityimpactagency@gmail.com con botón de confirmación.`,
        status: 'enviado',
        leadId: lead.id,
      });
    }

    // 2. Send to Admin
    if (adminEmail) {
      await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject: `🔔 [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || 'Nuevo Cliente'} (${lead.date} ${lead.timeSlot} hrs)`,
        html: adminHtml,
      });

      adminEmailSent = true;
      logNotificationServer({
        type: 'admin_alert',
        recipient: adminEmail,
        title: `Alerta: Cita agendada por ${lead.name}`,
        message: `Lead ${lead.businessName || lead.name} enviado a la bandeja de ${adminEmail}.`,
        status: 'enviado',
        leadId: lead.id,
      });
    }
  } catch (err: any) {
    console.error('Error in dispatchBookingEmails:', err);
    logNotificationServer({
      type: 'client_confirmation',
      recipient: lead.email,
      title: `Error al enviar correo a ${lead.name}`,
      message: `Detalle: ${err.message || String(err)}`,
      status: 'error',
      leadId: lead.id,
    });
  }

  return {
    clientEmailSent,
    adminEmailSent,
    clientPreviewUrl,
    confirmUrl,
  };
}

async function startServer() {
  app.use(express.json());

  // -------------------------------------------------------------
  // API ROUTES (MUST COME FIRST BEFORE VITE)
  // -------------------------------------------------------------

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', agency: 'Infinity Impact Agency', timestamp: Date.now() });
  });

  // Get all leads
  app.get('/api/leads', (req: Request, res: Response) => {
    const leads = getStoredLeads();
    res.json({ leads });
  });

  // Create new booking / lead and auto-dispatch emails
  app.post('/api/leads', async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        phone,
        businessName,
        businessCategory,
        serviceInterest,
        notes,
        date,
        timeSlot,
      } = req.body;

      if (!name || !email || !date || !timeSlot) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, email, fecha u horario)' });
      }

      const leads = getStoredLeads();
      const config = getStoredConfig();

      const newLead: LeadData = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        email,
        phone: phone || '',
        businessName: businessName || '',
        businessCategory: businessCategory || 'General',
        serviceInterest: serviceInterest || 'INFINITY GROWTH',
        notes: notes || '',
        date,
        timeSlot,
        status: 'agendado',
        createdAt: Date.now(),
        sentEmail: false,
        adminNotified: false,
      };

      // Dispatch real email with confirmation button
      const emailResult = await dispatchBookingEmails(newLead, config, req);
      newLead.sentEmail = emailResult.clientEmailSent;
      newLead.adminNotified = emailResult.adminEmailSent;

      leads.unshift(newLead);
      saveStoredLeads(leads);

      res.status(201).json({
        success: true,
        lead: newLead,
        emailSent: emailResult.clientEmailSent,
        adminNotified: emailResult.adminEmailSent,
        clientPreviewUrl: emailResult.clientPreviewUrl,
        confirmUrl: emailResult.confirmUrl,
      });
    } catch (err: any) {
      console.error('Error creating lead:', err);
      res.status(500).json({ error: err.message || 'Error al agendar la llamada' });
    }
  });

  // Confirm booking (triggered when client clicks "CONFIRMAR MI CITA" in email)
  app.post('/api/leads/:id/confirm', (req: Request, res: Response) => {
    const { id } = req.params;
    const leads = getStoredLeads();
    const leadIndex = leads.findIndex((l) => l.id === id);

    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Update status to 'confirmado'
    leads[leadIndex].status = 'confirmado' as any;
    (leads[leadIndex] as any).confirmedAt = Date.now();
    saveStoredLeads(leads);

    const lead = leads[leadIndex];
    logNotificationServer({
      type: 'client_confirmation',
      recipient: lead.email,
      title: `✅ Cita Confirmada por el Cliente: ${lead.name}`,
      message: `El cliente ${lead.name} (${lead.businessName || 'Empresa'}) confirmó su asistencia desde el correo para el ${lead.date} a las ${lead.timeSlot} hrs.`,
      status: 'enviado',
      leadId: lead.id,
    });

    res.json({
      success: true,
      message: 'Cita confirmada con éxito por el cliente',
      lead,
    });
  });

  // Update lead (status, notes, etc)
  app.patch('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const leads = getStoredLeads();
    const leadIndex = leads.findIndex((l) => l.id === id);

    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    leads[leadIndex] = { ...leads[leadIndex], ...updates };
    saveStoredLeads(leads);

    res.json({ success: true, lead: leads[leadIndex] });
  });

  // Delete all leads / clear database
  app.delete('/api/leads', (req: Request, res: Response) => {
    saveStoredLeads([]);
    res.json({ success: true, count: 0 });
  });

  // Delete lead
  app.delete('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    let leads = getStoredLeads();
    leads = leads.filter((l) => l.id !== id);
    saveStoredLeads(leads);
    res.json({ success: true });
  });

  // Resend confirmation email to client
  app.post('/api/leads/:id/resend', async (req: Request, res: Response) => {
    const { id } = req.params;
    const leads = getStoredLeads();
    const lead = leads.find((l) => l.id === id);

    if (!lead) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const config = getStoredConfig();
    const result = await dispatchBookingEmails(lead, config, req);

    res.json({
      success: true,
      message: `Correo de confirmación reenviado a ${lead.email}`,
      result,
    });
  });

  // Preview full HTML email in browser
  app.get('/api/preview-email/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const leads = getStoredLeads();
    const lead = leads.find((l) => l.id === id) || {
      id: 'demo_lead',
      name: 'Carlos Mendoza',
      email: 'carlos@tuempresa.com',
      phone: '+56 9 1234 5678',
      businessName: 'Clínica San Lucas',
      businessCategory: 'Salud / Estética',
      serviceInterest: 'INFINITY GROWTH',
      notes: 'Queremos automatizar el agendamiento y confirmación de citas 24/7.',
      date: '2026-09-08',
      timeSlot: '11:00',
      status: 'agendado',
      createdAt: Date.now(),
    };

    const config = getStoredConfig();
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const confirmUrl = `${baseUrl}/?action=confirm_booking&id=${lead.id}&email=${encodeURIComponent(lead.email)}`;
    const meetingLink = config.notifications.customMeetingLink || 'https://meet.google.com/infinity-impact-call';

    const html = generateClientConfirmationEmailHtml({
      lead,
      agencyConfig: config,
      confirmUrl,
      meetingLink,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Agency Config GET / POST
  app.get('/api/config', (req: Request, res: Response) => {
    res.json({ config: getStoredConfig() });
  });

  // Sync Google Workspace token from Admin Dashboard
  app.post('/api/workspace/sync-token', (req: Request, res: Response) => {
    const { token, email } = req.body;
    if (token) {
      serverWorkspaceToken = token;
      serverWorkspaceEmail = email || 'infinityimpactagency@gmail.com';
      console.log(`[Workspace API] Google Workspace token synced for ${serverWorkspaceEmail}`);
      res.json({ success: true, message: 'Google Workspace token sincronizado para envíos de correo en vivo.' });
    } else {
      res.status(400).json({ error: 'Token no proporcionado' });
    }
  });

  // Check email configuration delivery status
  // Check email configuration delivery status
  app.get('/api/email-config-status', (req: Request, res: Response) => {
    const config = getStoredConfig();
    const hasSmtpPass = !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
    const hasWorkspaceToken = !!serverWorkspaceToken;
    res.json({
      senderEmail: 'infinityimpactagency@gmail.com',
      adminRecipient: config.notifications?.adminEmail || 'infinityimpactagency@gmail.com',
      hasSmtpPass,
      hasWorkspaceToken,
      mode: hasWorkspaceToken ? 'gmail_oauth_api' : (hasSmtpPass ? 'gmail_smtp_live' : 'sandbox_preview'),
    });
  });

  app.post('/api/config', (req: Request, res: Response) => {
    const newConfig = req.body;
    saveStoredConfig(newConfig);
    res.json({ success: true, config: newConfig });
  });

  // Notification logs
  app.get('/api/logs', (req: Request, res: Response) => {
    try {
      if (fs.existsSync(LOGS_FILE)) {
        const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
        return res.json({ logs });
      }
    } catch (e) {
      console.error(e);
    }
    res.json({ logs: [] });
  });

  // Test email endpoint
  app.post('/api/test-email', async (req: Request, res: Response) => {
    try {
      const config = getStoredConfig();
      const targetEmail = req.body.email || config.notifications.adminEmail || 'infinityimpactagency@gmail.com';
      const hasSmtpPass = !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
      const hasWorkspaceToken = !!serverWorkspaceToken;

      const htmlContent = `
        <div style="background-color: #07090e; padding: 30px; font-family: sans-serif; color: #ffffff; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid #1e293b;">
          <h2 style="color: #06b6d4; margin-top: 0;">⚡ Prueba de Envío Exitosa</h2>
          <p>Este es un correo de prueba enviado desde <strong>${config.agencyName}</strong> (infinityimpactagency@gmail.com).</p>
          <p>Cada vez que cualquier cliente reserve una cita, el sistema enviará en automático la confirmación con sus datos y botón interactivo directamente a la dirección de correo ingresada por el cliente.</p>
          <div style="margin-top: 20px; padding: 12px; background: #121824; border-radius: 8px; font-size: 12px; color: #10b981;">
            ✓ Destinatario de esta prueba: <strong>${targetEmail}</strong><br/>
            ✓ Modo de entrega: ${hasWorkspaceToken ? 'Google Workspace API (En Vivo)' : (hasSmtpPass ? 'Gmail SMTP Autenticado (En Vivo)' : 'Sandbox de Previsualización')}
          </div>
        </div>
      `;

      // 1. If Google Workspace token active, send via Gmail API
      if (serverWorkspaceToken) {
        try {
          await sendViaGmailApi(
            serverWorkspaceToken,
            targetEmail,
            `🔔 [PRUEBA EN VIVO] Sistema de Envío de ${config.agencyName}`,
            htmlContent
          );
          return res.json({
            success: true,
            deliveredLive: true,
            message: `Correo de prueba entregado en vivo a ${targetEmail} vía Google Workspace API`,
          });
        } catch (apiErr: any) {
          console.warn('Test send via Gmail API failed, trying SMTP transporter:', apiErr.message);
        }
      }

      // 2. SMTP Transporter
      const transporter = await createMailTransporter();
      const fromAddress = process.env.SMTP_FROM || `"${config.agencyName}" <infinityimpactagency@gmail.com>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject: `🔔 [PRUEBA OFICIAL] Sistema de Envío de ${config.agencyName}`,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      res.json({
        success: true,
        deliveredLive: hasSmtpPass,
        message: hasSmtpPass
          ? `Correo de prueba entregado en vivo a ${targetEmail} vía Gmail SMTP.`
          : `Correo generado para ${targetEmail} (en modo sandbox/previsualización).`,
        previewUrl,
        mode: hasSmtpPass ? 'live' : 'sandbox',
      });
    } catch (err: any) {
      console.error('Test email error:', err);
      res.status(500).json({ error: err.message || 'Error al enviar correo de prueba' });
    }
  });

  // -------------------------------------------------------------
  // VITE / SPA MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
