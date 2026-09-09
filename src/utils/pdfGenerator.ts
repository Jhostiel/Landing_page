import { jsPDF } from 'jspdf';
import { SpecItem, ProposalDocumentConfig } from '../technicalSpecsData';

/**
 * Builds a vector jsPDF instance for standard proposals.
 */
export function createProposalJsPDF(spec: SpecItem, config: ProposalDocumentConfig): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm
  let y = margin;

  const sanitize = (str?: string) => (str || '').replace(/[^\x00-\x7F\u00C0-\u017F\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20AC$€]/g, '');

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 5;
      // Small header on secondary page
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Infinity Impact Agency • Ref: ${config.proposalCode} • ${config.clientName}`, margin, y);
      y += 8;
    }
  };

  // Top Accent Banner (Emerald & Teal gradient simulation)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 10.5, pageWidth, 1.5, 'F');

  y = 20;

  // 1. HEADER: Agency Logo & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('INFINITY IMPACT AGENCY', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Plataformas Web & Automatización de Crecimiento con IA', margin, y + 4.5);
  doc.text(`WhatsApp: ${config.agencyPhone}  •  Email: ${config.agencyEmail}`, margin, y + 8.5);
  doc.text(`Web: ${config.agencyWebsite}`, margin, y + 12.5);

  // Right side: Proposal Ref Box
  const boxWidth = 65;
  const boxX = pageWidth - margin - boxWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(boxX, y - 4, boxWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('PROPUESTA COMERCIAL OFICIAL', boxX + 4, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`REF: ${config.proposalCode}`, boxX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, boxX + 4, y + 10);
  doc.text(`Valido hasta: ${config.validUntil}`, boxX + 4, y + 14);

  y += 24;

  // 2. CLIENT RECIPIENT CARD
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PREPARADO PARA:', margin + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitize(config.clientName), margin + 4, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text(sanitize(config.clientCompany), margin + 4, y + 15.5);

  // Client contact on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Email: ${config.clientEmail || 'N/A'}`, margin + contentWidth - 70, y + 8);
  doc.text(`Tel: ${config.clientPhone || 'N/A'}`, margin + contentWidth - 70, y + 13);

  y += 24;

  // 3. SERVICE / PLAN TITLE & BADGE
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, y, 52, 6, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text(sanitize(spec.badge.toUpperCase()), margin + 3, y + 4.2);

  if (spec.priceTag) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text(sanitize(spec.priceTag), margin + contentWidth - 4, y + 4.5, { align: 'right' });
  }

  y += 10;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitize(spec.title), margin, y);

  y += 5.5;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const subLines = doc.splitTextToSize(sanitize(spec.subtitle), contentWidth);
  doc.text(subLines, margin, y);
  y += subLines.length * 4.5 + 4;

  // 4. VALUE PROP & PROBLEM SOLVED
  checkPageBreak(35);
  const colW = (contentWidth - 6) / 2;

  // Propuesta de valor box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colW, 30, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(14, 116, 144);
  doc.text('PROPUESTA DE VALOR', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const vpLines = doc.splitTextToSize(sanitize(spec.valueProposition), colW - 8);
  doc.text(vpLines.slice(0, 5), margin + 4, y + 9.5);

  // Problema que resuelve box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + colW + 6, y, colW, 30, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text('PROBLEMA QUE RESUELVE', margin + colW + 10, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const probLines = doc.splitTextToSize(sanitize(spec.problemSolved), colW - 8);
  doc.text(probLines.slice(0, 5), margin + colW + 10, y + 9.5);

  y += 34;

  // 5. TECHNICAL ARCHITECTURE
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('ARQUITECTURA & TECNOLOGIAS:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const techLines = doc.splitTextToSize(sanitize(spec.technicalArchitecture), contentWidth - 8);
  doc.text(techLines.slice(0, 3), margin + 4, y + 9.5);

  y += 22;

  // 6. DELIVERABLES LIST
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ALCANCE Y ENTREGABLES CONCRETOS:', margin, y);
  y += 5;

  spec.deliverables.forEach((item) => {
    checkPageBreak(9);
    // Draw small green check bullet
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 2.5, y - 1, 1.3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const itemLines = doc.splitTextToSize(sanitize(item), contentWidth - 8);
    doc.text(itemLines, margin + 6, y);
    y += itemLines.length * 4 + 2;
  });

  y += 3;

  // 7. KEY METRICS: ROI, TIMELINE, SUPPORT
  checkPageBreak(22);
  const metricW = (contentWidth - 6) / 3;

  // Metric 1: ROI
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, metricW, 16, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('RETORNO DE INVERSION (ROI)', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const roiLines = doc.splitTextToSize(sanitize(spec.businessROI), metricW - 6);
  doc.text(roiLines.slice(0, 2), margin + 3, y + 9);

  // Metric 2: Timeline
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + metricW + 3, y, metricW, 16, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TIEMPO ESTIMADO DE ENTREGA', margin + metricW + 6, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const timeLines = doc.splitTextToSize(sanitize(spec.timelineWeeks), metricW - 6);
  doc.text(timeLines.slice(0, 2), margin + metricW + 6, y + 9);

  // Metric 3: Warranty
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + (metricW + 3) * 2, y, metricW, 16, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('GARANTIA Y SOPORTE', margin + (metricW + 3) * 2 + 3, y + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const warLines = doc.splitTextToSize(sanitize(spec.supportWarranty), metricW - 6);
  doc.text(warLines.slice(0, 2), margin + (metricW + 3) * 2 + 3, y + 9);

  y += 20;

  // 8. EXCLUSIONS & TERMS
  if (spec.exclusions && spec.exclusions.length > 0) {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Exclusiones:', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const exclText = sanitize(spec.exclusions.join('  •  '));
    const exclLines = doc.splitTextToSize(exclText, contentWidth - 18);
    doc.text(exclLines, margin + 18, y);
    y += exclLines.length * 3.5 + 3;
  }

  // Commercial terms
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Condiciones de pago:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const termsLines = doc.splitTextToSize(sanitize(config.customTerms), contentWidth - 28);
  doc.text(termsLines, margin + 28, y);
  y += termsLines.length * 3.5 + 8;

  // 9. SIGNATURES
  checkPageBreak(30);
  const sigColW = (contentWidth - 20) / 2;

  // Signature 1: Agency
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y + 14, margin + sigColW, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Infinity Impact Agency', margin, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitize(config.preparedBy), margin, y + 21.5);

  // Signature 2: Client
  doc.line(margin + sigColW + 20, y + 14, margin + contentWidth, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitize(config.clientName), margin + sigColW + 20, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${sanitize(config.clientCompany)}  •  Firma de Aceptación`, margin + sigColW + 20, y + 21.5);

  return doc;
}

/**
 * Generates the official 3-page Dossier PDF document using vector rendering in jsPDF.
 */
export function createDossierJsPDF(spec: SpecItem, config: ProposalDocumentConfig): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178mm

  const sanitize = (str?: string) =>
    (str || '').replace(/[^\x00-\x7F\u00C0-\u017F\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20AC$€]/g, '');

  const drawPageFooter = (pageNum: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${pageNum} de 3 • Infinity Impact Agency • Dossier Oficial de Servicio y Propuesta de Valor`, margin, pageHeight - 8);
    doc.text(sanitize(config.proposalCode), pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  const drawHeaderBar = (isFirstPage: boolean) => {
    // Top banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, isFirstPage ? 11 : 9, 'F');
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, isFirstPage ? 9.5 : 7.8, pageWidth, 1.5, 'F');

    if (!isFirstPage) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('INFINITY IMPACT AGENCY • DOSSIER DE SERVICIO Y PROPUESTA DE VALOR', margin, 15);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Ref: ${sanitize(config.proposalCode)} • ${sanitize(config.clientName)}`, pageWidth - margin, 15, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 17.5, pageWidth - margin, 17.5);
    }
  };

  // ==========================================
  // PAGE 1: Presentación y Pilares 1 y 2
  // ==========================================
  drawHeaderBar(true);

  // Agency info
  let y = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('INFINITY IMPACT AGENCY', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Plataformas Web & Automatización de Crecimiento con IA', margin, y + 4.5);
  doc.text(`WhatsApp: ${sanitize(config.agencyPhone)}  •  Email: ${sanitize(config.agencyEmail)}`, margin, y + 8.5);
  doc.text(`Web: ${sanitize(config.agencyWebsite)}`, margin, y + 12.5);

  // Proposal Reference Box
  const refBoxW = 66;
  const refBoxX = pageWidth - margin - refBoxW;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(refBoxX, y - 2, refBoxW, 16.5, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('DOSSIER COMERCIAL OFICIAL', refBoxX + 4, y + 2.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitize(config.proposalCode), refBoxX + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, refBoxX + 4, y + 11.5);
  doc.setTextColor(8, 145, 178);
  doc.text(`Válido hasta: ${sanitize(config.validUntil)}`, refBoxX + 32, y + 11.5);

  // Client recipient card
  y = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('DOCUMENTO PREPARADO EXCLUSIVAMENTE PARA:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${sanitize(config.clientName)}  •  ${sanitize(config.clientCompany)}`, margin + 4, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tel: ${sanitize(config.clientPhone || 'N/A')}  •  Email: ${sanitize(config.clientEmail || 'N/A')}`, pageWidth - margin - 4, y + 10, { align: 'right' });

  // Main Dossier Badge & Titles
  y = 54;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, 78, 6, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('DOSSIER DE SERVICIO Y PROPUESTA DE VALOR', margin + 4, y + 4.2);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Plataforma Web Integral de Crecimiento Comercial', margin, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(8, 145, 178);
  doc.text('Landing Page de Alta Conversión + Sistema Automatizado de Reservas + CRM Interno', margin, y);

  // Callout: ¿Qué es esta solución?
  y += 5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('QUE ES ESTA SOLUCION?', margin + 4, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const overviewText =
    'No es una "pagina web tradicional informativa". Es una infraestructura digital completa para captura y cierre de clientes, disenada para transformar visitas anonimas en citas calificadas y ventas directas en tu calendario, operando las 24 horas del dia sin intervencion manual.';
  const overviewLines = doc.splitTextToSize(overviewText, contentWidth - 8);
  doc.text(overviewLines, margin + 4, y + 9.5);

  // SECTION HEADER: 4 PILARES
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LOS 4 PILARES QUE TRANSFORMAN TU NEGOCIO', margin, y);
  doc.setDrawColor(16, 185, 129);
  doc.line(margin, y + 1.5, margin + 80, y + 1.5);

  // PILAR 1 BOX
  y += 5;
  const p1H = 43;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, p1H, 2, 2, 'FD');

  doc.setFillColor(16, 185, 129);
  doc.rect(margin, y, 3, p1H, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Landing Page de Alta Conversion (Tu Mejor Vendedor 24/7)', margin + 6, y + 5);

  const p1Points = [
    { label: 'Arquitectura Orientada a Ventas:', text: 'Cada seccion, titular y boton esta colocado con psicologia de conversion para guiar al usuario directo a agendar o comprar.' },
    { label: 'Diseno Premium & Responsive:', text: 'Imagen de marca corporativa, moderna y de autoridad, adaptada al 100% para celulares, tablets y computadores.' },
    { label: 'Micro-interacciones y Animaciones Tactiles:', text: 'Experiencia fluida donde cada toque ofrece retroalimentacion visual instantanea, aumentando el tiempo de retencion.' },
    { label: 'Carga Ultrarrapida:', text: 'Construida con tecnologia moderna (React + Tailwind) para que tus clientes no abandonen la web por lentitud.' }
  ];

  let pY = y + 10;
  p1Points.forEach((pt) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`* ${pt.label}`, margin + 6, pY);
    const labelW = doc.getTextWidth(`* ${pt.label} `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(pt.text, contentWidth - 10 - labelW);
    doc.text(lines[0], margin + 6 + labelW, pY);
    if (lines.length > 1) {
      doc.text(lines.slice(1), margin + 8, pY + 3.5);
      pY += (lines.length - 1) * 3.5;
    }
    pY += 4.5;
  });

  // PILAR 2 BOX
  y += p1H + 4;
  const p2H = 43;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, p2H, 2, 2, 'FD');

  doc.setFillColor(6, 182, 212);
  doc.rect(margin, y, 3, p2H, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Sistema Inteligente de Agendamiento y Calificacion', margin + 6, y + 5);

  const p2Points = [
    { label: 'Autonomia Total para el Cliente:', text: 'Tu prospecto elige el dia y la hora exacta segun tu disponibilidad en tiempo real, eliminando el desgaste de cruzar mensajes.' },
    { label: 'Filtro Cualificador de Prospectos:', text: 'Antes de reservar, recopila nombre, empresa, WhatsApp, correo y presupuesto o servicio para llegar preparado a la sesion.' },
    { label: 'Confirmacion Instantanea Multicanal:', text: 'Entrega sala Google Meet, boton para anadir a Google Calendar en 1 clic y descarga de invitacion (.ics) para iPhone/Outlook.' }
  ];

  pY = y + 10;
  p2Points.forEach((pt) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`* ${pt.label}`, margin + 6, pY);
    const labelW = doc.getTextWidth(`* ${pt.label} `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(pt.text, contentWidth - 10 - labelW);
    doc.text(lines[0], margin + 6 + labelW, pY);
    if (lines.length > 1) {
      doc.text(lines.slice(1), margin + 8, pY + 3.5);
      pY += (lines.length - 1) * 3.5;
    }
    pY += 5;
  });

  drawPageFooter(1);

  // ==========================================
  // PAGE 2: Pilares 3 y 4 + Tabla Comparativa
  // ==========================================
  doc.addPage();
  drawHeaderBar(false);

  y = 22;

  // PILAR 3 BOX
  const p3H = 43;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, p3H, 2, 2, 'FD');

  doc.setFillColor(59, 130, 246);
  doc.rect(margin, y, 3, p3H, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Sincronizacion Automatica con Google Workspace & Calendar', margin + 6, y + 5);

  const p3Points = [
    { label: 'Cero Citas Duplicadas:', text: 'Las reuniones se sincronizan de inmediato con tu Google Calendar corporativo en tu zona horaria local.' },
    { label: 'Recordatorios y Correos:', text: 'El cliente recibe confirmacion con los datos; tu equipo recibe una alerta inmediata con el WhatsApp del prospecto listo para contactar.' },
    { label: 'Reduccion de Inasistencias (No-Shows):', text: 'Al anclarse en la agenda personal del cliente, las tasas de asistencia aumentan dramaticamente.' }
  ];

  pY = y + 10;
  p3Points.forEach((pt) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`* ${pt.label}`, margin + 6, pY);
    const labelW = doc.getTextWidth(`* ${pt.label} `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(pt.text, contentWidth - 10 - labelW);
    doc.text(lines[0], margin + 6 + labelW, pY);
    if (lines.length > 1) {
      doc.text(lines.slice(1), margin + 8, pY + 3.5);
      pY += (lines.length - 1) * 3.5;
    }
    pY += 5;
  });

  // PILAR 4 BOX
  y += p3H + 4;
  const p4H = 43;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, p4H, 2, 2, 'FD');

  doc.setFillColor(168, 85, 247);
  doc.rect(margin, y, 3, p4H, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Panel de Administracion y Mini-CRM Privado', margin + 6, y + 5);

  const p4Points = [
    { label: 'Control Total en tus Manos:', text: 'Una plataforma interna exclusiva para ti y tu equipo, protegida por acceso y credenciales seguras.' },
    { label: 'Pipeline de Prospectos (CRM):', text: 'Visualiza en una sola pantalla a todos los clientes que han reservado o consultado, con estados claros (Nuevo, Confirmado, Contactado, Cerrado).' },
    { label: 'Horarios & CMS en Vivo:', text: 'Define dias y horarios de atencion, duracion de citas y modifica precios, textos o WhatsApp sin pagarle a programadores.' }
  ];

  pY = y + 10;
  p4Points.forEach((pt) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`* ${pt.label}`, margin + 6, pY);
    const labelW = doc.getTextWidth(`* ${pt.label} `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(pt.text, contentWidth - 10 - labelW);
    doc.text(lines[0], margin + 6 + labelW, pY);
    if (lines.length > 1) {
      doc.text(lines.slice(1), margin + 8, pY + 3.5);
      pY += (lines.length - 1) * 3.5;
    }
    pY += 5;
  });

  // COMPARATIVE TABLE
  y += p4H + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('COMPARATIVA: WEB TRADICIONAL VS. NUESTRA PLATAFORMA INTEGRAL', margin, y);
  doc.setDrawColor(16, 185, 129);
  doc.line(margin, y + 1.5, margin + 115, y + 1.5);

  y += 5;
  const col1W = 42;
  const col2W = 60;
  const col3W = contentWidth - col1W - col2W; // 76mm

  // Table header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Caracteristica Clave', margin + 3, y + 5);
  doc.text('Sitio Web Convencional', margin + col1W + 3, y + 5);
  doc.text('Nuestra Plataforma Integral', margin + col1W + col2W + 3, y + 5);

  y += 7.5;

  const compRows = [
    { feat: 'Objetivo Principal', trad: 'Solo informar estaticamente', int: 'Generar reservas calificadas y ventas 24/7' },
    { feat: 'Agendamiento', trad: 'Formularios que nadie responde a tiempo', int: 'Reserva interactiva en tiempo real' },
    { feat: 'Sincronizacion', trad: 'Manual (copiar y pegar en calendario)', int: 'Google Calendar & Meet 100% automatico' },
    { feat: 'Notificaciones', trad: 'A veces llegan a la carpeta de spam', int: 'Emails estructurados + invitacion (.ics)' },
    { feat: 'Gestion de Leads', trad: 'Hojas de calculo sueltas o chats perdidos', int: 'CRM integrado en la misma plataforma' },
    { feat: 'Modificacion de Textos', trad: 'Dependes de un programador para cada cambio', int: 'Panel propio para editar precios y textos en vivo' },
  ];

  compRows.forEach((r, idx) => {
    const rowH = 9;
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
    doc.rect(margin, y, contentWidth, rowH, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowH, 'S');

    // Dividers
    doc.line(margin + col1W, y, margin + col1W, y + rowH);
    doc.line(margin + col1W + col2W, y, margin + col1W + col2W, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(r.feat, margin + 3, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(r.trad, margin + col1W + 3, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(r.int, margin + col1W + col2W + 3, y + 5.5);

    y += rowH;
  });

  drawPageFooter(2);

  // ==========================================
  // PAGE 3: Audiencia Ideal, Entregables y Cierre Comercial
  // ==========================================
  doc.addPage();
  drawHeaderBar(false);

  y = 22;

  // TARGET AUDIENCE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PARA QUIEN ES IDEAL ESTA SOLUCION?', margin, y);
  doc.setDrawColor(16, 185, 129);
  doc.line(margin, y + 1.5, margin + 70, y + 1.5);

  y += 5;
  const targetCards = [
    { title: 'Agencias y Consultoras', reason: 'Para agendar llamadas de descubrimiento y consultorias estrategicas sin friccion.' },
    { title: 'Profesionales Independientes', reason: 'Abogados, medicos, coaches, contadores y asesores que necesitan citas organizadas.' },
    { title: 'Empresas de Servicios B2B / B2C', reason: 'Negocios que requieren cualificar clientes antes de cotizar contratos de alto valor.' }
  ];

  const cardW = (contentWidth - 8) / 3;
  targetCards.forEach((c, idx) => {
    const cX = margin + idx * (cardW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cX, y, cardW, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(8, 145, 178);
    doc.text(c.title, cX + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const rLines = doc.splitTextToSize(c.reason, cardW - 6);
    doc.text(rLines, cX + 3, y + 9.5);
  });

  // DELIVERABLES SECTION
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ENTREGABLES DEL PROYECTO (ALCANCE COMPLETO)', margin, y);
  doc.setDrawColor(16, 185, 129);
  doc.line(margin, y + 1.5, margin + 85, y + 1.5);

  y += 5;
  const deliverablesList = [
    'Despliegue y Puesta en Marcha: Configuracion de dominio, servidores seguros en la nube y certificado SSL (https://).',
    'Personalizacion Integral de Marca: Paleta de colores, logotipo, tipografias y propuesta de valor de tu negocio.',
    'Automatizacion de Notificaciones: Conexion de tu cuenta de correo y Google Calendar corporativo.',
    'Acceso al Panel Administrativo: Credenciales de seguridad y configuracion del CRM interno.',
    'Garantia y Acompanamiento: Soporte tecnico y capacitacion breve para que administren la plataforma sin fricciones.'
  ];

  deliverablesList.forEach((d) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text('OK', margin + 3, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    doc.text(d, margin + 10, y + 5.5);

    y += 9.5;
  });

  // METRICS SUMMARY
  y += 2;
  const metricBoxW = (contentWidth - 8) / 3;
  const metrics = [
    { title: 'RETORNO DE INVERSION', val: 'Multiplica x2 las citas y ahorra 15h semanales' },
    { title: 'PLAZO DE ENTREGA', val: '7 a 14 dias laborables para entrega completa' },
    { title: 'GARANTIA TECNICA', val: 'Garantia total, soporte prioritario y backups' }
  ];

  metrics.forEach((m, idx) => {
    const mX = margin + idx * (metricBoxW + 4);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(mX, y, metricBoxW, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.title, mX + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    const mLines = doc.splitTextToSize(m.val, metricBoxW - 6);
    doc.text(mLines, mX + 3, y + 8.5);
  });

  // CLOSING CALL TO ACTION BOX
  y += 18;
  const ctaH = 34;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, ctaH, 3, 3, 'F');

  doc.setFillColor(16, 185, 129); // emerald top bar
  doc.rect(margin, y, contentWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(52, 211, 153);
  doc.text('Listo para automatizar la captacion de tus clientes?', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(241, 245, 249);
  doc.text('Hablemos hoy para planificar la estructura y puesta en marcha de tu nueva plataforma.', margin + 6, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`WhatsApp: ${sanitize(config.agencyPhone)}   |   Email: ${sanitize(config.agencyEmail)}   |   Web: ${sanitize(config.agencyWebsite)}`, margin + 6, y + 24);

  // TERMS NOTE
  y += ctaH + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Condiciones comerciales:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const termsText = sanitize(config.customTerms);
  const tLines = doc.splitTextToSize(termsText, contentWidth - 28);
  doc.text(tLines, margin + 28, y);
  y += tLines.length * 3.5 + 4;

  // SIGNATURES
  const sigColW = (contentWidth - 20) / 2;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y + 12, margin + sigColW, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Infinity Impact Agency', margin, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitize(config.preparedBy), margin, y + 19.5);

  doc.line(margin + sigColW + 20, y + 12, margin + contentWidth, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitize(config.clientName), margin + sigColW + 20, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${sanitize(config.clientCompany)} • Firma de Aceptación`, margin + sigColW + 20, y + 19.5);

  drawPageFooter(3);

  return doc;
}

/**
 * Directly triggers download of the Dossier PDF file
 */
export function generateDossierDirectPDF(spec: SpecItem, config: ProposalDocumentConfig): void {
  const doc = createDossierJsPDF(spec, config);
  const cleanClient = (config.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  const filename = `Dossier_Plataforma_Web_Integral_${cleanClient}.pdf`;
  doc.save(filename);
}

/**
 * Returns a Blob of the official Dossier PDF
 */
export function generateDossierPDFBlob(spec: SpecItem, config: ProposalDocumentConfig): Blob {
  const doc = createDossierJsPDF(spec, config);
  return doc.output('blob');
}

/**
 * Directly downloads any proposal or dossier PDF
 */
export function generateDirectPDF(spec: SpecItem, config: ProposalDocumentConfig): void {
  if (spec.isDossier || spec.id === 'spec-dossier-plataforma-integral' || (spec.pillars && spec.pillars.length > 0)) {
    generateDossierDirectPDF(spec, config);
    return;
  }

  const doc = createProposalJsPDF(spec, config);
  const cleanTitle = (spec.title || 'Propuesta').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const cleanClient = (config.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  const filename = `Propuesta_${cleanTitle}_${cleanClient}.pdf`;
  doc.save(filename);
}

/**
 * Returns a Blob of any proposal or dossier PDF
 */
export function generatePDFBlob(spec: SpecItem, config: ProposalDocumentConfig): Blob {
  if (spec.isDossier || spec.id === 'spec-dossier-plataforma-integral' || (spec.pillars && spec.pillars.length > 0)) {
    return generateDossierPDFBlob(spec, config);
  }
  const doc = createProposalJsPDF(spec, config);
  return doc.output('blob');
}

/**
 * Generates an executive, printable HTML version of the official Dossier.
 */
function generateDossierHTML(spec: SpecItem, config: ProposalDocumentConfig): string {
  const pillars = spec.pillars || [];
  const compTable = spec.comparisonTable || [];
  const idealList = spec.idealFor || [];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dossier de Servicio y Propuesta de Valor - ${config.clientName || 'Infinity Impact'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 30px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-container {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 45px 50px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      position: relative;
    }
    .top-accent {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .logo-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .agency-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.5;
    }
    .ref-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 12px 18px;
      border-radius: 10px;
      text-align: right;
    }
    .ref-tag {
      font-size: 9px;
      font-weight: 800;
      color: #059669;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .ref-num {
      font-family: monospace;
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      margin: 2px 0;
    }
    .ref-date {
      font-size: 11px;
      color: #64748b;
    }
    .client-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .client-label {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .client-name {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .client-company {
      font-size: 12px;
      font-weight: 600;
      color: #059669;
    }
    .dossier-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      margin-bottom: 12px;
    }
    .dossier-title {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin-bottom: 6px;
    }
    .dossier-sub {
      font-size: 14px;
      color: #0891b2;
      font-weight: 600;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .overview-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 18px 22px;
      margin-bottom: 32px;
    }
    .overview-title {
      font-size: 12px;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .overview-p {
      font-size: 13.5px;
      color: #1e293b;
      line-height: 1.6;
      font-weight: 500;
    }
    .section-head {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 32px 0 16px 0;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 8px;
    }
    .pillar-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 22px;
      margin-bottom: 16px;
      position: relative;
      border-left: 4px solid #10b981;
    }
    .pillar-card:nth-child(2) { border-left-color: #06b6d4; }
    .pillar-card:nth-child(3) { border-left-color: #3b82f6; }
    .pillar-card:nth-child(4) { border-left-color: #a855f7; }
    .pillar-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 10px;
    }
    .pillar-num-title {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .pillar-points {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pillar-point {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .pillar-bullet {
      color: #10b981;
      font-weight: bold;
    }
    .pillar-point strong {
      color: #0f172a;
      font-weight: 700;
    }
    .comp-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
      font-size: 12px;
    }
    .comp-table th {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 16px;
      font-weight: 700;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .comp-table td {
      padding: 11px 16px;
      border-bottom: 1px solid #e2e8f0;
      line-height: 1.4;
    }
    .comp-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .comp-trad {
      color: #64748b;
    }
    .comp-integral {
      color: #059669;
      font-weight: 700;
    }
    .ideal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .ideal-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .ideal-title {
      font-size: 12px;
      font-weight: 800;
      color: #0891b2;
      margin-bottom: 6px;
      font-family: 'Outfit', sans-serif;
    }
    .ideal-desc {
      font-size: 11.5px;
      color: #475569;
      line-height: 1.45;
    }
    .deliverables-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-bottom: 24px;
    }
    .deliv-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .deliv-check {
      color: #10b981;
      font-weight: bold;
      font-size: 14px;
    }
    .metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .metric-label {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-val {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
    }
    .cta-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 14px;
      padding: 24px 28px;
      margin-bottom: 28px;
      border: 1px solid #334155;
      position: relative;
      overflow: hidden;
    }
    .cta-box::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #10b981, #06b6d4);
    }
    .cta-head {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #34d399;
      margin-bottom: 6px;
    }
    .cta-p {
      font-size: 13px;
      color: #e2e8f0;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .cta-links {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 12px;
      color: #94a3b8;
    }
    .cta-link-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ffffff;
      font-weight: 600;
    }
    .terms-box {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-bottom: 28px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      border-top: 1px solid #cbd5e1;
      padding-top: 24px;
    }
    .sig-line {
      border-bottom: 1px solid #94a3b8;
      height: 36px;
      margin-bottom: 8px;
    }
    .sig-name {
      font-weight: 700;
      font-size: 12px;
      color: #0f172a;
    }
    .sig-title {
      font-size: 11px;
      color: #64748b;
    }
    .floating-print {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      border: 2px solid #10b981;
      transition: all 0.2s;
    }
    .floating-print:hover {
      background: #1e293b;
      transform: scale(1.05);
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .page-container { border: none; box-shadow: none; padding: 0; }
      .floating-print { display: none !important; }
      .page-break { page-break-before: always; }
      @page { margin: 12mm 15mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="top-accent"></div>
    
    <div class="header">
      <div>
        <div class="logo-title">INFINITY IMPACT AGENCY</div>
        <div class="agency-sub">
          Plataformas Web & Automatización de Crecimiento con IA<br>
          WhatsApp: ${config.agencyPhone} • ${config.agencyEmail}<br>
          ${config.agencyWebsite}
        </div>
      </div>
      <div class="ref-box">
        <div class="ref-tag">Dossier Comercial Oficial</div>
        <div class="ref-num">${config.proposalCode}</div>
        <div class="ref-date">Fecha: ${new Date().toLocaleDateString()}</div>
        <div class="ref-date" style="color: #0891b2; font-weight: 600;">Válido hasta: ${config.validUntil}</div>
      </div>
    </div>

    <div class="client-card">
      <div>
        <div class="client-label">Documento preparado exclusivamente para:</div>
        <div class="client-name">${config.clientName}</div>
        <div class="client-company">${config.clientCompany}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <div>Tel: ${config.clientPhone || 'N/A'}</div>
        <div>Email: ${config.clientEmail || 'N/A'}</div>
      </div>
    </div>

    <div>
      <div class="dossier-badge">🚀 DOSSIER DE SERVICIO Y PROPUESTA DE VALOR</div>
      <h1 class="dossier-title">${spec.title}</h1>
      <div class="dossier-sub">${spec.subtitle}</div>
    </div>

    <div class="overview-box">
      <div class="overview-title">📌 ¿QUÉ ES ESTA SOLUCIÓN?</div>
      <p class="overview-p">${spec.solutionOverview || spec.valueProposition}</p>
    </div>

    <div class="section-head">💎 LOS 4 PILARES QUE TRANSFORMAN TU NEGOCIO</div>

    <div class="pillars-container">
      ${pillars
        .map(
          (p) => `
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-num-title">${p.number}. ${p.title} (${p.subtitle})</div>
          </div>
          <ul class="pillar-points">
            ${p.points
              .map(
                (pt) => `
              <li class="pillar-point">
                <span class="pillar-bullet">•</span>
                <div>${pt.label ? `<strong>${pt.label}:</strong> ` : ''}${pt.text}</div>
              </li>`
              )
              .join('')}
          </ul>
        </div>`
        )
        .join('')}
    </div>

    <div class="page-break"></div>

    <div class="section-head">📊 COMPARATIVA: WEB TRADICIONAL VS. NUESTRA PLATAFORMA</div>

    <table class="comp-table">
      <thead>
        <tr>
          <th>Característica Clave</th>
          <th>Sitio Web Convencional</th>
          <th>Nuestra Plataforma Integral</th>
        </tr>
      </thead>
      <tbody>
        ${compTable
          .map(
            (c) => `
          <tr>
            <td><strong>${c.feature}</strong></td>
            <td class="comp-trad">${c.traditional}</td>
            <td class="comp-integral">✓ ${c.integral}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="section-head">🎯 ¿PARA QUIÉN ES IDEAL ESTA SOLUCIÓN?</div>

    <div class="ideal-grid">
      ${idealList
        .map(
          (item) => `
        <div class="ideal-card">
          <div class="ideal-title">${item.audience}</div>
          <div class="ideal-desc">${item.reason}</div>
        </div>`
        )
        .join('')}
    </div>

    <div class="section-head">📦 ENTREGABLES DEL PROYECTO (ALCANCE COMPLETO)</div>

    <div class="deliverables-grid">
      ${spec.deliverables
        .map(
          (d) => `
        <div class="deliv-item">
          <span class="deliv-check">✓</span>
          <span>${d}</span>
        </div>`
        )
        .join('')}
    </div>

    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">Retorno de Inversión (ROI)</div>
        <div class="metric-val">${spec.businessROI}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Tiempo Estimado</div>
        <div class="metric-val">${spec.timelineWeeks}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Garantía & Soporte</div>
        <div class="metric-val">${spec.supportWarranty}</div>
      </div>
    </div>

    <div class="cta-box">
      <div class="cta-head">🚀 ¿Listo para automatizar la captación de tus clientes?</div>
      <p class="cta-p">Hablemos hoy para planificar la estructura y puesta en marcha de tu nueva plataforma.</p>
      <div class="cta-links">
        <div class="cta-link-item">📱 WhatsApp: ${config.agencyPhone}</div>
        <div class="cta-link-item">✉️ Correo: ${config.agencyEmail}</div>
        <div class="cta-link-item">🌐 Web: ${config.agencyWebsite}</div>
      </div>
    </div>

    <div class="terms-box">
      <strong>Condiciones Comerciales y Forma de Pago:</strong><br>
      ${config.customTerms}
    </div>

    <div class="signatures">
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Infinity Impact Agency</div>
        <div class="sig-title">${config.preparedBy}</div>
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">${config.clientName}</div>
        <div class="sig-title">${config.clientCompany} • Firma de Aceptación</div>
      </div>
    </div>
  </div>

  <button class="floating-print" onclick="window.print()">
    🖨️ Imprimir / Guardar en PDF
  </button>
</body>
</html>`;
}

/**
 * Builds an ultra-clean, standalone HTML document for high-res printing or viewing
 * in an independent window/tab.
 */
export function generateStandaloneHTML(spec: SpecItem, config: ProposalDocumentConfig): string {
  if (spec.isDossier || spec.id === 'spec-dossier-plataforma-integral' || (spec.pillars && spec.pillars.length > 0)) {
    return generateDossierHTML(spec, config);
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Propuesta Oficial - ${spec.title} - ${config.clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 30px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px 50px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      position: relative;
    }
    .top-accent {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .logo-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .agency-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.5;
    }
    .ref-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 12px 18px;
      border-radius: 10px;
      text-align: right;
    }
    .ref-tag {
      font-size: 9px;
      font-weight: 800;
      color: #059669;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .ref-num {
      font-family: monospace;
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      margin: 2px 0;
    }
    .ref-date {
      font-size: 11px;
      color: #64748b;
    }
    .client-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .client-label {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .client-name {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .client-company {
      font-size: 12px;
      font-weight: 600;
      color: #059669;
    }
    .service-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      margin-bottom: 8px;
    }
    .service-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }
    .service-title {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .service-price {
      font-family: monospace;
      font-size: 20px;
      font-weight: 700;
      color: #0891b2;
    }
    .service-sub {
      font-size: 13px;
      color: #475569;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }
    .box-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .box-p {
      font-size: 12px;
      color: #334155;
      line-height: 1.5;
    }
    .tech-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 12px;
      color: #334155;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .deliverables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }
    .deliverable-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      color: #1e293b;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.4;
    }
    .check-icon {
      color: #10b981;
      font-weight: bold;
      font-size: 14px;
    }
    .metrics-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
    }
    .metric-label {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
    }
    .metric-val {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
    }
    .terms-box {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-bottom: 30px;
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      border-top: 1px solid #cbd5e1;
      padding-top: 24px;
    }
    .sig-line {
      border-bottom: 1px solid #94a3b8;
      height: 40px;
      margin-bottom: 8px;
    }
    .sig-name {
      font-weight: 700;
      font-size: 12px;
      color: #0f172a;
    }
    .sig-title {
      font-size: 11px;
      color: #64748b;
    }
    .floating-print {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      border: 2px solid #10b981;
      transition: all 0.2s;
    }
    .floating-print:hover {
      background: #1e293b;
      transform: scale(1.05);
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .page-container { border: none; box-shadow: none; padding: 0; }
      .floating-print { display: none !important; }
      @page { margin: 15mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="top-accent"></div>
    
    <div class="header">
      <div>
        <div class="logo-title">INFINITY IMPACT AGENCY</div>
        <div class="agency-sub">
          Plataformas Web & Automatización de Crecimiento con IA<br>
          WhatsApp: ${config.agencyPhone} • ${config.agencyEmail}<br>
          ${config.agencyWebsite}
        </div>
      </div>
      <div class="ref-box">
        <div class="ref-tag">Propuesta Oficial</div>
        <div class="ref-num">${config.proposalCode}</div>
        <div class="ref-date">Fecha: ${new Date().toLocaleDateString()}</div>
        <div class="ref-date" style="color: #0891b2; font-weight: 600;">Válido hasta: ${config.validUntil}</div>
      </div>
    </div>

    <div class="client-card">
      <div>
        <div class="client-label">Propuesta preparada para:</div>
        <div class="client-name">${config.clientName}</div>
        <div class="client-company">${config.clientCompany}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <div>Tel: ${config.clientPhone || 'N/A'}</div>
        <div>Email: ${config.clientEmail || 'N/A'}</div>
      </div>
    </div>

    <div>
      <span class="service-badge">${spec.badge}</span>
      <div class="service-head">
        <h1 class="service-title">${spec.title}</h1>
        ${spec.priceTag ? `<div class="service-price">${spec.priceTag}</div>` : ''}
      </div>
      <p class="service-sub">${spec.subtitle}</p>
    </div>

    <div class="two-cols">
      <div class="box">
        <div class="box-title" style="color: #0891b2;">🎯 Propuesta de Valor & Solución</div>
        <p class="box-p">${spec.valueProposition}</p>
      </div>
      <div class="box">
        <div class="box-title" style="color: #e11d48;">🛡️ Problema Comercial que Resuelve</div>
        <p class="box-p">${spec.problemSolved}</p>
      </div>
    </div>

    <div class="tech-box">
      <strong style="color: #0f172a;">⚙️ Arquitectura & Tecnologías Empleadas:</strong><br>
      ${spec.technicalArchitecture}
    </div>

    <div class="section-title">✅ Alcance y Entregables Concretos:</div>
    <div class="deliverables-grid">
      ${spec.deliverables
        .map(
          (d) => `<div class="deliverable-item"><span class="check-icon">✓</span><span>${d}</span></div>`
        )
        .join('')}
    </div>

    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">Retorno de Inversión (ROI)</div>
        <div class="metric-val">${spec.businessROI}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Tiempo Estimado</div>
        <div class="metric-val">${spec.timelineWeeks}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Garantía & Soporte</div>
        <div class="metric-val">${spec.supportWarranty}</div>
      </div>
    </div>

    ${
      spec.exclusions && spec.exclusions.length > 0
        ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 16px;"><strong>Límites y exclusiones:</strong> ${spec.exclusions.join(' • ')}</div>`
        : ''
    }

    <div class="terms-box">
      <strong>Condiciones Comerciales y Forma de Pago:</strong><br>
      ${config.customTerms}
    </div>

    <div class="signatures">
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Infinity Impact Agency</div>
        <div class="sig-title">${config.preparedBy}</div>
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">${config.clientName}</div>
        <div class="sig-title">${config.clientCompany} • Firma de Aceptación</div>
      </div>
    </div>
  </div>

  <button class="floating-print" onclick="window.print()">
    🖨️ Imprimir / Guardar en PDF
  </button>
</body>
</html>`;
}

/**
 * Creates an independent HTML printable window/tab to bypass iframe restrictions completely,
 * allowing the user to view the full styled layout and use their native browser "Print to PDF".
 */
export function openPrintableTab(htmlContent: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    // If popups are blocked by browser, trigger download of the standalone HTML
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Propuesta_Comercial_Infinity_Impact.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}


