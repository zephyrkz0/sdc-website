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

  // Detect if returning from Google OAuth redirect
  const [isOAuthReturn] = useState(() => {
    try {
      const isRedirecting = sessionStorage.getItem('sdc_oauth_redirecting') === 'true';
      const hasHashTokens = typeof window !== 'undefined' && (
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('refresh_token') ||
        window.location.search.includes('code=')
      );
      return isRedirecting || hasHashTokens;
    } catch {
      return false;
    }
  });

  const duration = isOAuthReturn
    ? 450
    : (typeof window !== 'undefined' && sessionStorage.getItem('sdc_has_booted') === 'true')
    ? 600
    : minDurationMs;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 98);
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsLoaded(true);
          try {
            sessionStorage.setItem('sdc_has_booted', 'true');
            if (isOAuthReturn) {
              sessionStorage.removeItem('sdc_oauth_redirecting');
              // Clean hash from URL for cleaner UX
              if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }
          } catch {}
        }, 150);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration, isOAuthReturn]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] bg-[#050508] flex flex-col justify-between p-6 sm:p-12 font-mono select-none overflow-hidden"
        >
          {/* Top Corner Markers */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-bold">SKILL DEVELOPMENT CLUB</span>
            </div>
            <div className="text-zinc-500">
              {isOAuthReturn ? 'SIGN-IN COMPLETE' : 'SDC PLATFORM'}
            </div>
          </div>

          {/* Centered Brand & Progress Box */}
          <div className="flex flex-col items-center justify-center space-y-6 text-center relative">
            {isOAuthReturn ? (
              /* Google OAuth Return Animation Crest */
              <div className="relative">
                <div className="w-16 h-16 bg-[#0c0c14] border border-zinc-700/80 flex items-center justify-center relative shadow-xl">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            ) : (
              /* Centered Rotating Star Icon Box */
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
            )}

            <div className="space-y-1">
              <h2 className="font-syne font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
                {isOAuthReturn ? 'WELCOME TO SDC' : 'SKILL DEVELOPMENT CLUB'}
              </h2>
              <p className="text-[10px] text-zinc-400 tracking-widest uppercase">
                {isOAuthReturn ? 'LOADING YOUR DASHBOARD' : 'INITIALIZING PLATFORM'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2 pt-2">
              <div className="w-full h-1 bg-zinc-800 overflow-hidden relative">
                <motion.div
                  className={`h-full ${isOAuthReturn ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-white'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{isOAuthReturn ? 'PLEASE WAIT' : 'LOADING ASSETS'}</span>
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
