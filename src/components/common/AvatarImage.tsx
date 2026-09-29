import React, { useState, useEffect } from 'react';

interface AvatarImageProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  fallbackClassName?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt = 'Avatar',
  fallbackText = 'U',
  className = 'w-full h-full object-cover',
  fallbackClassName = 'font-syne font-black text-xl uppercase',
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Expired blob URLs (from previous browser sessions) cannot be loaded and cause broken image icons
  const isDeadBlob = typeof src === 'string' && src.startsWith('blob:');
  const shouldRenderImage = Boolean(src && !isDeadBlob && !hasError);

  if (!shouldRenderImage) {
    const initial = fallbackText.trim().charAt(0).toUpperCase() || 'U';
    return (
      <span className={fallbackClassName}>
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

export default AvatarImage;
