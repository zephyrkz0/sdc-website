import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface HolographicCard3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const HolographicCard3D: React.FC<HolographicCard3DProps> = ({
  children,
  className = '',
  intensity = 15,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const springConfig = { damping: 20, stiffness: 200, mass: 0.2 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -intensity;
    const rotY = ((x - centerX) / centerX) * intensity;

    rotateX.set(rotX);
    rotateY.set(rotY);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.8,
    });
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div style={{ perspective: 1200 }} className="w-full flex justify-center">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden transition-shadow duration-300 ${className}`}
      >
        {/* Child Content */}
        <div className="relative z-10">{children}</div>

        {/* Dynamic Holographic Reflection Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 mix-blend-color-dodge"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(
              circle at ${glarePos.x}% ${glarePos.y}%,
              rgba(255, 255, 255, 0.45) 0%,
              rgba(167, 139, 250, 0.35) 25%,
              rgba(56, 189, 248, 0.25) 50%,
              transparent 75%
            )`,
          }}
        />

        {/* Metallic Border Sheen Highlight */}
        <div
          className="pointer-events-none absolute inset-0 z-20 border border-white/30"
          style={{
            boxShadow: glarePos.opacity > 0 ? 'inset 0 0 20px rgba(255,255,255,0.1)' : 'none',
          }}
        />
      </motion.div>
    </div>
  );
};
