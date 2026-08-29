import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Cpu, BrainCircuit } from 'lucide-react';
import { ScheduleSession } from '../../types';

interface DomainRadarProps {
  stats?: any;
  sessions?: ScheduleSession[];
}

export const DomainRadar: React.FC<DomainRadarProps> = ({ sessions = [] }) => {
  const tracks = [
    {
      id: 'WEB_DEV',
      title: 'Web Development',
      icon: Globe,
      description:
        'Full stack web devlopment first we learn basic three(html,css,js) along with react and after we move to backend',
      hours: 60,
      displayHours: '60+ hrs',
      percentage: 65,
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'DSA',
      title: 'Data Structures & Algorithms',
      icon: Cpu,
      description:
        'Problem solving basics , how to approach a problem and problem solving sessions on codeforces,leetcode and neetcode',
      hours: 25,
      displayHours: '25+ hrs',
      percentage: 35,
      accent: 'from-purple-500 to-pink-500',
    },
    {
      id: 'AI_ML',
      title: 'AI & Machine Learning',
      icon: BrainCircuit,
      description:
        'Machine learning fundamentals, deep learning, natural language processing, computer vision, and implementation of intelligent systems',
      hours: 0,
      displayHours: '0 hrs',
      percentage: 0,
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-syne font-black text-white tracking-tight uppercase">
          CORE FOCUS DOMAINS
        </h2>
        <p className="text-xs text-zinc-400 max-w-4xl leading-relaxed">
          Upskilling students and fostering passion for technology in general , the three domains below are the core ones we focus on but no matter what your intrest is even if it isnt in the three you can come and use the space to work on your intrests
        </p>
      </div>

      {/* 3 Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((track, idx) => {
          const Icon = track.icon;
          return (
            <div
              key={track.id}
              className="bg-[#0b0b10] border border-zinc-800 hover:border-zinc-600 p-6 space-y-4 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-zinc-400 transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 py-0.5 border border-zinc-800 bg-zinc-900/60">
                    TRACK FOCUS
                  </span>
                </div>

                <h3 className="font-syne font-bold text-xl text-white tracking-tight">
                  {track.title}
                </h3>

                <p className="font-mono text-xs text-zinc-400 leading-relaxed min-h-[48px]">
                  {track.description}
                </p>
              </div>

              {/* Progress Bar & Logged Time */}
              <div className="space-y-2 font-mono text-[10px] pt-4 border-t border-zinc-900">
                <div className="flex justify-between text-zinc-400">
                  <span>Logged Workshop Time</span>
                  <span className="text-white font-bold">{track.displayHours}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 overflow-hidden border border-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(track.percentage, track.hours > 0 ? 10 : 0)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                    className={`h-full bg-gradient-to-r ${track.accent}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DomainRadar;
