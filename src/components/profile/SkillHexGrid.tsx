import React from 'react';
import { motion } from 'framer-motion';

interface SkillHexGridProps {
  skills: string[];
}

export const SkillHexGrid: React.FC<SkillHexGridProps> = ({ skills }) => {
  const skillLevels: { name: string; level: number; cat: string }[] = [
    { name: 'TypeScript / React', level: 95, cat: 'FRONTEND' },
    { name: 'Node.js / Express', level: 90, cat: 'BACKEND' },
    { name: 'Python / Machine Learning', level: 85, cat: 'AI_ML' },
    { name: 'Figma / UI Design', level: 92, cat: 'DESIGN' },
    { name: 'Database & SQL / Supabase', level: 80, cat: 'DATABASE' },
    { name: 'Competitive Programming / DSA', level: 75, cat: 'DSA' },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-mono text-[10px] text-zinc-400 mb-5">
        <span className="font-bold text-white uppercase tracking-wider">SKILLS & PROFICIENCY</span>
        <span>VERIFIED BY SDC</span>
      </div>

      <div className="space-y-4 font-mono">
        {skillLevels.map((sk, idx) => (
          <div key={sk.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-bold">{sk.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-purple-400">{sk.cat}</span>
                <span className="text-white font-bold">{sk.level}%</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${sk.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.08 }}
                className="h-full bg-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
