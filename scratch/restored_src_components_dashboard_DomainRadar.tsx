import React from 'react';
import { GlobalClubStats, ScheduleSession } from '../../types';
import { motion } from 'framer-motion';
import { Globe, Cpu, BrainCircuit } from 'lucide-react';

interface DomainRadarProps {
  stats?: GlobalClubStats;
  sessions?: ScheduleSession[];
}

export const DomainRadar: React.FC<DomainRadarProps> = ({ sessions = [] }) => {
  // Calculate dynamic hours based on user's exact starting baselines:
  // Web Dev: 60+ hrs
  // DSA: 25+ hrs
  // AI & ML: 0 hrs
  const BASE_HOURS = {
    WEB_DEV: 60,
    DSA: 25,
    AI_ML: 0,
  };

  // Helper to compute session hours
  const calculateSessionHours = (session: ScheduleSession): number => {
    try {
      if (session.timeStart && session.timeEnd) {
        const [startH, startM] = session.timeStart.split(':').map(Number);
        const [endH, endM] = session.timeEnd.split(':').map(Number);
        if (!isNaN(startH) && !isNaN(endH)) {
          const diff = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
          if (diff > 0) return Math.round((diff / 60) * 10) / 10;
        }
      }
    } catch {}
    return 2; // Standard default 2-hour daily session (5:30 - 7:30 PM)
  };

  // Tally live hours from sessions added by admins
  let addedWebHours = 0;
  let addedDsaHours = 0;
  let addedAiHours = 0;

  sessions.forEach((s) => {
    const hrs = calculateSessionHours(s);
    const text = `${s.title} ${s.track} ${s.sessionType} ${s.description}`.toLowerCase();

    if (text.includes('dsa') || text.includes('algorithm') || text.includes('data structure') || text.includes('leetcode')) {
      addedDsaHours += hrs;
    } else if (text.includes('ai') || text.includes('machine learning') || text.includes('neural') || text.includes('ml') || text.includes('llm') || text.includes('model')) {
      addedAiHours += hrs;
    } else {
      // Defaults to Web Development / Core coding
      addedWebHours += hrs;
    }
  });

  const webTotal = BASE_HOURS.WEB_DEV + addedWebHours;
  const dsaTotal = BASE_HOURS.DSA + addedDsaHours;
  const aiTotal = BASE_HOURS.AI_ML + addedAiHours;
  const totalAll = webTotal + dsaTotal + aiTotal || 1;

  const tracks = [
    {
      id: 'WEB_DEV',
      title: 'Web Development',
      icon: Globe,
      description: 'Modern full-stack web engineering, React, TypeScript, scalable backends, REST/GraphQL APIs, and responsive UI systems.',
      skills: ['React & Next.js', 'Node & TypeScript', 'PostgreSQL & Supabase', 'Tailwind & Modern CSS'],
      hours: webTotal,
      displayHours: `${webTotal}+ hrs`,
      percentage: Math.round((webTotal / totalAll) * 100),
      accent: 'from-blue-400 to-indigo-500',
    },
    {
      id: 'DSA',
      title: 'Data Structures & Algorithms',
      icon: Cpu,
      description: 'Foundational problem solving, complexity analysis, data structures, dynamic programming, and competitive coding practice.',
      skills: ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Interview Readiness'],
      hours: dsaTotal,
      displayHours: `${dsaTotal}+ hrs`,
      percentage: Math.round((dsaTotal / totalAll) * 100),
      accent: 'from-purple-400 to-pink-500',
    },
    {
      id: 'AI_ML',
      title: 'AI & Machine Learning',
      icon: BrainCircuit,
      description: 'Machine learning fundamentals, deep learning, NLP, computer vision, and hands-on implementation of intelligent agents.',
      skills: ['Python & PyTorch', 'Machine Learning', 'Computer Vision & NLP', 'Model Deployment'],
      hours: aiTotal,
      displayHours: `${aiTotal} hrs`,
      percentage: Math.round((aiTotal / totalAll) * 100),
      accent: 'from-emerald-400 to-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tracks.map((track, idx) => {
        const Icon = track.icon;
        return (
          <div
            key={track.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-6 tech-corner-box space-y-4 flex flex-col justify-between transition-all group shadow-md"
          >
            <div className="space-y-3">
              {/* Header: Icon & Track Title */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-zinc-400 transition-colors">
                  Track Focus
                </span>
              </div>

              <h3 className="font-syne font-black text-xl text-white tracking-tight">
                {track.title}
              </h3>

              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                {track.description}
              </p>
            </div>

            {/* Progress & Logged Time */}
            <div className="space-y-1.5 font-mono text-[10px] pt-3 border-t border-zinc-900">
              <div className="flex justify-between text-zinc-400">
                <span>Logged Workshop Time</span>
                <span className="text-white font-bold">{track.displayHours}</span>
              </div>
                <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(track.percentage, track.hours > 0 ? 12 : 0)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                    className={`h-full bg-gradient-to-r ${track.accent}`}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DomainRadar;

                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                    className={`h-full bg-gradient-to-r ${track.accent}`}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DomainRadar;
