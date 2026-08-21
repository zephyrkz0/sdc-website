import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCounterProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  figNum?: string;
  detail: string;
  changeRate?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  label,
  value,
  suffix = '',
  prefix = '',
  detail,
  changeRate,
}) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
      className="relative p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all duration-300 group overflow-hidden tech-corner-box"
    >
      {/* Top Bar with Rate */}
      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 mb-3 select-none">
        <span className="font-mono text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
          {label}
        </span>
        {changeRate && (
          <span className="px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[9px]">
            {changeRate}
          </span>
        )}
      </div>

      {/* Main Counter Number */}
      <div className="flex items-baseline gap-1 my-2">
        <span className="font-syne font-black text-4xl sm:text-5xl text-white tracking-tight group-hover:text-zinc-100 transition-colors">
          {prefix}
          {displayVal.toLocaleString()}
          {suffix}
        </span>
      </div>

      {/* Detail description */}
      <p className="font-mono text-[11px] text-zinc-400 leading-snug pt-1 border-t border-zinc-900 mt-3">
        {detail}
      </p>

      {/* Hover Chrome Sheen */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};
