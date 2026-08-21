import React from 'react';
import { GlobalClubStats } from '../../types';
import { motion } from 'framer-motion';

interface DomainRadarProps {
  stats: GlobalClubStats;
}

export const DomainRadar: React.FC<DomainRadarProps> = ({ stats }) => {
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 relative overflow-hidden tech-corner-box">
      {/* Blueprint Header */}
      <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 pb-3 border-b border-zinc-800/80 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-zinc-200 font-bold">[SKILL_SPECTRUM]</span>
          <span>//</span>
          <span>HOURS_DISTRIBUTION</span>
        </div>
        <span className="px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300">
          TOTAL: {stats.totalHoursExecuted} HRS
        </span>
      </div>

      {/* Domain Breakdown Bars */}
      <div className="space-y-4">
        {stats.domainDistribution.map((item, idx) => (
          <div key={item.domain} className="space-y-1.5 font-mono">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-[10px]">0{idx + 1}.</span>
                <span className="font-bold text-zinc-200">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                <span>{item.hours} HRS</span>
                <span className="w-10 text-right font-bold text-white">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Visual Bar with Segmented Tick Pattern */}
            <div className="w-full h-3 bg-zinc-900 border border-zinc-800 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-zinc-400 via-zinc-200 to-white relative"
              >
                {/* Subtle dither pattern on bar */}
                <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px] opacity-30" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Technical Telemetry */}
      <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span>CURRICULUM_SYNC: 100% COMPLETE</span>
        </div>
        <span>ALGORITHM: WEIGHTED_PEER_REVIEW_V4</span>
      </div>
    </div>
  );
};
