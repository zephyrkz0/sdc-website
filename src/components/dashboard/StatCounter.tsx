import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCounterProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  figNum: string;
  detail: string;
  changeRate?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  label,
  value,
  suffix = '',
  prefix = '',
  figNum,
  detail,
  changeRate,
}) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const easeVal = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeVal * value);
      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setDisplayVal(value);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-5 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all duration-300 group overflow-hidden tech-corner-box"
    >
      {/* Top Spec Bar with Screw/Bolt Marker */}
      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 mb-3 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 border border-zinc-600 rounded-full flex items-center justify-center text-[6px]">
            +
          </span>
          <span>FIG_{figNum}</span>
        </div>
        {changeRate && (
          <span className="px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[9px]">
            {changeRate}
          </span>
        )}
      </div>

      {/* Main Counter Number with Syne typography */}
      <div className="flex items-baseline gap-1 my-1">
        <span className="font-syne font-black text-4xl sm:text-5xl text-white tracking-tight group-hover:text-zinc-100 transition-colors">
          {prefix}
          {displayVal.toLocaleString()}
          {suffix}
        </span>
      </div>

      {/* Label and Assembly Detail */}
      <div className="mt-3 space-y-1">
        <h4 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider">
          {label}
        </h4>
        <p className="font-mono text-[10px] text-zinc-500 leading-snug">
          {detail}
        </p>
      </div>

      {/* Subtle bottom decorative barcode */}
      <div className="mt-4 pt-2 border-t border-zinc-900 flex items-center justify-between text-[8px] font-mono text-zinc-600">
        <span>PARAM_OK</span>
        <div className="w-12 h-1.5 barcode-strip opacity-20 group-hover:opacity-60 transition-opacity" />
      </div>

      {/* Hover Chrome Sheen */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};
