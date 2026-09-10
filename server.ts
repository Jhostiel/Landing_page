import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateClientConfirmationEmailHtml, generateAdminNotificationEmailHtml } from './src/emailTemplates';
import { LeadData, AgencySiteConfig } from './src/types';
import { DEFAULT_AGENCY_CONFIG } from './src/adminDefaults';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS & Preflight handling
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON Body Parser at root level
app.use(express.json());

// Detect Vercel / serverless environment
const isVercel = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.AWS_LAMBDA_FUNCTION_NAME
);

// On Vercel, process.cwd() is read-only so /tmp must be used for dynamic file writing
const DATA_DIR = isVercel ? path.join('/tmp', 'infinity_data') : path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CONFIG_FILE = path.join(DATA_DIR, 'agency_config.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const LOGS_FILE = path.join(DATA_DIR, 'notification_logs.json');
const WORKSPACE_TOKEN_FILE = path.join(DATA_DIR, 'workspace_token.json');

// Ensure data folder exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Notice: DATA_DIR creation check:', e);
}

// In-memory fallbacks to guarantee 100% serverless resilience even if filesystem is read-only
let memoryLeads: LeadData[] = [];
let memoryConfig: AgencySiteConfig = DEFAULT_AGENCY_CONFIG;
let memoryContent: { services?: any[]; pricing?: any[] } | null = null;
let memoryLogs: any[] = [];
let memoryWorkspaceToken: { token: string | null; email: string | null } = {
  token: null,
  email: 'infinityimpactagency@gmail.com',
};

function getStoredContent(): { services?: any[]; pricing?: any[] } | null {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), 'data', 'content.json');
      if (fs.existsSync(bundled)) {
        return JSON.parse(fs.readFileSync(bundled, 'utf-8'));
      }
    }
  } catch (err) {
    console.error('Error reading content file:', err);
  }
  return memoryContent;
}

function saveStoredContent(content: { services?: any[]; pricing?: any[] }) {
  memoryContent = content;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: content saved to memory cache:', err);
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
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), 'data', 'workspace_token.json');
      if (fs.existsSync(bundled)) {
        const data = JSON.parse(fs.readFileSync(bundled, 'utf-8'));
        return {
          token: data.token || null,
          email: data.email || 'infinityimpactagency@gmail.com',
        };
      }
    }
  } catch (e) {
    console.error('Error reading workspace token file:', e);
  }
  return memoryWorkspaceToken;
}

function saveStoredWorkspaceAuth(token: string, email: string) {
  memoryWorkspaceToken = { token, email };
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      WORKSPACE_TOKEN_FILE,
      JSON.stringify({ token, email, updatedAt: Date.now() }, null, 2),
      'utf-8'
    );
  } catch (e) {
    console.warn('Notice: workspace auth saved to memory cache:', e);
  }
}

// Helpers to read/write persistent files
function getStoredLeads(): LeadData[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLeads = parsed;
        return parsed;
      }
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), 'data', 'leads.json');
      if (fs.existsSync(bundled)) {
        const data = fs.readFileSync(bundled, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryLeads = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading leads file:', err);
  }
  return memoryLeads;
}

function saveStoredLeads(leads: LeadData[]) {
  memoryLeads = leads;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: leads saved to memory cache:', err);
  }
}

function getStoredConfig(): AgencySiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        memoryConfig = { ...DEFAULT_AGENCY_CONFIG, ...parsed };
        return memoryConfig;
      }
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), 'data', 'agency_config.json');
      if (fs.existsSync(bundled)) {
        const data = fs.readFileSync(bundled, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          memoryConfig = { ...DEFAULT_AGENCY_CONFIG, ...parsed };
          return memoryConfig;
        }
      }
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return memoryConfig;
}

function saveStoredConfig(config: AgencySiteConfig) {
  memoryConfig = config;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice: config saved to memory cache:', err);
  }
}

function logNotificationServer(item: any) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    } else {
      logs = memoryLogs;
    }
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...item,
    };
    logs.unshift(newLog);
    memoryLogs = logs.slice(0, 100);
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(LOGS_FILE, JSON.stringify(memoryLogs, null, 2), 'utf-8');
    } catch (e) {
      // Ignored for serverless
    }
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

// Resend API Transport (ideal for Vercel / serverless deployments)
async function sendViaResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  options?: { fromName?: string; fromEmail?: string }
) {
  const fromName = options?.fromName || 'Infinity Impact Agency';
  // Use verified sender address or Resend onboarding sandbox
  const fromEmail = options?.fromEmail || process.env.RESEND_FROM || 'onboarding@resend.dev';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${errorBody}`);
  }
  return await res.json();
}

// Nodemailer transport setup (Gmail / Custom SMTP) with dual-port fallback (465 SSL, fallback 587 STARTTLS)
function createMailTransporter(agencyConfig?: AgencySiteConfig, forcePort?: number) {
  const host = process.env.SMTP_HOST || agencyConfig?.notifications?.smtpHost || 'smtp.gmail.com';
  const port = forcePort || (process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : (agencyConfig?.notifications?.smtpPort || 465));
  const user = (
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    agencyConfig?.notifications?.smtpUser ||
    'infinityimpactagency@gmail.com'
  ).trim();

  const rawPass =
    process.env.SMTP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    agencyConfig?.notifications?.smtpPass;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

  if (pass) {
    const isSecure = port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      pool: false,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    });
  }

  return null;
}

// Resilient mail sending: tries port 465 SSL first, then automatically falls back to 587 STARTTLS
async function sendMailWithRetry(mailOptions: any, agencyConfig?: AgencySiteConfig) {
  const transporter465 = createMailTransporter(agencyConfig, 465);
  if (!transporter465) {
    throw new Error('Credenciales SMTP no configuradas (falta SMTP_PASS o GMAIL_APP_PASSWORD).');
  }

  try {
    return await transporter465.sendMail(mailOptions);
  } catch (err465: any) {
    console.warn('[SMTP] Puerto 465 falló (' + err465.message + '), intentando puerto 587 STARTTLS de respaldo...');
    const transporter587 = createMailTransporter(agencyConfig, 587);
    if (transporter587) {
      return await transporter587.sendMail(mailOptions);
    }
    throw err465;
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
  let clientPreviewUrl: string | undefined = `/api/preview-email/${lead.id}`;
  let deliveryMethod = 'none';

  const fromAddress = process.env.SMTP_FROM || `"${agencyConfig.agencyName}" <infinityimpactagency@gmail.com>`;
  const adminEmail = agencyConfig.notifications.adminEmail || 'infinityimpactagency@gmail.com';

  const resendApiKey = process.env.RESEND_API_KEY || agencyConfig.notifications?.resendApiKey;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || agencyConfig.notifications?.smtpPass;

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
      }

      if (adminEmail) {
        await sendViaGmailApi(
          serverWorkspaceToken,
          adminEmail,
          `🔔 [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || 'Nuevo Cliente'} (${lead.date} ${lead.timeSlot} hrs)`,
          adminHtml
        );
        adminEmailSent = true;
      }

      deliveryMethod = 'google_workspace_api';
      logNotificationServer({
        type: 'client_confirmation',
        recipient: lead.email,
        title: `Confirmación enviada (Workspace API) a ${lead.name}`,
        message: `Correo oficial con branding enviado desde infinityimpactagency@gmail.com a ${lead.email}`,
        status: 'enviado',
        leadId: lead.id,
      });

      return {
        clientEmailSent,
        adminEmailSent,
        confirmUrl,
        clientPreviewUrl,
        deliveryMethod,
      };
    } catch (gmailErr: any) {
      console.warn('[Email Dispatch] Workspace API warning, evaluating fallbacks:', gmailErr.message);
    }
  }

  // B. Priority 2: Send via Resend API (HTTP REST, zero port restrictions on Vercel)
  if (resendApiKey) {
    try {
      if (lead.email) {
        await sendViaResend(
          resendApiKey,
          lead.email,
          `✅ Confirmación: Tu Llamada Estratégica con ${agencyConfig.agencyName}`,
          clientHtml,
          {
            fromName: agencyConfig.agencyName,
            fromEmail: agencyConfig.notifications?.resendFromEmail,
          }
        );
        clientEmailSent = true;
      }

      if (adminEmail) {
        await sendViaResend(
          resendApiKey,
          adminEmail,
          `🔔 [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || 'Nuevo Cliente'} (${lead.date} ${lead.timeSlot} hrs)`,
          adminHtml,
          {
            fromName: agencyConfig.agencyName,
            fromEmail: agencyConfig.notifications?.resendFromEmail,
          }
        );
        adminEmailSent = true;
      }

      deliveryMethod = 'resend_api';
      logNotificationServer({
        type: 'client_confirmation',
        recipient: lead.email,
        title: `Confirmación enviada (Resend API) a ${lead.name}`,
        message: `Correo oficial entregado a ${lead.email} y copia de alerta a ${adminEmail} vía Resend API.`,
        status: 'enviado',
        leadId: lead.id,
      });

      return {
        clientEmailSent,
        adminEmailSent,
        confirmUrl,
        clientPreviewUrl,
        deliveryMethod,
      };
    } catch (resendErr: any) {
      console.warn('[Email Dispatch] Resend API error:', resendErr.message);
    }
  }

  // C. Priority 3: Send via Gmail SMTP Transporter (Dual-Port 465 SSL / 587 STARTTLS)
  if (smtpPass) {
    try {
      // 1. Send to Client
      if (lead.email) {
        await sendMailWithRetry({
          from: fromAddress,
          to: lead.email,
          subject: `✅ Confirmación: Tu Llamada Estratégica con ${agencyConfig.agencyName}`,
          html: clientHtml,
        }, agencyConfig);
        clientEmailSent = true;

        logNotificationServer({
          type: 'client_confirmation',
          recipient: lead.email,
          title: `Confirmación enviada (Gmail SMTP) a ${lead.name}`,
          message: `Correo oficial enviado desde infinityimpactagency@gmail.com con botón interactivo de confirmación.`,
          status: 'enviado',
          leadId: lead.id,
        });
      }

      // 2. Send to Admin with official iCalendar (.ics) invite attachment
      if (adminEmail) {
        const formatIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const startIso = `${lead.date}T${lead.timeSlot}:00`;
        const startDate = new Date(startIso);
        const durationMin = agencyConfig.hoursConfig?.slotDurationMinutes || 45;
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

        await sendMailWithRetry({
          from: fromAddress,
          to: adminEmail,
          subject: `🔔 [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || 'Nuevo Cliente'} (${lead.date} ${lead.timeSlot} hrs)`,
          html: adminHtml,
          icalEvent: {
            filename: `cita-${lead.id}.ics`,
            method: 'REQUEST',
            content: icsContent,
          },
        }, agencyConfig);

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

      deliveryMethod = 'gmail_smtp';
    } catch (smtpErr: any) {
      console.error('[Email Dispatch] SMTP error:', smtpErr.message);
      logNotificationServer({
        type: 'client_confirmation',
        recipient: lead.email,
        title: `Error al enviar correo (SMTP): ${lead.name}`,
        message: `Fallo SMTP: ${smtpErr.message}`,
        status: 'error',
        leadId: lead.id,
      });
    }
  }

  // D. Webhook Dispatch (Zapier, Make, Google Apps Script, Discord, Telegram)
  const webhookUrl = process.env.WEBHOOK_URL || agencyConfig.notifications?.webhookUrl;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_booking',
          agency: agencyConfig.agencyName,
          lead,
          confirmUrl,
          meetingLink,
          deliveryMethod,
          timestamp: Date.now(),
        }),
      });
      console.log('[Email Dispatch] Webhook notification delivered to', webhookUrl);
    } catch (whErr: any) {
      console.warn('[Email Dispatch] Webhook notification failed:', whErr.message);
    }
  }

  if (!clientEmailSent && !adminEmailSent) {
    console.warn('[Email Dispatch] Notice: No active SMTP_PASS or RESEND_API_KEY configured.');
    logNotificationServer({
      type: 'client_confirmation',
      recipient: lead.email,
      title: `⚠️ Credenciales de correo no configuradas`,
      message: `La cita fue agendada pero no se pudo enviar correo en vivo porque falta SMTP_PASS o RESEND_API_KEY en Vercel o en /admind.`,
      status: 'pendiente_configuracion',
      leadId: lead.id,
    });
  }

  return {
    clientEmailSent,
    adminEmailSent,
    clientPreviewUrl,
    confirmUrl,
    deliveryMethod: clientEmailSent ? deliveryMethod : 'none',
  };
}

// -------------------------------------------------------------
// API ROUTES (MOUNTED DIRECTLY FOR STANDALONE & VERCEL SERVERLESS)
// -------------------------------------------------------------

  app.get(['/api/health', '/health'], (req: Request, res: Response) => {
    res.json({ status: 'ok', agency: 'Infinity Impact Agency', timestamp: Date.now() });
  });

  // Get all leads
  app.get(['/api/leads', '/leads'], (req: Request, res: Response) => {
    const leads = getStoredLeads();
    res.json({ leads });
  });

  // Create new booking / lead and auto-dispatch emails
  app.post(['/api/leads', '/leads'], async (req: Request, res: Response) => {
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
        deliveryMethod: emailResult.deliveryMethod,
      });
    } catch (err: any) {
      console.error('Error creating lead:', err);
      res.status(500).json({ error: err.message || 'Error al agendar la llamada' });
    }
  });

  // Confirm booking (triggered when client clicks "CONFIRMAR MI CITA" in email)
  app.post(['/api/leads/:id/confirm', '/leads/:id/confirm'], async (req: Request, res: Response) => {
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
  app.post(['/api/leads/:id/schedule-calendar', '/leads/:id/schedule-calendar'], async (req: Request, res: Response) => {
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
  app.patch(['/api/leads/:id', '/leads/:id'], (req: Request, res: Response) => {
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
  app.delete(['/api/leads', '/leads'], (req: Request, res: Response) => {
    saveStoredLeads([]);
    res.json({ success: true, count: 0 });
  });

  // Delete lead
  app.delete(['/api/leads/:id', '/leads/:id'], (req: Request, res: Response) => {
    const { id } = req.params;
    let leads = getStoredLeads();
    leads = leads.filter((l) => l.id !== id);
    saveStoredLeads(leads);
    res.json({ success: true });
  });

  // Resend confirmation email to client
  app.post(['/api/leads/:id/resend', '/leads/:id/resend'], async (req: Request, res: Response) => {
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
  app.get(['/api/preview-email/:id', '/preview-email/:id'], (req: Request, res: Response) => {
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
  app.get(['/api/config', '/config'], (req: Request, res: Response) => {
    res.json({ config: getStoredConfig() });
  });

  // Sync Google Workspace token from Admin Dashboard
  app.post(['/api/workspace/sync-token', '/workspace/sync-token'], (req: Request, res: Response) => {
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
  app.get(['/api/email-config-status', '/email-config-status'], (req: Request, res: Response) => {
    const config = getStoredConfig();
    const hasSmtpPass = !!(
      process.env.SMTP_PASS ||
      process.env.GMAIL_APP_PASSWORD ||
      config.notifications?.smtpPass
    );
    const hasResend = !!(
      process.env.RESEND_API_KEY ||
      config.notifications?.resendApiKey
    );
    const hasWebhook = !!(
      process.env.WEBHOOK_URL ||
      config.notifications?.webhookUrl
    );
    const hasWorkspaceToken = !!serverWorkspaceToken;
    const isConfigured = hasWorkspaceToken || hasResend || hasSmtpPass;

    res.json({
      senderEmail: 'infinityimpactagency@gmail.com',
      adminRecipient: config.notifications?.adminEmail || 'infinityimpactagency@gmail.com',
      hasSmtpPass,
      hasResend,
      hasWebhook,
      hasWorkspaceToken,
      isConfigured,
      mode: hasWorkspaceToken
        ? 'gmail_oauth_api'
        : hasResend
        ? 'resend_api'
        : hasSmtpPass
        ? 'gmail_smtp_live'
        : 'unconfigured',
    });
  });

  app.post(['/api/config', '/config'], (req: Request, res: Response) => {
    const newConfig = req.body;
    saveStoredConfig(newConfig);
    res.json({ success: true, config: newConfig });
  });

  // Services & Pricing Content GET / POST
  app.get(['/api/content', '/content'], (req: Request, res: Response) => {
    res.json({ content: getStoredContent() });
  });

  app.post(['/api/content', '/content'], (req: Request, res: Response) => {
    const content = req.body;
    saveStoredContent(content);
    res.json({ success: true, content });
  });

  // Persist settings directly into project source files so Git sees them in Pull Requests
  app.post(['/api/admin/save-to-code', '/admin/save-to-code'], (req: Request, res: Response) => {
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
  app.get(['/api/logs', '/logs'], (req: Request, res: Response) => {
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

  // Test email endpoint with multi-provider live testing (Resend, Gmail SMTP, Workspace)
  app.post(['/api/test-email', '/test-email'], async (req: Request, res: Response) => {
    try {
      const config = getStoredConfig();
      const targetEmail = req.body.email || config.notifications.adminEmail || 'infinityimpactagency@gmail.com';
      const resendApiKey = (process.env.RESEND_API_KEY || config.notifications?.resendApiKey)?.trim();
      const hasSmtpPass = !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || config.notifications?.smtpPass);
      const hasWorkspaceToken = !!serverWorkspaceToken;

      const htmlContent = `
        <div style="background-color: #07090e; padding: 30px; font-family: sans-serif; color: #ffffff; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid #1e293b;">
          <h2 style="color: #06b6d4; margin-top: 0;">⚡ Prueba de Envío Exitosa</h2>
          <p>Este es un correo de prueba enviado desde <strong>${config.agencyName}</strong> (infinityimpactagency@gmail.com).</p>
          <p>El sistema de reservas automáticas está activo y listo para notificar en vivo tanto al cliente como al administrador.</p>
          <div style="margin-top: 20px; padding: 12px; background: #121824; border-radius: 8px; font-size: 12px; color: #10b981;">
            ✓ Destinatario: <strong>${targetEmail}</strong><br/>
            ✓ Proveedor activo: ${hasWorkspaceToken ? 'Google Workspace API' : resendApiKey ? 'Resend REST API' : hasSmtpPass ? 'Gmail SMTP Autenticado' : 'Sin credenciales'}
          </div>
        </div>
      `;

      // 1. Google Workspace API
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
            mode: 'gmail_oauth_api',
          });
        } catch (apiErr: any) {
          console.warn('Test send via Gmail API failed:', apiErr.message);
        }
      }

      // 2. Resend API
      if (resendApiKey) {
        try {
          await sendViaResend(
            resendApiKey,
            targetEmail,
            `🔔 [PRUEBA EN VIVO] Sistema de Envío de ${config.agencyName}`,
            htmlContent,
            {
              fromName: config.agencyName,
              fromEmail: config.notifications?.resendFromEmail,
            }
          );
          return res.json({
            success: true,
            deliveredLive: true,
            message: `Correo de prueba entregado en vivo a ${targetEmail} vía Resend API`,
            mode: 'resend_api',
          });
        } catch (resendErr: any) {
          console.warn('Test send via Resend failed:', resendErr.message);
        }
      }

      // 3. Gmail SMTP Transporter with dual-port fallback (465 SSL, 587 STARTTLS)
      if (hasSmtpPass) {
        try {
          const fromAddress = process.env.SMTP_FROM || `"${config.agencyName}" <infinityimpactagency@gmail.com>`;
          await sendMailWithRetry({
            from: fromAddress,
            to: targetEmail,
            subject: `🔔 [PRUEBA OFICIAL] Sistema de Envío de ${config.agencyName}`,
            html: htmlContent,
          }, config);

          return res.json({
            success: true,
            deliveredLive: true,
            message: `Correo de prueba entregado en vivo a ${targetEmail} vía Gmail SMTP autenticado.`,
            mode: 'gmail_smtp_live',
          });
        } catch (smtpErr: any) {
          console.error('Test send via SMTP failed:', smtpErr.message);
          return res.status(400).json({
            success: false,
            deliveredLive: false,
            error: `Error al autenticar o enviar con Gmail SMTP: ${smtpErr.message}`,
            mode: 'smtp_error',
          });
        }
      }

      // If no credentials configured
      return res.status(400).json({
        success: false,
        deliveredLive: false,
        error: 'No hay credenciales activas en Vercel. Agrega SMTP_PASS (Contraseña de aplicación de Google) o RESEND_API_KEY en Vercel > Settings > Environment Variables.',
        mode: 'unconfigured',
      });
    } catch (err: any) {
      console.error('Test email error:', err);
      res.status(500).json({ success: false, error: err.message || 'Error al enviar correo de prueba' });
    }
  });

// -------------------------------------------------------------
// VITE / SPA MIDDLEWARE (DEVELOPMENT & STANDALONE CONTAINER RUNNER)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

if (!isVercel && process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
export { app };
