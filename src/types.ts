export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessCategory: string;
  serviceInterest: string;
  notes: string;
  date: string;
  timeSlot: string;
  status: 'nuevo' | 'agendado' | 'contactado' | 'en_progreso' | 'completado' | 'cancelado' | 'confirmado';
  createdAt: number;
  confirmedAt?: number;
  syncedCalendar?: boolean;
  calendarEventId?: string;
  calendarEventLink?: string;
  sentEmail?: boolean;
  adminNotified?: boolean;
}

export interface BusinessDaySchedule {
  day: number; // 0 = Dom, 1 = Lun, 2 = Mar, 3 = Mie, 4 = Jue, 5 = Vie, 6 = Sab
  name: string;
  active: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "19:00"
}

export interface AgencyHoursConfig {
  days: BusinessDaySchedule[];
  slotDurationMinutes: number; // 30, 45, 60
  breakBetweenSlotsMinutes: number;
  minNoticeHours: number;
  timezone: string;
  maxDailyBookings: number;
  blockedDates: string[]; // ['YYYY-MM-DD']
}

export interface AdminNotificationSettings {
  adminEmail: string;
  adminPhone: string;
  notifyAdminOnBooking: boolean;
  notifySoundEnabled: boolean;
  sendClientConfirmationEmail: boolean;
  emailSubjectTemplate: string;
  customMeetingLink: string;
  notifyGoogleChat: boolean;
  chatSpaceName: string;
  googleCalendarId?: string;
  googleCalendarEmbedUrl?: string;
}

export interface AgencySiteConfig {
  agencyName: string;
  headline: string;
  subheadline: string;
  whatsappNumber: string;
  whatsappDefaultMessage?: string;
  contactEmail: string;
  supportHoursText: string;
  hoursConfig: AgencyHoursConfig;
  notifications: AdminNotificationSettings;
  stats: {
    activeClients: string;
    leadsDelivered: string;
    satisfactionRate: string;
    hoursSaved: string;
  };
}

export interface NotificationLog {
  id: string;
  type: 'admin_alert' | 'client_confirmation' | 'calendar_sync';
  recipient: string;
  title: string;
  message: string;
  timestamp: number;
  status: 'enviado' | 'simulado' | 'error';
  leadId?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tag?: string;
  features: string[];
  gradient: string;
  highlightText: string;
  popular?: boolean;
}

export interface PricingPlan {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  price: string;
  priceDetail: string;
  features: string[];
  buttonText: string;
  cta?: string;
  popular?: boolean;
  accentGradient?: string;
}

export interface TrustClient {
  name: string;
  sub: string;
  icon: string;
}

export interface WorkspaceAuthState {
  isConnected: boolean;
  userEmail: string | null;
  accessToken: string | null;
  scopes: string[];
}
