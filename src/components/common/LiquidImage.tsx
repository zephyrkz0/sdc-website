import React from 'react';

export interface LiquidImageProps {
  src?: string;
  image?: { src: string; alt?: string };
  video?: string;
  sourceType?: 'image' | 'video';
  alt?: string;
  colorReveal?: boolean;
  strength?: number;
  speed?: number;
  fit?: 'cover' | 'contain' | 'fill';
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

const DEFAULT_IMAGE = '/assets/ascii_landing_desktop.gif';

export const LiquidImage: React.FC<LiquidImageProps> = ({
  src,
  image,
  video,
  sourceType = 'image',
  alt = 'Media',
  fit = 'cover',
  borderRadius = 0,
  className = '',
  style,
  onClick,
  children,
}) => {
  const resolvedSrc = src || image?.src || DEFAULT_IMAGE;
  const resolvedAlt = alt || image?.alt || 'Media';
  const isVideo = sourceType === 'video' && !!video;
  const borderStyle = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden w-full h-full ${className}`}
      style={{
        borderRadius: borderStyle,
        ...style,
      }}
    >
      {isVideo ? (
        <video
          src={video}
          muted
          autoPlay
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            display: 'block',
            borderRadius: borderStyle,
          }}
        />
      ) : (
        <img
          src={resolvedSrc}
          alt={resolvedAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            display: 'block',
            borderRadius: borderStyle,
          }}
          className="select-none pointer-events-none"
        />
      )}
      {children}
    </div>
  );
};

export default LiquidImage;
