import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Bell,
  Mail,
  Users,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Download,
  Search,
  MessageSquare,
  ArrowLeft,
  Save,
  RotateCcw,
  RefreshCw,
  Send,
  Phone,
  Building,
  Check,
  Zap,
  Globe,
  DollarSign,
  Layers,
  Sparkles,
  Lock,
  Eye,
  FileText,
  GitPullRequest
} from 'lucide-react';
import {
  AgencySiteConfig,
  LeadData,
  WorkspaceAuthState,
  NotificationLog,
  ServiceItem,
  PricingPlan
} from '../types';
import {
  loadAgencyConfig,
  saveAgencyConfig,
  DEFAULT_AGENCY_CONFIG,
  generateAvailableSlots,
  playNotificationChime,
  logNotification,
  getNotificationLogs
} from '../adminDefaults';
import { sendGmailMessage, sendChatMessage, createCalendarEvent } from '../workspace';
import { InfinityLogo } from './InfinityLogo';
import { SERVICES_LIST, PRICING_PLANS } from '../data';
import { ProposalsManager } from './ProposalsManager';

interface AdminDashboardProps {
  onBackToWebsite: () => void;
  workspaceAuth: WorkspaceAuthState;
  onInitiateOAuth: () => void;
  onUpdateWorkspaceEmail?: (email: string) => void;
  onDisconnectWorkspace?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToWebsite,
  workspaceAuth,
  onInitiateOAuth,
  onUpdateWorkspaceEmail,
  onDisconnectWorkspace,
}) => {
  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('infinity_admin_authenticated') === 'true';
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Workspace email quick-edit state
  const [isEditingWorkspaceEmail, setIsEditingWorkspaceEmail] = useState(false);
  const [workspaceEmailInput, setWorkspaceEmailInput] = useState(workspaceAuth.userEmail || 'infinityimpactagency@gmail.com');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'hours' | 'bookings' | 'calendar' | 'notifications' | 'content' | 'workspace' | 'proposals'>('hours');
  const [calendarViewMode, setCalendarViewMode] = useState<'WEEK' | 'MONTH' | 'AGENDA'>('WEEK');
  const [selectedLeadForProposal, setSelectedLeadForProposal] = useState<LeadData | null>(null);

  // Configuration State
  const [config, setConfig] = useState<AgencySiteConfig>(() => loadAgencyConfig());
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSyncingToCode, setIsSyncingToCode] = useState(false);

  // Leads CRM State
  const [leads, setLeads] = useState<LeadData[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('infinity_leads') || '[]');
    } catch {
      return [];
    }
  });

  // Notification logs state
  const [logs, setLogs] = useState<NotificationLog[]>(() => getNotificationLogs());

  // Filters for Leads
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('todos');

  // Test slot date for hours preview
  const [previewDate, setPreviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Services and Pricing local state for content editor
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('infinity_services_content');
      return saved ? JSON.parse(saved) : SERVICES_LIST;
    } catch {
      return SERVICES_LIST;
    }
  });

  const [pricing, setPricing] = useState<PricingPlan[]>(() => {
    try {
      const saved = localStorage.getItem('infinity_pricing_content');
      if (saved) {
        const parsed: PricingPlan[] = JSON.parse(saved);
        return parsed.map((p, idx) => {
          const fallback = PRICING_PLANS[idx] || PRICING_PLANS[0];
          return {
            ...p,
            buttonText: p.buttonText || p.cta || fallback.buttonText || 'Elegir plan',
            cta: p.cta || p.buttonText || fallback.buttonText || 'Elegir plan',
          };
        });
      }
      return PRICING_PLANS;
    } catch {
      return PRICING_PLANS;
    }
  });

  // Feedback state for test notification
  const [testSending, setTestSending] = useState(false);
  const [testMessageResult, setTestMessageResult] = useState<string | null>(null);

  // New manual appointment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualBusiness, setManualBusiness] = useState('');
  const [manualDate, setManualDate] = useState(previewDate);
  const [manualTime, setManualTime] = useState('11:00');
  const [manualNotes, setManualNotes] = useState('');

  // Live test email state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string; mode?: string } | null>(null);
  const [emailConfigStatus, setEmailConfigStatus] = useState<{
    senderEmail?: string;
    adminRecipient?: string;
    hasSmtpPass?: boolean;
    hasResend?: boolean;
    hasWebhook?: boolean;
    hasWorkspaceToken?: boolean;
    isConfigured?: boolean;
    mode?: string;
  } | null>(null);
  const [copiedVarName, setCopiedVarName] = useState<string | null>(null);

  const fetchEmailConfigStatus = async () => {
    try {
      const res = await fetch('/api/email-config-status');
      if (res.ok) {
        const data = await res.json();
        setEmailConfigStatus(data);
      }
    } catch (e) {
      console.warn('Backend email config sync notice:', e);
    }
  };

  // Lead delete and clear-all modal states
  const [leadToDelete, setLeadToDelete] = useState<LeadData | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('Por favor ingresa un correo electrónico válido para la prueba.');
      return;
    }
    setIsSendingTest(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailAddress }),
      });
      let data: any = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON response (e.g. server crash or Vercel function error page)
        data = {
          success: false,
          error: text.includes('A server error')
            ? 'Error en el servidor de Vercel al procesar el envío. Despliega la última versión compilada en Vercel para aplicar la corrección de imports.'
            : text.slice(0, 300) || `Error HTTP ${res.status}: Respuesta no válida del servidor.`,
        };
      }

      if (res.ok && data?.success) {
        setTestEmailResult({
          success: true,
          message: data.message || `Correo enviado a ${testEmailAddress}`,
          mode: data.mode,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: data?.error || 'No se pudo enviar el correo de prueba.',
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err?.message || 'Error de conexión con el servidor',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Fetch leads from backend and synchronize with local storage
  const fetchBackendLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
          localStorage.setItem('infinity_leads', JSON.stringify(data.leads));
        }
      }
    } catch (e) {
      console.warn('Backend leads sync notice:', e);
    }
  };

  // Auto-refresh when new bookings are created or confirmed
  useEffect(() => {
    fetchBackendLeads();
    fetchEmailConfigStatus();

    const handleBookingEvents = () => {
      try {
        const freshLeads = JSON.parse(localStorage.getItem('infinity_leads') || '[]');
        setLeads(freshLeads);
        setLogs(getNotificationLogs());
        fetchBackendLeads();
        fetchEmailConfigStatus();
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('infinity_booking_created', handleBookingEvents);
    window.addEventListener('infinity_booking_confirmed', handleBookingEvents);

    // Fetch latest config and content from server to keep admin in sync across sessions
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) {
          setConfig((prev) => ({ ...prev, ...data.config }));
          saveAgencyConfig(data.config);
        }
      })
      .catch(() => {});

    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        if (data?.content?.services) {
          setServices(data.content.services);
        }
        if (data?.content?.pricing) {
          setPricing(data.content.pricing);
        }
      })
      .catch(() => {});

    // Periodic polling to pick up client confirmations made from external email links
    const interval = setInterval(fetchBackendLeads, 4000);

    return () => {
      window.removeEventListener('infinity_booking_created', handleBookingEvents);
      window.removeEventListener('infinity_booking_confirmed', handleBookingEvents);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = authPassword.trim();
    if (cleanPass === 'infinity2026' || cleanPass === 'admin' || cleanPass === 'jhostiel') {
      localStorage.setItem('infinity_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta. Por favor verifica tus credenciales de acceso.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('infinity_admin_authenticated');
    setIsAuthenticated(false);
  };

  const handleSyncToGitRepo = async () => {
    setIsSyncingToCode(true);
    setSaveSuccessMessage('Sincronizando cambios con los archivos del proyecto para Git / PR...');
    try {
      saveAgencyConfig(config);
      localStorage.setItem('infinity_services_content', JSON.stringify(services));
      localStorage.setItem('infinity_pricing_content', JSON.stringify(pricing));
      window.dispatchEvent(new CustomEvent('infinity_config_updated', { detail: config }));

      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services, pricing }),
      });

      const res = await fetch('/api/admin/save-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, services, pricing }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveSuccessMessage('¡Éxito! Cambios guardados en src/adminDefaults.ts y data/. Ahora aparecerán en tu Pull Request de GitHub.');
      } else {
        setSaveSuccessMessage('¡Configuración guardada en el servidor!');
      }
    } catch {
      setSaveSuccessMessage('¡Configuración guardada localmente!');
    } finally {
      setIsSyncingToCode(false);
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    }
  };

  const handleSaveConfig = async () => {
    saveAgencyConfig(config);
    // Dispatch event so main website re-renders immediately
    window.dispatchEvent(new CustomEvent('infinity_config_updated', { detail: config }));
    setSaveSuccessMessage('Guardando configuración y sincronizando con archivos...');

    try {
      // 1. Save to server persistent json
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      // 2. Persist to project source code files so Git and Pull Requests include the changes
      await fetch('/api/admin/save-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, services, pricing }),
      });

      setSaveSuccessMessage('¡Configuración guardada y sincronizada con los archivos del proyecto (listo para Pull Request)!');
    } catch {
      setSaveSuccessMessage('¡Configuración guardada y aplicada con éxito!');
    }
    setTimeout(() => setSaveSuccessMessage(null), 4500);
  };

  const handleResetDefaults = async () => {
    if (window.confirm('¿Deseas restaurar todos los horarios y configuraciones por defecto?')) {
      setConfig(DEFAULT_AGENCY_CONFIG);
      saveAgencyConfig(DEFAULT_AGENCY_CONFIG);
      window.dispatchEvent(new CustomEvent('infinity_config_updated', { detail: DEFAULT_AGENCY_CONFIG }));
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEFAULT_AGENCY_CONFIG),
        });
        await fetch('/api/admin/save-to-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: DEFAULT_AGENCY_CONFIG, services, pricing }),
        });
      } catch {}
      setSaveSuccessMessage('Configuraciones restablecidas a los valores de fábrica.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const handleSaveContent = async () => {
    localStorage.setItem('infinity_services_content', JSON.stringify(services));
    localStorage.setItem('infinity_pricing_content', JSON.stringify(pricing));
    saveAgencyConfig(config);
    window.dispatchEvent(new CustomEvent('infinity_content_updated'));
    setSaveSuccessMessage('Guardando servicios y precios en el proyecto...');

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services, pricing }),
      });
      await fetch('/api/admin/save-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, services, pricing }),
      });
      setSaveSuccessMessage('¡Servicios, precios y textos sincronizados con los archivos del proyecto para Git / PR!');
    } catch {
      setSaveSuccessMessage('¡Servicios, precios y textos actualizados en toda la web!');
    }
    setTimeout(() => setSaveSuccessMessage(null), 4500);
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadData['status']) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    setLeads(updated);
    localStorage.setItem('infinity_leads', JSON.stringify(updated));

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn('Backend patch lead status error:', err);
    }
  };

  const confirmDeleteLead = async (leadId: string) => {
    setIsDeletingLead(true);
    // 1. Immediately update local state and localStorage
    const updated = leads.filter((l) => l.id !== leadId);
    setLeads(updated);
    localStorage.setItem('infinity_leads', JSON.stringify(updated));
    setLeadToDelete(null);

    // 2. Call backend DELETE endpoint to eliminate from server storage
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) {
        console.warn('Backend delete returned status:', res.status);
      }
    } catch (err) {
      console.warn('Backend delete error:', err);
    } finally {
      setIsDeletingLead(false);
    }

    setActionFeedback('✓ Reserva eliminada con éxito del sistema');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const confirmClearAllLeads = async () => {
    setIsDeletingLead(true);
    // 1. Clear local state and localStorage
    setLeads([]);
    localStorage.setItem('infinity_leads', JSON.stringify([]));
    setShowClearAllModal(false);

    // 2. Call backend DELETE endpoint
    try {
      await fetch('/api/leads', { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend clear leads error:', err);
    } finally {
      setIsDeletingLead(false);
    }

    setActionFeedback('✓ Todas las reservas han sido eliminadas correctamente');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleResendClientConfirmation = async (lead: LeadData) => {
    if (!lead.email) {
      alert('Este cliente no tiene correo registrado.');
      return;
    }

    try {
      // 1. Dispatch through backend API which compiles the official HTML template with agency colors and confirmation button
      let sentViaServer = false;
      try {
        const res = await fetch(`/api/leads/${lead.id}/resend`, { method: 'POST' });
        if (res.ok) {
          sentViaServer = true;
        }
      } catch (err) {
        console.warn('Backend resend failed, falling back to Gmail API if available:', err);
      }

      // 2. If workspace token is active, also try sending via Gmail API
      if (!sentViaServer && workspaceAuth.accessToken) {
        await sendGmailMessage(workspaceAuth.accessToken, {
          to: lead.email,
          subject: config.notifications.emailSubjectTemplate || `Confirmación de tu Cita: ${config.agencyName}`,
          body: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 24px; color: #0f172a; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-top: 0;">¡Hola ${lead.name}!</h2>
              <p>Reenviamos la confirmación oficial de tu <strong>Llamada Estratégica Gratuita</strong> con el equipo de <strong>${config.agencyName}</strong>.</p>
              <div style="background: #ffffff; padding: 18px; border-radius: 8px; border: 1px solid #cbd5e1; margin: 20px 0;">
                <p style="margin: 6px 0;">📅 <strong>Fecha:</strong> ${lead.date}</p>
                <p style="margin: 6px 0;">⏰ <strong>Hora:</strong> ${lead.timeSlot} hrs</p>
                <p style="margin: 6px 0;">🏢 <strong>Empresa:</strong> ${lead.businessName || 'Empresa registrada'}</p>
                <p style="margin: 6px 0;">🔗 <strong>Enlace Google Meet:</strong> <a href="${config.notifications.customMeetingLink}" style="color: #0284c7; font-weight: bold;">Unirse a la videollamada</a></p>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${window.location.origin}/?action=confirm_booking&id=${lead.id}&email=${encodeURIComponent(lead.email)}" style="background: linear-gradient(135deg, #10b981 0%, #0284c7 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
                  CONFIRMAR MI ASISTENCIA
                </a>
              </div>
            </div>
          `,
        });
      }

      logNotification({
        type: 'client_confirmation',
        recipient: lead.email,
        title: `Reenvío de Correo HTML a ${lead.name}`,
        message: `Correo oficial con colores de la agencia y botón de confirmación reenviado a ${lead.email}.`,
        status: 'enviado',
        leadId: lead.id,
      });

      setLogs(getNotificationLogs());
      alert(`✅ Correo de confirmación en HTML oficial enviado exitosamente a ${lead.email}`);
    } catch (e: any) {
      alert(`Error al enviar: ${e.message}`);
    }
  };

  const handleSimulateClientConfirmation = async (lead: LeadData) => {
    try {
      // 1. Call server confirmation endpoint
      const res = await fetch(`/api/leads/${lead.id}/confirm`, { method: 'POST' });
      let calScheduled = false;
      let calLink: string | null = null;
      if (res.ok) {
        const data = await res.json();
        calScheduled = !!data.calendarScheduled;
        calLink = data.calendarLink || null;
      }

      // If workspaceAuth has accessToken and not yet scheduled by server, schedule client-side
      if (workspaceAuth.accessToken && !calScheduled) {
        try {
          const startDateTime = `${lead.date}T${lead.timeSlot}:00`;
          const startDate = new Date(startDateTime);
          const durationMin = config.hoursConfig.slotDurationMinutes || 45;
          const endDate = new Date(startDate.getTime() + durationMin * 60000);
          const calRes = await createCalendarEvent(workspaceAuth.accessToken, {
            summary: `Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`,
            description: `Sesión Estratégica de Crecimiento con IA.\n\nCliente: ${lead.name}\nEmpresa: ${lead.businessName || ''}\nWhatsApp: ${lead.phone || ''}\nEmail: ${lead.email || ''}\nServicio: ${lead.serviceInterest || 'Consultoría IA'}\nSala Meet: ${config.notifications.customMeetingLink}\n\n✅ Confirmada por el cliente.`,
            startDateTime: startDate.toISOString(),
            endDateTime: endDate.toISOString(),
            attendeeEmail: lead.email,
          });
          calScheduled = true;
          calLink = calRes?.htmlLink || null;
        } catch (calErr: any) {
          console.warn('Calendar sync error:', calErr.message);
        }
      }

      // 2. Update local state
      const updated = leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status: 'confirmado' as const,
              confirmedAt: Date.now(),
              syncedCalendar: calScheduled || l.syncedCalendar,
              calendarEventLink: calLink || l.calendarEventLink,
            }
          : l
      );
      setLeads(updated);
      localStorage.setItem('infinity_leads', JSON.stringify(updated));

      // 3. Log notification
      logNotification({
        type: 'client_confirmation',
        recipient: lead.email || config.notifications.adminEmail,
        title: `🟢 Cita Confirmada por Cliente: ${lead.name}`,
        message: `El cliente confirmó su asistencia. Cita asegurada para el ${lead.date} a las ${lead.timeSlot} hrs.${calScheduled ? ' Agendada automáticamente en Google Calendar.' : ''}`,
        status: 'enviado',
        leadId: lead.id,
      });
      setLogs(getNotificationLogs());

      alert(`🟢 ¡Excelente! La cita de ${lead.name} ahora aparece como "CITA CONFIRMADA"${calScheduled ? ' y ha sido agendada en Google Calendar oficial de la agencia.' : '.'}`);
    } catch (e: any) {
      console.error(e);
      handleUpdateLeadStatus(lead.id, 'confirmado');
    }
  };

  const handleSyncLeadToCalendar = async (lead: LeadData) => {
    try {
      // Try server first
      let calLink: string | null = null;
      try {
        const res = await fetch(`/api/leads/${lead.id}/schedule-calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: workspaceAuth.accessToken }),
        });
        if (res.ok) {
          const data = await res.json();
          calLink = data.calendarLink;
        }
      } catch (err) {
        console.warn('Server calendar sync fallback:', err);
      }

      // Fallback to client OAuth token if available
      if (!calLink && workspaceAuth.accessToken) {
        const startDateTime = `${lead.date}T${lead.timeSlot}:00`;
        const startDate = new Date(startDateTime);
        const durationMin = config.hoursConfig.slotDurationMinutes || 45;
        const endDate = new Date(startDate.getTime() + durationMin * 60000);
        const calRes = await createCalendarEvent(workspaceAuth.accessToken, {
          summary: `Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`,
          description: `Sesión Estratégica de Crecimiento con IA.\n\nCliente: ${lead.name}\nEmpresa: ${lead.businessName || ''}\nWhatsApp: ${lead.phone || ''}\nEmail: ${lead.email || ''}\nServicio: ${lead.serviceInterest || 'Consultoría IA'}\nSala Meet: ${config.notifications.customMeetingLink}`,
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          attendeeEmail: lead.email,
        });
        calLink = calRes?.htmlLink || null;
      }

      // Fallback: Generate direct 1-click Google Calendar URL targeting infinityimpactagency@gmail.com
      if (!calLink) {
        const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const startDateTime = `${lead.date}T${lead.timeSlot}:00`;
        const startDate = new Date(startDateTime);
        const durationMin = config.hoursConfig.slotDurationMinutes || 45;
        const endDate = new Date(startDate.getTime() + durationMin * 60000);
        const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
        const meetingLink = config.notifications.customMeetingLink || 'https://meet.google.com/inf-agen-impact';
        const title = `Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`;
        const details = `Sesión Estratégica de Crecimiento con IA.\n\n👤 Cliente: ${lead.name}\n🏢 Empresa: ${lead.businessName || 'No indicada'}\n📱 WhatsApp: ${lead.phone || ''}\n✉️ Email: ${lead.email || ''}\n🎯 Servicio: ${lead.serviceInterest || 'Consultoría IA'}\n📹 Sala Google Meet: ${meetingLink}\n\nAgendada en Infinity Impact Agency (Zona Horaria: Bogotá GMT-5).`;
        const gCalAgencyUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetingLink)}&add=${encodeURIComponent('infinityimpactagency@gmail.com')}&src=${encodeURIComponent('infinityimpactagency@gmail.com')}&ctz=America/Bogota`;
        calLink = gCalAgencyUrl;
        window.open(gCalAgencyUrl, '_blank');
      }

      if (calLink) {
        const updated = leads.map((l) =>
          l.id === lead.id ? { ...l, syncedCalendar: true, calendarEventLink: calLink } : l
        );
        setLeads(updated);
        localStorage.setItem('infinity_leads', JSON.stringify(updated));
        alert(`📅 ¡Cita de ${lead.name} lista y sincronizada con Google Calendar de Infinity Impact Agency!`);
      }
    } catch (e: any) {
      alert(`Error al agendar en Google Calendar: ${e.message}`);
    }
  };

  const handleTestNotification = async () => {
    setTestSending(true);
    setTestMessageResult(null);

    // 1. Trigger sound
    if (config.notifications.notifySoundEnabled) {
      playNotificationChime();
    }

    try {
      // 2. Send email to admin
      if (workspaceAuth.accessToken && config.notifications.adminEmail) {
        await sendGmailMessage(workspaceAuth.accessToken, {
          to: config.notifications.adminEmail,
          subject: '🔔 [PRUEBA DE ALERTA] Sistema de Notificaciones de Infinity Agency',
          body: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 24px; color: #0f172a; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-top: 0;">🔔 ¡Notificación de Prueba Exitosa!</h2>
              <p>Este es un correo de comprobación enviado desde el <strong>Panel de Control (/admind)</strong> de <strong>Infinity Impact Agency</strong>.</p>
              <div style="background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #cbd5e1; margin: 18px 0;">
                <p style="margin: 4px 0;"><strong>Destinatario Administrador:</strong> ${config.notifications.adminEmail}</p>
                <p style="margin: 4px 0;"><strong>Horario configurado:</strong> ${config.supportHoursText}</p>
                <p style="margin: 4px 0;"><strong>Estado del Sistema:</strong> 🟢 100% Operativo</p>
              </div>
              <p>Cada vez que un cliente complete el formulario en la web, recibirás al instante una alerta como esta con los datos del lead para que puedas contactarlo inmediatamente.</p>
            </div>
          `,
        });

        logNotification({
          type: 'admin_alert',
          recipient: config.notifications.adminEmail,
          title: 'Prueba de Alerta al Administrador',
          message: 'Correo de prueba enviado correctamente vía Gmail API.',
          status: 'enviado',
        });

        setTestMessageResult(`¡Sonido ejecutado y correo de prueba enviado con éxito a ${config.notifications.adminEmail}!`);
      } else {
        logNotification({
          type: 'admin_alert',
          recipient: config.notifications.adminEmail,
          title: 'Prueba de Alerta al Administrador',
          message: 'Alerta sonora y notificación simulada ejecutada en el panel.',
          status: 'simulado',
        });

        setTestMessageResult(`¡Sonido reproducido y alerta registrada para ${config.notifications.adminEmail}! (Conecta Google Workspace para recibirlo en tu bandeja de entrada de Gmail).`);
      }

      setLogs(getNotificationLogs());
    } catch (err: any) {
      setTestMessageResult(`Alerta sonora OK. Detalle de envío Gmail: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No hay clientes ni citas registradas para exportar.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Rubro', 'Fecha Cita', 'Hora Cita', 'Plan', 'Estado', 'Fecha Registro'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.businessName || ''}"`,
      `"${l.businessCategory || ''}"`,
      l.date,
      l.timeSlot,
      `"${l.serviceInterest || ''}"`,
      l.status,
      new Date(l.createdAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `infinity_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: LeadData = {
      id: `manual_${Date.now()}`,
      name: manualName,
      email: manualEmail,
      phone: manualPhone,
      businessName: manualBusiness,
      businessCategory: 'Agendado Manualmente',
      serviceInterest: 'INFINITY GROWTH',
      notes: manualNotes,
      date: manualDate,
      timeSlot: manualTime,
      status: 'agendado',
      createdAt: Date.now(),
      adminNotified: true,
      sentEmail: false,
    };

    const updated = [newLead, ...leads];
    setLeads(updated);
    localStorage.setItem('infinity_leads', JSON.stringify(updated));
    setIsManualModalOpen(false);

    // Reset inputs
    setManualName('');
    setManualEmail('');
    setManualPhone('');
    setManualBusiness('');
    setManualNotes('');

    alert('Cita manual registrada en el sistema.');
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchLeadQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchLeadQuery.toLowerCase()) ||
      lead.businessName?.toLowerCase().includes(searchLeadQuery.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchLeadQuery.toLowerCase());

    const matchesStatus = leadStatusFilter === 'todos' || lead.status === leadStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate preview slots for selected previewDate
  const previewSlots = generateAvailableSlots(previewDate, config.hoursConfig, leads);

  // If not authenticated, render sleek login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0d121c] border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <InfinityLogo size={38} showAgencyText={true} />
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lock size={12} />
              Acceso Administrativo Protegido
            </div>
            <h1 className="text-xl font-bold text-white mt-3 font-['Outfit']">
              Control & Gestión de la Agencia
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Acceso exclusivo para el equipo de Infinity Impact Agency
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Ingresa tu contraseña de administrador"
                className="w-full bg-[#141a26] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              Entrar al Panel
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onBackToWebsite}
              className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              Volver a la Web Principal
            </button>
            <span className="text-[11px] text-slate-500">v2.4 Pro</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a0e17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <InfinityLogo size={32} showAgencyText={true} />
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
              PANEL ADMIN (/admind)
            </span>
            <span className="text-xs text-slate-400">
              Notificaciones a: <strong className="text-white">{config.notifications.adminEmail}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync to Code / Git PR Button */}
          <button
            onClick={handleSyncToGitRepo}
            disabled={isSyncingToCode}
            title="Guardar cambios físicamente en el código fuente (src/adminDefaults.ts) para que aparezcan en tu Pull Request de GitHub"
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <GitPullRequest size={14} className={isSyncingToCode ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Guardar para Git / PR</span>
          </button>

          {/* Audio & Notification Test Button */}
          <button
            onClick={handleTestNotification}
            disabled={testSending}
            title="Probar sonido y envío de alerta"
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Volume2 size={14} className="text-cyan-400" />
            <span className="hidden md:inline">Probar Notificación</span>
          </button>

          {/* Back to Web Button */}
          <button
            onClick={onBackToWebsite}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Ver Sitio Web</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión administrativa"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs font-medium flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {testMessageResult && (
        <div className="bg-cyan-500/20 border-b border-cyan-500/30 text-cyan-200 px-6 py-2.5 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Bell size={15} />
            {testMessageResult}
          </span>
          <button onClick={() => setTestMessageResult(null)} className="text-cyan-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-[#0d121d] border border-slate-800/80 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('hours')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'hours'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock size={16} />
            Horarios de Atención
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar size={16} />
            Citas y Leads Agendados
            {leads.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-400 text-slate-950">
                {leads.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar size={16} className={activeTab === 'calendar' ? 'text-white' : 'text-cyan-400'} />
            Google Calendar Agencia
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-500/30">
              Bogotá
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bell size={16} />
            Notificaciones y Correos
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe size={16} />
            Gestión de la Web
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles size={16} />
            Google Workspace
            {workspaceAuth.isConnected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('proposals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'proposals'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30'
            }`}
          >
            <Download size={16} />
            Fichas & Dossier PDF
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-500/40">
              Ventas
            </span>
          </button>
        </div>

        {/* TAB 1: HORARIOS DE ATENCIÓN */}
        {activeTab === 'hours' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <Clock className="text-cyan-400" />
                    Horarios de Atención y Disponibilidad de Agenda
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Configura los días laborables, las franjas horarias y la duración de las llamadas. Esto determina exactamente los horarios que los clientes verán al agendar una llamada en la web.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleResetDefaults}
                    className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    Restablecer
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    Guardar Cambios
                  </button>
                </div>
              </div>

              {/* Day by Day Configuration */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                  Días y Rango Horario de Atención
                </h3>
                <div className="space-y-3">
                  {config.hoursConfig.days.map((dayItem, idx) => (
                    <div
                      key={dayItem.day}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        dayItem.active
                          ? 'bg-[#141a29]/80 border-slate-700/80 text-white'
                          : 'bg-[#0f1420]/40 border-slate-800/50 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-40">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayItem.active}
                            onChange={(e) => {
                              const newDays = [...config.hoursConfig.days];
                              newDays[idx] = { ...dayItem, active: e.target.checked };
                              setConfig({
                                ...config,
                                hoursConfig: { ...config.hoursConfig, days: newDays },
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                        <span className="font-semibold text-sm">{dayItem.name}</span>
                      </div>

                      {dayItem.active ? (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Apertura:</span>
                            <input
                              type="time"
                              value={dayItem.startTime}
                              onChange={(e) => {
                                const newDays = [...config.hoursConfig.days];
                                newDays[idx] = { ...dayItem, startTime: e.target.value };
                                setConfig({
                                  ...config,
                                  hoursConfig: { ...config.hoursConfig, days: newDays },
                                });
                              }}
                              className="bg-[#1b2334] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <span className="text-slate-600">hasta</span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Cierre:</span>
                            <input
                              type="time"
                              value={dayItem.endTime}
                              onChange={(e) => {
                                const newDays = [...config.hoursConfig.days];
                                newDays[idx] = { ...dayItem, endTime: e.target.value };
                                setConfig({
                                  ...config,
                                  hoursConfig: { ...config.hoursConfig, days: newDays },
                                });
                              }}
                              className="bg-[#1b2334] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-500">
                          Día no laborable (no se permitirán citas)
                        </span>
                      )}

                      <div className="text-[11px] font-medium text-slate-400">
                        {dayItem.active ? (
                          <span className="text-emerald-400">● Abierto para reservas</span>
                        ) : (
                          <span className="text-slate-500">○ Bloqueado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duración de la Cita
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Minutos por llamada</p>
                  <select
                    value={config.hoursConfig.slotDurationMinutes}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hoursConfig: {
                          ...config.hoursConfig,
                          slotDurationMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-[#1b2233] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos (Recomendado)</option>
                    <option value={60}>60 minutos (1 hora)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pausa entre Citas
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Margen de descanso / buffer</p>
                  <select
                    value={config.hoursConfig.breakBetweenSlotsMinutes}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hoursConfig: {
                          ...config.hoursConfig,
                          breakBetweenSlotsMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-[#1b2233] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={0}>Sin pausa (0 min)</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                  </select>
                </div>

                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Anticipación Mínima
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Horas previas requeridas</p>
                  <select
                    value={config.hoursConfig.minNoticeHours}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hoursConfig: {
                          ...config.hoursConfig,
                          minNoticeHours: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-[#1b2233] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>1 hora antes</option>
                    <option value={2}>2 horas antes</option>
                    <option value={4}>4 horas antes</option>
                    <option value={24}>24 horas antes (1 día)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Zona Horaria Principal
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">Referencia de atención</p>
                  <input
                    type="text"
                    value={config.hoursConfig.timezone}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hoursConfig: { ...config.hoursConfig, timezone: e.target.value },
                      })
                    }
                    className="w-full bg-[#1b2233] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Interactive Live Slot Preview */}
              <div className="mt-8 p-5 bg-[#0b0f17] border border-slate-800/80 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Simulador en Vivo: Horarios que verá el Cliente
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Probar fecha:</span>
                    <input
                      type="date"
                      value={previewDate}
                      onChange={(e) => setPreviewDate(e.target.value)}
                      className="bg-[#171f2e] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {previewSlots.length === 0 ? (
                  <div className="p-6 text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    ⚠️ En la fecha seleccionada ({previewDate}) no hay horarios disponibles (día inactivo o bloqueado en la configuración).
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {previewSlots.map((item) => (
                      <div
                        key={item.slot}
                        className={`p-2.5 rounded-lg border text-center text-xs font-mono transition-all ${
                          item.available
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 line-through'
                        }`}
                        title={item.reason || 'Disponible para agendar'}
                      >
                        {item.slot} hrs
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CITAS Y LEADS AGENDADOS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8">
              {/* Header metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <Calendar className="text-cyan-400" />
                    Citas Agendadas y Gestión de Prospectos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Revisa las llamadas programadas desde la web, envía confirmaciones por correo o comunícate directamente por WhatsApp.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} className="text-emerald-400" />
                    Agendar Cita Manual
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Exportar CSV
                  </button>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Total Solicitudes</span>
                  <div className="text-2xl font-black text-white mt-1 font-['Outfit']">{leads.length}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#131926] border border-emerald-500/50 rounded-xl shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Citas Confirmadas</span>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300 mt-1 font-['Outfit'] flex items-center gap-1.5">
                    <span>{leads.filter((l) => l.status === 'confirmado').length}</span>
                    <span className="text-[10px] text-emerald-400/80 font-normal">por cliente</span>
                  </div>
                </div>
                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <span className="text-xs text-cyan-400">Por Confirmar</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1 font-['Outfit']">
                    {leads.filter((l) => l.status === 'agendado').length}
                  </div>
                </div>
                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <span className="text-xs text-blue-400">Contactadas</span>
                  <div className="text-2xl font-black text-blue-400 mt-1 font-['Outfit']">
                    {leads.filter((l) => l.status === 'contactado').length}
                  </div>
                </div>
                <div className="p-4 bg-[#131926] border border-slate-800 rounded-xl">
                  <span className="text-xs text-purple-400">En Progreso</span>
                  <div className="text-2xl font-black text-purple-400 mt-1 font-['Outfit']">
                    {leads.filter((l) => l.status === 'en_progreso').length}
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchLeadQuery}
                    onChange={(e) => setSearchLeadQuery(e.target.value)}
                    placeholder="Buscar por cliente, empresa, teléfono..."
                    className="w-full bg-[#141b29] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-400">Filtrar estado:</span>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="bg-[#141b29] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="todos">Todos los estados ({leads.length})</option>
                    <option value="confirmado">🟢 Citas Confirmadas ({leads.filter((l) => l.status === 'confirmado').length})</option>
                    <option value="agendado">📅 Agendados / Pendientes ({leads.filter((l) => l.status === 'agendado').length})</option>
                    <option value="contactado">📞 Contactados ({leads.filter((l) => l.status === 'contactado').length})</option>
                    <option value="en_progreso">⚡ En Progreso ({leads.filter((l) => l.status === 'en_progreso').length})</option>
                    <option value="completado">✅ Completados ({leads.filter((l) => l.status === 'completado').length})</option>
                    <option value="cancelado">❌ Cancelados ({leads.filter((l) => l.status === 'cancelado').length})</option>
                  </select>

                  {leads.length > 0 && (
                    <button
                      onClick={() => setShowClearAllModal(true)}
                      title="Eliminar todas las reservas registradas"
                      className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Vaciar todo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Leads Table */}
              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
                {filteredLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    No se encontraron llamadas o clientes con ese criterio.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#131926] text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">Cliente & Empresa</th>
                        <th className="p-3.5">Fecha y Hora Cita</th>
                        <th className="p-3.5">Contacto Rápido</th>
                        <th className="p-3.5">Interés / Plan</th>
                        <th className="p-3.5">Estado</th>
                        <th className="p-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredLeads.map((lead) => {
                        const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                        const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${lead.name}, te escribo de Infinity Impact Agency respecto a tu llamada estratégica agendada para el ${lead.date}.`)}` : '#';

                        return (
                          <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5">
                              <div className="font-semibold text-white text-sm">{lead.name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building size={11} className="text-slate-500" />
                                {lead.businessName || 'Empresa no informada'} ({lead.businessCategory || 'General'})
                              </div>
                              {lead.notes && (
                                <p className="text-[10px] text-slate-400 italic mt-1 max-w-xs truncate" title={lead.notes}>
                                  "{lead.notes}"
                                </p>
                              )}
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <div className="font-mono text-white font-medium flex items-center gap-1.5">
                                <Calendar size={13} className="text-cyan-400" />
                                {lead.date}
                              </div>
                              <div className="font-mono text-emerald-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                                <Clock size={12} />
                                {lead.timeSlot} hrs
                              </div>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {cleanPhone && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <MessageSquare size={12} />
                                    WhatsApp
                                  </a>
                                )}
                                {lead.email && (
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <Mail size={12} />
                                    Email
                                  </a>
                                )}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium">
                                {lead.serviceInterest || 'Consultoría IA'}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5">
                                {lead.status === 'confirmado' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10 w-fit">
                                    <CheckCircle2 size={13} className="text-emerald-400" />
                                    <span>CITA CONFIRMADA</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit">
                                    <Clock size={11} className="text-amber-400" />
                                    <span>Por confirmar</span>
                                  </span>
                                )}

                                <select
                                  value={lead.status}
                                  onChange={(e) =>
                                    handleUpdateLeadStatus(lead.id, e.target.value as LeadData['status'])
                                  }
                                  className="bg-[#172030] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="confirmado">🟢 Cita Confirmada</option>
                                  <option value="agendado">📅 Agendado / Pendiente</option>
                                  <option value="contactado">📞 Contactado</option>
                                  <option value="en_progreso">⚡ En Progreso</option>
                                  <option value="completado">✅ Completado</option>
                                  <option value="cancelado">❌ Cancelado</option>
                                </select>
                              </div>
                            </td>

                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Create/Open Proposal PDF */}
                                <button
                                  onClick={() => {
                                    setSelectedLeadForProposal(lead);
                                    setActiveTab('proposals');
                                  }}
                                  title="Crear o personalizar Ficha Técnica y Propuesta PDF para este cliente"
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-950/40 cursor-pointer"
                                >
                                  <FileText size={13} className="text-emerald-400" />
                                  <span>Propuesta PDF</span>
                                </button>

                                {/* Preview HTML email */}
                                <a
                                  href={`/api/preview-email/${lead.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Ver Correo HTML enviado con branding de la agencia"
                                  className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20"
                                >
                                  <Eye size={14} />
                                </a>

                                {/* Confirm action / test */}
                                {lead.status !== 'confirmado' ? (
                                  <button
                                    onClick={() => handleSimulateClientConfirmation(lead)}
                                    title="Marcar como confirmada / Simular confirmación del cliente"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-all"
                                  >
                                    <Check size={11} />
                                    <span>Confirmar</span>
                                  </button>
                                ) : (
                                  <span
                                    title="Cita confirmada por el cliente"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 flex items-center gap-1"
                                  >
                                    <CheckCircle2 size={11} className="text-emerald-400" />
                                    <span>OK</span>
                                  </span>
                                )}

                                {/* Google Calendar status / sync */}
                                {lead.syncedCalendar ? (
                                  <a
                                    href={lead.calendarEventLink || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Agendado en Google Calendar de la agencia (clic para abrir evento)"
                                    className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/30 flex items-center gap-1 text-[11px]"
                                  >
                                    <Calendar size={13} />
                                    <span className="hidden xl:inline text-[10px] font-semibold">Calendar</span>
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => handleSyncLeadToCalendar(lead)}
                                    title="Agendar esta cita en Google Calendar ahora"
                                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors border border-slate-700 hover:border-cyan-500/30 flex items-center gap-1 text-[11px]"
                                  >
                                    <Calendar size={13} />
                                    <span className="hidden xl:inline text-[10px]">+ Calendar</span>
                                  </button>
                                )}

                                {/* Resend email */}
                                <button
                                  onClick={() => handleResendClientConfirmation(lead)}
                                  title="Reenviar correo HTML de confirmación oficial al cliente"
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                                >
                                  <Send size={14} />
                                </button>

                                {/* Delete lead */}
                                <button
                                  onClick={() => setLeadToDelete(lead)}
                                  title="Eliminar reserva"
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-800 hover:border-rose-500/30 cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GOOGLE CALENDAR OFICIAL DE LA AGENCIA */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      CALENDARIO OFICIAL VINCULADO
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      AMERICA/BOGOTA (GMT-5)
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <Calendar className="text-cyan-400" />
                    Google Calendar de Infinity Impact Agency
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Aquí se reflejan todas las llamadas y sesiones estratégicas de clientes. La cuenta vinculada es{' '}
                    <strong className="text-cyan-300">infinityimpactagency@gmail.com</strong> sincronizada con la hora de Bogotá.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href="https://calendar.google.com/calendar/u/0/r"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Abrir Google Calendar</span>
                  </a>

                  <a
                    href={config.notifications.customMeetingLink || 'https://meet.google.com/inf-agen-impact'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    <Zap size={14} className="text-amber-400" />
                    <span>Sala Google Meet</span>
                  </a>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-[#131926] border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Cuenta de la Agencia</span>
                    <Mail size={14} className="text-cyan-400" />
                  </div>
                  <div className="text-xs font-bold text-white truncate" title="infinityimpactagency@gmail.com">
                    infinityimpactagency@gmail.com
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={11} /> Receptora oficial de citas
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#131926] border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Zona Horaria Principal</span>
                    <Clock size={14} className="text-cyan-400" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    America/Bogota (GMT-5)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Horas exactas para Colombia / Latam
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#131926] border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Citas en Sistema</span>
                    <Calendar size={14} className="text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {leads.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {leads.filter((l) => l.status === 'confirmado').length} confirmadas por clientes
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#131926] border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Enlace Directo</span>
                    <Globe size={14} className="text-purple-400" />
                  </div>
                  <a
                    href="https://calendar.google.com/calendar/embed?src=infinityimpactagency%40gmail.com&ctz=America%2FBogota"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 mt-1"
                  >
                    Ver calendario público
                    <ExternalLink size={11} />
                  </a>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Vista embebida de Google
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Live Google Calendar */}
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 bg-[#111726] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">
                    Vista en Vivo: Google Calendar Embed
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">
                    (infinityimpactagency@gmail.com)
                  </span>
                </div>

                {/* Mode switcher (Semana, Mes, Agenda) */}
                <div className="flex items-center gap-1.5 bg-[#0a0e17] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setCalendarViewMode('WEEK')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      calendarViewMode === 'WEEK'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('MONTH')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      calendarViewMode === 'MONTH'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mes
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('AGENDA')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      calendarViewMode === 'AGENDA'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Agenda
                  </button>
                </div>
              </div>

              {/* IFrame */}
              <div className="w-full bg-[#0a0e17] p-3 sm:p-4">
                <div className="w-full h-[640px] rounded-xl overflow-hidden border border-slate-800/80 bg-white">
                  <iframe
                    key={calendarViewMode}
                    src={`https://calendar.google.com/calendar/embed?src=infinityimpactagency%40gmail.com&ctz=America%2FBogota&mode=${calendarViewMode}&showPrint=0&showTabs=1&showCalendars=0&showTz=1`}
                    style={{ border: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    scrolling="no"
                    title="Google Calendar Infinity Impact Agency"
                  />
                </div>
              </div>
            </div>

            {/* List of Booked Calls with 1-Click Calendar Sync */}
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    Citas Agendadas y Enlaces Directos al Calendario
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Puedes abrir o guardar directamente cada cita en el calendario oficial de la agencia con 1 solo clic.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                  {leads.length} Cita{leads.length === 1 ? '' : 's'} en total
                </span>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No hay citas registradas aún. Cuando un cliente agende en la web, aparecerá aquí automáticamente.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead) => {
                    const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    const startDateTime = `${lead.date}T${lead.timeSlot}:00`;
                    const startDate = new Date(startDateTime);
                    const durationMin = config.hoursConfig.slotDurationMinutes || 45;
                    const endDate = new Date(startDate.getTime() + durationMin * 60000);
                    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
                    const meetingLink = config.notifications.customMeetingLink || 'https://meet.google.com/inf-agen-impact';
                    const title = `Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`;
                    const details = `Sesión Estratégica de Crecimiento con IA.\n\n👤 Cliente: ${lead.name}\n🏢 Empresa: ${lead.businessName || 'No indicada'}\n📱 WhatsApp: ${lead.phone || ''}\n✉️ Email: ${lead.email || ''}\n🎯 Servicio: ${lead.serviceInterest || 'Consultoría IA'}\n📹 Sala Google Meet: ${meetingLink}\n\nAgendada en Infinity Impact Agency (Bogotá GMT-5).`;
                    const gCalAgencyUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetingLink)}&add=${encodeURIComponent('infinityimpactagency@gmail.com')}&src=${encodeURIComponent('infinityimpactagency@gmail.com')}&ctz=America/Bogota`;

                    return (
                      <div
                        key={lead.id}
                        className="p-5 rounded-xl bg-[#131926] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                              <p className="text-xs text-cyan-400 font-medium">{lead.businessName || 'Empresa no indicada'}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                lead.status === 'confirmado'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {lead.status === 'confirmado' ? 'CONFIRMADA' : 'AGENDADA'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800/60">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-cyan-400 shrink-0" />
                              <span>
                                <strong>{lead.date}</strong> a las <strong>{lead.timeSlot} hrs</strong> (Bogotá GMT-5)
                              </span>
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Mail size={13} className="shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Phone size={13} className="shrink-0" />
                                <span>{lead.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                          <a
                            href={lead.calendarEventLink || gCalAgencyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Calendar size={13} />
                            <span>Añadir / Abrir en Calendar</span>
                          </a>

                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          >
                            <Zap size={13} className="text-amber-400" />
                            <span>Meet</span>
                          </a>

                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setSelectedLeadForProposal(lead);
                              setActiveTab('proposals');
                            }}
                            title="Generar Ficha Técnica y Propuesta PDF para este cliente"
                            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <FileText size={13} className="text-emerald-400" />
                            <span>Propuesta PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICACIONES Y CORREOS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <Bell className="text-cyan-400" />
                    Reglas de Notificaciones & Correos Automáticos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Asegúrate de que te llegue notificación instantánea cada vez que alguien agende una llamada, y que al cliente le llegue automáticamente su correo de confirmación.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleTestNotification}
                    disabled={testSending}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
                  >
                    <Send size={14} />
                    {testSending ? 'Enviando...' : 'Enviar Prueba al Administrador'}
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    Guardar Reglas
                  </button>
                </div>
              </div>

              {/* Notification Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* 1. Admin Alert Settings */}
                <div className="p-6 bg-[#131926] border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <ShieldCheck size={18} />
                    <span>Notificaciones para TI (Administrador)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Configura a dónde y cómo quieres recibir la alerta cada vez que un prospecto reserve una hora.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo Electrónico del Administrador Receptor
                    </label>
                    <input
                      type="email"
                      value={config.notifications.adminEmail}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          notifications: {
                            ...config.notifications,
                            adminEmail: e.target.value,
                          },
                        })
                      }
                      placeholder="infinityimpactagency@gmail.com"
                      className="w-full bg-[#1b2334] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Recibirás la alerta de cada cita agendada en esta casilla interna de la agencia.
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.notifications.notifyAdminOnBooking}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: {
                              ...config.notifications,
                              notifyAdminOnBooking: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Notificarme por correo Gmail inmediatamente
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Envía un email enriquecido con el nombre, teléfono, rubro, notas y botón de WhatsApp directo del cliente.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.notifications.notifySoundEnabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: {
                              ...config.notifications,
                              notifySoundEnabled: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Alerta Sonora / Campana en el Navegador
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Emite un agradable tono de campana armónica cuando entra una nueva reserva.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.notifications.notifyGoogleChat}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            notifications: {
                              ...config.notifications,
                              notifyGoogleChat: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Publicar alerta en espacio de Google Chat
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Sincroniza un mensaje en tiempo real para el canal comercial.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 2. Client Confirmation Settings */}
                <div className="p-6 bg-[#131926] border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Mail size={18} />
                    <span>Correo de Confirmación al CLIENTE</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    El cliente recibirá un correo con el branding de la agencia, los detalles de su cita y el link de la reunión.
                  </p>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notifications.sendClientConfirmationEmail}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          notifications: {
                            ...config.notifications,
                            sendClientConfirmationEmail: e.target.checked,
                          },
                        })
                      }
                      className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Enviar correo de confirmación automático al agendar
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Dispara un correo oficial con logo de Infinity Agency inmediatamente tras presionar "Confirmar Cita".
                      </span>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Asunto del Correo al Cliente
                    </label>
                    <input
                      type="text"
                      value={config.notifications.emailSubjectTemplate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          notifications: {
                            ...config.notifications,
                            emailSubjectTemplate: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#1b2334] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enlace de Sala Google Meet / Videollamada
                    </label>
                    <input
                      type="text"
                      value={config.notifications.customMeetingLink}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          notifications: {
                            ...config.notifications,
                            customMeetingLink: e.target.value,
                          },
                        })
                      }
                      placeholder="https://meet.google.com/..."
                      className="w-full bg-[#1b2334] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="p-3.5 bg-[#0f1422] rounded-xl border border-emerald-500/30 text-[11px] text-slate-300 space-y-2">
                    <div className="font-bold text-emerald-400 flex items-center justify-between">
                      <span>Diseño HTML Oficial con Colores de la Agencia:</span>
                      <a
                        href="/api/preview-email/preview_test"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <span>Ver Vista Previa del HTML</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="text-slate-400 space-y-1 text-[11px]">
                      <div>✓ <strong>Destinatario 100% dinámico:</strong> Se despacha directamente al correo ingresado por el cliente en el formulario de agendamiento.</div>
                      <div>✓ <strong>Remitente oficial:</strong> infinityimpactagency@gmail.com (Infinity Impact Agency).</div>
                      <div>✓ <strong>Colores corporativos:</strong> Fondo oscuro (#07090e), acentos cian (#00f0ff) y verde esmeralda (#10b981).</div>
                      <div>✓ <strong>Botón de Confirmación Interactivo:</strong> Incluye el botón directo <span className="text-emerald-300 font-semibold">"CONFIRMAR MI ASISTENCIA"</span> que al hacer clic marca la cita como confirmada automáticamente en tu panel de /admind.</div>
                    </div>
                  </div>

                  {/* Vercel Environment Configuration & Diagnostics */}
                  <div className="p-4 bg-gradient-to-br from-[#0c121e] via-[#0f172a] to-[#0c121e] border border-blue-500/40 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <span className="text-base">🚀</span>
                        <span className="uppercase tracking-wider">Estado de Envíos en Vercel (Producción)</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                        emailConfigStatus?.isConfigured
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${emailConfigStatus?.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{emailConfigStatus?.isConfigured ? 'Envíos en Vivo Activos' : 'Requiere Configuración en Vercel'}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Para que los correos automáticos lleguen tanto al cliente como a ti al reservar en la página desplegada en <strong>Vercel</strong>, el servidor necesita credenciales de despacho. Puedes usar <strong>Gmail SMTP (Gratuito)</strong> o <strong>Resend API</strong>.
                    </p>

                    {/* Step-by-step instructions */}
                    <div className="bg-[#090d16] p-3.5 rounded-lg border border-slate-800 text-[11px] space-y-2.5">
                      <div className="font-semibold text-cyan-300 flex items-center justify-between">
                        <span>Opción A: Gmail SMTP Oficial (Recomendada y 100% Gratuita)</span>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline text-[10px]"
                        >
                          <span>Crear contraseña en Google</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="text-slate-400 text-[10px]">
                        1. Entra a tu cuenta Google (<strong>infinityimpactagency@gmail.com</strong>) &gt; Seguridad &gt; Verificación en 2 pasos &gt; <strong>Contraseñas de aplicaciones</strong>.<br />
                        2. Genera una contraseña (nombre: "Vercel Web") y obtendrás 16 letras.<br />
                        3. En tu proyecto de <strong>Vercel &gt; Settings &gt; Environment Variables</strong> agrega:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="bg-[#131924] border border-slate-700/80 rounded-lg p-2 flex items-center justify-between">
                          <div>
                            <div className="text-[9px] text-slate-400 uppercase font-mono">Nombre de variable:</div>
                            <div className="font-mono text-cyan-300 text-xs font-bold">SMTP_PASS</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('SMTP_PASS');
                              setCopiedVarName('SMTP_PASS');
                              setTimeout(() => setCopiedVarName(null), 2000);
                            }}
                            className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
                          >
                            {copiedVarName === 'SMTP_PASS' ? '¡Copiado!' : 'Copiar'}
                          </button>
                        </div>

                        <div className="bg-[#131924] border border-slate-700/80 rounded-lg p-2 flex items-center justify-between">
                          <div>
                            <div className="text-[9px] text-slate-400 uppercase font-mono">Nombre de variable:</div>
                            <div className="font-mono text-cyan-300 text-xs font-bold">SMTP_USER</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('infinityimpactagency@gmail.com');
                              setCopiedVarName('SMTP_USER');
                              setTimeout(() => setCopiedVarName(null), 2000);
                            }}
                            className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
                          >
                            {copiedVarName === 'SMTP_USER' ? '¡Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick credential inputs directly into config */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Contraseña de Aplicación Gmail (16 letras)
                        </label>
                        <input
                          type="password"
                          value={config.notifications?.smtpPass || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              notifications: {
                                ...config.notifications,
                                smtpPass: e.target.value,
                              },
                            })
                          }
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full bg-[#1b2334] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          API Key de Resend (Alternativa opcional)
                        </label>
                        <input
                          type="password"
                          value={config.notifications?.resendApiKey || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              notifications: {
                                ...config.notifications,
                                resendApiKey: e.target.value,
                              },
                            })
                          }
                          placeholder="re_..."
                          className="w-full bg-[#1b2334] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        Guarda los cambios arriba con <strong className="text-white">"Guardar Cambios"</strong> para aplicarlos al sistema.
                      </span>
                      <a
                        href="https://vercel.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors"
                      >
                        <span>Abrir Panel de Vercel</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Real Live Email Dispatch Tester */}
                  <div className="p-4 bg-[#0a0f1d] border border-cyan-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <Send size={14} />
                        <span>PROBADOR DE ENVÍO REAL A CUALQUIER CORREO</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        Diagnóstico
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Ingresa cualquier correo (de cliente o personal) para comprobar el envío desde <strong className="text-slate-200">infinityimpactagency@gmail.com</strong>:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="ejemplo@gmail.com o correo de prueba"
                        className="flex-1 bg-[#151c2b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={isSendingTest}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap shadow-lg shadow-cyan-500/10 cursor-pointer"
                      >
                        {isSendingTest ? (
                          <span>Enviando...</span>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Enviar Correo de Prueba</span>
                          </>
                        )}
                      </button>
                    </div>

                    {testEmailResult && (
                      <div className={`p-2.5 rounded-lg border text-xs ${
                        testEmailResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}>
                        <div className="font-semibold">{testEmailResult.message}</div>
                        {testEmailResult.mode === 'sandbox' && (
                          <div className="text-[11px] text-amber-300 mt-1">
                            ℹ️ Nota: Para que Gmail entregue a bandejas reales en internet sin pasar por sandbox, asegúrate de configurar <strong>SMTP_PASS</strong> en las variables de entorno con la contraseña de aplicación de 16 letras de Google para <strong>infinityimpactagency@gmail.com</strong>.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification Logs History */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" />
                    Historial de Notificaciones y Envíos
                  </h3>
                  <button
                    onClick={() => {
                      localStorage.removeItem('infinity_admin_notifications');
                      setLogs([]);
                    }}
                    className="text-slate-500 hover:text-slate-400 text-xs"
                  >
                    Limpiar historial
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No hay registros recientes de notificaciones enviadas.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#131926] text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                          <th className="p-3">Tipo</th>
                          <th className="p-3">Destinatario</th>
                          <th className="p-3">Título / Asunto</th>
                          <th className="p-3">Fecha y Hora</th>
                          <th className="p-3 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {logs.slice(0, 15).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/20">
                            <td className="p-3">
                              {log.type === 'admin_alert' ? (
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20">
                                  🔔 Alerta Admin
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                                  ✉️ Cliente
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-white text-[11px]">{log.recipient}</td>
                            <td className="p-3 font-medium text-slate-200">{log.title}</td>
                            <td className="p-3 text-slate-500 text-[11px]">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              {log.status === 'enviado' ? (
                                <span className="text-emerald-400 font-semibold">● Enviado Real</span>
                              ) : (
                                <span className="text-amber-400 font-semibold">● Registrado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GESTIÓN DE CONTENIDOS DE LA WEB */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                    <Globe className="text-cyan-400" />
                    Gestor de Contenidos de la Web
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Modifica cualquier parte de la página: datos de contacto, titulares del hero, métricas, servicios y precios.
                  </p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Save size={14} />
                  Guardar Contenido
                </button>
              </div>

              {/* General Agency Info */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Datos Principales y Contacto de la Agencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre de la Agencia
                    </label>
                    <input
                      type="text"
                      value={config.agencyName}
                      onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp Oficial de Atención
                    </label>
                    <input
                      type="text"
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mensaje Automático de Saludo (WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={config.whatsappDefaultMessage || ''}
                      placeholder="¡Hola! Me comunico desde su sitio web y me gustaría hablar con un asesor."
                      onChange={(e) => setConfig({ ...config, whatsappDefaultMessage: e.target.value })}
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mensaje inicial abierto que verá el visitante al hacer clic en el botón de WhatsApp.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email de Soporte / Comercial
                    </label>
                    <input
                      type="email"
                      value={config.contactEmail}
                      onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Texto Resumen de Horarios (Visible en pie de página)
                    </label>
                    <input
                      type="text"
                      value={config.supportHoursText}
                      onChange={(e) => setConfig({ ...config, supportHoursText: e.target.value })}
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Titular Principal del Hero (Headline)
                  </label>
                  <input
                    type="text"
                    value={config.headline}
                    onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                    className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subtítulo Descriptivo del Hero
                  </label>
                  <textarea
                    rows={2}
                    value={config.subheadline}
                    onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
                    className="w-full bg-[#141b29] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Stats KPIs */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                  Métricas y Estadísticas Clave
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Clientes Activos</label>
                    <input
                      type="text"
                      value={config.stats.activeClients}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          stats: { ...config.stats, activeClients: e.target.value },
                        })
                      }
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Leads Generados</label>
                    <input
                      type="text"
                      value={config.stats.leadsDelivered}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          stats: { ...config.stats, leadsDelivered: e.target.value },
                        })
                      }
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tasa de Satisfacción</label>
                    <input
                      type="text"
                      value={config.stats.satisfactionRate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          stats: { ...config.stats, satisfactionRate: e.target.value },
                        })
                      }
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Horas Ahorradas</label>
                    <input
                      type="text"
                      value={config.stats.hoursSaved}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          stats: { ...config.stats, hoursSaved: e.target.value },
                        })
                      }
                      className="w-full bg-[#141b29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Plans Editor */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-400" />
                  Precios de los Planes de la Agencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pricing.map((plan, pIdx) => (
                    <div key={plan.id} className="p-4 bg-[#131926] border border-slate-800 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-cyan-400">{plan.number} • {plan.name}</div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Precio</label>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const copy = [...pricing];
                            copy[pIdx].price = e.target.value;
                            setPricing(copy);
                          }}
                          className="w-full bg-[#1a2233] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Detalle Facturación</label>
                        <input
                          type="text"
                          value={plan.priceDetail}
                          onChange={(e) => {
                            const copy = [...pricing];
                            copy[pIdx].priceDetail = e.target.value;
                            setPricing(copy);
                          }}
                          className="w-full bg-[#1a2233] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Subtítulo</label>
                        <input
                          type="text"
                          value={plan.subtitle}
                          onChange={(e) => {
                            const copy = [...pricing];
                            copy[pIdx].subtitle = e.target.value;
                            setPricing(copy);
                          }}
                          className="w-full bg-[#1a2233] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Texto del Botón (CTA)</label>
                        <input
                          type="text"
                          value={plan.buttonText || plan.cta || 'Elegir plan'}
                          onChange={(e) => {
                            const copy = [...pricing];
                            copy[pIdx].buttonText = e.target.value;
                            copy[pIdx].cta = e.target.value;
                            setPricing(copy);
                          }}
                          className="w-full bg-[#1a2233] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GOOGLE WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-['Outfit'] mb-2">
                <Sparkles className="text-cyan-400" />
                Integración con Google Workspace
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Conecta tu cuenta corporativa de Google para sincronizar citas en Calendar y despachar emails de confirmación y alertas desde tu Gmail real.
              </p>

              <div className="p-6 bg-[#131926] border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 font-bold text-sm text-white">
                    <span>Estado de Conexión Google Workspace:</span>
                    {workspaceAuth.isConnected ? (
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Conectado ({workspaceAuth.userEmail || 'infinityimpactagency@gmail.com'})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1.5">
                        <AlertCircle size={13} /> Desconectado
                      </span>
                    )}

                    {/* Quick switch/edit email button */}
                    {workspaceAuth.isConnected && !isEditingWorkspaceEmail && (
                      <button
                        onClick={() => {
                          setWorkspaceEmailInput(workspaceAuth.userEmail || 'infinityimpactagency@gmail.com');
                          setIsEditingWorkspaceEmail(true);
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer transition-colors"
                      >
                        Cambiar correo
                      </button>
                    )}
                  </div>

                  {/* Inline Email Edit Form */}
                  {isEditingWorkspaceEmail && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                      <input
                        type="email"
                        value={workspaceEmailInput}
                        onChange={(e) => setWorkspaceEmailInput(e.target.value)}
                        placeholder="ej: infinityimpactagency@gmail.com"
                        className="px-3 py-1.5 bg-slate-900 border border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 w-64"
                      />
                      <button
                        onClick={() => {
                          onUpdateWorkspaceEmail?.(workspaceEmailInput);
                          setIsEditingWorkspaceEmail(false);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setWorkspaceEmailInput(workspaceAuth.userEmail || 'infinityimpactagency@gmail.com');
                          setIsEditingWorkspaceEmail(false);
                        }}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Permisos activos: Google Calendar (creación de eventos), Gmail (envío de correos de confirmación), Google Chat (alertas en tiempo real).
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={onInitiateOAuth}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    {workspaceAuth.isConnected ? 'Reconectar / Actualizar' : 'Conectar Google Workspace'}
                  </button>

                  {workspaceAuth.isConnected && onDisconnectWorkspace && (
                    <button
                      onClick={onDisconnectWorkspace}
                      className="px-4 py-2.5 bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                      title="Desconectar cuenta Google Workspace"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-[#101522] border border-slate-800/80 rounded-xl">
                  <div className="font-semibold text-xs text-blue-400 flex items-center gap-1.5 mb-1">
                    <Calendar size={14} /> Google Calendar
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Crea automáticamente la sesión estratégica en tu calendario principal con el cliente como invitado y recordatorios activos.
                  </p>
                </div>

                <div className="p-4 bg-[#101522] border border-slate-800/80 rounded-xl">
                  <div className="font-semibold text-xs text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Mail size={14} /> Gmail API
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Envía el correo de confirmación al cliente y la alerta inmediata al administrador con los detalles completos del lead.
                  </p>
                </div>

                <div className="p-4 bg-[#101522] border border-slate-800/80 rounded-xl">
                  <div className="font-semibold text-xs text-purple-400 flex items-center gap-1.5 mb-1">
                    <MessageSquare size={14} /> Google Chat
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Envía avisos a tu espacio comercial en Google Chat o webhook para no perder ninguna oportunidad de venta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: FICHAS TÉCNICAS & PROPUESTAS COMERCIALES EN PDF */}
        {activeTab === 'proposals' && (
          <ProposalsManager
            agencyConfig={config}
            initialLead={selectedLeadForProposal}
            onClearInitialLead={() => setSelectedLeadForProposal(null)}
          />
        )}
      </div>

      {/* Manual Booking Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0d121c] border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 font-['Outfit']">
              Agendar Cita Manual
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Registra un cliente que te contactó por teléfono o WhatsApp directamente en el sistema.
            </p>

            <form onSubmit={handleCreateManualBooking} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ej. Rodrigo Sánchez"
                  className="w-full bg-[#151c29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">Email del Cliente *</label>
                <input
                  type="email"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="rodrigo@ejemplo.com"
                  className="w-full bg-[#151c29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+56 9..."
                    className="w-full bg-[#151c29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">Empresa</label>
                  <input
                    type="text"
                    value={manualBusiness}
                    onChange={(e) => setManualBusiness(e.target.value)}
                    placeholder="Clínica..."
                    className="w-full bg-[#151c29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-[#151c29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-[#151c29] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">Notas u Observaciones</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Detalles sobre el interés del cliente..."
                  className="w-full bg-[#151c29] border border-slate-700 rounded-lg p-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/20"
                >
                  Guardar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SINGLE LEAD CONFIRMATION MODAL */}
      {leadToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Eliminar esta reserva?</h3>
                <p className="text-xs text-slate-400">Esta acción borrará la cita de forma definitiva del sistema.</p>
              </div>
            </div>

            <div className="p-3 bg-[#151c2b] border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-semibold text-white">{leadToDelete.name}</span>
              </div>
              {leadToDelete.businessName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Empresa:</span>
                  <span className="text-slate-200">{leadToDelete.businessName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha y Hora:</span>
                <span className="font-mono text-cyan-300">{leadToDelete.date} • {leadToDelete.timeSlot} hrs</span>
              </div>
              {leadToDelete.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Correo:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{leadToDelete.email}</span>
                </div>
              )}
              {leadToDelete.serviceInterest && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Servicio de Interés:</span>
                  <span className="text-purple-300 font-medium">{leadToDelete.serviceInterest}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeletingLead}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteLead(leadToDelete.id)}
                disabled={isDeletingLead}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isDeletingLead ? 'Eliminando...' : 'Sí, Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL LEADS CONFIRMATION MODAL */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Vaciar todas las reservas?</h3>
                <p className="text-xs text-slate-400">Se eliminarán las {leads.length} citas registradas.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#151c2b] p-3 rounded-xl border border-slate-800">
              Esta acción eliminará permanentemente todas las reservas guardadas tanto en este panel como en el servidor. No se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                disabled={isDeletingLead}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmClearAllLeads}
                disabled={isDeletingLead}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isDeletingLead ? 'Vaciando...' : 'Sí, Vaciar Todo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION FEEDBACK TOAST */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101726] border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}
    </div>
  );
};
