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
  FileText
} from 'lucide-react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { students, announcements, activities, selectedDate } = useClass();
  const { t } = useLanguage();

  const activitiesTodayCount = activities.filter(a => a.date === selectedDate).length;

  const tabs = [
    { id: 'overview', label: t('navOverview'), icon: LayoutDashboard },
    { id: 'students', label: t('navStudents'), icon: Users, badge: students.length },
    { id: 'quran', label: t('navQuran'), icon: BookMarked },
    { id: 'attendance', label: t('navAttendance'), icon: CheckCircle2 },
    { id: 'evaluations', label: t('navEvaluations'), icon: Star },
    { id: 'weekly_reports', label: t('navWeeklyReports'), icon: FileText, badge: 'Excel / PDF' },
    { id: 'announcements', label: t('navAnnouncements'), icon: Megaphone, badge: announcements.length },
  ];

  return (
    <nav className="bg-[#fcfaf7] border-b border-[#e5dcd3] sticky top-[69px] z-20 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 rtl:space-x-reverse overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-none text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#3b2317] text-[#faedd9] shadow-xs border border-[#5a3623]'
                    : 'text-[#635043] hover:text-[#2b170e] hover:bg-[#f3ece4]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#df9b52]' : 'text-[#8c7464]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-none font-bold ${
                    isActive 
                      ? 'bg-[#20130c] text-[#f0ba78]' 
                      : 'bg-[#eadecf] text-[#543827]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
