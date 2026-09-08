export interface SpecItem {
  id: string;
  type: 'service' | 'plan';
  title: string;
  subtitle: string;
  badge: string;
  priceTag?: string;
  valueProposition: string;
  targetAudience: string;
  problemSolved: string;
  technicalArchitecture: string;
  deliverables: string[];
  businessROI: string;
  timelineWeeks: string;
  supportWarranty: string;
  exclusions: string[];
}

export interface ProposalDocumentConfig {
  clientName: string;
  clientCompany: string;
  clientEmail?: string;
  clientPhone?: string;
  proposalCode: string;
  validUntil: string;
  preparedBy: string;
  selectedItems: SpecItem[];
  customTerms: string;
  agencyPhone: string;
  agencyEmail: string;
  agencyWebsite: string;
}

export const DEFAULT_TECHNICAL_SPECS: SpecItem[] = [
  // 1. WhatsApp IA
  {
    id: 'spec-whatsapp-ia',
    type: 'service',
    title: 'Agente de IA para WhatsApp & Omnicanalidad 24/7',
    subtitle: 'Atención inmediata, calificación automatizada y agendamiento directo en Google Calendar',
    badge: 'Automatización & Conversión',
    valueProposition: 'Infraestructura de atención conversacional que responde en menos de 3 segundos, responde preguntas frecuentes, califica prospectos y concreta citas en calendario sin intervención humana.',
    targetAudience: 'Clínicas, consultores, agencias y negocios de servicios que pierden prospectos por tardar más de 15 minutos en responder mensajes en WhatsApp o Instagram.',
    problemSolved: 'Pérdida de ventas fuera de horario laboral, saturación de la recepcionista con preguntas repetitivas y prospectos que se enfrían por falta de seguimiento inmediato.',
    technicalArchitecture: 'Conexión con Meta Cloud API / WhatsApp Business API oficial, modelo de lenguaje de última generación entrenado con la base de conocimiento del negocio, webhook seguro con verificación de firma y sincronización bidireccional con Google Calendar.',
    deliverables: [
      'Agente de Inteligencia Artificial configurado con tono de marca y base de conocimiento',
      'Flujo de calificación con preguntas filtro (presupuesto, urgencia, necesidad)',
      'Sincronización en tiempo real con Google Calendar (detección de huecos libres y reserva)',
      'Panel de control en vivo para monitoreo de conversaciones y toma de control humano',
      'Mensaje de confirmación instantánea con sala de Google Meet y archivo .ics descargable',
      'Secuencia de recordatorios previos a la cita (24 horas y 1 hora antes) para blindar asistencia'
    ],
    businessROI: 'Aumento de hasta un 320% en captura de leads fuera de horario comercial y reducción de inasistencias (no-shows) a menos del 5%.',
    timelineWeeks: '1 a 2 semanas para puesta en marcha y fase de calibración',
    supportWarranty: '30 días de garantía y ajustes de calibración del modelo incluidos',
    exclusions: ['Costos de mensajería oficial de Meta/WhatsApp (se facturan a tarifa oficial de Meta al cliente)', 'Redacción de contenido no relacionado con el negocio']
  },
  // 2. Páginas Web de Alta Conversión
  {
    id: 'spec-web-conversion',
    type: 'service',
    title: 'Landing Page de Alta Conversión + Web de Crecimiento',
    subtitle: 'Diseño ultra-rápido, responsivo y diseñado matemáticamente para cerrar ventas y reservas',
    badge: 'Diseño & Alta Conversión',
    valueProposition: 'Plataforma web moderna orientada a la venta directa: elimina el rebote de usuarios mediante carga en menos de 1 segundo y guía visual orientada a la acción inmediata.',
    targetAudience: 'Profesionales independientes, clínicas, empresas B2B y negocios de servicios que tienen una web obsoleta o que actualmente no les genera clientes.',
    problemSolved: 'Sitios web "folleto digital" que no generan prospectos, tiempos de carga lentos que provocan abandono en móviles y falta de herramientas de agendamiento.',
    technicalArchitecture: 'Desarrollado en React 19 + TypeScript + Tailwind CSS con renderizado optimizado, micro-animaciones fluidas con motion/react, responsive design adaptado a móviles y tablets, y compresión estricta de assets.',
    deliverables: [
      'Landing page de alta conversión optimizada para dispositivos móviles (Mobile-First)',
      'Secciones estratégicas: Hero de impacto, propuesta de valor, casos de éxito, planes y FAQ',
      'Integración nativa del motor de agendamiento interactivo en tiempo real',
      'Tracking avanzado preconfigurado (Meta Pixel, Google Analytics 4, eventos de conversión)',
      'Certificado de seguridad SSL (HTTPS), compresión de código y velocidad 95+ PageSpeed',
      'Diseño acorde a la identidad visual, tipografías y paleta de colores de la empresa'
    ],
    businessROI: 'Multiplica x2 o x3 la tasa de conversión de visitantes a citas agendadas frente a webs tradicionales.',
    timelineWeeks: '7 a 12 días laborables',
    supportWarranty: 'Soporte técnico continuo, garantía de funcionamiento y backups automáticos',
    exclusions: ['Producción fotográfica o de video presencial (deben ser suministrados por el cliente o usarse stock premium)', 'Costos anuales de dominio propio']
  },
  // 3. Prospección y Generación de Leads B2B
  {
    id: 'spec-leads-ia',
    type: 'service',
    title: 'Generación de Leads B2B & Prospección con IA',
    subtitle: 'Cold Email híper-personalizado y prospección multicanal para atraer clientes de alto valor',
    badge: 'Adquisición B2B',
    valueProposition: 'Sistema automatizado de captación activa que investiga a tus tomadores de decisión ideales, redacta correos personalizados 1 a 1 y llena tu agenda comercial.',
    targetAudience: 'Empresas de consultoría, servicios corporativos, software, estudios contables o jurídicos que necesitan clientes corporativos de alto ticket.',
    problemSolved: 'Dependencia del "boca a boca" o de referidos irregulares, falta de un flujo predecible de nuevas oportunidades comerciales cada mes.',
    technicalArchitecture: 'Scraping ético y enriquecimiento con IA de bases de datos B2B, configuración de dominios secundarios con SPF/DKIM/DMARC, calentamiento de bandejas de entrada y rotación de IPs.',
    deliverables: [
      'Configuración de infraestructura de prospección (dominios espejo y calentamiento)',
      'Definición del Perfil de Cliente Ideal (ICP) y segmentación por industria/facturación',
      'Copywriting estratégico de secuencias de 3 a 5 correos con enfoque consultivo',
      'Automatización de alertas a tu WhatsApp o Gmail cuando un prospecto responde positivamente',
      'Reporte mensual de métricas: tasa de apertura (Open Rate > 60%), respuestas y citas'
    ],
    businessROI: 'Generación constante de 15 a 40 oportunidades comerciales calificadas por mes para tu equipo de ventas.',
    timelineWeeks: '2 semanas (incluye 14 días de calentamiento técnico de bandejas)',
    supportWarranty: 'Acompañamiento y optimización semanal de copies según métricas',
    exclusions: ['Cierre de ventas (nuestro sistema pone el lead en tu mesa; tu equipo o tú cierran la llamada)', 'Bases de datos de consumidores masivos B2C']
  },
  // 4. CRM + Seguimiento
  {
    id: 'spec-crm-whatsapp',
    type: 'service',
    title: 'CRM Inteligente & Pipeline Comercial Automatizado',
    subtitle: 'Gestión unificada de prospectos, cotizaciones y etapas de venta desde una sola pantalla',
    badge: 'Gestión Comercial',
    valueProposition: 'Centralización de todo tu embudo de ventas: conoce en qué estado está cada prospecto, quién debe ser contactado hoy y automatiza los seguimientos para no dejar dinero sobre la mesa.',
    targetAudience: 'Empresas y consultores con volumen de consultas que sufren por perder mensajes entre chats personales de WhatsApp o notas en libretas.',
    problemSolved: 'Pérdida de ventas por falta de seguimiento (el 80% de las ventas se cierran entre el 5° y 12° contacto y la mayoría de negocios se rinde en el 1°).',
    technicalArchitecture: 'Mini-CRM nativo o integración con HubSpot / Notion / Google Sheets vía Webhooks y APIs REST seguras, con disparadores automáticos por cambio de etapa.',
    deliverables: [
      'Tablero Kanban personalizado con las etapas de tu ciclo de venta (Nuevo, Contactado, Cotizado, Cerrado)',
      'Ficha técnica detallada por cada cliente con historial de llamadas y notas',
      'Automatización de recordatorios previos a reuniones y alertas internas al equipo',
      'Exportación rápida a formato Excel / CSV para contabilidad y análisis',
      'Capacitación al equipo sobre el uso y buenas prácticas del embudo comercial'
    ],
    businessROI: 'Recuperación de hasta un 35% de cotizaciones que antes se perdían en el olvido por falta de seguimiento.',
    timelineWeeks: '1 a 2 semanas',
    supportWarranty: 'Capacitación en video grabada para nuevos miembros del equipo',
    exclusions: ['Licencias de CRMs de terceros de pago si el cliente elige una plataforma externa premium']
  },
  // 5. SEO Local & Google Maps
  {
    id: 'spec-seo-local',
    type: 'service',
    title: 'SEO Local Top #1 + Reputación en Google Maps',
    subtitle: 'Aparición destacada en búsquedas locales y captura masiva de reseñas 5 estrellas',
    badge: 'Google Maps Top #1',
    valueProposition: 'Posicionamiento en los primeros 3 lugares de Google Maps cuando clientes en tu ciudad busquen tus servicios, respaldado por un flujo constante de reseñas positivas.',
    targetAudience: 'Negocios con sede física o servicio local: clínicas, odontólogos, restaurantes, bufetes, gimnasios y talleres.',
    problemSolved: 'Ser invisible en Google Maps mientras los competidores cercanos se llevan todas las llamadas por tener más opiniones y mejor perfil.',
    technicalArchitecture: 'Optimización on-page de Perfil de Negocio de Google (Google Business Profile), estructuración de geocitaciones (NAP), microdatos Schema.org LocalBusiness y flujo de automatización vía WhatsApp post-servicio.',
    deliverables: [
      'Auditoría y optimización integral del Perfil de Google Business (fotos, categorías, productos, horarios)',
      'Sistema automatizado de solicitud de reseñas por WhatsApp tras finalizar el servicio',
      'Filtro de satisfacción: los clientes felices van a Google; las quejas van a tu buzón privado',
      'Plantillas inteligentes para responder reseñas con palabras clave locales',
      'Reporte bimestral de llamadas, clics a la web y solicitudes de cómo llegar generadas'
    ],
    businessROI: 'Aumento del 40% al 120% en llamadas entrantes directas desde Google Maps.',
    timelineWeeks: '2 a 3 semanas para despliegue y primeros resultados orgánicos en 30-60 días',
    supportWarranty: 'Mantenimiento mensual y auditoría continua de palabras clave locales',
    exclusions: ['Compra artificial de reseñas falsas (nuestra metodología es 100% legal y orgánica con tus clientes reales)']
  },
  // 6. Menús Digitales & Pedidos
  {
    id: 'spec-menus-pedidos',
    type: 'service',
    title: 'Menús Digitales Interactivos & Pedidos Automatizados',
    subtitle: 'Catálogo QR inteligente con pedidos directos a cocina y WhatsApp para gastronomía',
    badge: 'Gastronomía & Retail',
    valueProposition: 'Experiencia gastronómica digital que agiliza la toma de comandas, reduce los tiempos de espera de los comensales y permite ordenar delivery sin comisiones abusivas.',
    targetAudience: 'Restaurantes, cafeterías, bares, food trucks y cadenas gastronómicas.',
    problemSolved: 'Costos de reimpresión de cartas físicas, mesas desatendidas en horas pico y comisiones del 30% en plataformas de delivery tradicionales.',
    technicalArchitecture: 'PWA / Web-App móvil ultraliviana con carga por código QR, panel de actualización de precios instantáneo y conexión directa con impresoras o chat de WhatsApp.',
    deliverables: [
      'Carta digital interactiva con fotos en alta definición, categorías y modificadores de platos',
      'Módulo de generación de códigos QR de alta resolución listos para imprimir para las mesas',
      'Recepción estructurada de pedidos por WhatsApp con desglose de ítems, precio y dirección',
      'Panel sencillo para habilitar o deshabilitar platos agotados en tiempo real',
      'Integración con botones de pago rápido (MercadoPago / Stripe / Transferencia)'
    ],
    businessROI: 'Incremento del ticket promedio en un 18% gracias a sugerencias visuales de adicionales y bebidas.',
    timelineWeeks: '1 a 2 semanas',
    supportWarranty: 'Actualizaciones de menú asistidas durante los primeros 30 días',
    exclusions: ['Impresión física de material publicitario o soportes acrílicos para mesas']
  },

  // PLANES COMPLETOS
  // Plan 01: Infinity Start
  {
    id: 'spec-plan-start',
    type: 'plan',
    title: 'Plan INFINITY START: Presencia Digital de Alto Impacto',
    subtitle: 'Página Web Moderna + Posicionamiento en Google Maps + WhatsApp Directo',
    badge: 'Plan 01 • Validación & Inicio',
    priceTag: 'US$ 397 (Pago Único)',
    valueProposition: 'El paquete de inicio ideal para profesionales o negocios que desean dejar de ser invisibles en internet y proyectar una imagen corporativa seria, confiable y moderna.',
    targetAudience: 'Emprendedores, consultores independientes, consultorios o pequeñas empresas que no tienen página web o cuya web actual está desactualizada.',
    problemSolved: 'No aparecer cuando los clientes buscan tu servicio en Google, proyectar desconfianza por no tener web oficial y depender exclusivamente de redes sociales.',
    technicalArchitecture: 'Landing page optimizada en React + Tailwind CSS, hosting de alto rendimiento con CDN global, SSL activado y vinculación directa a Google Business Profile.',
    deliverables: [
      'Página Web / Landing Page moderna y 100% responsiva (móviles, tablets, laptops)',
      'Diseño personalizado con la identidad visual, colores y logotipo de tu negocio',
      'Secciones: Presentación, Quiénes somos, Servicios destacados, Testimonios y Contacto',
      'Botón flotante inteligente de contacto directo a tu WhatsApp con mensaje personalizado',
      'Configuración y optimización de tu ficha de Google Business Profile (Google Maps)',
      'Formularios de contacto directos a tu correo corporativo con validación antispam',
      'Configuración analítica base (Google Analytics 4 para medir cuánta gente te visita)'
    ],
    businessROI: 'Recuperación de la inversión con tus primeros 1 a 2 clientes nuevos captados desde la web.',
    timelineWeeks: '5 a 7 días hábiles tras recibir la información de la marca',
    supportWarranty: '30 días de soporte post-lanzamiento para dudas y ajustes menores',
    exclusions: ['Agente de inteligencia artificial conversacional', 'Sincronización automatizada con CRM avanzado']
  },

  // Plan 02: Infinity AI
  {
    id: 'spec-plan-ai',
    type: 'plan',
    title: 'Plan INFINITY AI: Atención & Agendamiento 24/7 con Inteligencia Artificial',
    subtitle: 'Todo Infinity Start + Agente de IA para WhatsApp + Agenda y Reservas Integradas',
    badge: 'Plan 02 • Automatización 24/7',
    priceTag: 'US$ 797 (Pago Único)',
    valueProposition: 'Tu negocio operando en piloto automático las 24 horas del día. Un agente de inteligencia artificial que atiende inmediatamente cada consulta, responde dudas sobre tus servicios, califica a los prospectos y los agenda directamente en tu Google Calendar.',
    targetAudience: 'Consultores, médicos, terapeutas, centros de estética, academias y profesionales de servicios que pierden tiempo valioso respondiendo los mismos mensajes todos los días.',
    problemSolved: 'Perder clientes por tardar horas en contestar mensajes nocturnos o de fin de semana; el caos de coordinar horarios manualmente enviando opciones de fechas.',
    technicalArchitecture: 'Infraestructura completa de Infinity Start + Meta WhatsApp Cloud API + Agente LLM calibrado + Motor de verificación de disponibilidad y reserva en Google Calendar.',
    deliverables: [
      'Todo lo incluido en el Plan INFINITY START (Web moderna + Google Maps + SEO local base)',
      'Agente de Inteligencia Artificial entrenado a medida con preguntas, precios y políticas de tu negocio',
      'Módulo de agendamiento online sincronizado con tu Google Calendar en tiempo real',
      'Filtro de pre-calificación: el agente recopila datos clave antes de conceder la cita',
      'Confirmación automática por correo y WhatsApp con sala de Google Meet y archivo (.ics)',
      'Panel de control administrativo para supervisar conversaciones y bloquear horarios'
    ],
    businessROI: 'Ahorro de más de 15 horas semanales de atención repetitiva y aumento de hasta un 40% en citas concretadas.',
    timelineWeeks: '7 a 12 días hábiles',
    supportWarranty: '60 días de soporte técnico y calibración continua de respuestas de la IA',
    exclusions: ['Campañas de prospección activa outbound a listas frías de correos']
  },

  // Plan 03: Infinity Growth (Popular)
  {
    id: 'spec-plan-growth',
    type: 'plan',
    title: 'Plan INFINITY GROWTH: Sistema Integral de Captación + IA + CRM',
    subtitle: 'El paquete insignia más completo para empresas en crecimiento activo',
    badge: 'Plan 03 • Más Popular • Escala Comercial',
    priceTag: 'US$ 1,497 (Inversión Inicial) + US$ 297/mes (Mantenimiento & Prospección)',
    valueProposition: 'Un motor comercial completo: no solo recibes prospectos pasivos, sino que prospectas activamente clientes corporativos y los gestionas dentro de un pipeline organizado para multiplicar tus ventas mes a mes.',
    targetAudience: 'Negocios y empresas consolidadas, clínicas con múltiples doctores, estudios profesionales y empresas B2B que buscan escalar su facturación con sistemas predecibles.',
    problemSolved: 'Meses con pocas ventas por falta de prospección activa, desorden comercial en el equipo de ventas y fugas de prospectos sin seguimiento.',
    technicalArchitecture: 'Stack completo de Infinity AI + Servidores dedicados de Cold Emailing + CRM integrado + Webhooks de sincronización multicanal + Algoritmos de lead scoring con IA.',
    deliverables: [
      'Todo lo incluido en el Plan INFINITY AI (Web de alta conversión + Agente WhatsApp IA + Reservas)',
      'Sistema de prospección activa B2B (Cold Email inteligente con dominios secundarios protegidos)',
      'Generación de 20 a 50 leads calificados mensuales con tomadores de decisión reales',
      'Mini-CRM & Pipeline comercial tipo Kanban para gestionar cada oportunidad de venta',
      'Lead Scoring con IA: puntuación automática para priorizar a los clientes con mayor presupuesto',
      'Secuencias automatizadas de seguimiento post-reunión para aumentar tasa de cierre',
      'Panel de métricas avanzadas y reporte ejecutivo mensual de rendimiento y ROI'
    ],
    businessROI: 'Retorno de inversión estimado de 4x a 10x el valor del plan según el ticket promedio de tu negocio.',
    timelineWeeks: '2 a 3 semanas para puesta en marcha completa',
    supportWarranty: 'Soporte prioritario VIP, reuniones quincenales de optimización y mantenimiento continuo',
    exclusions: ['Presupuesto publicitario en plataformas de pago por clic (Meta Ads / Google Ads)']
  },

  // Plan 04: Infinity 360
  {
    id: 'spec-plan-360',
    type: 'plan',
    title: 'Plan INFINITY 360: Business Growth System & Transformación Total',
    subtitle: 'Solución llave en mano de escala institucional, automatización avanzada y consultoría 1 a 1',
    badge: 'Plan 04 • Transformación Corporativa',
    priceTag: 'US$ 2,497+ (Inversión Inicial) + US$ 497/mes',
    valueProposition: 'La máxima expresión tecnológica para tu negocio: nos convertimos en tu brazo derecho tecnológico y de crecimiento, automatizando procesos internos, posicionamiento omnicanal y desarrollo a medida.',
    targetAudience: 'Empresas con equipos de trabajo consolidados, clínicas o cadenas multisede, firmas de consultoría consolidadas y negocios que quieren liderar su sector.',
    problemSolved: 'Procesos operativos manuales ineficientes, falta de presencia multisede, fugas masivas de tiempo de los directores en tareas administrativas.',
    technicalArchitecture: 'Arquitectura Enterprise personalizada: integraciones con ERP/CRM corporativos, base de datos en la nube, agentes de voz con IA y auditoría continua de ciberseguridad.',
    deliverables: [
      'Todo lo incluido en el Plan INFINITY GROWTH sin restricciones de volumen',
      'SEO Local avanzado multisede y estrategia de reputación blindada en Google Maps',
      'Agente telefónico / voz con IA para recepción de llamadas entrantes (según requerimiento)',
      'Automatización de procesos operativos internos (facturación, contratos, firmas digitales)',
      'Consultoría estratégica mensual 1 a 1 directamente con los directores de Infinity Impact',
      'SLA de soporte técnico crítico en menos de 2 horas y desarrollos a medida incluidos'
    ],
    businessROI: 'Transformación del modelo operativo reduciendo costos de nómina y escalando la capacidad comercial sin contratar personal adicional.',
    timelineWeeks: '3 a 5 semanas con plan de despliegue por fases',
    supportWarranty: 'SLA garantizado de alta disponibilidad, backups diarios y soporte VIP 24/7',
    exclusions: ['Costos de licencias de software corporativo de terceros específico del cliente (SAP, Oracle, etc.)']
  }
];
