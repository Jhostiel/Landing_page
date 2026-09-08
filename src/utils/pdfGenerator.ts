import { jsPDF } from 'jspdf';
import { SpecItem, ProposalDocumentConfig } from '../technicalSpecsData';

/**
 * Generates and downloads a clean, professional vector PDF document
 * using jsPDF directly, completely avoiding iframe print sandbox restrictions.
 */
export function generateDirectPDF(spec: SpecItem, config: ProposalDocumentConfig): void {
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

  // Save the PDF file directly via browser download
  const cleanTitle = (spec.title || 'Propuesta').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const cleanClient = (config.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  const filename = `Propuesta_${cleanTitle}_${cleanClient}.pdf`;

  doc.save(filename);
}

/**
 * Builds an ultra-clean, standalone HTML document for high-res printing or viewing
 * in an independent window/tab.
 */
export function generateStandaloneHTML(spec: SpecItem, config: ProposalDocumentConfig): string {
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


