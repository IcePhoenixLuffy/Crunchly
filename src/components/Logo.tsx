import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = true,
}) => {
  const iconSizeClasses =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textClasses =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl'
      : 'text-xl';
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-2.5">
      {/* Stylized Munchly Food-Tech Logo Icon: Rounded badge with steaming bowl & playful bite notch */}
      <div
        className={`${iconSizeClasses} rounded-xl ${
          isDark
            ? 'bg-emerald-950/90 text-amber-400 border border-emerald-800/40'
            : 'bg-[#12372A] text-amber-400'
        } flex items-center justify-center shadow-xs flex-shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-amber-400"
        >
          {/* Steaming curved warmth rays */}
          <path
            d="M10 7C10 5.5 11 5 11 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 7C16 5 17 4.5 17 3.5"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M22 7C22 5.5 23 5 23 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Canteen Bowl with stylized 'Bite' cutout on upper-right lip */}
          <path
            d="M6 12C6 19 11 24 16 24C21 24 26 19 26 12H6Z"
            fill="currentColor"
          />
          {/* Stylized circular bite cutout accent */}
          <circle cx="23" cy="12" r="3.2" fill={isDark ? '#064e3b' : '#12372A'} />

          {/* Under-plate base */}
          <path
            d="M11 26H21"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="flex items-center">
          <span
            className={`font-black ${textClasses} tracking-tight ${
              isDark ? 'text-white' : 'text-[#12372A]'
            }`}
          >
            Munch<span className="text-[#EA580C]">ly</span>
          </span>
        </div>
        {showTagline && (
          <p
            className={`text-[9.5px] uppercase font-bold tracking-wider ${
              isDark ? 'text-emerald-300/80' : 'text-stone-500'
            }`}
          >
            Your Hunger, Handled.
          </p>
        )}
      </div>
    </div>
  );
};
