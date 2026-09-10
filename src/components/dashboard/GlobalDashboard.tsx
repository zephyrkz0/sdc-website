import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
}) => {
  // Pinned scroll container — 350vh gives ample scroll room for smooth zoom + held fullscreen
  const pinRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.0005,
  });

  // Title: prominently centered at rest (0), fades out smoothly as zoom starts
  const titleOpacity = useTransform(smoothProgress, [0.03, 0.22], [1, 0]);
  const titleY = useTransform(smoothProgress, [0.03, 0.22], [0, -50]);
  const titleScale = useTransform(smoothProgress, [0.03, 0.22], [1, 0.9]);

  // Cinematic Expanding Iris / Clip-Path:
  // Starts at 50% inset (0x0 size), smoothly opens to 0% inset (100vw x 100vh) by 0.55,
  // and stays 100% full screen through 0.85
  const insetY = useTransform(smoothProgress, [0.04, 0.55], [50, 0]);
  const insetX = useTransform(smoothProgress, [0.04, 0.55], [50, 0]);
  const radius = useTransform(smoothProgress, [0.04, 0.45], [40, 0]);
  const clipPath = useTransform(
    [insetY, insetX, radius],
    ([y, x, r]) => `inset(${y}% ${x}% round ${r}px)`
  );

  const gifOpacity = useTransform(smoothProgress, [0.02, 0.06], [0, 1]);
  const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  return (
    <div className="relative text-white font-mono">
      {/*
        PINNED SCROLL SECTION — 350vh tall.
        The inner `sticky` container stays locked to the viewport top
        while the user scrolls through the 350vh. The GIF zooms from 0 size
        to full viewport, holds fullscreen for an extended scroll, and
        only then releases to normal content & navbar.
      */}
      <div ref={pinRef} style={{ height: '350vh' }} className="relative">
        {/* Sticky viewport-locked canvas */}
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">

          {/* Brand title — centered in viewport at rest */}
          <motion.div
            style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
            className="absolute z-20 text-center select-none px-4 pointer-events-none"
          >
            <h1 className="font-openboek text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
              SKILL DEVELOPMENT CLUB
            </h1>
          </motion.div>

          {/* Growing GIF Viewport — GPU-accelerated Clip-Path expands from 0 to 100% */}
          <motion.div
            style={{
              opacity: gifOpacity,
              clipPath,
            }}
            className="absolute inset-0 w-full h-full bg-black flex items-center justify-center pointer-events-none"
          >
            <picture className="w-full h-full block">
              <source media="(max-width: 768px)" srcSet="/assets/ascii_landing_mobile.gif" />
              <source media="(min-width: 769px)" srcSet="/assets/ascii_landing_desktop.gif" />
              <img
                src="/assets/ascii_landing_desktop.gif"
                alt="SDC Landing Visual"
                className="w-full h-full object-cover select-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/ascii_landing.gif';
                }}
              />
            </picture>
          </motion.div>

          {/* Floating Scroll Down Prompt */}
          <motion.div
            style={{ opacity: scrollIndicatorOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold">SCROLL TO EXPLORE</span>
            <div className="w-4 h-7 border border-zinc-600 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-1.5 bg-white rounded-full animate-bounce" />
            </div>
          </motion.div>

        </div>
      </div>
      {/* END PINNED SECTION — content flows normally below */}

      {/* MAIN BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 relative z-20">

        {/* WHO ARE WE? AND WHAT DO WE DO? */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Mission & Details */}
          <div className="lg:col-span-12 space-y-6">
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
              Skill Development Club (SDC) is an active student technical community at CUCEK focused on upskilling
              and mentoring students on various technical and soft skills. We provide students with an active community
              they can engage with along with daily sessions from 5:30 to 7:30 PM at CUCEK where any student can come
              and work on their skills regardless of the domain they are interested in, ask doubts, or seek guidance
              from experienced seniors. Along with all this, we also conduct talk sessions and hackathons. Our aim is
              to upskill students to prepare them for real-world jobs and environments.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
              <button
                onClick={() => { playCyberClick(); setActiveTab('roster'); }}
                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                <Users size={14} />
                <span>VIEW MEMBER DIRECTORY</span>
              </button>

              <button
                onClick={() => { playCyberClick(); setActiveTab('schedule'); }}
                className="px-6 py-3 bg-[#0d0d14] text-white border border-zinc-700 hover:border-white font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Calendar size={14} />
                <span>SESSION SCHEDULE</span>
              </button>
            </div>
          </div>
        </section>

        {/* CORE FOCUS DOMAINS */}
        <section>
          <DomainRadar />
        </section>

        {/* EVENTS & WORKSHOPS BANNER */}
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
            onClick={() => { playCyberClick(); setActiveTab('schedule'); }}
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
