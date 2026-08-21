import React from 'react';

interface ChromeBadgeProps {
  label: string;
  variant?: 'silver' | 'dark' | 'holo' | 'outline' | 'alert';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChromeBadge: React.FC<ChromeBadgeProps> = ({
  label,
  variant = 'silver',
  icon,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  const variantClasses = {
    silver: 'bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 text-black font-bold border border-white/80 shadow-sm',
    dark: 'bg-zinc-900/90 text-zinc-300 border border-zinc-700/80 shadow-inner',
    holo: 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-white border border-purple-400/40 backdrop-blur-md',
    outline: 'bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-500',
    alert: 'bg-red-950/80 text-red-300 border border-red-500/40 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
