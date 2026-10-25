import React, { useState, useRef, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  CalendarDays,
  Users, 
  BookOpen, 
  Sparkles, 
  Globe, 
  Menu,
  Bell,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  LogOut,
  Settings,
  CheckCircle2,
  Layers,
  X
} from 'lucide-react';
import { AcademyLogo } from './AcademyLogo';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenQuickLog?: () => void;
  onToggleMobileSidebar?: () => void;
  selectedClass?: string;
  onSelectClass?: (className: string) => void;
  onOpenSettings?: () => void;
  onOpenCalendar?: () => void;
  onOpenHomepage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenQuickLog, 
  onToggleMobileSidebar,
  selectedClass = 'Class Five (Boys)',
  onSelectClass,
  onOpenSettings,
  onOpenCalendar,
  onOpenHomepage
}) => {
  const { students, selectedDate, setSelectedDate, attendance, quranLogs, announcements, activeSession, activeTerm } = useClass();
  const { language, toggleLanguage, isRTL, t } = useLanguage();
  const { user, logout } = useAuth();

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const classDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const todayAttendance = attendance.filter(a => a.date === selectedDate && a.session === 'morning');
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const todayRecitations = quranLogs.filter(q => q.date === selectedDate).length;

  const classOptions = [
    { id: 'Class Five (Boys)', labelEn: 'Class Five (Boys)', labelAr: 'الصف الخامس (بنين)', count: '25 Students' },
    { id: 'Class 7A', labelEn: 'Class 7A (Advanced)', labelAr: 'الصف السابع (أ)', count: '28 Students' },
    { id: 'Class 6B', labelEn: 'Class 6B (Intermediate)', labelAr: 'الصف السادس (ب)', count: '22 Students' },
    { id: 'Class 5B', labelEn: 'Class 5B (Tajweed)', labelAr: 'الصف الخامس (ب)', count: '24 Students' }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setIsClassDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-[#140c08] via-[#1c120c] to-[#251710] text-white shadow-lg border-b border-[#df9b52]/30 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Hamburger, Logo & Branding */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleMobileSidebar && (
              <button
                id="header-mobile-sidebar-toggle"
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-xl bg-[#23150d] hover:bg-[#341e13] text-[#faedd9] border border-[#df9b52]/30 transition cursor-pointer shrink-0"
                aria-label="Open sidebar menu"
              >
                <Menu className="h-5 w-5 text-[#df9b52]" />
              </button>
            )}

            {/* Official Al-Millah Logo */}
            <div className="relative group shrink-0">
              <div className="rounded-full p-0.5 bg-gradient-to-tr from-[#df9b52] via-[#f7cb8b] to-[#c88642] shadow-md relative z-10">
                <AcademyLogo 
                  size="lg" 
                  variant="circle"
                  showBorder={false}
                  className="ring-1 ring-white/50" 
                />
              </div>
            </div>

            {/* Academy Branding Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-[#faedd9] uppercase font-serif truncate leading-tight">
                  AL-MILLAH ACADEMY
                </h1>
                <span className="hidden xl:inline-block bg-[#df9b52]/20 text-[#f7cb8b] text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-[#df9b52]/40 uppercase tracking-widest">
                  LEARN • GROW • SUCCEED
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#c4b3a4] leading-tight mt-0.5">
                <span className="font-semibold text-[#df9b52]">Class Management System</span>
                <span className="hidden sm:inline text-[#6f4b36]">•</span>
                <span className="hidden sm:inline text-[10px] uppercase font-sans tracking-wider text-[#e6d5c5]">
                  {language === 'ar' ? 'الصف الخامس (بنين)' : 'Class Five (Boys)'}
                </span>
              </div>
            </div>
          </div>

          {/* Center/Right: Class Indicator, Date, Language Switcher, and User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Clean Class 5 Indicator Badge */}
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[#251710] border border-[#df9b52]/40 text-[#faedd9] text-xs font-bold">
              <GraduationCap className="h-3.5 w-3.5 text-[#df9b52] shrink-0" />
              <span className="hidden sm:inline font-serif">Class 5 (Boys)</span>
              <span className="sm:hidden text-[11px]">Class 5</span>
            </div>

            {/* School Homepage Preview Button */}
            {onOpenHomepage && (
              <button
                type="button"
                onClick={onOpenHomepage}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#251710] hover:bg-[#382115] border border-[#df9b52]/40 text-[#faedd9] hover:text-[#df9b52] text-xs font-bold transition cursor-pointer min-h-[36px]"
                title={language === 'ar' ? 'عرض الصفحة الرئيسية للمدرسة' : 'View School Homepage'}
              >
                <Globe className="h-3.5 w-3.5 text-[#df9b52]" />
                <span>{language === 'ar' ? 'الرئيسية' : 'Homepage'}</span>
              </button>
            )}

            {/* Date Selector */}
            <div className="flex items-center bg-[#251710] border border-[#df9b52]/40 rounded-xl px-2 sm:px-2.5 py-1 text-xs">
              <Calendar className="h-3.5 w-3.5 text-[#df9b52] mr-1.5 rtl:ml-1.5 rtl:mr-0 shrink-0" />
              <input 
                id="system-date-selector"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-[#f5eee8] text-xs font-medium focus:outline-none cursor-pointer max-w-[105px] sm:max-w-none"
              />
            </div>

            {/* Language Switcher - visible on all screens */}
            <button
              id="header-language-toggle-btn"
              type="button"
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1 bg-[#251710] hover:bg-[#321f16] text-[#f7ede2] border border-[#df9b52]/40 rounded-xl px-2 sm:px-2.5 py-1 text-xs font-bold transition shadow-xs cursor-pointer min-h-[36px]"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Globe className="h-3.5 w-3.5 text-[#df9b52]" />
              <span className="text-[#f7cb8b] text-[11px] font-bold">
                {language === 'en' ? 'عربي' : 'EN'}
              </span>
            </button>

            {/* Theme Toggle - Desktop */}
            <div className="hidden sm:block">
              <ThemeToggle 
                variant="icon" 
                className="rounded-xl border-[#df9b52]/40 bg-[#251710] hover:bg-[#321f16] text-[#df9b52] p-2"
              />
            </div>

            {/* Quick Log Sabaq button - Desktop */}
            {onOpenQuickLog && (
              <button
                id="header-quick-log-btn"
                type="button"
                onClick={onOpenQuickLog}
                className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-[#df9b52] to-[#c88642] hover:brightness-110 text-[#18110c] font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-md active:scale-95 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t('logQuranBtn')}</span>
              </button>
            )}

            {/* User Profile Avatar with Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl bg-[#251710] hover:bg-[#321f16] border border-[#df9b52]/40 transition cursor-pointer"
                title={user?.email || 'Faculty Profile'}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#df9b52] via-[#f7cb8b] to-[#c88642] p-0.5 shadow-xs shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#18110c] text-[#f7cb8b] font-black text-xs flex items-center justify-center">
                    MS
                  </div>
                </div>
                <div className="hidden xl:flex flex-col items-start text-left rtl:text-right text-[11px] leading-tight">
                  <span className="font-bold text-[#faedd9] truncate max-w-[130px]">
                    {language === 'ar' ? user?.arabicName || 'الأستاذ محمد شايعو' : user?.name || 'Ustadh Muhammad Shaya\'u'}
                  </span>
                  <span className="text-[9.5px] text-[#df9b52] truncate max-w-[130px]">
                    Class Supervisor
                  </span>
                </div>
                <ChevronDown className="hidden sm:block h-3 w-3 text-[#df9b52]" />
              </button>

              {isProfileDropdownOpen && (
                <div 
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-xl bg-[#1b110b] border border-[#df9b52]/50 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-2 border-b border-[#3b2518]">
                    <p className="text-xs font-bold text-[#faedd9]">
                      {language === 'ar' ? user?.arabicName || 'الأستاذ محمد شايعو' : user?.name || 'Ustadh Muhammad Shaya\'u'}
                    </p>
                    <p className="text-[10px] text-[#df9b52] mt-0.5">
                      Class Five Supervisor & Qur’an Teacher
                    </p>
                    <p className="text-[10px] text-[#8c7464] truncate mt-0.5">
                      {user?.email || 'mohdshayau46@gmail.com'}
                    </p>
                  </div>

                  <div className="py-1">
                    {onOpenSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenSettings();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left rtl:text-right text-xs text-[#d6c3b3] hover:text-white hover:bg-[#2c1b12] flex items-center gap-2 cursor-pointer transition"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#df9b52]" />
                        <span>{language === 'ar' ? 'إعدادات النظام والبوابة' : 'Settings & Preferences'}</span>
                      </button>
                    )}

                    {onOpenHomepage && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenHomepage();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left rtl:text-right text-xs text-[#d6c3b3] hover:text-white hover:bg-[#2c1b12] flex items-center gap-2 cursor-pointer transition"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#df9b52]" />
                        <span>{language === 'ar' ? 'عرض الصفحة الرئيسية للمدرسة' : 'View School Homepage'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left rtl:text-right text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
