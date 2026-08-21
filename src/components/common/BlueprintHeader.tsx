import React from 'react';

interface BlueprintHeaderProps {
  stepNumber?: string;
  tag?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const BlueprintHeader: React.FC<BlueprintHeaderProps> = ({
  stepNumber = '01',
  tag = 'SPEC_SYS.V2',
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  return (
    <div className={`relative mb-8 ${className}`}>
      {/* Top Assembly Annotation Line */}
      <div className={`flex items-center gap-3 font-mono text-[10px] text-zinc-400 tracking-wider mb-2 select-none uppercase ${
        align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
      }`}>
        <span className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 font-bold">
          FIG. {stepNumber}
        </span>
        <span className="text-zinc-500">//</span>
        <span>{tag}</span>
        <span className="text-zinc-500">//</span>
        <span className="hidden sm:inline text-zinc-600">ASSEMBLY_STEP_{stepNumber}</span>
      </div>

      {/* Main Title with Gothic/Syne Typography */}
      <div className={`flex items-baseline gap-3 flex-wrap ${
        align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      }`}>
        <h2 className="text-3xl md:text-5xl font-black font-syne tracking-tight text-white uppercase">
          {title}
        </h2>
      </div>

      {/* Subtitle / Technical Description */}
      {subtitle && (
        <p className={`mt-2 font-mono text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed ${
          align === 'center' ? 'mx-auto text-center' : ''
        }`}>
          {subtitle}
        </p>
      )}

      {/* Bottom Technical Crosshair Ruler */}
      <div className="mt-4 flex items-center gap-2 text-zinc-700 select-none">
        <span className="font-mono text-xs text-zinc-500">[+]</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-700 via-zinc-800 to-transparent" />
        <div className="w-16 h-2 barcode-strip opacity-30" />
        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
          SDC_INDEX_{stepNumber}
        </span>
        <span className="font-mono text-xs text-zinc-500">[+]</span>
      </div>
    </div>
  );
};
