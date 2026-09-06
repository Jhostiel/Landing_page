import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
  Zap,
  ShieldCheck,
  Building2,
  Smile,
  HeartPulse,
  Utensils,
  Dumbbell,
  Scale,
  MessageSquareText,
  Target,
  Laptop,
  MapPin,
  Share2,
  BookOpen,
  Check,
  Play,
  Mail,
  ChevronDown,
  ExternalLink,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { InfinityLogo, InfinityHeroEmblem } from './components/InfinityLogo';
import { BookingModal } from './components/BookingModal';
import { DemoSimulatorModal } from './components/DemoSimulatorModal';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import {
  TRUST_CLIENTS,
  SERVICES_LIST,
  PRICING_PLANS,
  VALUE_PROPOSITIONS,
  INDUSTRY_CASES
} from './data';
import { WorkspaceAuthState, AgencySiteConfig, ServiceItem, PricingPlan } from './types';
import { WORKSPACE_SCOPES, createCalendarEvent } from './workspace';
import { loadAgencyConfig } from './adminDefaults';

function getGoogleCalendarUrl(booking: { name: string; date: string; timeSlot: string; businessName?: string; serviceInterest?: string; meetingLink: string }) {
  try {
    const startIso = `${booking.date}T${booking.timeSlot}:00`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 45 * 60000);
    const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
    const title = `Llamada Estratégica IA: ${booking.name} & Infinity Impact`;
    const details = `Sesión de Estrategia de IA y Automatización.\nCliente: ${booking.name}\nEmpresa: ${booking.businessName || 'Empresa'}\nServicio: ${booking.serviceInterest || 'Consultoría IA'}\nSala Google Meet: ${booking.meetingLink}\n\nAgendada con Infinity Impact Agency.`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(booking.meetingLink)}`;
  } catch {
    return 'https://calendar.google.com';
  }
}

function downloadIcsFile(booking: { name: string; date: string; timeSlot: string; businessName?: string; serviceInterest?: string; meetingLink: string }) {
  try {
    const startIso = `${booking.date}T${booking.timeSlot}:00`;
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 45 * 60000);
    const formatIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Infinity Impact Agency//Booking//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:infinity_${Date.now()}@infinityimpactagency.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:Llamada Estratégica IA: ${booking.name} & Infinity Impact`,
      `DESCRIPTION:Sesión Estratégica de Automatización con IA.\\nSala Meet: ${booking.meetingLink}`,
      `LOCATION:${booking.meetingLink}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio de Llamada Estratégica',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cita-Infinity-Impact-${booking.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error downloading .ics file:', e);
  }
}

export default function App() {
  // Navigation / View state
  const [currentView, setCurrentView] = useState<'website' | 'admin'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path.includes('admin') ||
      path.includes('admind') ||
      hash.includes('admin') ||
      hash.includes('admind')
    ) ? 'admin' : 'website';
  });

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [selectedPlanForBooking, setSelectedPlanForBooking] = useState('INFINITY GROWTH');
  const [showWorkspaceHub, setShowWorkspaceHub] = useState(false);

  // Agency Config (editable from /admind)
  const [agencyConfig, setAgencyConfig] = useState<AgencySiteConfig>(() => loadAgencyConfig());

  // Services and Pricing (editable from /admind)
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

  // Client confirmation modal from email link
  const [confirmedBookingData, setConfirmedBookingData] = useState<{
    id: string;
    name: string;
    date: string;
    timeSlot: string;
    businessName: string;
    serviceInterest?: string;
    meetingLink: string;
    calendarScheduled?: boolean;
    calendarLink?: string | null;
  } | null>(null);

  // Detect email confirmation action in URL (?action=confirm_booking&id=...)
  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      const hash = window.location.hash;
      const leadId = urlParams.get('id') || (hash.includes('confirm_booking') ? new URLSearchParams(hash.split('?')[1]).get('id') : null);

      if ((action === 'confirm_booking' || hash.includes('confirm_booking')) && leadId) {
        try {
          // 1. Call server confirmation endpoint (auto-schedules to Google Calendar if server has token)
          let confirmedLead: any = null;
          let calendarScheduled = false;
          let calendarLink: string | null = null;

          try {
            const res = await fetch(`/api/leads/${leadId}/confirm`, { method: 'POST' });
            if (res.ok) {
              const resData = await res.json();
              confirmedLead = resData.lead;
              calendarScheduled = !!resData.calendarScheduled;
              calendarLink = resData.calendarLink || null;
            }
          } catch (e) {
            console.warn('Server confirm call fallback to local:', e);
          }

          // 2. Also update in localStorage
          try {
            const currentLeads: any[] = JSON.parse(localStorage.getItem('infinity_leads') || '[]');
            const updated = currentLeads.map((l) =>
              l.id === leadId ? { ...l, status: 'confirmado', confirmedAt: Date.now(), syncedCalendar: calendarScheduled || l.syncedCalendar } : l
            );
            localStorage.setItem('infinity_leads', JSON.stringify(updated));
            if (!confirmedLead) {
              confirmedLead = updated.find((l) => l.id === leadId);
            }
          } catch (e) {
            console.error(e);
          }

          // 3. Fallback: If client browser holds Google Workspace token and server hadn't scheduled yet
          const localGoogleToken = localStorage.getItem('google_access_token');
          if (localGoogleToken && !calendarScheduled && confirmedLead) {
            try {
              const startDateTime = `${confirmedLead.date}T${confirmedLead.timeSlot}:00`;
              const startDate = new Date(startDateTime);
              const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
              const endDate = new Date(startDate.getTime() + durationMin * 60000);
              const calRes = await createCalendarEvent(localGoogleToken, {
                summary: `Llamada Estratégica IA: ${confirmedLead.name} (${confirmedLead.businessName || 'Empresa'}) - Infinity Impact`,
                description: `Sesión Estratégica de Crecimiento y Automatización con IA.\n\nCliente: ${confirmedLead.name}\nEmpresa: ${confirmedLead.businessName || ''}\nWhatsApp: ${confirmedLead.phone || ''}\nEmail: ${confirmedLead.email || ''}\nServicio: ${confirmedLead.serviceInterest || 'Consultoría IA'}\nSala Meet: ${agencyConfig.notifications.customMeetingLink}\n\n✅ Confirmada por el cliente desde el correo.`,
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                attendeeEmail: confirmedLead.email,
              });
              calendarScheduled = true;
              calendarLink = calRes?.htmlLink || null;
            } catch (calErr) {
              console.warn('Local calendar auto-sync warning:', calErr);
            }
          }

          // 4. Notify open tabs / Admin Dashboard
          window.dispatchEvent(
            new CustomEvent('infinity_booking_confirmed', {
              detail: { id: leadId, lead: confirmedLead, calendarScheduled },
            })
          );

          // 5. Open celebratory confirmation modal
          setConfirmedBookingData({
            id: leadId,
            name: confirmedLead?.name || 'Estimado(a) Cliente',
            date: confirmedLead?.date || 'Fecha Agendada',
            timeSlot: confirmedLead?.timeSlot || '11:00',
            businessName: confirmedLead?.businessName || '',
            serviceInterest: confirmedLead?.serviceInterest || 'Consultoría IA',
            meetingLink: agencyConfig.notifications.customMeetingLink || 'https://meet.google.com/inf-agen-impact',
            calendarScheduled: calendarScheduled || !!confirmedLead?.syncedCalendar,
            calendarLink: calendarLink || confirmedLead?.calendarEventLink || null,
          });

          // Clean URL without reloading page
          window.history.replaceState({}, '', window.location.pathname + (hash.includes('admind') ? '#/admind' : ''));
        } catch (err) {
          console.error('Error confirming booking from link:', err);
        }
      }
    };

    checkEmailConfirmation();
  }, [agencyConfig.notifications.customMeetingLink]);

  // Listen to configuration updates from Admin Dashboard
  useEffect(() => {
    const handleConfigUpdate = () => {
      setAgencyConfig(loadAgencyConfig());
      try {
        const savedServices = localStorage.getItem('infinity_services_content');
        if (savedServices) setServices(JSON.parse(savedServices));
        const savedPricing = localStorage.getItem('infinity_pricing_content');
        if (savedPricing) {
          const parsed: PricingPlan[] = JSON.parse(savedPricing);
          setPricing(
            parsed.map((p, idx) => {
              const fallback = PRICING_PLANS[idx] || PRICING_PLANS[0];
              return {
                ...p,
                buttonText: p.buttonText || p.cta || fallback.buttonText || 'Elegir plan',
                cta: p.cta || p.buttonText || fallback.buttonText || 'Elegir plan',
              };
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path.includes('admin') ||
        path.includes('admind') ||
        hash.includes('admin') ||
        hash.includes('admind')
      ) {
        setCurrentView('admin');
      } else {
        setCurrentView('website');
      }
    };

    // Discreet shortcut for admin: Alt + A or Ctrl + Shift + A
    const handleAdminShortcut = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        window.location.hash = '#/admind';
        setCurrentView('admin');
      }
    };

    window.addEventListener('infinity_config_updated', handleConfigUpdate);
    window.addEventListener('infinity_content_updated', handleConfigUpdate);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('keydown', handleAdminShortcut);

    return () => {
      window.removeEventListener('infinity_config_updated', handleConfigUpdate);
      window.removeEventListener('infinity_content_updated', handleConfigUpdate);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleAdminShortcut);
    };
  }, []);

  // Google Workspace auth state
  const [workspaceAuth, setWorkspaceAuth] = useState<WorkspaceAuthState>(() => {
    const savedToken = localStorage.getItem('google_access_token');
    const savedEmail = localStorage.getItem('google_user_email');
    if (savedToken) {
      fetch('/api/workspace/sync-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: savedToken, email: savedEmail || 'infinityimpactagency@gmail.com' }),
      }).catch(() => {});
    }
    return {
      isConnected: !!savedToken,
      accessToken: savedToken,
      userEmail: savedEmail || 'infinityimpactagency@gmail.com',
      scopes: WORKSPACE_SCOPES,
    };
  });

  // Client icon mapper
  const getClientIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smile': return <Smile size={18} className="text-cyan-400" />;
      case 'HeartPulse': return <HeartPulse size={18} className="text-rose-400" />;
      case 'Utensils': return <Utensils size={18} className="text-amber-400" />;
      case 'Building2': return <Building2 size={18} className="text-blue-400" />;
      case 'Dumbbell': return <Dumbbell size={18} className="text-emerald-400" />;
      case 'Scale': return <Scale size={18} className="text-purple-400" />;
      default: return <Building2 size={18} className="text-slate-400" />;
    }
  };

  // Service icon mapper
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquareText': return <MessageSquareText size={22} className="text-emerald-400" />;
      case 'Target': return <Target size={22} className="text-cyan-400" />;
      case 'Laptop': return <Laptop size={22} className="text-blue-400" />;
      case 'MapPin': return <MapPin size={22} className="text-amber-400" />;
      case 'Share2': return <Share2 size={22} className="text-purple-400" />;
      case 'BookOpen': return <BookOpen size={22} className="text-rose-400" />;
      default: return <Zap size={22} className="text-emerald-400" />;
    }
  };

  // Value prop icon mapper
  const getValueIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap size={18} className="text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck size={18} className="text-cyan-400" />;
      case 'Clock': return <Clock size={18} className="text-blue-400" />;
      case 'TrendingUp': return <TrendingUp size={18} className="text-purple-400" />;
      default: return <Sparkles size={18} className="text-emerald-400" />;
    }
  };

  const handleInitiateOAuth = () => {
    // Check if Google GSI token client is available
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: '521109508539-client-demo.apps.googleusercontent.com',
        scope: WORKSPACE_SCOPES.join(' '),
        callback: (response) => {
          if (response.access_token) {
            localStorage.setItem('google_access_token', response.access_token);
            localStorage.setItem('google_user_email', 'infinityimpactagency@gmail.com');
            setWorkspaceAuth((prev) => ({
              ...prev,
              isConnected: true,
              accessToken: response.access_token!,
              userEmail: 'infinityimpactagency@gmail.com',
            }));
            fetch('/api/workspace/sync-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.access_token, email: 'infinityimpactagency@gmail.com' }),
            }).catch(() => {});
          }
        },
      });
      client.requestAccessToken();
    } else {
      // Simulate connected state with the user's jhostiel@gmail.com account for preview interaction
      const mockToken = 'workspace_active_token_' + Date.now();
      localStorage.setItem('google_access_token', mockToken);
      localStorage.setItem('google_user_email', 'jhostiel@gmail.com');
      setWorkspaceAuth({
        isConnected: true,
        accessToken: mockToken,
        userEmail: 'jhostiel@gmail.com',
        scopes: WORKSPACE_SCOPES,
      });
    }
  };

  const handleOpenBooking = (planName?: string) => {
    if (planName) {
      setSelectedPlanForBooking(planName);
    }
    setIsBookingOpen(true);
  };

  const navigateToAdmin = () => {
    window.location.hash = '#/admind';
    setCurrentView('admin');
  };

  const navigateToWebsite = () => {
    window.location.hash = '';
    setCurrentView('website');
  };

  // If user navigated to /admind, render AdminDashboard
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBackToWebsite={navigateToWebsite}
        workspaceAuth={workspaceAuth}
        onInitiateOAuth={handleInitiateOAuth}
      />
    );
  }

  const cleanWhatsAppNumber = agencyConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const waContactLink = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent('Hola Infinity Impact Agency, deseo información sobre sus servicios de automatización con IA.')}`;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top ambient atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-600/10 via-emerald-500/5 to-transparent blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/85 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <InfinityLogo size={36} />
          </a>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs sm:text-sm font-medium text-slate-300">
            <a href="#inicio" className="text-white hover:text-emerald-400 transition-colors">
              Inicio
            </a>
            <a href="#servicios" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
              Servicios <ChevronDown size={13} className="text-slate-500" />
            </a>
            <a href="#paquetes" className="hover:text-emerald-400 transition-colors">
              Paquetes
            </a>
            <a href="#industrias" className="hover:text-emerald-400 transition-colors">
              Industrias
            </a>
            <a href="#casos" className="hover:text-emerald-400 transition-colors">
              Casos de Éxito
            </a>
            <a href="#nosotros" className="hover:text-emerald-400 transition-colors">
              Nosotros
            </a>
            <a href="#contacto" className="hover:text-emerald-400 transition-colors">
              Contacto
            </a>
          </nav>

          {/* Top CTA button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => handleOpenBooking('Consulta General')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-sm active:scale-95"
            >
              Agenda una llamada
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Massive Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-['Outfit']">
                {agencyConfig.headline}
              </h1>

              {/* Subheading text */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                {agencyConfig.subheadline}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#servicios"
                  className="px-6 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center"
                >
                  Ver servicios
                </a>

                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="px-6 py-3.5 rounded-full font-semibold text-sm border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <Play size={10} className="ml-0.5 fill-current" />
                  </div>
                  <span>Ver cómo funciona</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xl sm:text-2xl font-['Outfit']">
                    <Users size={18} className="text-purple-400" />
                    <span>{agencyConfig.stats.activeClients}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Negocios impulsados</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xl sm:text-2xl font-['Outfit']">
                    <TrendingUp size={18} className="text-cyan-400" />
                    <span>{agencyConfig.stats.leadsDelivered}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Crecimiento promedio</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xl sm:text-2xl font-['Outfit']">
                    <Clock size={18} className="text-emerald-400" />
                    <span>{agencyConfig.stats.hoursSaved}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Atención inteligente</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xl sm:text-2xl font-['Outfit']">
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                    <span>{agencyConfig.stats.satisfactionRate}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Satisfacción de clientes</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Infinity Emblem */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <InfinityHeroEmblem />
            </div>

          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-12 border-y border-slate-800/80 bg-[#0a0d14]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-semibold tracking-[0.25em] text-slate-400 uppercase mb-8">
            NEGOCIOS QUE CONFÍAN EN NOSOTROS
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center opacity-75 hover:opacity-100 transition-opacity">
            {TRUST_CLIENTS.map((client, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 p-3 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-slate-700 group-hover:scale-110 transition-all">
                  {getClientIcon(client.icon)}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-200 tracking-wider group-hover:text-white">
                    {client.name}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
                    {client.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="servicios" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              NUESTROS SERVICIOS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-['Outfit']">
              Soluciones que generan impacto real
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Diseñadas específicamente para negocios que quieren crecer sin complicarse la vida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative rounded-2xl p-7 bg-[#0d121c]/90 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getServiceIcon(service.icon)}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 font-['Outfit'] group-hover:text-emerald-300 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/60">
                  <ul className="space-y-2 text-xs text-slate-300">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleOpenBooking(service.title)}
                    className="w-full pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors"
                  >
                    <span>Me interesa este servicio</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US / VALUE PROPOSITIONS */}
      <section id="nosotros" className="py-20 bg-[#090d14] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              ¿POR QUÉ ELEGIRNOS?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              No somos otra agencia más
            </h2>
            <p className="text-sm text-slate-400">
              Combinamos tecnología de punta con una obsesión por los resultados comerciales de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUE_PROPOSITIONS.map((vp, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  {getValueIcon(vp.icon)}
                </div>
                <h4 className="text-base font-bold text-white mb-2 font-['Outfit']">
                  {vp.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {vp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="paquetes" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              PLANES Y PRECIOS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-['Outfit']">
              Elige el plan ideal para tu negocio
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Inversión transparente sin costos ocultos. Comienza con lo que necesitas hoy y escala mañana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricing.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-7 flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'bg-[#0f1726] border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/10 -translate-y-2'
                    : 'bg-[#0c1017] border border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[10px] tracking-wider uppercase">
                    MÁS POPULAR
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-emerald-400 tracking-wider mb-1">
                    {plan.number}
                  </div>
                  <h3 className="text-xl font-black text-white font-['Outfit'] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    {plan.subtitle}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
                      {plan.price}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {plan.priceDetail}
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenBooking(plan.name)}
                  className={`w-full py-3.5 px-4 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 group flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-extrabold hover:from-emerald-400 hover:to-emerald-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <span className="tracking-wider uppercase text-[11px] font-extrabold">
                    {plan.buttonText || plan.cta || (plan.id === 'start' ? 'Comenzar ahora' : 'Elegir plan')}
                  </span>
                  <ArrowRight
                    size={14}
                    className={`transition-transform group-hover:translate-x-1 shrink-0 ${
                      plan.popular ? 'text-slate-950' : 'text-emerald-400'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES & SUCCESS CASES */}
      <section id="industrias" className="py-20 bg-[#090d14] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              SECTORES ESPECIALIZADOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Resultados comprobados por industria
            </h2>
            <p className="text-sm text-slate-400">
              Adaptamos cada flujo y agente de IA a las dinámicas concretas de tu sector.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INDUSTRY_CASES.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-emerald-400 mb-4">
                    {item.industry}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 font-['Outfit']">
                    {item.leadIncrease} en Crecimiento
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400 block text-[11px]">
                      Ahorro semanal:
                    </span>
                    <span className="text-emerald-400 font-bold text-xs">
                      {item.timeSaved}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBooking(`Caso ${item.industry}`)}
                  className="mt-6 text-xs text-slate-300 hover:text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Quiero estos resultados</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM BANNER */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-[#111724] to-[#0a0d14] border border-slate-800 text-center overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white max-w-2xl mx-auto leading-tight font-['Outfit']">
            ¿Listo para llevar tu negocio al siguiente nivel?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mt-4 mb-8 leading-relaxed">
            Agenda una llamada estratégica sin costo. Analizamos tus procesos actuales y te mostramos cómo la IA puede multiplicar tu facturación.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={waContactLink}
              target="_blank"
              rel="noreferrer"
              className="px-7 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <MessageSquareText size={16} />
              <span>Hablar por WhatsApp ({agencyConfig.whatsappNumber})</span>
            </a>

            <button
              onClick={() => handleOpenBooking('CTA Final')}
              className="px-7 py-3.5 rounded-full font-semibold text-sm border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-white transition-all active:scale-95"
            >
              Agendar Llamada Estratégica
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#05070a] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <InfinityLogo size={32} />
            <span className="text-[11px] text-slate-500">
              Horario de atención: <strong className="text-slate-300">{agencyConfig.supportHoursText}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#inicio" className="hover:text-slate-200 transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-slate-200 transition-colors">Servicios</a>
            <a href="#paquetes" className="hover:text-slate-200 transition-colors">Paquetes</a>
            <a href="#contacto" className="hover:text-slate-200 transition-colors">Contacto</a>
          </div>

          <div className="text-center md:text-right text-slate-500 text-[11px]">
            © 2026 {agencyConfig.agencyName}. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        workspaceAuth={workspaceAuth}
        onInitiateOAuth={handleInitiateOAuth}
        preselectedPlan={selectedPlanForBooking}
      />

      <DemoSimulatorModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onOpenBooking={() => {
          setIsDemoOpen(false);
          handleOpenBooking('Demo WhatsApp IA');
        }}
      />

      {/* CLIENT CONFIRMATION CELEBRATION MODAL */}
      {confirmedBookingData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 text-center">
            {/* Ambient emerald ring */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={42} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <Sparkles size={12} />
              Cita Oficialmente Confirmada
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              ¡Gracias por Confirmar, {confirmedBookingData.name}!
            </h3>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Tu asistencia a la llamada estratégica con los directores de <strong className="text-cyan-400">Infinity Impact Agency</strong> está 100% blindada. Nuestro panel administrativo ha sido notificado al instante.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-[#131926] border border-slate-800 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                <span className="font-semibold text-slate-200">Detalles de la Cita:</span>
                <span className="text-emerald-400 font-bold">Estado: Confirmado</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={14} className="text-cyan-400 shrink-0" />
                <span><strong>Fecha:</strong> {confirmedBookingData.date}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock size={14} className="text-emerald-400 shrink-0" />
                <span><strong>Hora:</strong> {confirmedBookingData.timeSlot} hrs</span>
              </div>
              {confirmedBookingData.businessName && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 size={14} className="text-blue-400 shrink-0" />
                  <span><strong>Empresa:</strong> {confirmedBookingData.businessName}</span>
                </div>
              )}
              {confirmedBookingData.serviceInterest && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span><strong>Servicio de Interés:</strong> <span className="text-cyan-300 font-semibold">{confirmedBookingData.serviceInterest}</span></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-300">
                <Laptop size={14} className="text-purple-400 shrink-0" />
                <span className="truncate"><strong>Sala Virtual:</strong> {confirmedBookingData.meetingLink}</span>
              </div>
            </div>

            {/* Google Calendar Auto-Schedule Status Banner */}
            <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-300 text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calendar size={13} />
                </div>
                <span>
                  <strong>Google Calendar de la Agencia:</strong>{' '}
                  {confirmedBookingData.calendarScheduled
                    ? 'Agendado y sincronizado automáticamente con éxito.'
                    : 'Cita registrada y confirmada en la agenda oficial.'}
                </span>
              </div>
              {confirmedBookingData.calendarLink && (
                <a
                  href={confirmedBookingData.calendarLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1 shrink-0 text-[11px] transition-colors"
                >
                  <span>Ver evento</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Client Add to Calendar Options */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                📅 Añadir a tu calendario personal:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={getGoogleCalendarUrl(confirmedBookingData)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Calendar size={13} />
                  <span>Google Calendar</span>
                  <ExternalLink size={11} />
                </a>
                <button
                  onClick={() => downloadIcsFile(confirmedBookingData)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Apple / Outlook (.ics)</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={confirmedBookingData.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>Acceder a la Sala Meet</span>
                <ExternalLink size={13} />
              </a>
              <button
                onClick={() => setConfirmedBookingData(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Cerrar y continuar al sitio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
