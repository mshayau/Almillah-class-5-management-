import React from 'react';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  Settings as SettingsIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings
}) => {
  const { language, isRTL } = useLanguage();

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      labelEn: 'Dashboard',
      labelAr: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'attendance' as ActiveTab,
      labelEn: 'Attendance',
      labelAr: 'الحضور',
      icon: CheckCircle2,
    },
    {
      id: 'quran' as ActiveTab,
      labelEn: 'Qur\'an',
      labelAr: 'القرآن',
      icon: BookMarked,
    },
    {
      id: 'students' as ActiveTab,
      labelEn: 'Students',
      labelAr: 'الطلاب',
      icon: Users,
    },
    {
      id: 'weekly_reports' as ActiveTab,
      labelEn: 'Reports',
      labelAr: 'التقارير',
      icon: FileText,
    }
  ];

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#150d09]/95 backdrop-blur-xl border-t border-[#df9b52]/30 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] px-2 py-1.5"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer relative ${
                isActive 
                  ? 'text-[#f7cb8b] scale-105' 
                  : 'text-[#9e8879] hover:text-[#faedd9]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-gradient-to-r from-[#df9b52] to-[#f7cb8b] shadow-[0_0_8px_#df9b52]" />
              )}
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#df9b52]/20' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#df9b52]' : ''}`} />
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-0.5 truncate max-w-full px-0.5">
                {language === 'ar' ? item.labelAr : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
