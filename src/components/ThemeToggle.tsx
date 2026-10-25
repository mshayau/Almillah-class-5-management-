import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'switch' | 'icon-button';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'pill',
  showLabel = true,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const labelText = isDark
    ? (language === 'ar' ? 'الوضع النهاري' : 'Light Mode')
    : (language === 'ar' ? 'الوضع الليلي' : 'Dark Mode');

  const tooltipText = isDark
    ? (language === 'ar' ? 'التبديل إلى الوضع النهاري' : 'Switch to Light Mode')
    : (language === 'ar' ? 'التبديل إلى الوضع الليلي' : 'Switch to Dark Mode');

  if (variant === 'switch') {
    return (
      <button
        id="theme-switch-toggle-btn"
        type="button"
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        title={tooltipText}
        className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#df9b52]/50 cursor-pointer ${
          isDark ? 'bg-[#5c351f] border border-[#df9b52]/60' : 'bg-[#e5dad0] border border-[#cfbeb0]'
        } ${className}`}
      >
        <span className="sr-only">{tooltipText}</span>
        <span
          className={`flex h-5 w-5 transform items-center justify-center rounded-full transition-transform duration-300 shadow-md ${
            isDark
              ? 'translate-x-7 rtl:-translate-x-7 bg-[#df9b52] text-[#1b110b]'
              : 'translate-x-1 rtl:-translate-x-1 bg-white text-[#854d2b]'
          }`}
        >
          {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3 text-amber-500" />}
        </span>
      </button>
    );
  }

  if (variant === 'icon-button') {
    return (
      <button
        id="theme-icon-toggle-btn"
        type="button"
        onClick={toggleTheme}
        title={tooltipText}
        aria-label={tooltipText}
        className={`p-2 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
          isDark
            ? 'bg-[#291a11] hover:bg-[#3d2417] text-[#f4c382] border border-[#5c3722] shadow-xs'
            : 'bg-[#faf7f3] hover:bg-[#f0e6dc] text-[#5c351f] border border-[#e5dad0] shadow-xs'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-[#df9b52] transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-[#854d2b] transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </button>
    );
  }

  // Default 'pill' variant
  return (
    <button
      id="theme-pill-toggle-btn"
      type="button"
      onClick={toggleTheme}
      title={tooltipText}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-xs select-none ${
        isDark
          ? 'bg-[#2a1a11] hover:bg-[#3d2518] text-[#f4c382] border border-[#5c3722]'
          : 'bg-[#faf7f3] hover:bg-[#f0e6dc] text-[#5c351f] border border-[#e5dad0]'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-[#df9b52] shrink-0" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-[#854d2b] shrink-0" />
      )}
      {showLabel && <span className="whitespace-nowrap">{labelText}</span>}
    </button>
  );
};
