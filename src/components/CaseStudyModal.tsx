import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  ArrowRight,
  Quote,
  Smile,
  HeartPulse,
  Utensils,
  Building2,
  Dumbbell,
  Scale,
  Sparkles,
  Layers
} from 'lucide-react';
import { TrustClient } from '../types';

interface CaseStudyModalProps {
  client: TrustClient | null;
  onClose: () => void;
  onBookService: (serviceTitle: string) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  client,
  onClose,
  onBookService,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (client) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [client, onClose]);

  if (!client) return null;

  const renderClientIcon = (iconName: string) => {
    const props = { size: 24, className: 'text-emerald-400' };
    switch (iconName) {
      case 'Smile': return <Smile {...props} className="text-cyan-400" />;
      case 'HeartPulse': return <HeartPulse {...props} className="text-rose-400" />;
      case 'Utensils': return <Utensils {...props} className="text-amber-400" />;
      case 'Building2': return <Building2 {...props} className="text-blue-400" />;
      case 'Dumbbell': return <Dumbbell {...props} className="text-emerald-400" />;
      case 'Scale': return <Scale {...props} className="text-purple-400" />;
      default: return <Building2 {...props} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0b0f17] border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-auto max-h-[90vh] flex flex-col z-10"
        >
          {/* Header Banner */}
          <div className="relative px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shadow-inner shrink-0">
                  {renderClientIcon(client.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-wide">
                      {client.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                      {client.sub}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    {client.industry}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400 shrink-0" />
                «{client.tagline}»
              </p>
            </div>
          </div>

          {/* Body content (scrollable) */}
          <div className="overflow-y-auto px-6 py-5 space-y-6 text-slate-200 scrollbar-thin">
            {/* Impact Metrics Grid */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <TrendingUp size={14} className="text-emerald-400" />
                <span>Resultados e Impacto Medible</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {client.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 font-['Outfit']">
                      {metric.value}
                    </span>
                    <span className="text-xs font-semibold text-white mt-1">
                      {metric.label}
                    </span>
                    {metric.subtext && (
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {metric.subtext}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Challenge */}
              <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-900/30 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300 mb-2">
                  <AlertCircle size={15} className="text-rose-400 shrink-0" />
                  <span>El Reto Inicial (Antes)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {client.challenge}
                </p>
              </div>

              {/* Solution */}
              <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/30 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                  <Zap size={15} className="text-emerald-400 shrink-0" />
                  <span>Solución Infinity Impact</span>
                </div>
                <p className="text-xs font-bold text-white mb-1">
                  {client.solution.title}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {client.solution.description}
                </p>
              </div>
            </div>

            {/* Deliverables */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                <Layers size={14} className="text-cyan-400" />
                <span>Lo que implementamos para este negocio</span>
              </div>
              <ul className="space-y-2">
                {client.solution.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial Quote */}
            {client.testimonial && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-800 relative">
                <Quote size={20} className="text-emerald-500/30 absolute top-3 right-3" />
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed mb-3">
                  «{client.testimonial.quote}»
                </p>
                <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                  <span className="font-bold text-white">
                    {client.testimonial.author}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {client.testimonial.role}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-6 py-4 border-t border-slate-800 bg-[#090d14] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs text-slate-400">
                Solución aplicada: <span className="text-white font-semibold">{client.serviceTitle}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => onBookService(client.serviceTitle)}
                className="w-2/3 sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer touch-tap"
              >
                <span>Quiero una solución similar</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
