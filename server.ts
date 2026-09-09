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
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const LOGS_FILE = path.join(DATA_DIR, 'notification_logs.json');
const WORKSPACE_TOKEN_FILE = path.join(DATA_DIR, 'workspace_token.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getStoredContent(): { services?: any[]; pricing?: any[] } | null {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading content file:', err);
  }
  return null;
}

function saveStoredContent(content: { services?: any[]; pricing?: any[] }) {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving content file:', err);
  }
}

function getStoredWorkspaceAuth(): { token: string | null; email: string | null } {
  try {
    if (fs.existsSync(WORKSPACE_TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(WORKSPACE_TOKEN_FILE, 'utf-8'));
      return {
        token: data.token || null,
        email: data.email || 'infinityimpactagency@gmail.com',
      };
    }
  } catch (e) {
    console.error('Error reading workspace token file:', e);
  }
  return { token: null, email: 'infinityimpactagency@gmail.com' };
}

function saveStoredWorkspaceAuth(token: string, email: string) {
  try {
    fs.writeFileSync(
      WORKSPACE_TOKEN_FILE,
      JSON.stringify({ token, email, updatedAt: Date.now() }, null, 2),
      'utf-8'
    );
  } catch (e) {
    console.error('Error saving workspace auth file:', e);
  }
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

// Google Workspace Token & Gmail/Calendar API dispatch
const initialAuth = getStoredWorkspaceAuth();
let serverWorkspaceToken: string | null = initialAuth.token;
let serverWorkspaceEmail: string | null = initialAuth.email || 'infinityimpactagency@gmail.com';

/**
 * Automatically schedules the confirmed strategy call in the Agency's Google Calendar.
 * Adds Google Meet conference details, reminders, and invites both client and agency.
 */
async function scheduleCallInGoogleCalendar(token: string, lead: LeadData, config: AgencySiteConfig) {
  const meetingLink = config?.notifications?.customMeetingLink || 'https://meet.google.com/inf-agen-impact';
  const durationMin = config?.hoursConfig?.slotDurationMinutes || 45;

  const startDateTime = `${lead.date}T${lead.timeSlot}:00`;
  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + durationMin * 60000);
  const timeZone = 'America/Bogota';
  const agencyCalendarId = 'infinityimpactagency@gmail.com';

  const eventPayload = {
    summary: `Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`,
    description: `Sesión Estratégica de Crecimiento y Automatización de Procesos con IA.\n\n👤 Cliente: ${lead.name}\n🏢 Empresa: ${lead.businessName || 'No indicada'}\n💼 Rubro: ${lead.businessCategory || 'General'}\n📱 WhatsApp: ${lead.phone}\n✉️ Email: ${lead.email}\n🎯 Servicio de Interés: ${lead.serviceInterest || 'Agentes de IA'}\n📹 Sala Google Meet: ${meetingLink}\n📝 Notas: ${lead.notes || 'Ninguna'}\n\n✅ Cita confirmada y sincronizada en Infinity Impact Agency.`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone,
    },
    location: meetingLink,
    attendees: [
      { email: 'infinityimpactagency@gmail.com', displayName: 'Infinity Impact Agency', responseStatus: 'accepted' },
      { email: lead.email, displayName: lead.name },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 día antes
        { method: 'popup', minutes: 15 },      // 15 minutos antes
      ],
    },
  };

  // 1. Try targeting infinityimpactagency@gmail.com directly
  let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(agencyCalendarId)}/events?sendUpdates=all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  // 2. If access to infinityimpactagency@gmail.com fails (404/403), fallback to primary calendar with agency as invitee
  if (!res.ok && (res.status === 404 || res.status === 403)) {
    console.log(`[Google Calendar] Notice: Direct insert to ${agencyCalendarId} returned ${res.status}. Falling back to primary calendar.`);
    res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${errText}`);
  }

  return await res.json();
}

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

    // 2. Send to Admin with official iCalendar (.ics) invite attachment
    if (adminEmail) {
      const formatIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const startIso = `${lead.date}T${lead.timeSlot}:00`;
      const startDate = new Date(startIso);
      const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
      const endDate = new Date(startDate.getTime() + durationMin * 60000);

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Infinity Impact Agency//Booking System//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:infinity_${lead.id}@infinityimpactagency.com`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(startDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        `SUMMARY:Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`,
        `DESCRIPTION:Sesión Estratégica de Crecimiento con IA.\\nCliente: ${lead.name}\\nEmpresa: ${lead.businessName || 'No indicada'}\\nWhatsApp: ${lead.phone}\\nEmail: ${lead.email}\\nServicio: ${lead.serviceInterest || 'Consultoría IA'}\\nSala Meet: ${meetingLink}`,
        `LOCATION:${meetingLink}`,
        'ORGANIZER;CN=Infinity Impact Agency:mailto:infinityimpactagency@gmail.com',
        'ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Infinity Impact:mailto:infinityimpactagency@gmail.com',
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${lead.name}:mailto:${lead.email}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Recordatorio de Llamada Estratégica IA',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject: `🔔 [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || 'Nuevo Cliente'} (${lead.date} ${lead.timeSlot} hrs)`,
        html: adminHtml,
        icalEvent: {
          filename: `cita-${lead.id}.ics`,
          method: 'REQUEST',
          content: icsContent,
        },
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
  app.post('/api/leads/:id/confirm', async (req: Request, res: Response) => {
    const { id } = req.params;
    const leads = getStoredLeads();
    const leadIndex = leads.findIndex((l) => l.id === id);

    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Update status to 'confirmado'
    leads[leadIndex].status = 'confirmado' as any;
    leads[leadIndex].confirmedAt = Date.now();

    const lead = leads[leadIndex];
    const config = getStoredConfig();
    let calendarScheduled = false;
    let calendarEventResult: any = null;

    // Automatically schedule in Google Calendar if Google Workspace is connected
    const activeToken = serverWorkspaceToken || getStoredWorkspaceAuth().token;
    if (activeToken) {
      try {
        calendarEventResult = await scheduleCallInGoogleCalendar(activeToken, lead, config);
        leads[leadIndex].syncedCalendar = true;
        leads[leadIndex].calendarEventId = calendarEventResult.id;
        leads[leadIndex].calendarEventLink = calendarEventResult.htmlLink;
        calendarScheduled = true;
        console.log(`[Google Calendar] Call scheduled automatically for ${lead.name} (${lead.date} ${lead.timeSlot}): ${calendarEventResult.htmlLink}`);
        
        logNotificationServer({
          type: 'calendar_event',
          recipient: lead.email,
          title: `📅 Agendado en Google Calendar: ${lead.name}`,
          message: `La videollamada ha sido agendada automáticamente en el Google Calendar de la agencia para el ${lead.date} a las ${lead.timeSlot} hrs. Sala Meet vinculada.`,
          status: 'enviado',
          leadId: lead.id,
        });
      } catch (calErr: any) {
        console.warn('[Google Calendar Sync Warning]', calErr.message);
      }
    }

    saveStoredLeads(leads);

    logNotificationServer({
      type: 'client_confirmation',
      recipient: lead.email,
      title: `✅ Cita Confirmada por el Cliente: ${lead.name}`,
      message: `El cliente ${lead.name} (${lead.businessName || 'Empresa'}) confirmó su asistencia desde el correo para el ${lead.date} a las ${lead.timeSlot} hrs.${calendarScheduled ? ' (Agendada en Google Calendar)' : ''}`,
      status: 'enviado',
      leadId: lead.id,
    });

    res.json({
      success: true,
      message: 'Cita confirmada con éxito por el cliente',
      lead: leads[leadIndex],
      calendarScheduled,
      calendarLink: calendarEventResult?.htmlLink || null,
    });
  });

  // Explicitly schedule an existing lead to Google Calendar
  app.post('/api/leads/:id/schedule-calendar', async (req: Request, res: Response) => {
    const { id } = req.params;
    const leads = getStoredLeads();
    const leadIndex = leads.findIndex((l) => l.id === id);

    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const lead = leads[leadIndex];
    const config = getStoredConfig();
    const token = req.body.token || serverWorkspaceToken || getStoredWorkspaceAuth().token;

    if (!token) {
      return res.status(400).json({ error: 'No hay token de Google Workspace activo. Conecta tu cuenta en el panel de administración.' });
    }

    try {
      const calResult = await scheduleCallInGoogleCalendar(token, lead, config);
      leads[leadIndex].syncedCalendar = true;
      leads[leadIndex].calendarEventId = calResult.id;
      leads[leadIndex].calendarEventLink = calResult.htmlLink;
      saveStoredLeads(leads);

      logNotificationServer({
        type: 'calendar_event',
        recipient: lead.email,
        title: `📅 Sincronizado en Google Calendar: ${lead.name}`,
        message: `Llamada agendada exitosamente en Google Calendar para el ${lead.date} a las ${lead.timeSlot} hrs.`,
        status: 'enviado',
        leadId: lead.id,
      });

      res.json({ success: true, lead: leads[leadIndex], calendarLink: calResult.htmlLink });
    } catch (err: any) {
      console.error('Error scheduling in Google Calendar:', err);
      res.status(500).json({ error: err.message || 'Error al agendar en Google Calendar' });
    }
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
      saveStoredWorkspaceAuth(token, serverWorkspaceEmail);
      console.log(`[Workspace API] Google Workspace token synced and persisted for ${serverWorkspaceEmail}`);
      res.json({ success: true, message: 'Google Workspace token sincronizado para envíos y Google Calendar en vivo.' });
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

  // Services & Pricing Content GET / POST
  app.get('/api/content', (req: Request, res: Response) => {
    res.json({ content: getStoredContent() });
  });

  app.post('/api/content', (req: Request, res: Response) => {
    const content = req.body;
    saveStoredContent(content);
    res.json({ success: true, content });
  });

  // Persist settings directly into project source files so Git sees them in Pull Requests
  app.post('/api/admin/save-to-code', (req: Request, res: Response) => {
    try {
      const { config, services, pricing } = req.body;
      if (config) {
        saveStoredConfig(config);

        // Update src/adminDefaults.ts so DEFAULT_AGENCY_CONFIG has the current config
        const defaultsFilePath = path.join(process.cwd(), 'src', 'adminDefaults.ts');
        if (fs.existsSync(defaultsFilePath)) {
          const content = fs.readFileSync(defaultsFilePath, 'utf-8');
          const regex = /export const DEFAULT_AGENCY_CONFIG: AgencySiteConfig = \{[\s\S]*?\n\};/;
          const replacement = `export const DEFAULT_AGENCY_CONFIG: AgencySiteConfig = ${JSON.stringify(config, null, 2)};`;
          if (regex.test(content)) {
            const updated = content.replace(regex, replacement);
            fs.writeFileSync(defaultsFilePath, updated, 'utf-8');
            console.log('[Admin API] Updated src/adminDefaults.ts with new default agency configuration for Git/PR tracking.');
          }
        }
      }

      if (services || pricing) {
        saveStoredContent({ services, pricing });
      }

      res.json({
        success: true,
        message: '¡Configuración sincronizada exitosamente con los archivos del proyecto! Ahora aparecerá en tu repositorio de GitHub y en tus Pull Requests.',
      });
    } catch (err: any) {
      console.error('Error saving to code files:', err);
      res.status(500).json({ success: false, error: err?.message || 'Error guardando en archivos de código' });
    }
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
