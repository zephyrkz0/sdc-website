import React from 'react';

interface BlueprintHeaderProps {
  stepNumber?: string;
  section?: string;
  tag?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const BlueprintHeader: React.FC<BlueprintHeaderProps> = ({
  stepNumber,
  section,
  tag,
  title,
  subtitle,
  action,
  align = 'left',
  className = '',
}) => {
  const displayStep = section || stepNumber || '01';
  return (
    <div className={`relative mb-8 ${className}`}>
      {/* Step Indicator */}
      <div className={`flex items-center justify-between font-mono text-[10px] text-zinc-400 tracking-wider mb-2 select-none uppercase`}>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300 font-bold">
            {displayStep}
          </span>
          {tag && (
            <>
              <span className="text-zinc-600">//</span>
              <span className="text-zinc-400">{tag}</span>
            </>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Main Title */}
      <div className={`flex items-baseline gap-3 flex-wrap ${
        align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      }`}>
        <h2 className="text-3xl md:text-5xl font-black font-syne tracking-tight text-white uppercase">
          {title}
        </h2>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className={`mt-2 font-mono text-xs md:text-sm text-zinc-400 max-w-2xl leading-relaxed ${
          align === 'center' ? 'mx-auto text-center' : ''
        }`}>
          {subtitle}
        </p>
      )}

      {/* Clean Divider Line */}
      <div className="mt-4 flex items-center gap-2 text-zinc-700 select-none">
        <span className="font-mono text-xs text-zinc-600">+</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 via-zinc-800 to-transparent" />
      </div>
    </div>
  );
};
