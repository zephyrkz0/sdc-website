import React, { useRef, useEffect, useState, startTransition } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/* ----------------------------------
   RESPONSIVE CONFIGURATION
   startWidthPct / startHeightPct define the initial compact capsule size (% of viewport)
----------------------------------- */
const RESPONSIVE = {
  desktop: {
    titleFont: 'clamp(2.2rem, 4.5vw, 4.2rem)',
    bottomOffset: 'calc(50% + 5.5vh)',
    startWidthPct: 0,  // Initial desktop width (1.2% of screen)
    startHeightPct: 0, // Initial desktop height (0.5% of screen)
  },
  tablet: {
    titleFont: 'clamp(1.6rem, 4vw, 3.0rem)',
    bottomOffset: 'calc(50% + 5vh)',
    startWidthPct: 0,  // Initial tablet width
    startHeightPct: 0, // Initial tablet height
  },
  mobile: {
    titleFont: 'clamp(1.2rem, 5.5vw, 2.0rem)',
    bottomOffset: 'calc(50% + 4.2vh)',
    startWidthPct: 0,  // Initial mobile width
    startHeightPct: 0, // Initial mobile height
  },
};

export interface ScrollZoomRevealProps {
  image?: { src: string; alt?: string } | string;
  desktopImage?: string;
  mobileImage?: string;
  title?: string;
  titleText?: string;
  leftText?: string;
  rightText?: string;
  buttonText?: string;
  textColor?: string;
  animationStiffness?: number;
  animationDamping?: number;
  animationMass?: number;
  className?: string;
}

export const ScrollZoomReveal: React.FC<ScrollZoomRevealProps> = ({
  image,
  desktopImage,
  mobileImage,
  title,
  titleText,
  leftText,
  rightText,
  textColor = '#ffffff',
  animationStiffness = 90,
  animationDamping = 25,
  animationMass = 0.6,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        startTransition(() => setScreen('mobile'));
      } else if (window.innerWidth <= 1200) {
        startTransition(() => setScreen('tablet'));
      } else {
        startTransition(() => setScreen('desktop'));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const current = RESPONSIVE[screen];
  const isMobile = screen === 'mobile';

  // Display title text above the center image
  const displayTitle =
    title ||
    titleText ||
    (leftText && rightText ? `${leftText} ${rightText}` : leftText || rightText || 'SKILL DEVELOPMENT CLUB');

  // Intelligently select mobile GIF or desktop GIF based on current viewport
  const imageSrc = isMobile
    ? mobileImage || (typeof image === 'string' ? image : image?.src) || '/assets/ascii_landing_mobile.gif'
    : desktopImage || (typeof image === 'string' ? image : image?.src) || '/assets/ascii_landing_desktop.gif';

  const imageAlt = typeof image === 'string' ? 'SDC Landing Visual' : image?.alt || 'SDC Landing Visual';

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Calculate GPU-accelerated insets based on initial % dimensions
  const initialInsetX = (100 - current.startWidthPct) / 2;
  const initialInsetY = (100 - current.startHeightPct) / 2;

  const insetX = useTransform(scrollYProgress, [0, 0.92], [initialInsetX, 0]);
  const insetY = useTransform(scrollYProgress, [0, 0.92], [initialInsetY, 0]);
  const rawRadius = useTransform(scrollYProgress, [0, 0.92], [100, 0]);

  // Combined clip-path template: inset(Y% X% round Rpx)
  const clipPath = useTransform(
    [insetY, insetX, rawRadius],
    ([y, x, r]) => `inset(${y}% ${x}% round ${r}px)`
  );

  // Border opacity fades out as the viewport expands to 100% full screen
  const borderAlpha = useTransform(scrollYProgress, [0, 0.8], [0.3, 0]);

  // Typography starts strictly at 100% solid opacity (0% transparency) at rest,
  // and only begins gradually dissolving after active scroll starts
  const textOpacity = useTransform(scrollYProgress, [0, 0.08, 0.4], [1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.08, 0.4], [0, 0, -40]);
  const textScale = useTransform(scrollYProgress, [0, 0.08, 0.4], [1, 1, 0.95]);
  const textDisplay = useTransform(scrollYProgress, (v) => (v >= 0.41 ? 'none' : 'block'));

  return (
    <section
      ref={ref}
      className={`relative select-none w-full ${className}`}
      style={{ height: '380vh' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          zIndex: 30,
          pointerEvents: 'auto',
        }}
        className="relative flex items-center justify-center pointer-events-auto"
      >
        {/* Title Typographic Header - Positioned with generous breathing room above capsule */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: current.bottomOffset,
            x: '-50%',
            opacity: textOpacity,
            y: textY,
            scale: textScale,
            display: textDisplay,
            zIndex: 10,
          }}
          className="font-openboek font-black uppercase tracking-wider text-center pointer-events-none select-none w-full max-w-5xl px-4"
        >
          <h1
            style={{
              fontSize: current.titleFont,
              color: '#ffffff',
              WebkitTextStroke: '1.2px #ffffff',
              textShadow: '0 0 10px #ffffff, 0 0 25px rgba(255,255,255,0.9), 0 0 45px rgba(255,255,255,0.6)',
              opacity: 1,
            }}
            className="text-white leading-tight font-black"
          >
            {displayTitle}
          </h1>
        </motion.div>

        {/* Absolute Centered Expanding Cinematic Viewport with GPU Clip-Path */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath,
            overflow: 'hidden',
            background: '#000000',
            zIndex: 20,
            pointerEvents: 'auto',
          }}
          className="w-full h-full pointer-events-auto"
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover select-none block pointer-events-none"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollZoomReveal;
