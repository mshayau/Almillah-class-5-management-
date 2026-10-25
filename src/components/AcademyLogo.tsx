import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

export const ACADEMY_LOGO_URL = '/logo.jpg';
export const ACADEMY_LOGO_FALLBACK = 'https://i.ibb.co/Cp2NKpFT/1787091470119.jpg';

interface AcademyLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'rounded' | 'circle' | 'square';
  showBorder?: boolean;
  hoverEffect?: boolean;
  title?: string;
  onClick?: () => void;
}

export const AcademyLogo: React.FC<AcademyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'circle',
  showBorder = true,
  hoverEffect = true,
  title = 'Al-Millah Islamic Academy • أكاديمية المِلَّة الإسلامية',
  onClick,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(ACADEMY_LOGO_URL);
  const [hasError, setHasError] = useState<boolean>(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20 sm:w-24 sm:h-24',
  }[size];

  const variantClasses = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    square: 'rounded-lg',
  }[variant];

  const borderClass = showBorder ? 'border border-[#df9b52]/40 shadow-xs' : '';
  const hoverClass = hoverEffect 
    ? 'cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:rotate-3 hover:shadow-[0_0_20px_rgba(223,155,82,0.55)] hover:ring-2 hover:ring-[#df9b52] active:scale-95' 
    : '';

  if (hasError) {
    return (
      <div
        title={title}
        onClick={onClick}
        className={`${sizeClasses} ${variantClasses} ${hoverClass} aspect-square bg-[#362115] border border-[#5c3722] flex items-center justify-center text-[#df9b52] shadow-inner shrink-0 overflow-hidden ${className}`}
      >
        <BookOpen className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <div
      title={title}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center ${sizeClasses} ${variantClasses} ${borderClass} ${hoverClass} overflow-hidden bg-white shrink-0 aspect-square shadow-xs ${className}`}
    >
      <img
        src={imgSrc}
        alt="Al-Millah Islamic Academy Logo"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => {
          if (imgSrc === ACADEMY_LOGO_URL) {
            setImgSrc(ACADEMY_LOGO_FALLBACK);
          } else {
            setHasError(true);
          }
        }}
        className={`w-full h-full object-cover aspect-square ${variantClasses} block`}
      />
    </div>
  );
};
