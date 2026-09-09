import { ServiceItem, PricingPlan, TrustClient } from './types';

export const TRUST_CLIENTS: TrustClient[] = [
  {
    id: 'case-dental-care',
    name: 'DENTAL CARE',
    sub: 'CLÍNICA ODONTOLÓGICA',
    icon: 'Smile',
    industry: 'Salud Dental & Odontología Especializada',
    tagline: 'Agendamiento médico 24/7 y erradicación del ausentismo por olvido',
    challenge: 'Perdían más del 40% de los pacientes que escribían por WhatsApp fuera del horario de recepción (noches y fines de semana). La secretaria dedicaba hasta 3 horas al día confirmando citas una por una por teléfono, y aún así sufrían un 25% de ausentismo.',
    solution: {
      title: 'Agente de IA para WhatsApp + Agenda Médica Bidireccional',
      description: 'Implementamos un asistente conversacional calibrado con el catálogo de tratamientos, aranceles y seguros de la clínica, conectado en tiempo real con Google Calendar y con recordatorios automatizados.',
      deliverables: [
        'Agente conversacional en Meta WhatsApp API oficial con lenguaje empático',
        'Sincronización de disponibilidad en tiempo real con Google Calendar',
        'Recordatorio inteligente 24h y 2h antes con opción de confirmación o reprogramación con 1 clic',
        'Panel de recepción con ficha médica preliminar de cada paciente'
      ]
    },
    metrics: [
      { label: 'Citas Mensuales', value: '+48%', subtext: 'Aumento neto de pacientes' },
      { label: 'Tiempo de Respuesta', value: '< 4 seg', subtext: 'Disponibilidad 24/7' },
      { label: 'Tasa de No-Show', value: '-82%', subtext: 'Reducción de ausentismo' }
    ],
    testimonial: {
      quote: 'Ahora los pacientes agendan sus valoraciones y limpiezas incluso de madrugada. Nuestro equipo en recepción ya no vive esclavo del teléfono y se enfoca en atender con calidez en la sala de espera.',
      author: 'Dra. Marcela Gómez',
      role: 'Directora Médica & Socia Fundadora'
    },
    serviceId: 'whatsapp-ia',
    serviceTitle: 'Agentes de IA para WhatsApp',
    accentColor: 'cyan'
  },
  {
    id: 'case-bellavista',
    name: 'BellaVista',
    sub: 'CLÍNICA MÉDICA & ESTÉTICA',
    icon: 'HeartPulse',
    industry: 'Medicina Estética & Cuidado Dermatológico',
    tagline: 'Filtro cualificador de prospectos y triaje automatizado para consultas VIP',
    challenge: 'Invertían fuertemente en publicidad en redes sociales pero colapsaban con cientos de mensajes preguntando "¿precio?" sin saber cuáles eran pacientes con presupuesto real, desgastando a las asesoras comerciales.',
    solution: {
      title: 'Embudo de Cualificación Inteligente & CRM de Citas Estéticas',
      description: 'Construimos un flujo conversacional inteligente que realiza un pre-diagnóstico amigable, clasifica el interés por procedimiento (rinomodelación, toxina, aparatología) y solo deriva a agenda médica a prospectos cualificados.',
      deliverables: [
        'Triaje automatizado de procedimientos y expectativas del paciente',
        'Presentación dinámica de portafolio y rangos de inversión aproximados',
        'Cobro de abono de reserva integrado para asegurar la asistencia',
        'Alertas inmediatas al equipo médico con ficha completa del caso'
      ]
    },
    metrics: [
      { label: 'Conversión a Consulta', value: '3.4x', subtext: 'De chat a pago de consulta' },
      { label: 'Leads Cualificados', value: '100%', subtext: 'Cero tiempo perdido en curiosos' },
      { label: 'Ahorro Administrativo', value: '+35 hrs', subtext: 'Ahorradas al mes por el equipo' }
    ],
    testimonial: {
      quote: 'El agente de Infinity Impact hace el trabajo pesado de filtrado. Cuando un paciente llega a la consulta presencial, ya conoce los procedimientos, tiene el presupuesto claro y viene decidido a iniciar su tratamiento.',
      author: 'Dr. Esteban Ríos',
      role: 'Cirujano Estético'
    },
    serviceId: 'leads-ia',
    serviceTitle: 'Generación de Leads & Cualificación IA',
    accentColor: 'rose'
  },
  {
    id: 'case-sabor-fuego',
    name: 'Sabor & Fuego',
    sub: 'RESTAURANTE GOURMET & ASADOR',
    icon: 'Utensils',
    industry: 'Gastronomía de Alta Gama & Experiencias Culinarias',
    tagline: 'Menú QR interactivo, pedidos automáticos a cocina y reservas de mesa',
    challenge: 'En horarios de máxima afluencia los comensales esperaban hasta 15 minutos solo para recibir la carta. Los pedidos a domicilio por WhatsApp llegaban en audios largos o notas incompletas, generando errores en comandas y retrasos.',
    solution: {
      title: 'Menú QR Ultraliviano + Bot de Pedidos Estructurados para WhatsApp',
      description: 'Desarrollamos una Web-App ultraliviana accesible por QR en mesas que carga en menos de 1 segundo, junto a un bot que recepciona pedidos de delivery con desglose automático de ítems, dirección y método de pago.',
      deliverables: [
        'Menú digital interactivo con fotos HD, alérgenos y sugerencias de maridaje',
        'Recepción de pedidos por WhatsApp formateados como comanda para cocina',
        'Sistema de reservas de mesas para cenas con confirmación instantánea',
        'Panel de caja para actualización instantánea de platos agotados'
      ]
    },
    metrics: [
      { label: 'Tiempo de Espera', value: '-65%', subtext: 'De 15 min a atención inmediata' },
      { label: 'Ticket Promedio', value: '+28%', subtext: 'Por sugerencias de postres y vinos' },
      { label: 'Errores en Comandas', value: '0%', subtext: 'Pedidos 100% estructurados' }
    ],
    testimonial: {
      quote: 'Los clientes escanean el QR y piden sin esperar al mesero. Para delivery, el bot toma la orden completa sin que tengamos que escribir un solo mensaje a mano. Facturación más ágil y clientes felices.',
      author: 'Mateo Cardona',
      role: 'Chef Ejecutivo & Propietario'
    },
    serviceId: 'qr-menu',
    serviceTitle: 'Menús QR & Pedidos Automatizados',
    accentColor: 'amber'
  },
  {
    id: 'case-hotel-paraiso',
    name: 'Hotel Paraíso',
    sub: 'BOUTIQUE & SPA',
    icon: 'Building2',
    industry: 'Hotelería Boutique & Turismo de Experiencia',
    tagline: 'Motor de reservas directas sin comisiones y Concierge virtual bilingüe',
    challenge: 'Pagaban entre el 18% y el 22% de comisión a plataformas externas (Booking, Airbnb) por no contar con una web propia moderna con motor de reserva ágil. Además, perdían consultas internacionales por la diferencia de huso horario.',
    solution: {
      title: 'Página Web de Alta Conversión + Concierge Virtual 24/7 Bilingüe',
      description: 'Diseñamos una experiencia web inmersiva de alta velocidad con motor de reserva directa integrado, junto a un Concierge en WhatsApp capaz de responder en español e inglés sobre habitaciones, traslados y paquetes de spa.',
      deliverables: [
        'Web moderna móvil-first con checkout directo sin comisiones a terceros',
        'Agente Concierge bilingüe (Español / Inglés) con respuestas instantáneas',
        'Agenda integrada para masajes, tours y cenas privadas en el hotel',
        'Sincronización de calendario iCal para prevenir sobreventas'
      ]
    },
    metrics: [
      { label: 'Reservas Directas', value: '+62%', subtext: 'Ventas directas en la web' },
      { label: 'Ahorro en Comisiones', value: '$4,200', subtext: 'USD ahorrados en 90 días' },
      { label: 'Velocidad de Carga', value: '1.4 seg', subtext: 'Optimización móvil total' }
    ],
    testimonial: {
      quote: 'Infinity Impact nos dio la independencia que necesitábamos de las plataformas de reservas. Los turistas ahora reservan directo y el concierge virtual atiende dudas en inglés a las 3 de la madrugada sin errores.',
      author: 'Carolina Valenzuela',
      role: 'Gerente General'
    },
    serviceId: 'web-conversion',
    serviceTitle: 'Páginas Web de Alta Conversión',
    accentColor: 'blue'
  },
  {
    id: 'case-fit-life',
    name: 'FIT LIFE',
    sub: 'GYM & WELLNESS CLUB',
    icon: 'Dumbbell',
    industry: 'Fitness, Acondicionamiento Físico & Bienestar',
    tagline: 'Automatización de altas de socios, cobros recurrentes y clases de prueba',
    challenge: 'Alta deserción de socios en los primeros meses. Para inscribirse, los interesados debían ir presencialmente a firmar papeles y pagar en caja. La recepción perdía horas recordando pagos mensuales por WhatsApp.',
    solution: {
      title: 'Embudo de Suscripciones Online + Asistente de Recuperación de Socios',
      description: 'Automatizamos el ciclo completo del cliente: inscripción en 2 minutos desde el celular, pagos recurrentes con tarjeta y un asistente de WhatsApp que agenda clases de prueba gratuitas y reactiva a socios ausentes.',
      deliverables: [
        'Plataforma web de membresías con cobros recurrentes automatizados',
        'Agente de WhatsApp que coordina pases de cortesía y clases grupales',
        'Flujo de reactivación que detecta inasistencias prolongadas y motiva el retorno',
        'Integración con control de acceso y sistema de notificaciones'
      ]
    },
    metrics: [
      { label: 'Nuevas Membresías', value: '+140', subtext: 'Inscritos en los primeros 60 días' },
      { label: 'Retención de Socios', value: '+31%', subtext: 'Mayor permanencia trimestral' },
      { label: 'Cobranza Automatizada', value: '100%', subtext: 'Cero cobranza manual en caja' }
    ],
    testimonial: {
      quote: 'Antes nos pasábamos la primera semana del mes persiguiendo cuotas atrasadas. Ahora los socios se inscriben directo desde el celular y el bot llena los cupos de las clases de spinning en cuestión de minutos.',
      author: 'Sebastián Ruiz',
      role: 'Head Coach & Co-Fundador'
    },
    serviceId: 'local-seo',
    serviceTitle: 'Posicionamiento & Sistemas de Captación',
    accentColor: 'emerald'
  },
  {
    id: 'case-estudio-juridico',
    name: 'ESTUDIO JURÍDICO',
    sub: 'ASESORES LEGALES CORPORATIVOS',
    icon: 'Scale',
    industry: 'Servicios Legales, Derecho Comercial & Tributario',
    tagline: 'Filtro cualificador de causas legales y agenda de asesoría con pago previo',
    challenge: 'Abogados con tarifas horarias elevadas atendían decenas de consultas informales por chat o llamadas que resultaban ser casos fuera de su especialidad o sin viabilidad económica, colapsando su jornada laboral.',
    solution: {
      title: 'Sistema de Triaje Jurídico Inteligente + Agenda de Consulta Pre-pagada',
      description: 'Implementamos un formulario interactivo y filtro conversacional que identifica la materia del caso (laboral, corporativo, tributario), valida la viabilidad y procesa el pago de los honorarios de la primera consulta antes de agendar.',
      deliverables: [
        'Cuestionario inteligente de triaje legal y evaluación de compatibilidad',
        'Cobro de consulta de diagnóstico previo al bloqueo de horario en la agenda',
        'Generación de resumen ejecutivo del caso enviado al abogado antes del Meet',
        'Sincronización con Google Calendar y sala de Google Meet automática'
      ]
    },
    metrics: [
      { label: 'Tiempo Recuperado', value: '+14 hrs', subtext: 'Semanales por cada abogado' },
      { label: 'Consultas Pagadas', value: '100%', subtext: 'Cero llamadas informales' },
      { label: 'Satisfacción Cliente', value: '4.9/5', subtext: 'Experiencia ejecutiva VIP' }
    ],
    testimonial: {
      quote: 'Se acabó el perder horas respondiendo consultas que no correspondían a nuestra práctica. Ahora cada reunión que entra al calendario es con un cliente serio que ya abonó la consulta y cuyo expediente tenemos estudiado de antemano.',
      author: 'Dr. Andrés Morales',
      role: 'Socio Director'
    },
    serviceId: 'crm-whatsapp',
    serviceTitle: 'CRM & Automatización para Profesionales',
    accentColor: 'purple'
  }
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
    cta: 'Comenzar ahora',
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
    cta: 'Elegir plan',
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
    cta: 'Elegir plan',
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
    cta: 'Elegir plan',
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

export interface IndustryCase {
  industry: string;
  tagline?: string;
  leadIncrease: string;
  timeSaved: string;
  desc: string;
}

export const INDUSTRY_CASES: IndustryCase[] = [
  {
    industry: 'Clínicas y Odontología',
    tagline: 'Para centros médicos, doctores y especialistas de la salud.',
    leadIncrease: '+320%',
    timeSaved: '18 hrs/sem',
    desc: 'Respuestas automáticas a dudas sobre citas, confirmación por WhatsApp y recordatorio para reducir ausentismos a menos del 4%.'
  },
  {
    industry: 'Restaurantes y Gastronomía',
    tagline: 'Para negocios gastronómicos, cafeterías y experiencias culinarias.',
    leadIncrease: '+210%',
    timeSaved: '25 hrs/sem',
    desc: 'Menú interactivo con pedidos directos, reserva de mesas sincronizada con Google Calendar y captación de reseñas de 5 estrellas.'
  },
  {
    industry: 'Consultores e Independientes',
    tagline: 'Para profesionales que quieren atraer clientes, gestionar citas y automatizar su seguimiento.',
    leadIncrease: '+185%',
    timeSaved: '14 hrs/sem',
    desc: 'Pre-calificación inteligente de prospectos con IA antes de agendar una llamada estratégica o asesoría en tu calendario personal.'
  },
  {
    industry: 'Gimnasios y Centros Fitness',
    tagline: 'Para entrenadores personales, boxes de crossfit y centros deportivos.',
    leadIncrease: '+410%',
    timeSaved: '22 hrs/sem',
    desc: 'Venta de membresías y agendamiento de clases de prueba gratuitas 24/7 sin personal extra en recepción.'
  }
];
