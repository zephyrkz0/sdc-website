import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest('button, a, input, select, textarea, [data-interactive="true"], .interactive-element');
        setIsHovered(!!isInteractive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300">
      {/* Precision Center Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full mix-blend-difference"
        animate={{
          x: mousePos.x - 3,
          y: mousePos.y - 3,
          scale: isClicking ? 0.6 : isHovered ? 1.5 : 1,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 500, mass: 0.1 }}
      />

      {/* Cyber Crosshair Reticle Ring */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full border border-white/60 mix-blend-difference flex items-center justify-center ${
          isHovered ? 'border-dashed border-white bg-white/10' : ''
        }`}
        animate={{
          x: mousePos.x - (isHovered ? 24 : 14),
          y: mousePos.y - (isHovered ? 24 : 14),
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          rotate: isHovered ? 90 : 0,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.2 }}
      >
        {isHovered && (
          <span className="font-mono text-[8px] text-white select-none font-bold tracking-tighter opacity-80">
            [+]
          </span>
        )}
      </motion.div>
    </div>
  );
};
