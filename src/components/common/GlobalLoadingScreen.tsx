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

  const [isOAuthReturn] = useState(() => {
    try {
      const isRedirecting = sessionStorage.getItem('sdc_oauth_redirecting') === 'true';
      const hasHashTokens =
        typeof window !== 'undefined' &&
        (window.location.hash.includes('access_token') ||
          window.location.hash.includes('refresh_token') ||
          window.location.search.includes('code='));
      return isRedirecting || hasHashTokens;
    } catch {
      return false;
    }
  });

  const hasBooted = (() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem('sdc_has_booted') === 'true';
    } catch {
      return false;
    }
  })();

  const duration = isOAuthReturn ? 450 : hasBooted ? 600 : minDurationMs;

  useEffect(() => {
    const startTime = performance.now();
    let frameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawRatio = Math.min(elapsed / duration, 1);
      const easedRatio = 1 - Math.pow(1 - rawRatio, 3);
      const currentProgress = Math.min(Math.floor(easedRatio * 100), 100);

      setProgress(currentProgress);

      if (rawRatio < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        timeoutId = setTimeout(() => {
          setIsLoaded(true);
          try {
            sessionStorage.setItem('sdc_has_booted', 'true');
            if (isOAuthReturn) {
              sessionStorage.removeItem('sdc_oauth_redirecting');
              if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }
          } catch { }
        }, 140);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [duration, isOAuthReturn]);

  const formattedProgress = String(progress).padStart(2, '0');

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          key="sdc-aperture-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1, transition: { duration: 0.75 } }}
          className="fixed inset-0 z-[999] flex flex-col justify-between overflow-hidden select-none pointer-events-auto"
        >
          <motion.div
            initial={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            className="relative w-full h-1/2 bg-[#08080a] flex flex-col justify-end px-6 sm:px-12 pb-5"
          >
            <div className="w-full max-w-xl mx-auto flex items-end justify-start gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-white text-xs">✦</span>
                <span className="font-syne font-bold text-xs sm:text-sm tracking-[0.28em] text-white uppercase">
                  {isOAuthReturn ? 'WELCOME BACK' : 'SKILL DEVELOPMENT CLUB'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed left-0 right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center px-6 sm:px-12 pointer-events-none"
          >
            <div className="w-full max-w-xl h-[1px] bg-zinc-900 relative overflow-hidden flex items-center justify-center">
              <div
                className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            className="relative w-full h-1/2 bg-[#08080a] flex flex-col justify-start px-6 sm:px-12 pt-5"
          >
            <div className="w-full max-w-xl mx-auto flex items-start justify-end font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="text-zinc-200 font-bold tabular-nums">
                {formattedProgress}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingScreen;
