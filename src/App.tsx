import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassProvider } from './context/ClassContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ActiveTab } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentRecordsView } from './components/StudentRecordsView';
import { QuranTrackerView } from './components/QuranTrackerView';
import { AttendanceView } from './components/AttendanceView';
import { DailyEvaluationView } from './components/DailyEvaluationView';
import { DailyActivitiesTrackerView } from './components/DailyActivitiesTrackerView';
import { WeeklyReportsView } from './components/WeeklyReportsView';
import { AcademicCalendarView } from './components/AcademicCalendarView';
import { HomepageView } from './components/HomepageView';
import { BottomNavigation } from './components/BottomNavigation';
import { SettingsModal } from './components/SettingsModal';
import { ACADEMY_LOGO_URL, ACADEMY_LOGO_FALLBACK } from './components/AcademyLogo';

const MainContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [viewingHomepage, setViewingHomepage] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [studentRecordsSubTab, setStudentRecordsSubTab] = useState<'roster' | 'activities'>('roster');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('Class Five (Boys)');
  const [quranStudentId, setQuranStudentId] = useState<string | undefined>(undefined);
  const [evalStudentId, setEvalStudentId] = useState<string | undefined>(undefined);
  const [reportStudentId, setReportStudentId] = useState<string | undefined>(undefined);
  const [isQuranModalOpen, setIsQuranModalOpen] = useState(false);
  const { language, isRTL } = useLanguage();

  if (!isAuthenticated || viewingHomepage) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="homepage-view-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <HomepageView onEnterDashboard={() => setViewingHomepage(false)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'activities') {
      setStudentRecordsSubTab('activities');
      setActiveTab('students');
    } else {
      setActiveTab(tab);
    }
    if (tab !== 'quran') {
      setIsQuranModalOpen(false);
    }
  };

  const handleOpenQuranLog = (studentId?: string) => {
    setQuranStudentId(studentId);
    setIsQuranModalOpen(true);
    setActiveTab('quran');
  };

  const handleOpenEvaluation = (studentId?: string) => {
    if (studentId) {
      setEvalStudentId(studentId);
    }
    setActiveTab('evaluations');
  };

  const handleOpenWeeklyReport = (studentId?: string) => {
    if (studentId) {
      setReportStudentId(studentId);
    }
    setActiveTab('weekly_reports');
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="dashboard-view-container"
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`min-h-screen bg-[#f7f3ee] dark:bg-[#120c08] text-[#1b110b] dark:text-[#faedd9] flex selection:bg-[#5c351f] selection:text-[#faedd9] transition-colors duration-200 ${
          language === 'ar' ? 'font-arabic text-[15px]' : ''
        }`}
      >
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenQuickLog={() => handleOpenQuranLog()}
        onOpenHomepage={() => setViewingHomepage(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Centered Background Emblem Watermark */}
        <div 
          aria-hidden="true" 
          className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
        >
          <img 
            src={ACADEMY_LOGO_URL} 
            alt="Academy Background Watermark" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = ACADEMY_LOGO_FALLBACK;
            }}
            className="w-[360px] sm:w-[520px] lg:w-[680px] h-[360px] sm:h-[520px] lg:h-[680px] object-contain rounded-full opacity-[0.035] dark:opacity-[0.045] filter sepia-[0.3] contrast-125"
          />
        </div>

        {/* Top Header */}
        <Header 
          onOpenQuickLog={() => handleOpenQuranLog()} 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          selectedClass={selectedClass}
          onSelectClass={(cls) => setSelectedClass(cls)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCalendar={() => handleSelectTab('calendar')}
          onOpenHomepage={() => setViewingHomepage(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 pb-24 lg:pb-8">
          {activeTab === 'overview' && (
            <DashboardOverview 
              onNavigate={handleSelectTab} 
              onOpenQuranLog={handleOpenQuranLog}
              onOpenEvaluation={handleOpenEvaluation}
              onOpenWeeklyReport={handleOpenWeeklyReport}
            />
          )}

          {activeTab === 'students' && (
            <StudentRecordsView 
              initialSubTab={studentRecordsSubTab}
              onSubTabChange={(sub) => setStudentRecordsSubTab(sub)}
              onOpenQuranLog={handleOpenQuranLog}
              onOpenEvaluation={handleOpenEvaluation}
              onOpenWeeklyReport={handleOpenWeeklyReport}
            />
          )}

          {activeTab === 'quran' && (
            <QuranTrackerView 
              initialStudentId={quranStudentId}
              isLogModalOpen={isQuranModalOpen}
              onCloseModal={() => setIsQuranModalOpen(false)}
            />
          )}

          {activeTab === 'calendar' && (
            <AcademicCalendarView />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView />
          )}

          {activeTab === 'activities' && (
            <StudentRecordsView 
              initialSubTab="activities"
              onSubTabChange={(sub) => setStudentRecordsSubTab(sub)}
              onOpenQuranLog={handleOpenQuranLog}
              onOpenEvaluation={handleOpenEvaluation}
              onOpenWeeklyReport={handleOpenWeeklyReport}
            />
          )}

          {activeTab === 'evaluations' && (
            <DailyEvaluationView 
              initialStudentId={evalStudentId}
              onSelectStudent={(id) => setEvalStudentId(id)}
              onOpenWeeklyReport={handleOpenWeeklyReport}
            />
          )}

          {activeTab === 'weekly_reports' && (
            <WeeklyReportsView 
              initialStudentId={reportStudentId}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#18100b] border-t border-[#362217] py-4 no-print text-center text-xs text-[#c4b3a4] relative z-10 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#f5eee8]">
                {language === 'ar' ? 'معهد المِلَّة الإسلامي' : 'Al-Millah Islamic Academy'}
              </span>
              <span className="text-[#694630]">•</span>
              <span>
                {language === 'ar' ? 'نظام إدارة الصف والمتابعة المتقدم' : 'Class Management System'}
              </span>
              <span className="text-[#694630]">•</span>
              <span className="text-[#df9b52] font-semibold">
                LEARN • GROW • SUCCEED
              </span>
            </div>
            <div className="font-arabic text-[#df9b52] text-sm font-semibold">
              بَارَكَ اللَّهُ فِيكُمْ وَجَزَاكُمُ اللَّهُ خَيْرًا
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Settings & Profile Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          selectedClass={selectedClass}
          onSelectClass={(cls) => setSelectedClass(cls)}
        />

      </div>
    </motion.div>
  </AnimatePresence>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ClassProvider>
            <MainContent />
          </ClassProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
