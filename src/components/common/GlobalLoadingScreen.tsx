import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingScreenProps {
  minDurationMs?: number;
}

export const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  minDurationMs = 1400,
}) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / minDurationMs) * 100), 98);
      setProgress(currentProgress);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsLoaded(true);
        }, 200);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDurationMs]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] bg-[#050508] flex flex-col justify-between p-6 sm:p-12 font-mono select-none overflow-hidden"
        >
          {/* Top Corner Markers */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 tracking-wider">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300 font-bold">SKILL DEVELOPMENT CLUB</span>
            </div>
            <div className="text-zinc-500">SDC PLATFORM</div>
          </div>

          {/* Centered Brand & Progress Box */}
          <div className="flex flex-col items-center justify-center space-y-6 text-center relative">
            {/* Centered Rotating Star Icon Box */}
            <div className="w-16 h-16 bg-[#0c0c14] border border-zinc-700/80 flex items-center justify-center relative shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </motion.div>
            </div>

            <div className="space-y-1">
              <h2 className="font-syne font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
                SKILL DEVELOPMENT CLUB
              </h2>
              <p className="text-[10px] text-zinc-400 tracking-widest uppercase">
                INITIALIZING PLATFORM
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2 pt-2">
              <div className="w-full h-1 bg-zinc-800 overflow-hidden relative">
                <motion.div
                  className="h-full bg-white"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>LOADING ASSETS</span>
                <span className="text-zinc-300 font-bold">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between text-[10px] text-zinc-600">
            <span className="tracking-widest">SDC CUCEK • 2026</span>
            <span>COMMUNITY PLATFORM</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default GlobalLoadingScreen;
