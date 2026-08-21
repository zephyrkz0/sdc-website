import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';

interface GlobalLoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  onComplete,
  minDurationMs = 1200,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('CONNECTING TO NODE...');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let gifLoaded = false;
    let modelLoaded = false;
    let gifProgress = 0;
    let modelProgress = 0;

    const startTime = performance.now();

    const updateAggregatedProgress = () => {
      const combined = Math.min(Math.round((gifProgress * 0.4) + (modelProgress * 0.6)), 98);
      setProgress(combined);
    };

    // 1. Preload GIF Asset
    const img = new Image();
    img.src = '/assets/ascii_landing.gif';
    img.onload = () => {
      gifLoaded = true;
      gifProgress = 100;
      updateAggregatedProgress();
      setStatusText('ASCII VISUALS SYNCHRONIZED');
    };
    img.onerror = () => {
      gifLoaded = true;
      gifProgress = 100;
      updateAggregatedProgress();
    };

    // 2. Preload 3D Model with GLTFLoader and MeshoptDecoder
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      '/assets/model.glb',
      () => {
        modelLoaded = true;
        modelProgress = 100;
        setStatusText('3D MESH GEOMETRY COMPILED');
        checkDone();
      },
      (xhr) => {
        if (xhr.total > 0) {
          const p = (xhr.loaded / xhr.total) * 100;
          modelProgress = p;
          setStatusText(`DECODING MESH [${Math.round(p)}%]`);
          updateAggregatedProgress();
        }
      },
      (err) => {
        console.warn('Preloader model error:', err);
        modelLoaded = true;
        modelProgress = 100;
        checkDone();
      }
    );

    const checkDone = () => {
      const elapsed = performance.now() - startTime;
      const remainingTime = Math.max(minDurationMs - elapsed, 0);

      setTimeout(() => {
        setProgress(100);
        setStatusText('ALL SYSTEMS NOMINAL');
        setTimeout(() => {
          setIsFinished(true);
          if (onComplete) {
            onComplete();
          }
        }, 350);
      }, remainingTime);
    };

    // Safety fallback timer so user is never stuck
    const safetyTimer = setTimeout(() => {
      if (!isFinished) {
        setProgress(100);
        setStatusText('READY');
        setTimeout(() => {
          setIsFinished(true);
          if (onComplete) onComplete();
        }, 200);
      }
    }, 4500);

    return () => clearTimeout(safetyTimer);
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] bg-[#08080a] flex flex-col justify-between items-center p-6 sm:p-10 select-none overflow-hidden"
        >
          {/* Subtle Blueprint Grid & Ambient Glow */}
          <div className="absolute inset-0 bg-blueprint-grid opacity-25 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Technical Header */}
          <div className="w-full max-w-5xl flex items-center justify-between font-mono text-[10px] text-zinc-500 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-zinc-300 font-bold tracking-widest">SDC_PRELOADER</span>
            </div>
            <div className="text-zinc-400">
              BUILD 2026 // ACUBI
            </div>
          </div>

          {/* Center Brand & Progress Matrix */}
          <div className="w-full max-w-md space-y-6 text-center relative z-10">
            {/* Center Spinning Chrome Icon */}
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-700 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="font-syne font-black text-2xl text-white animate-spin [animation-duration:8s]">
                  ✦
                </span>
                <div className="absolute -top-1 -left-1 text-[8px] font-mono text-zinc-600">+</div>
                <div className="absolute -bottom-1 -right-1 text-[8px] font-mono text-zinc-600">+</div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-1">
              <h2 className="font-syne font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                SKILL DEVELOPMENT CLUB
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                INITIALIZING ASSET ARCHIVE
              </p>
            </div>

            {/* Brutalist Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-2 bg-zinc-950 border border-zinc-800 p-0.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-zinc-300 via-white to-purple-300 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Progress and Live Status Info */}
              <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500">
                <span className="text-zinc-400 uppercase">{statusText}</span>
                <span className="text-white font-bold tracking-wider">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Barcode & Coordinates */}
          <div className="w-full max-w-5xl flex items-center justify-between font-mono text-[10px] text-zinc-600 relative z-10">
            <div className="w-20 h-2 barcode-strip opacity-30" />
            <div className="text-[9px]">
              OPERATIVE PLATFORM // READY
            </div>
          </div>

          {/* Corner Crosshairs */}
          <div className="absolute top-4 left-4 font-mono text-xs text-zinc-600 pointer-events-none select-none">+</div>
          <div className="absolute top-4 right-4 font-mono text-xs text-zinc-600 pointer-events-none select-none">+</div>
          <div className="absolute bottom-4 left-4 font-mono text-xs text-zinc-600 pointer-events-none select-none">+</div>
          <div className="absolute bottom-4 right-4 font-mono text-xs text-zinc-600 pointer-events-none select-none">+</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
