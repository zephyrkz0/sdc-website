import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Sparkles, Shield, Terminal, Zap, Eye } from 'lucide-react';
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

  // Dissolve and scale smoothly as user scrolls down
  const opacity = useTransform(scrollYProgress, [0, 0.6, 0.95], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const blurValue = useTransform(scrollYProgress, [0, 0.7, 1], ['blur(0px)', 'blur(3px)', 'blur(12px)']);

  const handleScrollDown = () => {
    playCyberClick();
    if (onEnter) {
      onEnter();
    } else {
      const modelSection = document.getElementById('sdc-model-section');
      if (modelSection) {
        modelSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className="relative w-full h-[calc(100vh-4.5rem)] min-h-[640px] flex flex-col justify-between items-center text-center px-4 sm:px-8 py-6 mb-16 overflow-hidden select-none"
    >
      {/* Full-Screen Pixelated GIF Background Layer */}
      <motion.div
        style={{ scale, y, filter: blurValue }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src="/assets/ascii_landing.gif"
          alt="SDC Pixelated Fullscreen Visual"
          className="w-full h-full object-cover grayscale contrast-125 object-center"
        />

        {/* Acubi CRT Scanlines & Dark Obsidian Vignette */}
        <div className="absolute inset-0 bg-scanline opacity-45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-black/40 to-[#08080a]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,8,10,0.85)_100%)] pointer-events-none" />
      </motion.div>

      {/* Top Technical Metadata Bar */}
      <div className="relative z-10 w-full max-w-6xl flex items-center justify-between font-mono text-[10px] text-zinc-400 border-b border-white/20 pb-3 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white tracking-widest">[SYSTEM_ENTRY // 2026]</span>
          <span className="text-zinc-500 hidden sm:inline">//</span>
          <span className="text-zinc-300 hidden sm:inline">SKILL DEVELOPMENT CLUB</span>
        </div>

        <div className="flex items-center gap-2">
          <ChromeBadge label="PIXEL_ASCII_MATRIX" variant="silver" size="sm" />
          <span className="text-zinc-400 font-mono text-[9px] hidden sm:inline">
            RES: FULLSCREEN_HD
          </span>
        </div>
      </div>

      {/* Center Cinematic Editorial Headline */}
      <motion.div
        style={{ scale, filter: blurValue }}
        className="relative z-10 max-w-5xl mx-auto space-y-4 my-auto px-4"
      >
        <div className="flex justify-center mb-2">
          <span className="px-3 py-1 bg-black/70 border border-white/30 text-zinc-300 font-mono text-xs tracking-widest uppercase backdrop-blur-md">
            ✦ AUTONOMOUS OPERATIONAL PORTAL ✦
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-syne tracking-tighter text-white uppercase leading-[0.9] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
          SKILL DEV <br />
          <span className="chrome-text-silver">CLUB</span>
        </h1>

        <p className="font-mono text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md bg-black/40 p-2 border border-white/10 backdrop-blur-xs">
          High-velocity peer engineering, verified operative dossiers, 3D shader laboratories, and cryptographic event passes.
        </p>
      </motion.div>

      {/* Bottom Scroll Prompt Bar */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/20 font-mono text-[10px] text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-24 h-3 barcode-strip opacity-70" />
          <span>SDC-INITIAL-ENTRY-PASS // STAGE_0</span>
        </div>

        {/* Scroll CTA Trigger */}
        <button
          onClick={handleScrollDown}
          className="flex items-center gap-2.5 px-6 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-white hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-pointer"
        >
          <span>SCROLL DOWN TO UNVEIL 3D MATRIX</span>
          <ArrowDown size={14} className="animate-bounce" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
          <Eye size={12} className="text-purple-400" />
          <span>SCROLL TO DISSOLVE</span>
        </div>
      </div>

      {/* Decorative Technical Corner Crosshairs */}
      <div className="absolute top-2 left-2 font-mono text-xs text-white/50 pointer-events-none select-none">
        [+]
      </div>
      <div className="absolute top-2 right-2 font-mono text-xs text-white/50 pointer-events-none select-none">
        [+]
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-xs text-white/50 pointer-events-none select-none">
        [+]
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-xs text-white/50 pointer-events-none select-none">
        [+]
      </div>
    </motion.section>
  );
};
