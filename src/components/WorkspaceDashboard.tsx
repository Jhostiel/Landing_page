import React, { useState } from 'react';
import {
  Calendar,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Trash2,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { WorkspaceAuthState } from '../types';
import { createCalendarEvent, sendGmailMessage, sendChatMessage } from '../workspace';

interface WorkspaceDashboardProps {
  workspaceAuth: WorkspaceAuthState;
  onInitiateOAuth: () => void;
  onOpenBooking: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  workspaceAuth,
  onInitiateOAuth,
  onOpenBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'gmail' | 'chat' | 'leads'>('calendar');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Email form state
  const [emailTo, setEmailTo] = useState(workspaceAuth.userEmail || '');
  const [emailSubject, setEmailSubject] = useState('Propuesta de Automatización IA - Infinity Impact Agency');
  const [emailBody, setEmailBody] = useState(
    'Estimado cliente,\n\nAdjuntamos la propuesta personalizada para automatizar la atención en WhatsApp y la captación de clientes de su empresa.\n\nQuedamos a su disposición para coordinar la llamada estratégica.\n\nAtentamente,\nEquipo Infinity Impact Agency'
  );

  // Chat message state
  const [chatMessage, setChatMessage] = useState('🔥 Alerta de Lead Calificado: Paciente solicita cita prioritaria para implante dental en BellaVista.');

  // Leads from localStorage
  const [leads, setLeads] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('infinity_leads') || '[]');
    } catch {
      return [];
    }
  });

  const refreshLeads = () => {
    try {
      setLeads(JSON.parse(localStorage.getItem('infinity_leads') || '[]'));
    } catch {
      setLeads([]);
    }
  };

  const clearLeads = () => {
    localStorage.removeItem('infinity_leads');
    setLeads([]);
  };

  const handleTestCalendarEvent = async () => {
    if (!workspaceAuth.accessToken) {
      onInitiateOAuth();
      return;
    }
    setIsBusy(true);
    setTestStatus(null);
    try {
      const now = new Date();
      now.setHours(now.getHours() + 2);
      const end = new Date(now.getTime() + 45 * 60000);

      await createCalendarEvent(workspaceAuth.accessToken, {
        summary: 'Demo: Llamada Estratégica Infinity Impact Agency',
        description: 'Evento de prueba creado desde el panel de control de Infinity Agency.',
        startDateTime: now.toISOString(),
        endDateTime: end.toISOString(),
        attendeeEmail: workspaceAuth.userEmail || undefined,
      });

      setTestStatus('¡Evento de prueba creado exitosamente en tu Google Calendar!');
    } catch (err: any) {
      setTestStatus(`Error al sincronizar con Calendar: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceAuth.accessToken) {
      onInitiateOAuth();
      return;
    }
    setIsBusy(true);
    setTestStatus(null);
    try {
      await sendGmailMessage(workspaceAuth.accessToken, {
        to: emailTo,
        subject: emailSubject,
        body: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          ${emailBody.replace(/\n/g, '<br/>')}
          <hr style="margin-top:20px; border:0; border-top:1px solid #e2e8f0;"/>
          <p style="font-size:12px; color:#64748b;">Enviado a través de Infinity Impact Agency Workspace Integration.</p>
        </div>`,
      });
      setTestStatus(`¡Correo enviado con éxito a ${emailTo} mediante tu cuenta de Gmail!`);
    } catch (err: any) {
      setTestStatus(`Error al enviar por Gmail: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendTestChat = async () => {
    if (!workspaceAuth.accessToken) {
      onInitiateOAuth();
      return;
    }
    setIsBusy(true);
    setTestStatus(null);
    try {
      await sendChatMessage(workspaceAuth.accessToken, 'spaces', chatMessage);
      setTestStatus('¡Mensaje emitido hacia Google Chat!');
    } catch (err: any) {
      setTestStatus(`Notificación Google Chat: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-12 p-6 sm:p-8 bg-[#0b0f17] border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Sparkles size={12} />
              Centro de Operaciones Workspace
            </span>
            {workspaceAuth.isConnected ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={12} /> Conectado ({workspaceAuth.userEmail})
              </span>
            ) : (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Google Workspace Desconectado
              </span>
            )}
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-2 font-['Outfit']">
            Automatización en Vivo: Calendar, Gmail & Chat
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Gestiona citas estratégicas, secuencias de seguimiento y alertas de nuevos clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!workspaceAuth.isConnected ? (
            <button
              onClick={onInitiateOAuth}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck size={14} />
              Vincular Cuenta Google
            </button>
          ) : (
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Calendar size={13} />
              Agendar Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-800/80 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { setActiveTab('calendar'); setTestStatus(null); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar size={14} />
          Google Calendar
        </button>

        <button
          onClick={() => { setActiveTab('gmail'); setTestStatus(null); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'gmail'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mail size={14} />
          Gmail Auto-Send
        </button>

        <button
          onClick={() => { setActiveTab('chat'); setTestStatus(null); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare size={14} />
          Google Chat Alertas
        </button>

        <button
          onClick={() => { setActiveTab('leads'); refreshLeads(); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Leads & Citas Registradas ({leads.length})</span>
        </button>
      </div>

      {/* Status banner */}
      {testStatus && (
        <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{testStatus}</span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-[#121722] rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                Sincronización Bidireccional de Citas
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cada vez que un cliente solicita una llamada estratégica a través de la web o el agente de IA en WhatsApp, Infinity Agency crea automáticamente un evento en tu Google Calendar principal, reservando el horario y enviando un enlace seguro de videollamada a ambas partes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#161d2b] border border-slate-700/60 text-xs">
                  <div className="text-slate-400 font-medium">Recordatorios automáticos</div>
                  <div className="text-emerald-400 font-bold mt-1">Notificación 24h y 1h antes</div>
                  <div className="text-[11px] text-slate-500 mt-1">Disminuye el ausentismo en un 87%</div>
                </div>
                <div className="p-3 rounded-xl bg-[#161d2b] border border-slate-700/60 text-xs">
                  <div className="text-slate-400 font-medium">Zona Horaria</div>
                  <div className="text-blue-400 font-bold mt-1">Ajuste automático</div>
                  <div className="text-[11px] text-slate-500 mt-1">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleTestCalendarEvent}
                  disabled={isBusy}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Calendar size={14} />
                  Crear evento de prueba en Calendar
                </button>
                <button
                  onClick={onOpenBooking}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  Abrir modal de agendamiento
                </button>
              </div>
            </div>

            <div className="p-5 bg-[#121722] rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h5 className="text-sm font-bold text-white mb-2">Próximos Horarios Disponibles</h5>
                <p className="text-xs text-slate-400 mb-4">Slots sincronizados para llamadas estratégicas:</p>
                <div className="space-y-2 text-xs">
                  {['Hoy 15:00 hrs', 'Hoy 16:30 hrs', 'Mañana 10:00 hrs', 'Mañana 11:30 hrs'].map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">{slot}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Libre</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-4">
                La disponibilidad se actualiza en tiempo real evitando doble reserva.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'gmail' && (
          <div className="p-5 bg-[#121722] rounded-2xl border border-slate-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Mail size={18} className="text-red-400" />
              Emisión de Correos y Propuestas vía Gmail
            </h4>
            <p className="text-xs text-slate-300 mb-4">
              Envía confirmaciones instantáneas, dossiers de servicios y propuestas comerciales directamente desde tu buzón autenticado.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-3 max-w-2xl text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destinatario:</label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="cliente@empresa.com"
                  className="w-full bg-[#161d2b] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Asunto:</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#161d2b] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cuerpo del mensaje (Plantilla IA):</label>
                <textarea
                  rows={4}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[#161d2b] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Send size={13} />
                Enviar Correo con Gmail
              </button>
            </form>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="p-5 bg-[#121722] rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-400" />
              Notificaciones de Prospectos a Google Chat
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mantén a tu equipo de ventas sincronizado enviando alertas de nuevos leads calificados a los espacios de Google Chat de tu organización.
            </p>

            <div className="max-w-2xl space-y-3">
              <label className="block text-xs text-slate-300 font-semibold">Mensaje de alerta a emitir:</label>
              <textarea
                rows={3}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="w-full bg-[#161d2b] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <button
                onClick={handleSendTestChat}
                disabled={isBusy}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Send size={13} />
                Emitir Notificación a Google Chat
              </button>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="p-5 bg-[#121722] rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Leads y Citas Registradas</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshLeads}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Actualizar lista"
                >
                  <RefreshCw size={14} />
                </button>
                {leads.length > 0 && (
                  <button
                    onClick={clearLeads}
                    className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Borrar registros"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay citas agendadas aún. Haz clic en "Agendar una llamada" en el menú o en los paquetes para crear tu primera reserva.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Cliente</th>
                      <th className="pb-2">Empresa</th>
                      <th className="pb-2">Fecha y Hora</th>
                      <th className="pb-2">Plan</th>
                      <th className="pb-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {leads.map((l, i) => (
                      <tr key={l.id || i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-medium text-white">{l.name}</td>
                        <td className="py-2.5 text-slate-400">{l.businessName || 'General'}</td>
                        <td className="py-2.5 text-cyan-400">{l.date} {l.timeSlot}</td>
                        <td className="py-2.5 text-emerald-400">{l.serviceInterest}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Agendado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
