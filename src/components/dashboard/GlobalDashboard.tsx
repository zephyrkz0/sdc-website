import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GlbModelViewer } from './GlbModelViewer';
import { NavTab } from '../common/Navbar';
import { DomainRadar } from './DomainRadar';
import { Users, Calendar } from 'lucide-react';
import { playCyberClick } from '../common/AudioEffects';

interface GlobalDashboardProps {
  stats?: any;
  logs?: any[];
  featuredEvent?: any;
  setActiveTab: (tab: NavTab) => void;
  onOpenRSVP?: () => void;
  onOpenScanner?: () => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  setActiveTab,
  onOpenRSVP,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // GIF pill: starts at 22% width / full pill-radius, grows to 100% / slightly rounded
  const gifWidth = useTransform(scrollYProgress, [0, 0.55], ['22%', '100%']);
  const gifHeight = useTransform(scrollYProgress, [0, 0.55], ['160px', '580px']);
  const gifRadius = useTransform(scrollYProgress, [0, 0.4], ['9999px', '16px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);

  return (
    <div className="relative min-h-screen text-white font-mono overflow-hidden">
      {/* Aurora Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute -top-[10%] -right-[10%] w-[55vw] h-[55vw] bg-purple-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[20%] w-[60vw] h-[60vw] bg-indigo-900/10 rounded-full blur-[160px]" />
      </div>

      {/* HERO: Title + scroll-growing GIF */}
      <section ref={heroRef} className="relative min-h-[200vh] flex flex-col items-center pt-24 pb-32 px-4 sm:px-6">
        {/* Brand title — fades as GIF expands */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-center space-y-3 select-none mb-10 z-10 relative"
        >
          <h1 className="font-openboek text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            SKILL DEVELOPMENT
          </h1>
          <h2 className="font-openboek text-3xl sm:text-5xl md:text-6xl font-bold tracking-widest text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            CLUB.
          </h2>
          <p className="font-mono text-xs text-zinc-400 tracking-[0.3em] uppercase mt-2">
            CUCEK · growth through skills
          </p>
        </motion.div>

        {/* Sticky scroll-expanding GIF container */}
        <div className="sticky top-24 w-full flex justify-center z-10">
          <motion.div
            style={{
              width: gifWidth,
              height: gifHeight,
              borderRadius: gifRadius,
            }}
            className="overflow-hidden bg-black border border-zinc-700 shadow-[0_0_60px_rgba(59,130,246,0.2)] relative"
          >
            <img
              src="/assets/desktop.gif"
              alt="SDC"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/ascii-magic-3.gif';
              }}
            />
            {/* CRT scanlines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
          </motion.div>
        </div>
      </section>

      {/* MAIN BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 relative z-20">
        {/* WHO ARE WE? AND WHAT DO WE DO? (Frame 6) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Mission & Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-syne font-black tracking-tight text-white uppercase">
                WHO ARE WE?
              </h2>
              <h3 className="text-2xl sm:text-4xl font-syne font-black tracking-tight text-purple-300 uppercase">
                AND WHAT DO WE DO?
              </h3>
              <div className="w-20 h-1 bg-purple-500 mt-2" />
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono">
              Skill Development Club (SDC) is an active student technical community at CUCEK focused on upskilling and mentoring students on various technical and soft skills. We provide students with an active community they can engage with along with daily sessions from 5:30 to 7:30 PM at CUCEK where any student can come and work on their skills regardless of the domain they are interested in, ask doubts, or seek guidance from experienced seniors. Along with all this, we also conduct talk sessions and hackathons. Our aim is to upskill students to prepare them for real-world jobs and environments.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
              <button
                onClick={() => {
                  playCyberClick();
                  setActiveTab('roster');
                }}
                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                <Users size={14} />
                <span>VIEW MEMBER DIRECTORY</span>
              </button>

              <button
                onClick={() => {
                  playCyberClick();
                  setActiveTab('schedule');
                }}
                className="px-6 py-3 bg-[#0d0d14] text-white border border-zinc-700 hover:border-white font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Calendar size={14} />
                <span>SESSION SCHEDULE</span>
              </button>
            </div>
          </div>

          {/* Right: Centered Interactive 3D Model Box (Frame 6) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] aspect-square bg-[#0c0c12]/90 border border-zinc-800 relative overflow-hidden shadow-2xl">
              <GlbModelViewer modelUrl="/assets/3d.glb" className="w-full h-full" />

              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-zinc-500 bg-black/60 px-2 py-1 border border-zinc-800 pointer-events-none">
                DRAG TO ROTATE 3D MESH
              </div>
            </div>
          </div>
        </section>

        {/* CORE FOCUS DOMAINS (Frame 7) */}
        <section>
          <DomainRadar />
        </section>

        {/* EVENTS & WORKSHOPS BANNER (Frame 8) */}
        <section className="bg-[#0c0c14] border border-zinc-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              EVENTS & WORKSHOPS
            </span>
            <h3 className="font-syne font-black text-xl sm:text-2xl text-white tracking-tight">
              SCHEDULE READY • EXPLORE SESSIONS & WORKSHOPS
            </h3>
            <p className="text-xs text-zinc-400 font-mono max-w-xl leading-relaxed">
              Explore the schedule timetable for upcoming daily 5:30 - 7:30 PM lab sessions, workshops, and hackathons.
            </p>
          </div>

          <button
            onClick={() => {
              playCyberClick();
              setActiveTab('schedule');
            }}
            className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
          >
            <Calendar size={14} />
            <span>VIEW SCHEDULE TIMETABLE</span>
          </button>
        </section>
      </main>
    </div>
  );
};
export default GlobalDashboard;
