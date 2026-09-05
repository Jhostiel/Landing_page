import { ServiceItem, PricingPlan, TrustClient } from './types';

export const TRUST_CLIENTS: TrustClient[] = [
  { name: 'DENTAL CARE', sub: 'CLÍNICA ODONTOLÓGICA', icon: 'Smile' },
  { name: 'BellaVista', sub: 'CLÍNICA MÉDICA', icon: 'HeartPulse' },
  { name: 'Sabor & Fuego', sub: 'RESTAURANTE GOURMET', icon: 'Utensils' },
  { name: 'Hotel Paraíso', sub: 'BOUTIQUE & SPA', icon: 'Building2' },
  { name: 'FIT LIFE', sub: 'GYM & WELLNESS', icon: 'Dumbbell' },
  { name: 'ESTUDIO JURÍDICO', sub: 'LEGAL ADVISORS', icon: 'Scale' },
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'whatsapp-ia',
    title: 'Agentes de IA para WhatsApp',
    description: 'Atención 24/7 que responde al instante, califica leads y agenda citas en tu calendario de forma 100% automática.',
    iconName: 'MessageSquareText',
    tag: 'Automatización 24/7',
    features: [
      'Respuestas contextuales inmediatas en < 3 segundos',
      'Integración directa con Google Calendar y agenda',
      'Filtro y calificación de prospectos calificados',
      'Derivación fluida a asesores humanos cuando sea necesario'
    ],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    highlightText: 'Saber más →',
    popular: true
  },
  {
    id: 'leads-ia',
    title: 'Generación de Leads con IA',
    description: 'Cold Email híper-personalizado, prospección en LinkedIn y secuencias inteligentes para atraer clientes con alto poder de compra.',
    iconName: 'Target',
    tag: 'Adquisición B2B/B2C',
    features: [
      'Investigación y enriquecimiento de prospectos con IA',
      'Secuencias personalizadas 1 a 1 sin sonar a spam',
      'Envío inteligente con calentamiento de dominios',
      'Notificaciones inmediatas vía Gmail y Google Chat'
    ],
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    highlightText: 'Saber más →'
  },
  {
    id: 'web-conversion',
    title: 'Páginas Web que Convierten',
    description: 'Diseños modernos, ultra-rápidos, adaptados a móviles y optimizados con copy persuasivo para convertir visitantes en clientes de pago.',
    iconName: 'Laptop',
    tag: 'Diseño & Alta Conversión',
    features: [
      'Arquitectura UX orientada a conversión directa',
      'Velocidad de carga subsegundo (95+ en Google PageSpeed)',
      'Diseño responsivo premium con identidad visual de impacto',
      'Tracking avanzado con Meta Pixel, GA4 y eventos personalizados'
    ],
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    highlightText: 'Saber más →'
  },
  {
    id: 'seo-local',
    title: 'SEO Local + Reputación Inteligente',
    description: 'Posicionamos tu negocio en el mapa de Google y capturamos reseñas de 5 estrellas automáticamente para superar a tu competencia local.',
    iconName: 'MapPin',
    tag: 'Google Maps Top #1',
    features: [
      'Optimización completa del perfil Google Business',
      'Estrategia automatizada de solicitud de reseñas por WhatsApp',
      'Filtrado proactivo y respuesta con IA a comentarios',
      'Crecimiento exponencial de llamadas y visitas locales'
    ],
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    highlightText: 'Saber más →'
  },
  {
    id: 'crm-whatsapp',
    title: 'CRM + WhatsApp IA para Profesionales',
    description: 'Gestiona tus clientes, pipeline comercial, citas y seguimientos automatizados sin fricción, todo conectado desde una sola bandeja central.',
    iconName: 'Share2',
    tag: 'Gestión Comercial',
    features: [
      'Pipeline visual de oportunidades tipo Kanban',
      'Automatización de recordatorios previos a cada cita',
      'Alertas en tiempo real por Google Chat y WhatsApp',
      'Historial consolidado de conversaciones y presupuestos'
    ],
    gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
    highlightText: 'Saber más →'
  },
  {
    id: 'menus-pedidos',
    title: 'Menús Digitales y Pedidos Automatizados',
    description: 'Menús interactivos y dinámicos para restaurantes y cafeterías con pedidos directos a cocina y WhatsApp, reduciendo esperas.',
    iconName: 'BookOpen',
    tag: 'Gastronomía & Retail',
    features: [
      'Catálogo QR interactivo con fotos HD y modificadores',
      'Recepción de órdenes estructuradas directas a cocina',
      'Pagos integrados y confirmación de delivery por WhatsApp',
      'Control de stock básico y platos destacados del día'
    ],
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    highlightText: 'Saber más →'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'start',
    number: '01',
    name: 'INFINITY START',
    subtitle: 'Presencia Digital',
    price: 'US$ 397',
    priceDetail: 'Pago único',
    buttonText: 'Comenzar ahora',
    features: [
      'Página web profesional y responsive',
      'Botón directo de WhatsApp',
      'Optimización Google Business',
      'Formularios de contacto dinámicos',
      'Configuración básica de analítica'
    ]
  },
  {
    id: 'ai',
    number: '02',
    name: 'INFINITY AI',
    subtitle: 'Atención Inteligente 24/7',
    price: 'US$ 797',
    priceDetail: 'Pago único',
    buttonText: 'Elegir plan',
    features: [
      'Todo lo de Start incluido',
      'Agente IA para WhatsApp',
      'Calificación automática de leads',
      'Agenda y reservas integradas',
      'Automatizaciones básicas',
      'Panel de control de conversaciones'
    ]
  },
  {
    id: 'growth',
    number: '03',
    name: 'INFINITY GROWTH',
    subtitle: 'Captación + IA + CRM',
    price: 'US$ 1,497',
    priceDetail: 'Pago inicial + US$297 / mes',
    buttonText: 'Elegir plan',
    popular: true,
    features: [
      'Todo lo de Infinity AI',
      'Generación de Leads (Email/LinkedIn)',
      'CRM y pipeline comercial avanzado',
      'Lead scoring predictivo con IA',
      'Automatizaciones de seguimiento',
      'Reportes y analítica avanzada'
    ]
  },
  {
    id: '360',
    number: '04',
    name: 'INFINITY 360',
    subtitle: 'Business Growth System',
    price: 'US$ 2,497+',
    priceDetail: 'Pago inicial + US$497 / mes',
    buttonText: 'Elegir plan',
    features: [
      'Todo lo de Growth incluido',
      'SEO Local avanzado y multisede',
      'Gestión inteligente de reputación',
      'Reportes completos con KPIs de ROI',
      'Optimización mensual recurrente',
      'Estrategia y consultoría 1 a 1'
    ]
  }
];

export const VALUE_PROPOSITIONS = [
  {
    title: 'Resultados reales',
    desc: 'Estrategias y tecnología que generan impacto desde el primer mes.',
    icon: 'Zap'
  },
  {
    title: 'Seguridad y confianza',
    desc: 'Protegemos tus datos y tu reputación online constantemente.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Soporte experto',
    desc: 'Acompañamiento continuo de un equipo especializado.',
    icon: 'Clock'
  },
  {
    title: 'Escalable',
    desc: 'Soluciones que crecen contigo y se adaptan a tu negocio.',
    icon: 'TrendingUp'
  }
];

export const INDUSTRY_CASES = [
  {
    industry: 'Clínicas y Odontología',
    leadIncrease: '+320%',
    timeSaved: '18 hrs/sem',
    desc: 'Respuestas automáticas a dudas sobre citas, confirmación por WhatsApp y recordatorio para reducir ausentismos a menos del 4%.'
  },
  {
    industry: 'Restaurantes y Gastronomía',
    leadIncrease: '+210%',
    timeSaved: '25 hrs/sem',
    desc: 'Menú interactivo con pedidos directos, reserva de mesas sincronizada con Google Calendar y captación de reseñas de 5 estrellas.'
  },
  {
    industry: 'Abogados y Consultores',
    leadIncrease: '+185%',
    timeSaved: '14 hrs/sem',
    desc: 'Pre-calificación rigurosa de prospectos con IA antes de agendar una llamada con los socios senior del bufete.'
  },
  {
    industry: 'Gimnasios y Centros Fitness',
    leadIncrease: '+410%',
    timeSaved: '22 hrs/sem',
    desc: 'Venta de membresías y agendamiento de clases de prueba gratuitas 24/7 sin personal extra en recepción.'
  }
];
