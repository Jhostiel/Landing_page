import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Edit3,
  CheckCircle2,
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  Save,
  RotateCcw,
  Eye,
  Check,
  Printer,
  ShieldCheck,
  Clock,
  Zap,
  ArrowRight,
  ChevronRight,
  Search,
  Sliders,
  DollarSign,
  Briefcase,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { InfinityLogo } from './InfinityLogo';
import { DEFAULT_TECHNICAL_SPECS, SpecItem, ProposalDocumentConfig } from '../technicalSpecsData';
import { AgencySiteConfig, LeadData } from '../types';
import { generateDirectPDF, generateStandaloneHTML, openPrintableTab } from '../utils/pdfGenerator';

interface ProposalsManagerProps {
  agencyConfig: AgencySiteConfig;
  initialLead?: LeadData | null;
  onClearInitialLead?: () => void;
}

export const ProposalsManager: React.FC<ProposalsManagerProps> = ({ agencyConfig, initialLead, onClearInitialLead }) => {
  // Local storage persisted specs
  const [specs, setSpecs] = useState<SpecItem[]>(() => {
    try {
      const saved = localStorage.getItem('infinity_technical_specs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TECHNICAL_SPECS;
  });

  // Helper to find the best matching spec based on client interest string
  const findMatchingSpecId = (interest?: string): string => {
    if (!interest) return 'spec-dossier-plataforma-integral';
    const lower = interest.toLowerCase();
    if (lower.includes('dossier') || lower.includes('plataforma') || lower.includes('integral')) return 'spec-dossier-plataforma-integral';
    if (lower.includes('plan 01') || lower.includes('start')) return 'spec-plan-start';
    if (lower.includes('plan 02') || lower.includes('plan ai') || lower.includes('infinity ai')) return 'spec-plan-ai';
    if (lower.includes('plan 03') || lower.includes('growth')) return 'spec-plan-growth';
    if (lower.includes('plan 04') || lower.includes('360')) return 'spec-plan-360';
    if (lower.includes('web') || lower.includes('landing') || lower.includes('página')) return 'spec-dossier-plataforma-integral';
    if (lower.includes('prospecci') || lower.includes('leads') || lower.includes('cold') || lower.includes('b2b')) return 'spec-leads-ia';
    if (lower.includes('crm') || lower.includes('pipeline') || lower.includes('seguimiento')) return 'spec-crm-whatsapp';
    if (lower.includes('maps') || lower.includes('seo') || lower.includes('reseñ') || lower.includes('local')) return 'spec-seo-local';
    if (lower.includes('menú') || lower.includes('menu') || lower.includes('pedido') || lower.includes('restaurante') || lower.includes('qr')) return 'spec-menus-pedidos';
    return 'spec-dossier-plataforma-integral';
  };

  // Selected spec for editing or generating document
  const [selectedSpecId, setSelectedSpecId] = useState<string>(() => {
    if (initialLead) {
      return findMatchingSpecId(initialLead.serviceInterest);
    }
    return 'spec-dossier-plataforma-integral';
  });
  const [filterType, setFilterType] = useState<'all' | 'service' | 'plan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mode: editor or client proposal preview
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);


  // Client proposal personalization
  const [proposalConfig, setProposalConfig] = useState<ProposalDocumentConfig>(() => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 15);

    if (initialLead) {
      return {
        clientName: initialLead.name || 'Cliente Estimado',
        clientCompany: initialLead.businessName || initialLead.businessCategory || 'Empresa / Negocio',
        clientEmail: initialLead.email || '',
        clientPhone: initialLead.phone || '',
        proposalCode: `INF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        validUntil: expiry.toISOString().split('T')[0],
        preparedBy: 'Dirección Comercial • Infinity Impact Agency',
        selectedItems: [specs[0]],
        customTerms: 'Forma de pago: 50% al inicio y 50% al completar y validar la puesta en marcha técnica. Incluye garantía de satisfacción y soporte técnico post-lanzamiento.',
        agencyPhone: agencyConfig.whatsappNumber || '+57 321 987 6543',
        agencyEmail: agencyConfig.notifications.adminEmail || 'contacto@infinityimpact.agency',
        agencyWebsite: 'www.infinityimpact.agency'
      };
    }

    return {
      clientName: 'Alejandro Morales',
      clientCompany: 'Clínica & Asociados',
      clientEmail: 'contacto@clinicamorales.com',
      clientPhone: '+57 310 987 6543',
      proposalCode: `INF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      validUntil: expiry.toISOString().split('T')[0],
      preparedBy: 'Dirección Comercial • Infinity Impact Agency',
      selectedItems: [specs[0]],
      customTerms: 'Forma de pago: 50% al inicio y 50% al completar y validar la puesta en marcha técnica. Incluye garantía de satisfacción y soporte técnico post-lanzamiento.',
      agencyPhone: agencyConfig.whatsappNumber || '+57 321 987 6543',
      agencyEmail: agencyConfig.notifications.adminEmail || 'contacto@infinityimpact.agency',
      agencyWebsite: 'www.infinityimpact.agency'
    };
  });

  // Watch for changes in initialLead if user navigated from Bookings tab
  useEffect(() => {
    if (initialLead) {
      const today = new Date();
      const expiry = new Date();
      expiry.setDate(today.getDate() + 15);

      const matchedId = findMatchingSpecId(initialLead.serviceInterest);
      setSelectedSpecId(matchedId);

      setProposalConfig((prev) => ({
        ...prev,
        clientName: initialLead.name || prev.clientName,
        clientCompany: initialLead.businessName || initialLead.businessCategory || prev.clientCompany,
        clientEmail: initialLead.email || prev.clientEmail,
        clientPhone: initialLead.phone || prev.clientPhone,
        proposalCode: `INF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        validUntil: expiry.toISOString().split('T')[0],
      }));
      setViewMode('preview');
    }
  }, [initialLead]);

  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // Currently active spec being reviewed/edited
  const currentSpec = specs.find((s) => s.id === selectedSpecId) || specs[0];

  const printableRef = useRef<HTMLDivElement>(null);

  const filteredSpecs = specs.filter((s) => {
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Save changes to local storage
  const handleSaveSpecChanges = (updated: SpecItem) => {
    const newSpecs = specs.map((s) => (s.id === updated.id ? updated : s));
    setSpecs(newSpecs);
    localStorage.setItem('infinity_technical_specs', JSON.stringify(newSpecs));
    setSaveAlert(`¡Ficha técnica de "${updated.title}" guardada exitosamente!`);
    setTimeout(() => setSaveAlert(null), 4000);
  };

  // Reset to default specs
  const handleResetDefaults = () => {
    if (window.confirm('¿Seguro que deseas restaurar las fichas técnicas y planes originales de fábrica?')) {
      setSpecs(DEFAULT_TECHNICAL_SPECS);
      localStorage.setItem('infinity_technical_specs', JSON.stringify(DEFAULT_TECHNICAL_SPECS));
      setSaveAlert('Fichas técnicas restauradas a los valores por defecto.');
      setTimeout(() => setSaveAlert(null), 3000);
    }
  };

  // Direct Vector PDF Download (Guaranteed to work inside iframes & mobile)
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setSaveAlert('Generando archivo PDF oficial en alta resolución...');
      
      // Small timeout to allow state rendering
      setTimeout(() => {
        try {
          generateDirectPDF(currentSpec, proposalConfig);
          setSaveAlert(`¡Documento PDF de "${currentSpec.title}" descargado con éxito! Revisa tus descargas.`);
          setTimeout(() => setSaveAlert(null), 5000);
        } catch (innerErr) {
          console.error('Error generating direct PDF:', innerErr);
          setSaveAlert('Generando documento imprimible alternativo...');
          handleOpenPrintableTab();
        } finally {
          setIsGeneratingPDF(false);
        }
      }, 150);
    } catch (err) {
      console.error('Error in PDF download flow:', err);
      setIsGeneratingPDF(false);
      handleOpenPrintableTab();
    }
  };

  // Open standalone printable version in a new tab (bypasses iframe sandbox for native browser Ctrl+P)
  const handleOpenPrintableTab = () => {
    const html = generateStandaloneHTML(currentSpec, proposalConfig);
    openPrintableTab(html);
    setSaveAlert('Abriendo propuesta en pestaña independiente para imprimir...');
    setTimeout(() => setSaveAlert(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="bg-[#0e131f] border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
              <Sparkles size={13} />
              Dossier Comercial & Fichas Técnicas para Clientes
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] tracking-tight">
              Generador de Fichas Técnicas & Propuestas en PDF
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Edita cada punto técnico, entregable, garantía y ROI de tus <strong>servicios y planes</strong>. 
              Personaliza con el nombre del cliente y <strong>descarga en PDF de alta resolución</strong> con los colores, tipografía y logo corporativo de Infinity Impact Agency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-md'
                  : 'bg-[#141b2b] text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Edit3 size={15} />
              <span>{viewMode === 'edit' ? 'Ver Propuesta' : 'Modo Edición'}</span>
            </button>

            <button
              onClick={handleOpenPrintableTab}
              title="Abre el documento en una pestaña independiente para imprimir o guardar con el diálogo nativo"
              className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
            >
              <ExternalLink size={15} className="text-cyan-400" />
              <span>Pestaña Imprimible</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Descargar PDF Oficial</span>
                </>
              )}
            </button>
          </div>
        </div>

        {initialLead && (
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <span className="font-bold text-emerald-300">Cliente Autocompletado desde Reserva:</span>{' '}
                <span className="text-white font-semibold">{initialLead.name}</span>{' '}
                <span className="text-slate-400">({initialLead.businessName || 'Empresa'}), Cita: {initialLead.date} {initialLead.timeSlot}</span>
              </div>
            </div>
            {onClearInitialLead && (
              <button
                onClick={onClearInitialLead}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium cursor-pointer self-start sm:self-auto transition-colors"
              >
                Limpiar y usar datos genéricos
              </button>
            )}
          </div>
        )}

        {saveAlert && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{saveAlert}</span>
          </div>
        )}
      </div>

      {/* DOSSIER DESTACADO BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Documento Listo para Clientes
              </span>
              <span className="text-xs font-semibold text-cyan-400">PDF Oficial 3 Páginas</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              Dossier de Servicio: Plataforma Web Integral (Landing + Reservas + CRM)
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mt-0.5">
              Material comercial completo con los 4 pilares, tabla comparativa, entregables y propuesta de valor para entregar a prospectos interesados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            onClick={() => {
              setSelectedSpecId('spec-dossier-plataforma-integral');
              setViewMode('preview');
            }}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye size={14} className="text-cyan-400" />
            <span>Ver Dossier</span>
          </button>
          <button
            onClick={() => {
              const dossierSpec = specs.find((s) => s.id === 'spec-dossier-plataforma-integral') || specs[0];
              generateDirectPDF(dossierSpec, proposalConfig);
            }}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Download size={14} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* FILTER AND SELECTOR BAR */}
      <div className="bg-[#0c101a] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({specs.length})
          </button>
          <button
            onClick={() => setFilterType('service')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'service'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Servicios Individuales (6)
          </button>
          <button
            onClick={() => setFilterType('plan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'plan'
                ? 'bg-purple-500 text-white font-bold shadow-sm shadow-purple-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Planes & Paquetes (4)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por servicio o plan..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#141a26] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <button
          onClick={handleResetDefaults}
          title="Restaurar textos originales de fábrica"
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 self-end md:self-auto cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Restaurar Fichas Originales</span>
        </button>
      </div>

      {/* MAIN LAYOUT: SIDEBAR LIST + CONTENT/PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR CATALOG LIST */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Selecciona el ítem a personalizar:
          </p>

          {filteredSpecs.map((item) => {
            const isSelected = item.id === selectedSpecId;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedSpecId(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#141b2b] to-[#101520] border-emerald-500/60 shadow-lg shadow-emerald-500/5 -translate-y-0.5'
                    : 'bg-[#0d121c] border-slate-800/80 hover:border-slate-700 hover:bg-[#111724]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.type === 'plan'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                  {item.priceTag && (
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {item.priceTag}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white leading-snug line-clamp-1 font-['Outfit']">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {item.subtitle}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {item.deliverables.length} entregables
                  </span>
                  <span className="text-cyan-400 flex items-center gap-0.5 font-medium">
                    {isSelected ? 'Editando / Viendo' : 'Seleccionar'}
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* WORKSPACE AREA (EDITOR OR PROPOSAL PREVIEW) */}
        <div className="lg:col-span-8">
          {viewMode === 'edit' ? (
            /* EDITOR FORM */
            <div className="bg-[#0d121c] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Modo Editor de Ficha Técnica
                  </span>
                  <h3 className="text-xl font-bold text-white font-['Outfit'] mt-1">
                    Editando: {currentSpec.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleSaveSpecChanges(currentSpec)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Guardar Cambios</span>
                </button>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Título del Servicio o Plan</label>
                    <input
                      type="text"
                      value={currentSpec.title}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, title: e.target.value } : s)))
                      }
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl px-3.5 py-2 text-white font-semibold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Inversión / Precio (ej. US$ 797)</label>
                    <input
                      type="text"
                      value={currentSpec.priceTag || ''}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, priceTag: e.target.value } : s)))
                      }
                      placeholder="ej. US$ 1,497 + US$ 297/mes"
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl px-3.5 py-2 text-cyan-400 font-mono font-semibold focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subtítulo / Promesa Principal</label>
                  <input
                    type="text"
                    value={currentSpec.subtitle}
                    onChange={(e) =>
                      setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, subtitle: e.target.value } : s)))
                    }
                    className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Propuesta de Valor (Para qué le sirve al cliente)</label>
                  <textarea
                    rows={3}
                    value={currentSpec.valueProposition}
                    onChange={(e) =>
                      setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, valueProposition: e.target.value } : s)))
                    }
                    className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-3 text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Cliente Ideal / A quién va dirigido</label>
                    <textarea
                      rows={2}
                      value={currentSpec.targetAudience}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, targetAudience: e.target.value } : s)))
                      }
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Problema que Resuelve (Dolor)</label>
                    <textarea
                      rows={2}
                      value={currentSpec.problemSolved}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, problemSolved: e.target.value } : s)))
                      }
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Lista de Entregables Concretos (Uno por línea)
                  </label>
                  <textarea
                    rows={6}
                    value={currentSpec.deliverables.join('\n')}
                    onChange={(e) =>
                      setSpecs(
                        specs.map((s) =>
                          s.id === currentSpec.id
                            ? { ...s, deliverables: e.target.value.split('\n').filter((l) => l.trim() !== '') }
                            : s
                        )
                      )
                    }
                    className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-3 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Retorno de Inversión (ROI)</label>
                    <input
                      type="text"
                      value={currentSpec.businessROI}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, businessROI: e.target.value } : s)))
                      }
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tiempos de Entrega</label>
                    <input
                      type="text"
                      value={currentSpec.timelineWeeks}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, timelineWeeks: e.target.value } : s)))
                      }
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Garantía y Soporte</label>
                    <input
                      type="text"
                      value={currentSpec.supportWarranty}
                      onChange={(e) =>
                        setSpecs(specs.map((s) => (s.id === currentSpec.id ? { ...s, supportWarranty: e.target.value } : s)))
                      }
                      className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Exclusiones / Lo que NO incluye (Uno por línea)
                  </label>
                  <textarea
                    rows={2}
                    value={currentSpec.exclusions.join('\n')}
                    onChange={(e) =>
                      setSpecs(
                        specs.map((s) =>
                          s.id === currentSpec.id
                            ? { ...s, exclusions: e.target.value.split('\n').filter((l) => l.trim() !== '') }
                            : s
                        )
                      )
                    }
                    className="w-full bg-[#141a26] border border-slate-700/80 rounded-xl p-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    handleSaveSpecChanges(currentSpec);
                    setViewMode('preview');
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Guardar y Ver Propuesta en PDF
                </button>
              </div>
            </div>
          ) : (
            /* CLIENT PROPOSAL PDF PREVIEW (STRICT HIGH RESOLUTION PRINTABLE SHEET) */
            <div className="space-y-6">
              {/* Client personalization mini-bar */}
              <div className="bg-[#0e1320] border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sliders size={14} className="text-cyan-400" />
                    Personalización para el Cliente Destinatario:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Se reflejará en el encabezado del documento
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Nombre del Cliente</label>
                    <input
                      type="text"
                      value={proposalConfig.clientName}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, clientName: e.target.value })}
                      className="w-full bg-[#151b29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Empresa / Negocio</label>
                    <input
                      type="text"
                      value={proposalConfig.clientCompany}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, clientCompany: e.target.value })}
                      className="w-full bg-[#151b29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={proposalConfig.clientPhone || ''}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, clientPhone: e.target.value })}
                      placeholder="+57 300 000 0000"
                      className="w-full bg-[#151b29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={proposalConfig.clientEmail || ''}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, clientEmail: e.target.value })}
                      placeholder="cliente@empresa.com"
                      className="w-full bg-[#151b29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Código de Propuesta</label>
                    <input
                      type="text"
                      value={proposalConfig.proposalCode}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, proposalCode: e.target.value })}
                      className="w-full bg-[#151b29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Válido Hasta</label>
                    <input
                      type="date"
                      value={proposalConfig.validUntil}
                      onChange={(e) => setProposalConfig({ ...proposalConfig, validUntil: e.target.value })}
                      className="w-full bg-[#151b29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PRINTABLE DOCUMENT CANVAS (OFFICIAL INFINITY IMPACT PROPOSAL SHEET) */}
              {/* ========================================================================= */}
              <div
                ref={printableRef}
                id="proposal-document-print"
                className="bg-[#0a0d14] text-slate-100 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white print:text-slate-900"
              >
                {/* Decorative glow lines (hidden on print) */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none print:hidden" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none print:hidden" />

                {/* 1. DOCUMENT HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-800 print:border-slate-300">
                  <div>
                    <InfinityLogo size={36} showAgencyText={true} />
                    <div className="mt-3 text-xs text-slate-400 print:text-slate-600 space-y-0.5">
                      <p className="font-semibold text-slate-200 print:text-slate-900">
                        Plataformas Web & Automatización de Crecimiento con IA
                      </p>
                      <p>WhatsApp: {proposalConfig.agencyPhone} • {proposalConfig.agencyEmail}</p>
                      <p>{proposalConfig.agencyWebsite}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs space-y-1 bg-[#0f1422] print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 print:text-emerald-700">
                      DOCUMENTO OFICIAL DE ESPECIFICACIÓN TÉCNICA
                    </div>
                    <p className="text-sm font-bold font-mono text-white print:text-slate-900">
                      REF: {proposalConfig.proposalCode}
                    </p>
                    <p className="text-slate-400 print:text-slate-600">
                      Fecha de Emisión: <strong>{new Date().toLocaleDateString()}</strong>
                    </p>
                    <p className="text-slate-400 print:text-slate-600">
                      Válido hasta: <strong className="text-cyan-400 print:text-blue-700">{proposalConfig.validUntil}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. PROPOSAL DESTINATION */}
                <div className="my-8 p-5 rounded-2xl bg-gradient-to-r from-[#0f1422] to-[#0c101a] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 block mb-1">
                    PROPUESTA Y ESPECIFICACIÓN PREPARADA PARA:
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white print:text-slate-900 font-['Outfit']">
                        {proposalConfig.clientName}
                      </h3>
                      <p className="text-xs text-emerald-400 print:text-emerald-700 font-medium">
                        {proposalConfig.clientCompany}
                      </p>
                    </div>
                    <div className="text-xs text-slate-300 print:text-slate-600 sm:text-right">
                      <p>Contacto: {proposalConfig.clientPhone || 'No especificado'}</p>
                      <p>Correo: {proposalConfig.clientEmail || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. ITEM CORE DETAILS */}
                <div className="space-y-6">
                  <div className="border-b border-slate-800/80 print:border-slate-300 pb-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-800 mb-2">
                      <Sparkles size={12} />
                      {currentSpec.badge}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 font-['Outfit'] tracking-tight">
                        {currentSpec.title}
                      </h2>
                      {currentSpec.priceTag && (
                        <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 print:text-blue-700 shrink-0">
                          {currentSpec.priceTag}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 print:text-slate-700 mt-2 font-medium leading-relaxed">
                      {currentSpec.subtitle}
                    </p>
                  </div>

                  {/* DOSSIER OR STANDARD SPEC DETAILS */}
                  {currentSpec.isDossier || (currentSpec.pillars && currentSpec.pillars.length > 0) ? (
                    /* DOSSIER FULL ON-SCREEN PREVIEW */
                    <div className="space-y-6">
                      {/* Overview Callout */}
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 print:bg-emerald-50 print:border-emerald-300 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-300 print:text-emerald-800 uppercase tracking-wider mb-2">
                          <Sparkles size={14} className="text-emerald-400" />
                          📌 ¿QUÉ ES ESTA SOLUCIÓN?
                        </div>
                        <p className="text-slate-200 print:text-slate-800 leading-relaxed font-medium">
                          {currentSpec.solutionOverview || currentSpec.valueProposition}
                        </p>
                      </div>

                      {/* 4 Pillars */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Zap size={16} className="text-cyan-400 print:text-blue-700" />
                          💎 LOS 4 PILARES QUE TRANSFORMAN TU NEGOCIO:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentSpec.pillars?.map((p) => (
                            <div
                              key={p.number}
                              className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 border-l-4 border-l-emerald-500 print:bg-white print:border-slate-300 print:border-l-emerald-600 text-xs space-y-2.5 shadow-sm"
                            >
                              <div className="font-bold text-white print:text-slate-900 text-sm font-['Outfit']">
                                {p.number}. {p.title}{' '}
                                <span className="text-slate-400 print:text-slate-600 text-xs font-normal">
                                  ({p.subtitle})
                                </span>
                              </div>
                              <div className="space-y-2">
                                {p.points.map((pt, pIdx) => (
                                  <div key={pIdx} className="flex items-start gap-2 text-slate-300 print:text-slate-700">
                                    <span className="text-emerald-400 print:text-emerald-700 font-bold shrink-0">•</span>
                                    <span>
                                      {pt.label && (
                                        <strong className="text-slate-100 print:text-slate-900">
                                          {pt.label}:{' '}
                                        </strong>
                                      )}
                                      {pt.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comparison Table */}
                      {currentSpec.comparisonTable && currentSpec.comparisonTable.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={16} className="text-cyan-400 print:text-blue-700" />
                            📊 COMPARATIVA: WEB TRADICIONAL VS. NUESTRA PLATAFORMA
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-[#0c111a] print:bg-slate-100 text-slate-300 print:text-slate-800 border-b border-slate-800 print:border-slate-300">
                                  <th className="p-3 font-bold uppercase text-[11px]">Característica Clave</th>
                                  <th className="p-3 font-bold uppercase text-[11px] text-slate-400 print:text-slate-600">
                                    Sitio Web Convencional
                                  </th>
                                  <th className="p-3 font-bold uppercase text-[11px] text-emerald-400 print:text-emerald-700">
                                    Nuestra Plataforma Integral
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                                {currentSpec.comparisonTable.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={
                                      rIdx % 2 === 0
                                        ? 'bg-[#0f1422]/60 print:bg-white'
                                        : 'bg-[#0a0f19] print:bg-slate-50'
                                    }
                                  >
                                    <td className="p-3 font-semibold text-white print:text-slate-900">{row.feature}</td>
                                    <td className="p-3 text-slate-400 print:text-slate-600">{row.traditional}</td>
                                    <td className="p-3 text-emerald-300 print:text-emerald-700 font-semibold">
                                      ✓ {row.integral}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Ideal For */}
                      {currentSpec.idealFor && currentSpec.idealFor.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={16} className="text-cyan-400 print:text-blue-700" />
                            🎯 ¿PARA QUIÉN ES IDEAL ESTA SOLUCIÓN?
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {currentSpec.idealFor.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 print:bg-slate-50 print:border-slate-300 text-xs"
                              >
                                <div className="font-bold text-cyan-300 print:text-blue-700 mb-1">
                                  {item.audience}
                                </div>
                                <p className="text-slate-400 print:text-slate-600 leading-relaxed">{item.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deliverables */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400 print:text-emerald-700" />
                          📦 ENTREGABLES DEL PROYECTO (ALCANCE COMPLETO):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentSpec.deliverables.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0f1422] border border-slate-800 print:bg-white print:border-slate-300 text-xs"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                                ✓
                              </div>
                              <span className="text-slate-200 print:text-slate-800 font-medium leading-relaxed">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#0e131f] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase block">
                            Retorno de Inversión (ROI)
                          </span>
                          <p className="text-slate-200 print:text-slate-900 font-semibold mt-1">
                            {currentSpec.businessROI}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0e131f] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase block">
                            Plazo Estimado de Entrega
                          </span>
                          <p className="text-slate-200 print:text-slate-900 font-semibold mt-1">
                            {currentSpec.timelineWeeks}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0e131f] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase block">
                            Soporte & Garantía
                          </span>
                          <p className="text-slate-200 print:text-slate-900 font-semibold mt-1">
                            {currentSpec.supportWarranty}
                          </p>
                        </div>
                      </div>

                      {/* Call to action card */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#0c1724] border border-cyan-500/40 print:bg-slate-100 print:border-slate-300 text-xs">
                        <div className="text-sm font-bold text-emerald-400 print:text-emerald-800 mb-1 font-['Outfit']">
                          🚀 ¿Listo para automatizar la captación de tus clientes?
                        </div>
                        <p className="text-slate-300 print:text-slate-700 mb-3">
                          Hablemos hoy para planificar la estructura y puesta en marcha de tu nueva plataforma.
                        </p>
                        <div className="flex flex-wrap gap-4 text-slate-400 print:text-slate-600 text-[11px]">
                          <span>
                            📱 WhatsApp:{' '}
                            <strong className="text-white print:text-slate-900">
                              {proposalConfig.agencyPhone}
                            </strong>
                          </span>
                          <span>
                            ✉️ Correo:{' '}
                            <strong className="text-white print:text-slate-900">
                              {proposalConfig.agencyEmail}
                            </strong>
                          </span>
                          <span>
                            🌐 Web:{' '}
                            <strong className="text-white print:text-slate-900">
                              {proposalConfig.agencyWebsite}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* VALUE PROP & PROBLEM SOLVED */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <h4 className="font-bold text-slate-200 print:text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Zap size={14} className="text-amber-400" />
                            Propuesta de Valor & Solución
                          </h4>
                          <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                            {currentSpec.valueProposition}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <h4 className="font-bold text-slate-200 print:text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-cyan-400" />
                            El Problema Comercial que Resuelve
                          </h4>
                          <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                            {currentSpec.problemSolved}
                          </p>
                        </div>
                      </div>

                      {/* TECHNICAL ARCHITECTURE */}
                      <div className="p-4 rounded-xl bg-[#0c111a] border border-slate-800 print:bg-slate-100 print:border-slate-300 text-xs space-y-1">
                        <span className="font-bold text-cyan-400 print:text-blue-700 uppercase tracking-wider block">
                          ⚙️ Arquitectura e Infraestructura Tecnológica Empleada:
                        </span>
                        <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                          {currentSpec.technicalArchitecture}
                        </p>
                      </div>

                      {/* DELIVERABLES LIST */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400 print:text-emerald-700" />
                          Entregables Concretos de la Solución (Alcance Total):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentSpec.deliverables.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0f1422] border border-slate-800/80 print:bg-white print:border-slate-300 text-xs"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                                ✓
                              </div>
                              <span className="text-slate-200 print:text-slate-800 font-medium leading-relaxed">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* METRICS & TERMS GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#0e131f] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase block">
                            Retorno de Inversión (ROI)
                          </span>
                          <p className="text-slate-200 print:text-slate-900 font-semibold mt-1">
                            {currentSpec.businessROI}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0e131f] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase block">
                            Plazo Estimado de Entrega
                          </span>
                          <p className="text-slate-200 print:text-slate-900 font-semibold mt-1">
                            {currentSpec.timelineWeeks}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0e131f] border border-slate-800 print:bg-slate-50 print:border-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase block">
                            Soporte & Garantía
                          </span>
                          <p className="text-slate-200 print:text-slate-900 font-semibold mt-1">
                            {currentSpec.supportWarranty}
                          </p>
                        </div>
                      </div>

                      {/* EXCLUSIONS */}
                      {currentSpec.exclusions.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 text-[11px] text-slate-400 print:text-slate-600">
                          <span className="font-bold text-slate-300 print:text-slate-700">Límites y Exclusiones Claras: </span>
                          {currentSpec.exclusions.join(' • ')}
                        </div>
                      )}
                    </>
                  )}

                  {/* CUSTOM TERMS */}
                  <div className="pt-4 border-t border-slate-800 print:border-slate-300 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 print:text-slate-600 uppercase tracking-wider block mb-1">
                      Condiciones Comerciales y Forma de Pago:
                    </span>
                    <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                      {proposalConfig.customTerms}
                    </p>
                  </div>

                  {/* 4. SIGNATURE / APPROVAL BLOCK */}
                  <div className="mt-8 pt-8 border-t border-slate-800 print:border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                    <div className="space-y-6">
                      <p className="text-slate-400 print:text-slate-600">Por la Agencia:</p>
                      <div className="pt-8 border-b border-slate-700 print:border-slate-400" />
                      <div>
                        <p className="font-bold text-white print:text-slate-900">Infinity Impact Agency</p>
                        <p className="text-slate-400 print:text-slate-600">{proposalConfig.preparedBy}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-slate-400 print:text-slate-600">Aceptado por el Cliente:</p>
                      <div className="pt-8 border-b border-slate-700 print:border-slate-400" />
                      <div>
                        <p className="font-bold text-white print:text-slate-900">{proposalConfig.clientName}</p>
                        <p className="text-slate-400 print:text-slate-600">{proposalConfig.clientCompany} • Fecha:</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS BELOW CANVAS */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>
                    El PDF se descarga de forma instantánea a tu ordenador o teléfono. También puedes usar &quot;Pestaña Imprimible&quot; para abrirlo en limpio.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setViewMode('edit')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    Editar contenido de esta ficha
                  </button>

                  <button
                    onClick={handleOpenPrintableTab}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Pestaña Imprimible</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Descargar PDF Oficial (.pdf)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
