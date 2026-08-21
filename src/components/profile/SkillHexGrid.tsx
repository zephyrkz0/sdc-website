import React from 'react';
import { motion } from 'framer-motion';

interface SkillHexGridProps {
  skills: string[];
}

export const SkillHexGrid: React.FC<SkillHexGridProps> = ({ skills }) => {
  const skillLevels: { name: string; level: number; cat: string }[] = [
    { name: 'TypeScript / React', level: 95, cat: 'FRONTEND' },
    { name: 'Three.js / WebGL', level: 90, cat: 'CREATIVE_3D' },
    { name: 'GLSL Shaders', level: 85, cat: 'GRAPHICS' },
    { name: 'Figma / Acubi UI', level: 92, cat: 'DESIGN' },
    { name: 'Rust / WASM', level: 78, cat: 'SYSTEMS' },
    { name: 'PyTorch / Neural Agents', level: 75, cat: 'AI_ML' },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 tech-corner-box">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-mono text-[10px] text-zinc-400 mb-5">
        <span className="font-bold text-white">[SKILL_MASTERY_HEX_MATRIX]</span>
        <span>VERIFIED_BY_SDC</span>
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

            <div className="w-full h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${sk.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.08 }}
                className="h-full bg-gradient-to-r from-zinc-500 via-purple-400 to-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
