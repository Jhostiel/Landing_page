import React, { useState } from 'react';

interface InfinityLogoProps {
  className?: string;
  size?: number;
  showAgencyText?: boolean;
  variant?: 'mark' | 'full';
}

export const InfinityLogo: React.FC<InfinityLogoProps> = ({
  className = '',
  size = 36,
  showAgencyText = true,
  variant = 'mark',
}) => {
  const [imgError, setImgError] = useState(false);

  if (variant === 'full') {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <img
          src="/logo-trimmed.png"
          alt="Infinity Impact Agency"
          className="object-contain filter drop-shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-transform duration-300 hover:scale-105"
          style={{ height: size, width: 'auto' }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ height: size, width: size * 1.6 }}
      >
        {!imgError ? (
          <img
            src="/infinity-mark-transparent.png"
            alt="Infinity Impact Agency Mark"
            className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 100 58"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_12px_rgba(37,211,102,0.4)]"
          >
            <defs>
              <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="25%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="75%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <path
              d="M28 11C18 11 10 19 10 29C10 39 18 47 28 47C39 47 46 36 50 29C54 22 61 11 72 11C82 11 90 19 90 29C90 39 82 47 72 47C61 47 54 36 50 29C46 22 39 11 28 11Z"
              stroke="url(#infinityGradient)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {showAgencyText && (
        <div className="flex flex-col tracking-tight">
          <span className="font-extrabold text-sm sm:text-base leading-none text-white tracking-[0.2em] font-['Outfit']">
            INFINITY
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-slate-400 tracking-[0.3em] leading-tight mt-0.5">
            IMPACT AGENCY
          </span>
        </div>
      )}
    </div>
  );
};

export const InfinityHeroEmblem: React.FC = () => {
  return (
    <div className="relative w-full max-w-[430px] flex flex-col items-center justify-center p-3 sm:p-5 mx-auto group">
      {/* Background ambient multi-color dynamic glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-cyan-500/25 to-purple-600/20 rounded-3xl blur-3xl -z-10 animate-pulse" />
      <div className="absolute w-72 h-72 bg-blue-500/15 rounded-full blur-2xl -z-10" />

      {/* Modern Card Showcase for the Real Agency Logo */}
      <div className="relative w-full rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#0e1422]/90 via-[#0a0e17]/95 to-[#06080d] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.18)] backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_25px_60px_rgba(6,182,212,0.25)]">
        {/* Sleek corner ambient highlights */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Real Official Agency Logo with 3D iridescent ribbons and clean typography */}
        <div className="relative flex flex-col items-center justify-center py-2">
          <img
            src="/logo-trimmed.png"
            alt="Infinity Impact Agency Logo Oficial"
            className="w-full max-w-[320px] sm:max-w-[360px] h-auto object-contain filter drop-shadow-[0_12px_28px_rgba(6,182,212,0.3)] transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Quality status badge */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Identidad Oficial Verificada
          </span>
          <span className="tracking-[0.18em] uppercase text-[10px] text-slate-400 font-semibold">
            AGENCIA IA
          </span>
        </div>
      </div>
    </div>
  );
};

