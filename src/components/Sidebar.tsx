import React from 'react';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  CheckCircle2, 
  Activity,
  Star, 
  Megaphone, 
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  CalendarDays,
  Globe
} from 'lucide-react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AcademyLogo } from './AcademyLogo';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenQuickLog?: () => void;
  onOpenHomepage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenQuickLog,
  onOpenHomepage,
}) => {
  const { students, announcements, activities, selectedDate, attendance, activeSession, activeTerm } = useClass();
  const { language, isRTL, t } = useLanguage();
  const { user, logout } = useAuth();

  const activitiesTodayCount = activities.filter(a => a.date === selectedDate).length;
  const todayAttendance = attendance.filter(a => a.date === selectedDate && a.session === 'morning');
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;

  const navSections = [
    {
      titleEn: 'Academic & Daily',
      titleAr: 'الحلقات والأنشطة',
      items: [
        { 
          id: 'overview', 
          label: t('navOverview'), 
          icon: LayoutDashboard,
          hintEn: 'Main summary dashboard',
          hintAr: 'الملخص العام للصف'
        },
        { 
          id: 'students', 
          label: language === 'ar' ? 'سجل الطلاب والأنشطة' : 'Students & Activities', 
          icon: Users, 
          badge: activitiesTodayCount > 0 ? `${students.length} • ${activitiesTodayCount}` : students.length,
          badgeColor: 'bg-[#faedd9]/20 text-[#f0ba78]',
          hintEn: 'Profiles & Daily Activities',
          hintAr: 'ملفات الطلاب وسجل الأنشطة'
        },
        { 
          id: 'quran', 
          label: t('navQuran'), 
          icon: BookMarked,
          hintEn: 'Recitation & Memorization',
          hintAr: 'التسميع والحفظ'
        },
        { 
          id: 'attendance', 
          label: t('navAttendance'), 
          icon: CheckCircle2,
          badge: `${presentCount}/${students.length}`,
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50',
          hintEn: '5-day school week',
          hintAr: 'أسبوع ٥ أيام'
        },
        { 
          id: 'evaluations', 
          label: t('navEvaluations'), 
          icon: Star,
          hintEn: 'Adab & participation',
          hintAr: 'الآداب والمشاركة'
        },
        { 
          id: 'calendar', 
          label: language === 'ar' ? 'التقويم الأكاديمي' : 'Academic Calendar', 
          icon: CalendarDays, 
          badge: `${activeSession?.name || '2026/27'} • T1`,
          badgeColor: 'bg-[#df9b52]/20 text-[#f0ba78]',
          hintEn: 'Sessions, Terms & Weeks',
          hintAr: 'الجلسات والفصول والأسابيع'
        },
      ]
    },
    {
      titleEn: 'Reports & Performance',
      titleAr: 'التقارير وسجل الإنجاز',
      items: [
        { 
          id: 'weekly_reports', 
          label: t('navWeeklyReports'), 
          icon: FileText, 
          badge: 'MS Word / 9:16',
          badgeColor: 'bg-[#df9b52]/20 text-[#f0ba78]',
          hintEn: 'Individual 9:16 Performance Cards',
          hintAr: 'بطاقات التقرير الفردية ٩:١٦'
        },
      ]
    }
  ];

  const handleItemClick = (id: ActiveTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  // Nav content used in both desktop persistent sidebar and mobile slide-over drawer
  const renderNavContent = (collapsed: boolean, isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-[#18100b] text-[#f7ede2] select-none">
      {/* Sidebar Header / Brand */}
      <div className={`p-4 border-b border-[#382317] flex items-center ${
        collapsed && !isMobile ? 'justify-center' : 'justify-between gap-3'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-full p-0.5 bg-gradient-to-tr from-[#df9b52] via-[#f7cb8b] to-[#854d2b] shadow-sm shrink-0">
            <AcademyLogo 
              size={collapsed && !isMobile ? 'md' : 'md'} 
              variant="circle"
              showBorder={false}
              className="ring-1 ring-white/40 shrink-0"
            />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                <span>{language === 'ar' ? 'معهد المِلَّة' : 'Al-Millah'}</span>
                <span className="text-[10px] bg-[#df9b52]/25 text-[#f0ba78] font-semibold px-1.5 py-0.5 rounded border border-[#df9b52]/30 shrink-0">
                  {t('classTag')}
                </span>
              </h2>
              <p className="text-[11px] text-[#c7b2a2] truncate mt-0.5">
                {language === 'ar' ? 'الصف الخامس (بنين)' : 'Class Five (Boys)'}
              </p>
            </div>
          )}
        </div>

        {/* Action button in header */}
        {isMobile ? (
          <button
            id="mobile-sidebar-close-btn"
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#c7b2a2] hover:text-white hover:bg-[#2b170e] transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            id="desktop-sidebar-toggle-btn"
            type="button"
            onClick={onToggleCollapse}
            title={collapsed 
              ? (language === 'ar' ? 'توسيع القائمة الجانبية' : 'Expand Sidebar') 
              : (language === 'ar' ? 'طي القائمة الجانبية' : 'Collapse Sidebar')}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-[#c7b2a2] hover:text-[#faedd9] hover:bg-[#2e1a10] border border-[#3e2417] transition cursor-pointer ${
              collapsed ? 'mt-2' : ''
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className={`h-4 w-4 text-[#df9b52] ${isRTL ? 'rotate-180' : ''}`} />
            ) : (
              <PanelLeftClose className={`h-4 w-4 text-[#df9b52] ${isRTL ? 'rotate-180' : ''}`} />
            )}
          </button>
        )}
      </div>

      {/* Quick Action (Log Qur'an Sabaq) */}
      {onOpenQuickLog && (
        <div className={`p-3 border-b border-[#311c11] ${collapsed && !isMobile ? 'px-2' : ''}`}>
          <button
            id={`sidebar-quick-log-${collapsed && !isMobile ? 'collapsed' : 'expanded'}`}
            type="button"
            onClick={() => {
              onOpenQuickLog();
              if (isMobile) onCloseMobile();
            }}
            title={language === 'ar' ? 'تدوين تسميع القرآن' : 'Log Qur’an Recitation'}
            className={`w-full bg-[#c88642] hover:bg-[#d99753] text-[#18110c] font-bold rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center cursor-pointer ${
              collapsed && !isMobile 
                ? 'p-2.5 h-10' 
                : 'px-3 py-2.5 gap-2 text-xs'
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="truncate">{t('logQuranBtn')}</span>
            )}
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-[#362115] scrollbar-track-transparent">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {(!collapsed || isMobile) && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#9f8574]">
                {language === 'ar' ? section.titleAr : section.titleEn}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    type="button"
                    onClick={() => handleItemClick(item.id as ActiveTab)}
                    title={collapsed && !isMobile ? item.label : undefined}
                    className={`w-full flex items-center rounded-xl transition-all duration-150 group cursor-pointer relative ${
                      collapsed && !isMobile 
                        ? 'justify-center p-2.5 my-0.5' 
                        : 'px-3 py-2.5 gap-3'
                    } ${
                      isActive
                        ? 'bg-[#3d2417] text-[#faedd9] font-bold shadow-xs border border-[#5c3722]'
                        : 'text-[#d6c3b3] hover:text-white hover:bg-[#25160e] border border-transparent'
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span 
                        className={`absolute top-1.5 bottom-1.5 w-1 bg-[#df9b52] rounded-full ${
                          isRTL ? 'right-1' : 'left-1'
                        }`} 
                      />
                    )}

                    {/* Icon */}
                    <Icon 
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive 
                          ? 'text-[#df9b52]' 
                          : 'text-[#ab9484] group-hover:text-[#faedd9]'
                      }`} 
                    />

                    {/* Label & Hint */}
                    {(!collapsed || isMobile) && (
                      <div className="flex-1 flex items-center justify-between min-w-0 text-left rtl:text-right">
                        <div className="truncate">
                          <span className="text-xs block leading-tight truncate">
                            {item.label}
                          </span>
                          <span className={`text-[10px] block leading-tight truncate mt-0.5 ${
                            isActive ? 'text-[#e5cfbd]' : 'text-[#8b7262]'
                          }`}>
                            {language === 'ar' ? item.hintAr : item.hintEn}
                          </span>
                        </div>

                        {/* Optional badge */}
                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-1.5 rtl:ml-0 rtl:mr-1.5 ${
                            isActive 
                              ? 'bg-[#1e1008] text-[#f0ba78] border border-[#6b4028]' 
                              : item.badgeColor || 'bg-[#2b170e] text-[#d6c3b3]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Collapsed Badge Dot / Count */}
                    {collapsed && !isMobile && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#df9b52] ring-2 ring-[#18100b]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Ustadh Profile & Sidebar Footer */}
      <div className="p-3 border-t border-[#311c11] bg-[#140c08]">
        {(!collapsed || isMobile) ? (
          <div className="space-y-2.5">
            {user && (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#20130c] border border-[#382317]">
                  <div className="w-8 h-8 rounded-lg bg-[#3b2317] border border-[#df9b52]/40 text-[#df9b52] flex items-center justify-center shrink-0 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#faedd9] truncate">
                      {language === 'ar' ? user.arabicName : user.name}
                    </div>
                    <div className="text-[10px] text-[#df9b52] truncate">
                      {user.role}
                    </div>
                  </div>
                </div>

                {/* School Homepage Preview Button */}
                {onOpenHomepage && (
                  <button
                    type="button"
                    onClick={onOpenHomepage}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#20130c] hover:bg-[#341b10] text-[#e8cbb6] hover:text-[#faedd9] border border-[#3d2518] hover:border-[#df9b52]/50 text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 group"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#df9b52] group-hover:scale-110 transition-transform" />
                    <span>{language === 'ar' ? 'الصفحة الرئيسية للمدرسة' : 'School Homepage'}</span>
                  </button>
                )}

                {/* Dedicated Sidebar Sign Out Button */}
                <button
                  id="sidebar-logout-btn"
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#20130c] hover:bg-[#341b10] text-[#e8cbb6] hover:text-[#faedd9] border border-[#3d2518] hover:border-[#df9b52]/50 text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 group"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#df9b52] group-hover:scale-110 transition-transform" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>
            )}

            {/* Dark Mode Theme Switcher Row */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#20130c] border border-[#382317]">
              <span className="text-xs font-medium text-[#c7b2a2]">
                {language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}
              </span>
              <ThemeToggle variant="switch" />
            </div>

            <div className="px-1 flex items-center justify-between text-[10px] text-[#856e5f]">
              <span>1447 AH / 2026</span>
              <span className="font-arabic text-[#c88642]">بَارَكَ اللَّهُ فِيكُمْ</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle variant="icon-button" showLabel={false} className="w-9 h-9 !rounded-xl !p-0" />
            {user && (
              <button
                id="sidebar-collapsed-logout-btn"
                type="button"
                onClick={logout}
                title={`${user.name} • ${language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}`}
                className="w-9 h-9 rounded-xl bg-[#20130c] border border-[#382317] hover:border-[#df9b52]/50 text-[#c7b2a2] hover:text-[#df9b52] hover:bg-[#341b10] flex items-center justify-center transition cursor-pointer active:scale-95 group shadow-2xs"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              id="sidebar-collapsed-expand-btn"
              type="button"
              onClick={onToggleCollapse}
              title={language === 'ar' ? 'توسيع القائمة' : 'Expand'}
              className="p-1 rounded text-[#856e5f] hover:text-[#faedd9] transition cursor-pointer"
            >
              {isRTL ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        id="app-desktop-sidebar"
        aria-label="Sidebar navigation"
        className={`hidden lg:block sticky top-0 h-screen shrink-0 transition-all duration-200 z-30 no-print border-[#382317] ${
          isRTL ? 'border-l' : 'border-r'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {renderNavContent(isCollapsed, false)}
      </aside>

      {/* Mobile Drawer Overlay & Slide-over Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex no-print" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div 
            className={`relative flex flex-col w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-${isRTL ? 'right' : 'left'} duration-200`}
          >
            {renderNavContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
};
