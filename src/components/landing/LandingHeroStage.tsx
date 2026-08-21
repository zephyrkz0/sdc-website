import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowDown, Shield, Terminal, Zap, Flame } from 'lucide-react';
import { ChromeBadge } from '../common/ChromeBadge';
import { playCyberClick } from '../common/AudioEffects';

interface LandingHeroStageProps {
  onEnter?: () => void;
}

export const LandingHeroStage: React.FC<LandingHeroStageProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Dissolve and scale down the GIF as the user scrolls
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const blurValue = useTransform(scrollYProgress, [0, 0.8, 1], ['blur(0px)', 'blur(4px)', 'blur(10px)']);

  const handleScrollDown = () => {
    playCyberClick();
    if (onEnter) {
      onEnter();
    } else {
      const modelSection = document.getElementById('sdc-model-section');
      if (modelSection) {
        modelSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 py-8 mb-12 overflow-hidden select-none"
    >
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Box */}
      <motion.div
        style={{ scale, y, filter: blurValue }}
        className="w-full max-w-4xl relative z-10 space-y-6"
      >
        {/* Top Acubi Status Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px]">
          <ChromeBadge label="INIT_SEQUENCE_2026" variant="silver" size="sm" />
          <ChromeBadge label="PIXEL_ASCII_PORTAL" variant="dark" size="sm" />
          <span className="px-2 py-0.5 border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            INITIAL_LANDING // ACTIVE
          </span>
        </div>

        {/* Main Headline */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-syne tracking-tighter text-white uppercase leading-[0.95]">
            SKILL DEVELOPMENT <br />
            <span className="chrome-text-silver">CLUB // MATRIX</span>
          </h1>
          <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto pt-2">
            Avant-garde digital hub for aggregate skill tracking, high-velocity workshops, and verified personnel dossiers.
          </p>
        </div>

        {/* FEATURED PIXELATED ASCII GIF FRAME */}
        <div className="relative mx-auto max-w-2xl bg-zinc-950 border-2 border-zinc-500 p-2 sm:p-3 tech-corner-box shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden group">
          {/* Top Bar Spec */}
          <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400 pb-2 px-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-white font-bold">ASCII_MAGIC_CORE.GIF</span>
            </div>
            <span>[120 FPS // 4-BIT DITHER]</span>
          </div>

          {/* The Pixelated GIF Image */}
          <div className="relative w-full h-64 sm:h-96 bg-black overflow-hidden flex items-center justify-center">
            <img
              src="/assets/ascii_landing.gif"
              alt="SDC Pixelated Landing Art"
              className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
            />

            {/* CRT Scanline & noise overlay */}
            <div className="absolute inset-0 bg-scanline opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* In-image Holographic Stamp */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/80 bg-black/70 px-2 py-1 border border-white/20 backdrop-blur-sm pointer-events-none">
              ✦ SDC_TERMINAL // DISSOLVE_ON_SCROLL
            </div>
          </div>

          {/* Bottom Bar: Barcode & Technical Coordinate */}
          <div className="flex items-center justify-between pt-2 px-2 text-[9px] font-mono text-zinc-500">
            <div className="w-24 h-2.5 barcode-strip opacity-60" />
            <span>SCROLL_TRIGGER: DISSOLVE_TO_3D_MODEL</span>
          </div>
        </div>

        {/* Scroll CTA Indicator */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <button
            onClick={handleScrollDown}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.3)] cursor-pointer"
          >
            <span>SCROLL TO ENTER 3D MATRIX</span>
            <ArrowDown size={14} className="animate-bounce" />
          </button>

          <span className="font-mono text-[9px] text-zinc-500 tracking-wider">
            [↓ SCROLL DOWN TO REVEAL 3D MODEL & PLATFORM ↓]
          </span>
        </div>
      </motion.div>
    </motion.section>
  );
};
