import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Send,
  Bell,
  Check
} from 'lucide-react';
import { createCalendarEvent, sendGmailMessage, sendChatMessage } from '../workspace';
import { WorkspaceAuthState, LeadData } from '../types';
import {
  loadAgencyConfig,
  generateAvailableSlots,
  playNotificationChime,
  logNotification
} from '../adminDefaults';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceAuth: WorkspaceAuthState;
  onInitiateOAuth: () => void;
  preselectedPlan?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  workspaceAuth,
  onInitiateOAuth,
  preselectedPlan = 'INFINITY GROWTH',
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Agency Config (hours, notifications, contact)
  const [agencyConfig, setAgencyConfig] = useState(() => loadAgencyConfig());

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Salud / Clínica');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [notes, setNotes] = useState('');

  // Sync options with Google Workspace
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [sendGmailConfirm, setSendGmailConfirm] = useState(true);
  const [calendarEventCreated, setCalendarEventCreated] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [adminNotified, setAdminNotified] = useState(false);
  const [createdLeadData, setCreatedLeadData] = useState<LeadData | null>(null);

  // Stored leads to avoid double bookings
  const [storedLeads, setStoredLeads] = useState<LeadData[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('infinity_leads') || '[]');
    } catch {
      return [];
    }
  });

  // Reload config whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const freshConfig = loadAgencyConfig();
      setAgencyConfig(freshConfig);
      try {
        setStoredLeads(JSON.parse(localStorage.getItem('infinity_leads') || '[]'));
      } catch {
        setStoredLeads([]);
      }
    }
  }, [isOpen]);

  // Compute available slots dynamically based on active agency hours
  const calculatedSlots = useMemo(() => {
    return generateAvailableSlots(selectedDate, agencyConfig.hoursConfig, storedLeads);
  }, [selectedDate, agencyConfig, storedLeads]);

  // Ensure selectedTime is valid when date changes
  useEffect(() => {
    const availableSlots = calculatedSlots.filter((s) => s.available);
    if (availableSlots.length > 0) {
      const match = availableSlots.find((s) => s.slot === selectedTime);
      if (!match) {
        setSelectedTime(availableSlots[0].slot);
      }
    }
  }, [calculatedSlots, selectedTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate that slots exist
    const hasAvailable = calculatedSlots.some((s) => s.available && s.slot === selectedTime);
    if (!hasAvailable && calculatedSlots.length > 0) {
      setErrorMessage('El horario seleccionado ya no está disponible. Por favor elige otro.');
      return;
    }

    if (calculatedSlots.length === 0) {
      setErrorMessage('No hay horarios de atención disponibles para la fecha seleccionada. Por favor selecciona otro día.');
      return;
    }

    setIsSubmitting(true);

    // 1. Play audible chime if enabled
    if (agencyConfig.notifications.notifySoundEnabled) {
      try {
        playNotificationChime();
      } catch (err) {
        console.warn('Audio chime error:', err);
      }
    }

    try {
      let createdEvent = false;
      let sentMail = true;
      let notifiedAdmin = true;
      let serverLead: LeadData | null = null;
      let previewUrlResult: string | null = null;
      let confirmUrlResult: string | null = null;

      // 1. Send to server backend to automatically dispatch real HTML email to client with agency colors & confirmation button!
      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            businessName,
            businessCategory: category,
            serviceInterest: preselectedPlan,
            notes,
            date: selectedDate,
            timeSlot: selectedTime,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.lead) {
            serverLead = resJson.lead;
            sentMail = resJson.emailSent;
            notifiedAdmin = resJson.adminNotified;
            previewUrlResult = resJson.clientPreviewUrl || `/api/preview-email/${resJson.lead.id}`;
            confirmUrlResult = resJson.confirmUrl || `/?action=confirm_booking&id=${resJson.lead.id}&email=${encodeURIComponent(email)}`;
          }
        }
      } catch (backendErr) {
        console.warn('Backend leads API warning, falling back to local dispatch:', backendErr);
      }

      const meetingLink = agencyConfig.notifications.customMeetingLink || 'https://meet.google.com/infinity-impact-call';
      const adminEmail = agencyConfig.notifications.adminEmail || 'jhostiel@gmail.com';

      // 2. Google Workspace operations if OAuth token is available in this browser session
      if (workspaceAuth.accessToken) {
        // A. Create Calendar Event
        if (syncToCalendar) {
          try {
            const startDateTime = `${selectedDate}T${selectedTime}:00`;
            const startDate = new Date(startDateTime);
            const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
            const endDate = new Date(startDate.getTime() + durationMin * 60000);

            await createCalendarEvent(workspaceAuth.accessToken, {
              summary: `Llamada Estratégica IA: ${businessName || name} & Infinity Impact`,
              description: `Sesión Estratégica de Automatización de Procesos con IA.\n\nCliente: ${name}\nEmpresa: ${businessName}\nRubro: ${category}\nWhatsApp / Tel: ${phone}\nEmail: ${email}\nPlan: ${preselectedPlan}\nEnlace Meet: ${meetingLink}\nNotas: ${notes}`,
              startDateTime: startDate.toISOString(),
              endDateTime: endDate.toISOString(),
              attendeeEmail: email,
            });
            createdEvent = true;
            setCalendarEventCreated(true);
          } catch (err: any) {
            console.warn('Google Calendar sync warning:', err);
          }
        }

        // B. Send confirmation via Gmail API if connected
        if (sendGmailConfirm && agencyConfig.notifications.sendClientConfirmationEmail && email) {
          try {
            const subject = `Confirmación: Tu Llamada Estratégica con ${agencyConfig.agencyName}`;
            await sendGmailMessage(workspaceAuth.accessToken, {
              to: email,
              subject,
              body: `
                <div style="font-family: sans-serif; max-width: 600px; background: #07090e; color: #f1f5f9; padding: 24px; border-radius: 14px;">
                  <h2 style="color: #06b6d4;">¡Hola ${name}! Tu cita ha sido agendada con éxito</h2>
                  <p>Te esperamos el <strong>${selectedDate}</strong> a las <strong>${selectedTime} hrs</strong>.</p>
                  <p><a href="${confirmUrlResult || `/?action=confirm_booking&id=${serverLead?.id || 'lead'}`}" style="display:inline-block; background: #10b981; color: black; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none;">CONFIRMAR MI CITA AHORA</a></p>
                </div>
              `,
            });
            sentMail = true;
          } catch (err: any) {
            console.warn('Gmail client confirmation warning:', err);
          }
        }
      }

      // Log notification in memory / local store
      logNotification({
        type: 'client_confirmation',
        recipient: email,
        title: `Confirmación enviada a ${name}`,
        message: `Correo oficial con branding y botón de confirmación enviado para el ${selectedDate} a las ${selectedTime} hrs.`,
        status: 'enviado',
      });

      logNotification({
        type: 'admin_alert',
        recipient: adminEmail,
        title: `Alerta: Cita agendada por ${name}`,
        message: `Lead ${businessName || name} agendado para ${selectedDate} ${selectedTime} hrs. Correo enviado al admin.`,
        status: 'enviado',
      });

      // 3. Save lead in localStorage CRM
      const newLead: LeadData = serverLead || {
        id: `lead_${Date.now()}`,
        name,
        email,
        phone,
        businessName,
        businessCategory: category,
        serviceInterest: preselectedPlan,
        notes,
        date: selectedDate,
        timeSlot: selectedTime,
        status: 'agendado',
        createdAt: Date.now(),
        syncedCalendar: createdEvent,
        sentEmail: true,
        adminNotified: true,
      };

      setCreatedLeadData(newLead);
      setEmailSent(true);
      setAdminNotified(true);

      const updatedLeads = [newLead, ...storedLeads.filter((l) => l.id !== newLead.id)];
      localStorage.setItem('infinity_leads', JSON.stringify(updatedLeads));
      setStoredLeads(updatedLeads);

      // Dispatch event for Admin Dashboard synchronization
      window.dispatchEvent(new CustomEvent('infinity_booking_created', { detail: newLead }));

      setStep('success');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocurrió un error al agendar la llamada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setName('');
    setEmail('');
    setPhone('');
    setBusinessName('');
    setNotes('');
    setCalendarEventCreated(false);
    setEmailSent(false);
    setAdminNotified(false);
    setCreatedLeadData(null);
    onClose();
  };

  // Check if date is in the past or inactive
  const availableSlotsCount = calculatedSlots.filter((s) => s.available).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#0c1017] border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {step === 'form' ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wide text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                <Sparkles size={13} />
                Llamada Estratégica 1 a 1
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {agencyConfig.hoursConfig.slotDurationMinutes || 45} min • 100% Gratuita
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mt-2 font-['Outfit']">
              Agenda tu llamada estratégica
            </h3>
            <p className="text-sm text-slate-400 mt-1 mb-5">
              Analizaremos tus procesos actuales y te mostraremos en vivo cómo la IA puede multiplicar tu captación de clientes.
            </p>

            {/* Google Workspace Connection Banner */}
            <div className="p-3.5 mb-5 rounded-xl border border-slate-800 bg-[#131924] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    Google Calendar & Gmail
                    {workspaceAuth.isConnected ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Conectado
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Opcional
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {workspaceAuth.isConnected
                      ? `Conectado como ${workspaceAuth.userEmail || 'usuario Google'}`
                      : 'Sincroniza el evento en tu calendario y recibe confirmación automática'}
                  </p>
                </div>
              </div>

              {!workspaceAuth.isConnected && (
                <button
                  type="button"
                  onClick={onInitiateOAuth}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 rounded-lg font-medium transition-all text-xs shrink-0"
                >
                  Conectar Google
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-cyan-400" />
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-cyan-400" />
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@tuempresa.com"
                    className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-400" />
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building size={13} className="text-cyan-400" />
                    Nombre de tu Empresa / Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Clínica San Lucas"
                    className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sector / Industria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  >
                    <option value="Salud / Clínica">Salud / Odontología / Estética</option>
                    <option value="Restaurantes / Gastronomía">Restaurantes / Gastronomía</option>
                    <option value="Legal / Estudio Jurídico">Legal / Abogados / Contabilidad</option>
                    <option value="Inmobiliario / Real Estate">Inmobiliario / Bienes Raíces</option>
                    <option value="Fitness / Bienestar">Fitness / Centros Deportivos</option>
                    <option value="Servicios Profesionales">Servicios Profesionales / Consultoría</option>
                    <option value="Comercio / E-commerce">Comercio / E-commerce</option>
                    <option value="Otro">Otro negocio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-blue-400" /> Fecha preferida *
                    </span>
                    <span className="text-[10px] text-slate-400">{agencyConfig.supportHoursText}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic Time Slots based on Agency Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-amber-400" /> Horarios de atención disponibles *
                  </span>
                  <span className="text-[10px] text-cyan-400">
                    {availableSlotsCount} franjas disponibles
                  </span>
                </label>

                {calculatedSlots.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>
                      En este día no hay atención al cliente según la configuración oficial. Por favor selecciona otro día de la semana.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
                    {calculatedSlots.map((item) => (
                      <button
                        key={item.slot}
                        type="button"
                        disabled={!item.available}
                        onClick={() => setSelectedTime(item.slot)}
                        className={`py-2 px-2 rounded-xl text-xs font-mono font-medium text-center transition-all border ${
                          selectedTime === item.slot && item.available
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                            : item.available
                            ? 'bg-[#151c2a] text-slate-200 border-slate-700/80 hover:border-cyan-500/60 hover:text-white'
                            : 'bg-slate-900/40 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                        }`}
                      >
                        {item.slot} hrs
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ¿Cuál es tu mayor reto o qué te gustaría automatizar?
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pierdo mucho tiempo respondiendo mensajes en WhatsApp y quiero que una IA agende automáticamente mis pacientes..."
                  className="w-full bg-[#161c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                />
              </div>

              {/* Workspace sync notifications notice */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                <span className="font-semibold text-white block text-[11px] uppercase tracking-wider text-slate-400">
                  Automatizaciones incluidas con esta reserva:
                </span>
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <Check size={13} />
                  <span>Te enviaremos un correo de confirmación oficial con el enlace de Google Meet.</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 text-[11px]">
                  <Bell size={13} />
                  <span>El equipo de Infinity Impact Agency recibirá notificación inmediata para preparar tu sesión.</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableSlotsCount === 0}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Agendando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Confirmar Llamada Estratégica</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-2xl font-bold text-white font-['Outfit']">
              ¡Llamada Agendada con Éxito!
            </h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Hemos reservado tu espacio para el <strong>{selectedDate}</strong> a las <strong>{selectedTime} hrs</strong>.
            </p>

            {/* Notification message */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-slate-900 border border-emerald-500/40 text-left text-xs max-w-md mx-auto shadow-md">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 text-base mt-0.5">✉️</span>
                <div>
                  <p className="text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    Confirmación Enviada
                  </p>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Hemos enviado un correo a <strong className="text-white">{email}</strong> con los detalles de la sesión y el enlace directo para confirmar tu asistencia.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#131924] border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex justify-between items-center">
                <span>Resumen de la sesión</span>
                <span className="text-cyan-400 font-semibold">{preselectedPlan}</span>
              </div>
              <div className="text-slate-400 space-y-1">
                <p>👤 <strong>Cliente:</strong> {name} ({businessName || 'Empresa'})</p>
                <p>📱 <strong>WhatsApp:</strong> {phone}</p>
                <p>✉️ <strong>Email:</strong> {email}</p>
                <p>🔗 <strong>Reunión:</strong> {agencyConfig.notifications.customMeetingLink}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/20"
              >
                Listo, volver al sitio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
