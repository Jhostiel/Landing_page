import { AgencySiteConfig, LeadData, NotificationLog } from './types';

export const DEFAULT_AGENCY_CONFIG: AgencySiteConfig = {
  "agencyName": "Infinity Impact Agency",
  "headline": "Automatizamos el Crecimiento de tu Negocio con Inteligencia Artificial",
  "subheadline": "Agentes inteligentes para WhatsApp, captación automatizada de clientes de alto valor y páginas web de alta conversión.",
  "whatsappNumber": "+56 9 8765 4321",
  "contactEmail": "infinityimpactagency@gmail.com",
  "supportHoursText": "Lunes a Viernes 09:00 a 19:00 hrs | Sábados 10:00 a 14:00 hrs",
  "hoursConfig": {
    "days": [
      {
        "day": 1,
        "name": "Lunes",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 2,
        "name": "Martes",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 3,
        "name": "Miércoles",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 4,
        "name": "Jueves",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 5,
        "name": "Viernes",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 6,
        "name": "Sábado",
        "active": true,
        "startTime": "10:00",
        "endTime": "14:00"
      },
      {
        "day": 0,
        "name": "Domingo",
        "active": false,
        "startTime": "10:00",
        "endTime": "13:00"
      }
    ],
    "slotDurationMinutes": 45,
    "breakBetweenSlotsMinutes": 15,
    "minNoticeHours": 2,
    "timezone": "America/Bogota",
    "maxDailyBookings": 8,
    "blockedDates": []
  },
  "notifications": {
    "adminEmail": "infinityimpactagency@gmail.com",
    "adminPhone": "+56 9 8765 4321",
    "notifyAdminOnBooking": true,
    "notifySoundEnabled": true,
    "sendClientConfirmationEmail": true,
    "emailSubjectTemplate": "Confirmación de Llamada Estratégica: Infinity Impact Agency",
    "customMeetingLink": "https://meet.google.com/inf-agen-impact",
    "notifyGoogleChat": true,
    "chatSpaceName": "spaces/sales-leads-infinity",
    "googleCalendarId": "infinityimpactagency@gmail.com",
    "googleCalendarEmbedUrl": "https://calendar.google.com/calendar/embed?src=infinityimpactagency%40gmail.com&ctz=America%2FBogota"
  },
  "stats": {
    "activeClients": "45+",
    "leadsDelivered": "180,000+",
    "satisfactionRate": "99.4%",
    "hoursSaved": "3,200 hrs"
  }
};

const STORAGE_KEY = 'infinity_agency_site_config';
const NOTIFICATIONS_KEY = 'infinity_admin_notifications';

export function loadAgencyConfig(): AgencySiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AGENCY_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AGENCY_CONFIG,
      ...parsed,
      hoursConfig: {
        ...DEFAULT_AGENCY_CONFIG.hoursConfig,
        ...(parsed.hoursConfig || {}),
        days: parsed.hoursConfig?.days || DEFAULT_AGENCY_CONFIG.hoursConfig.days,
      },
      notifications: {
        ...DEFAULT_AGENCY_CONFIG.notifications,
        ...(parsed.notifications || {}),
      },
      stats: {
        ...DEFAULT_AGENCY_CONFIG.stats,
        ...(parsed.stats || {}),
      }
    };
  } catch {
    return DEFAULT_AGENCY_CONFIG;
  }
}

export function saveAgencyConfig(config: AgencySiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

/**
 * Generate slots for a given date based on configured business hours and booked slots
 */
export function generateAvailableSlots(
  dateStr: string,
  config: AgencySiteConfig['hoursConfig'],
  existingBookings: LeadData[] = []
): { slot: string; available: boolean; reason?: string }[] {
  if (!dateStr) return [];
  
  // Parse date
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 is sunday, 1 is monday...

  // Check if date is in blocked dates
  if (config.blockedDates.includes(dateStr)) {
    return [];
  }

  // Find day configuration
  const daySchedule = config.days.find(d => d.day === dayOfWeek);
  if (!daySchedule || !daySchedule.active) {
    return [];
  }

  const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
  const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const step = config.slotDurationMinutes + config.breakBetweenSlotsMinutes;

  const results: { slot: string; available: boolean; reason?: string }[] = [];
  const bookedTimes = existingBookings
    .filter(b => b.date === dateStr && b.status !== 'cancelado')
    .map(b => b.timeSlot);

  // Check today and minimum notice hours
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes() + (config.minNoticeHours * 60);

  for (let m = startMinutes; m + config.slotDurationMinutes <= endMinutes; m += step) {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    const timeLabel = `${hh}:${mm}`;

    if (isToday && m < currentMinutesToday) {
      results.push({
        slot: timeLabel,
        available: false,
        reason: 'Tiempo mínimo de anticipación requerido',
      });
      continue;
    }

    if (bookedTimes.includes(timeLabel)) {
      results.push({
        slot: timeLabel,
        available: false,
        reason: 'Horario ya reservado por otro cliente',
      });
      continue;
    }

    results.push({
      slot: timeLabel,
      available: true,
    });
  }

  return results;
}

/**
 * Plays a high quality chime using Web Audio API
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic bell chime
    const playTone = (freq: number, start: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(gainVal, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.45, 0.18);        // C5
    playTone(659.25, now + 0.1, 0.45, 0.22);  // E5
    playTone(783.99, now + 0.2, 0.6, 0.26);   // G5
    playTone(1046.50, now + 0.3, 0.8, 0.28);  // C6
  } catch (e) {
    console.debug('Chime played in silent context', e);
  }
}

/**
 * Log notifications
 */
export function logNotification(log: Omit<NotificationLog, 'id' | 'timestamp'>): NotificationLog {
  const newLog: NotificationLog = {
    ...log,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([newLog, ...existing].slice(0, 100)));
  } catch (e) {
    console.error('Error logging notification', e);
  }

  return newLog;
}

export function getNotificationLogs(): NotificationLog[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  } catch {
    return [];
  }
}
