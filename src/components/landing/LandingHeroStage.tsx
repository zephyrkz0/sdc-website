import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

  // Dissolve and translate smoothly as user scrolls down
  const opacity = useTransform(scrollYProgress, [0, 0.6, 0.95], [1, 0.4, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const blurValue = useTransform(scrollYProgress, [0, 0.7, 1], ['blur(0px)', 'blur(2px)', 'blur(10px)']);

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
      className="relative w-full h-[calc(100vh-4rem)] min-h-[550px] flex items-center justify-center overflow-hidden select-none"
    >
      {/* PURE UNINTERRUPTED FULLSCREEN PIXELATED GIF */}
      <motion.div
        style={{ scale, y, filter: blurValue }}
        className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center bg-black"
      >
        <img
          src="/assets/ascii_landing.gif"
          alt="SDC Pixelated Visual"
          className="w-full h-full object-cover object-center pointer-events-none"
        />
      </motion.div>

      {/* Sleek Minimal Floating Scroll Indicator at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <button
          onClick={handleScrollDown}
          className="group flex flex-col items-center gap-1 font-mono text-[10px] tracking-widest text-white/80 hover:text-white transition-all cursor-pointer bg-black/60 px-4 py-1.5 border border-white/20 hover:border-white backdrop-blur-md"
        >
          <span className="uppercase font-bold tracking-widest">SCROLL DOWN</span>
          <ChevronDown size={14} className="animate-bounce text-white group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </motion.section>
  );
};
