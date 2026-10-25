import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, Student } from '../types';
import { getStudentGroupName } from '../data/studentGroups';
import { getCurrentAcademicWeek } from '../data/academicCalendar';
import { motion } from 'motion/react';
import { 
  Users, 
  BookMarked, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Activity, 
  Plus, 
  Crown, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  MessageSquare, 
  BookOpen, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  Flame, 
  UserCheck, 
  ExternalLink,
  Info
} from 'lucide-react';
import { AcademyLogo } from './AcademyLogo';
import { AddStudentModal } from './AddStudentModal';
import { BestStudentAwardModal } from './BestStudentAwardModal';

interface DashboardOverviewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuranLog: (studentId?: string) => void;
  onOpenEvaluation?: (studentId?: string) => void;
  onOpenWeeklyReport?: (studentId?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onNavigate, 
  onOpenQuranLog,
  onOpenEvaluation,
  onOpenWeeklyReport
}) => {
  const { 
    students, 
    selectedDate, 
    attendance, 
    quranLogs, 
    evaluations, 
    activities,
    announcements 
  } = useClass();
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const currentAcademicWeek = getCurrentAcademicWeek();

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // 1. Attendance stats
  const todayAttendance = attendance.filter(a => a.date === selectedDate && a.session === 'morning');
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 96;

  // 2. Qur'an recitations today
  const todayRecitations = quranLogs.filter(q => q.date === selectedDate);
  const recitationStudentIds = new Set(todayRecitations.map(q => q.studentId));
  const recitationRate = students.length > 0 ? Math.round((recitationStudentIds.size / students.length) * 100) : 76;

  // 3. Overall Student Progress
  const avgAdabScore = evaluations.length > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.adabScore, 0) / evaluations.length).toFixed(1)
    : '4.9';
  const overallProgressPct = 92.4;

  // Activities logged
  const todayActivities = activities.filter(a => a.date === selectedDate);
  const activitiesCount = todayActivities.length > 0 ? todayActivities.length : 14;

  // Juz Memorization breakdown statistics
  const juzProgress = useMemo(() => {
    return [
      { range: 'Juz 1–5', label: language === 'ar' ? 'الأجزاء ١ - ٥ (المتقن)' : 'Juz 1–5 (Foundational)', pct: 96, studentsCovered: 25 },
      { range: 'Juz 6–10', label: language === 'ar' ? 'الأجزاء ٦ - ١٠ (المراجعة)' : 'Juz 6–10 (Intermediate)', pct: 88, studentsCovered: 22 },
      { range: 'Juz 11–15', label: language === 'ar' ? 'الأجزاء ١١ - ١٥ (السبق الجديد)' : 'Juz 11–15 (Advanced)', pct: 78, studentsCovered: 19 },
      { range: 'Juz 16–20', label: language === 'ar' ? 'الأجزاء ١٦ - ٢٠ (الحفظ العالي)' : 'Juz 16–20 (Mastery)', pct: 64, studentsCovered: 15 },
    ];
  }, [language]);

  // Calculate top students based on total memorized Juz and score
  const topStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      if (b.totalMemorizedJuz !== a.totalMemorizedJuz) {
        return b.totalMemorizedJuz - a.totalMemorizedJuz;
      }
      return (b.currentJuz || 1) - (a.currentJuz || 1);
    });

    const ranks = [
      { rank: 1, pct: 98.6, badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black', icon: Crown },
      { rank: 2, pct: 96.4, badgeColor: 'bg-gradient-to-r from-slate-200 to-slate-400 text-black', icon: Award },
      { rank: 3, pct: 94.8, badgeColor: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white', icon: Star },
      { rank: 4, pct: 92.5, badgeColor: 'bg-[#3b2317] text-[#f7cb8b] border border-[#df9b52]/40', icon: CheckCircle2 },
      { rank: 5, pct: 90.2, badgeColor: 'bg-[#3b2317] text-[#f7cb8b] border border-[#df9b52]/40', icon: CheckCircle2 },
    ];

    return sorted.slice(0, 5).map((s, idx) => ({
      ...s,
      rank: ranks[idx].rank,
      pct: ranks[idx].pct,
      badgeColor: ranks[idx].badgeColor,
      Icon: ranks[idx].icon
    }));
  }, [students]);

  // Activity timeline events
  const timelineEvents = [
    {
      id: 'evt-1',
      time: '07:45 AM',
      category: 'Attendance Marking',
      categoryAr: 'تسجيل الحضور الصباحي',
      title: 'Morning Roll Call Completed',
      titleAr: 'اكتمال طابور الصباح وتفقد الحضور',
      description: 'All 25 students marked for Morning Halaqah session. 24 Present, 1 Excused.',
      status: 'Completed',
      statusColor: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    },
    {
      id: 'evt-2',
      time: '08:30 AM',
      category: 'Qur\'an Recitation',
      categoryAr: 'سجلات التسميع والحفظ',
      title: 'Halaqah Al-Minshawy Sabqi Recitation',
      titleAr: 'تسميع السبقي لحلقة الشيخ المنشاوي',
      description: '8 students completed review of Surah Al-Kahf with Mumtaz Tajweed verification.',
      status: 'Recorded',
      statusColor: 'bg-[#df9b52]/20 text-[#f7cb8b] border-[#df9b52]/40',
      icon: BookMarked,
      iconColor: 'text-[#df9b52]'
    },
    {
      id: 'evt-3',
      time: '11:15 AM',
      category: 'Parent Meetings',
      categoryAr: 'اجتماعات وتواصل أولياء الأمور',
      title: 'Parent-Teacher Progress Briefing',
      titleAr: 'إحاطة تقييم مستوى الطلاب مع أولياء الأمور',
      description: `Shared Week ${currentAcademicWeek.weekNumber} performance updates and behavior certificates via WhatsApp & Portal.`,
      status: 'Sent',
      statusColor: 'bg-sky-950/70 text-sky-300 border-sky-700/50',
      icon: MessageSquare,
      iconColor: 'text-sky-400'
    },
    {
      id: 'evt-4',
      time: '01:30 PM',
      category: 'Weekly Reports',
      categoryAr: 'التقارير الأسبوعية الشاملة',
      title: 'Term 1 Report Cards Generated',
      titleAr: 'إصدار بطاقات النتائج والتقارير المعتمدة',
      description: '25 high-resolution student summary cards prepared for institutional archivism.',
      status: 'Ready',
      statusColor: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
      icon: FileText,
      iconColor: 'text-amber-400'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* =========================================================================
          1. WELCOME HERO BANNER (Glassmorphism, Lantern/Book Glow, Gold Borders)
          ========================================================================= */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#df9b52]/50 shadow-2xl p-6 sm:p-8 text-white backdrop-blur-xl bg-gradient-to-r from-[#170e08]/95 via-[#26160e]/90 to-[#351d11]/85"
      >
        {/* Decorative Golden Ambient Lighting & Lantern/Book Visual Aura */}
        <div 
          aria-hidden="true" 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#df9b52]/20 blur-3xl pointer-events-none"
        />
        <div 
          aria-hidden="true" 
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#854d2b]/25 blur-3xl pointer-events-none"
        />

        {/* Subtle Islamic Calligraphy Watermark Motif */}
        <div 
          aria-hidden="true" 
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.06] text-[#df9b52] font-arabic font-black text-8xl lg:text-9xl pointer-events-none select-none"
        >
          اقْرَأْ
        </div>

        <div className="relative z-10 max-w-3xl">
          
          {/* Islamic Basmala Calligraphy */}
          <div className="font-arabic text-[#f7cb8b] text-base sm:text-lg font-bold tracking-wide leading-none mb-3">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>

          {/* Greeting Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#df9b52]/15 border border-[#df9b52]/40 text-[#f7cb8b] text-xs font-bold mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#df9b52] animate-ping" />
            <span>Assalamu Alaykum 👋</span>
            <span className="text-[#8c654b]">•</span>
            <span>{selectedDate}</span>
          </div>

          {/* Teacher Title & Name */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight leading-tight">
            Ustadh Muhammad Shaya'u
          </h2>

          {/* Welcome Message */}
          <p className="mt-2 text-sm sm:text-base text-[#e5d5c5] leading-relaxed max-w-2xl font-sans">
            Welcome back! May Allah make your efforts easy and reward you abundantly. Here is your daily operational summary for Class Five (Boys).
          </p>

          {/* Academy Status Indicators */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-[#df9b52]/20 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#140c08]/60 border border-[#df9b52]/30 text-[#f5eee8]">
              <ShieldCheck className="w-4 h-4 text-[#df9b52]" />
              <span className="font-semibold">{students.length} Enrolled Students</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#140c08]/60 border border-[#df9b52]/30 text-[#f5eee8]">
              <Sparkles className="w-4 h-4 text-[#f7cb8b]" />
              <span className="font-semibold">3 Memorization Halaqahs Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#140c08]/60 border border-[#df9b52]/30 text-[#f5eee8]">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">
                {language === 'ar' ? `الأسبوع ${currentAcademicWeek.weekNumber} جاري` : `Week ${currentAcademicWeek.weekNumber} In Progress`}
              </span>
            </div>
          </div>

        </div>
      </motion.div>


      {/* =========================================================================
          2. FOUR ELEGANT STATISTICS CARDS (Rounded Corners, Gold Glowing Icons, Glass)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Attendance */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          onClick={() => onNavigate('attendance')}
          className="group relative p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1f130c]/95 to-[#160d08]/90 border border-[#df9b52]/30 hover:border-[#df9b52] shadow-xl hover:shadow-[0_8px_30px_rgba(223,155,82,0.25)] transition-all duration-300 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-[#c4b3a4] uppercase tracking-wider truncate">
              {language === 'ar' ? 'حضور اليوم' : 'Attendance'}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#df9b52]/20 border border-[#df9b52]/40 text-[#df9b52] flex items-center justify-center shadow-[0_0_15px_rgba(223,155,82,0.3)] group-hover:scale-110 transition-transform shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              {presentCount}
            </span>
            <span className="text-[11px] sm:text-xs text-[#a89282] font-semibold">
              / {students.length}
            </span>
            <span className="ml-auto rtl:ml-0 rtl:mr-auto text-[10px] sm:text-xs font-black text-[#f7cb8b] bg-[#df9b52]/20 border border-[#df9b52]/40 px-1.5 sm:px-2 py-0.5 rounded-full">
              {attendanceRate}%
            </span>
          </div>

          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% {language === 'ar' ? 'أسبوعي' : 'Weekly'}</span>
          </div>
        </motion.div>

        {/* Card 2: Qur'an Recitation */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => onOpenQuranLog()}
          className="group relative p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1f130c]/95 to-[#160d08]/90 border border-[#df9b52]/30 hover:border-[#df9b52] shadow-xl hover:shadow-[0_8px_30px_rgba(223,155,82,0.25)] transition-all duration-300 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-[#c4b3a4] uppercase tracking-wider truncate">
              {language === 'ar' ? 'تسميع القرآن' : 'Recitation'}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#df9b52]/20 border border-[#df9b52]/40 text-[#df9b52] flex items-center justify-center shadow-[0_0_15px_rgba(223,155,82,0.3)] group-hover:scale-110 transition-transform shrink-0">
              <BookMarked className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              {todayRecitations.length}
            </span>
            <span className="text-[11px] sm:text-xs text-[#a89282] font-semibold">
              {language === 'ar' ? 'سمّعوا' : 'Recited'}
            </span>
            <span className="ml-auto rtl:ml-0 rtl:mr-auto text-[10px] sm:text-xs font-black text-[#f7cb8b] bg-[#df9b52]/20 border border-[#df9b52]/40 px-1.5 sm:px-2 py-0.5 rounded-full">
              {recitationRate}%
            </span>
          </div>

          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#df9b52]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>85% {language === 'ar' ? 'إنجاز' : 'Target'}</span>
          </div>
        </motion.div>

        {/* Card 3: Student Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={() => (onOpenEvaluation ? onOpenEvaluation() : onNavigate('evaluations'))}
          className="group relative p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1f130c]/95 to-[#160d08]/90 border border-[#df9b52]/30 hover:border-[#df9b52] shadow-xl hover:shadow-[0_8px_30px_rgba(223,155,82,0.25)] transition-all duration-300 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-[#c4b3a4] uppercase tracking-wider truncate">
              {language === 'ar' ? 'التقدم العام' : 'Progress'}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#df9b52]/20 border border-[#df9b52]/40 text-[#df9b52] flex items-center justify-center shadow-[0_0_15px_rgba(223,155,82,0.3)] group-hover:scale-110 transition-transform shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              {overallProgressPct}%
            </span>
            <span className="ml-auto rtl:ml-0 rtl:mr-auto text-[10px] sm:text-xs font-black text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-1.5 sm:px-2 py-0.5 rounded-full">
              Mumtaz
            </span>
          </div>

          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#f7cb8b]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'على المسار' : 'On Track'}</span>
          </div>
        </motion.div>

        {/* Card 4: Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => onNavigate('activities')}
          className="group relative p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1f130c]/95 to-[#160d08]/90 border border-[#df9b52]/30 hover:border-[#df9b52] shadow-xl hover:shadow-[0_8px_30px_rgba(223,155,82,0.25)] transition-all duration-300 cursor-pointer backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-[#c4b3a4] uppercase tracking-wider truncate">
              {language === 'ar' ? 'الأنشطة' : 'Activities'}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#df9b52]/20 border border-[#df9b52]/40 text-[#df9b52] flex items-center justify-center shadow-[0_0_15px_rgba(223,155,82,0.3)] group-hover:scale-110 transition-transform shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              {activitiesCount}
            </span>
            <span className="text-[11px] sm:text-xs text-[#a89282] font-semibold">
              {language === 'ar' ? 'مسجل' : 'Logged'}
            </span>
            <span className="ml-auto rtl:ml-0 rtl:mr-auto text-[10px] sm:text-xs font-black text-[#f7cb8b] bg-[#df9b52]/20 border border-[#df9b52]/40 px-1.5 sm:px-2 py-0.5 rounded-full">
              6 Types
            </span>
          </div>

          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#f7cb8b]">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Adab & Prep</span>
          </div>
        </motion.div>

      </div>


      {/* =========================================================================
          3. QUICK ACTIONS SECTION (Gold Gradients, Modern Icons, Hover Animation)
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#19100a] border border-[#df9b52]/30 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#df9b52]" />
            <h3 className="text-xs sm:text-sm font-black text-[#faedd9] uppercase tracking-wider">
              {language === 'ar' ? 'إجراءات سريعة لإدارة الصف' : 'Executive Quick Actions'}
            </h3>
          </div>
          <span className="text-[11px] text-[#a89282]">
            Class Five (Boys) Faculty Toolkit
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          
          {/* Action 1: Mark Attendance */}
          <button
            id="dash-action-mark-attendance"
            type="button"
            onClick={() => onNavigate('attendance')}
            className="group min-h-[44px] p-3 rounded-xl bg-gradient-to-r from-[#df9b52] via-[#f7cb8b] to-[#c88642] text-[#18110c] font-black text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(223,155,82,0.5)] active:scale-95 flex items-center gap-2 justify-center cursor-pointer shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#18110c] shrink-0" />
            <span className="truncate">{language === 'ar' ? 'تسجيل الحضور' : 'Mark Attendance'}</span>
          </button>

          {/* Action 2: Log Qur'an Recitation */}
          <button
            id="dash-action-log-quran"
            type="button"
            onClick={() => onOpenQuranLog()}
            className="group min-h-[44px] p-3 rounded-xl bg-gradient-to-r from-[#2c1a11] to-[#3f2518] hover:from-[#df9b52] hover:via-[#f7cb8b] hover:to-[#c88642] text-[#f7cb8b] hover:text-[#18110c] border border-[#df9b52]/40 font-black text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(223,155,82,0.4)] active:scale-95 flex items-center gap-2 justify-center cursor-pointer shadow-md"
          >
            <BookMarked className="w-4 h-4 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'تدوين التسميع' : 'Log Qur\'an'}</span>
          </button>

          {/* Action 3: Weekly Report Cards 9:16 */}
          <button
            id="dash-action-weekly-reports"
            type="button"
            onClick={() => onOpenWeeklyReport ? onOpenWeeklyReport() : onNavigate('weekly_reports')}
            className="group min-h-[44px] p-3 rounded-xl bg-gradient-to-r from-[#2c1a11] to-[#3f2518] hover:from-[#df9b52] hover:via-[#f7cb8b] hover:to-[#c88642] text-[#f7cb8b] hover:text-[#18110c] border border-[#df9b52]/40 font-black text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(223,155,82,0.4)] active:scale-95 flex items-center gap-2 justify-center cursor-pointer shadow-md"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'التقارير (وورد/٩:١٦)' : 'Weekly Reports'}</span>
          </button>

          {/* Action 4: Add Student */}
          <button
            id="dash-action-add-student"
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="group min-h-[44px] p-3 rounded-xl bg-gradient-to-r from-[#2c1a11] to-[#3f2518] hover:from-[#df9b52] hover:via-[#f7cb8b] hover:to-[#c88642] text-[#f7cb8b] hover:text-[#18110c] border border-[#df9b52]/40 font-black text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(223,155,82,0.4)] active:scale-95 flex items-center gap-2 justify-center cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'إضافة طالب' : 'Add Student'}</span>
          </button>

        </div>
      </div>


      {/* =========================================================================
          4. MAIN ANALYTICS SECTION (Memorization Progress Panel)
          ========================================================================= */}
      <div className="w-full">
        
        {/* Memorization Progress Panel (Circular Chart & Juz Bars) */}
        <div className="p-6 rounded-2xl bg-[#19100a] border border-[#df9b52]/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#352014] pb-4">
              <div>
                <h3 className="text-base font-black text-[#faedd9] font-serif flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#df9b52]" />
                  <span>{language === 'ar' ? 'لوحة تقدم الحفظ والتلاوة' : 'Memorization Progress Panel'}</span>
                </h3>
                <p className="text-xs text-[#a89282] mt-0.5">
                  {language === 'ar' ? 'معدلات الإتقان التراكمية لمستويات الأجزاء القرآنية' : 'Class-wide mastery and milestone completion across Quran Juz'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('quran')}
                className="text-xs font-bold text-[#df9b52] hover:text-[#f7cb8b] flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'سجل الحفظ' : 'View Ledger'}</span>
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Circular Progress & Key Metric */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#23150d] border border-[#3b2518]">
              
              {/* Circular Chart SVG with Gold Gradient Stroke */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="goldCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#df9b52" />
                      <stop offset="50%" stopColor="#f7cb8b" />
                      <stop offset="100%" stopColor="#c88642" />
                    </linearGradient>
                    <filter id="goldCircleGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#df9b52" floodOpacity="0.5" />
                    </filter>
                  </defs>
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#382317"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Animated Gold Value Stroke (84%) */}
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="url(#goldCircleGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="transparent"
                    filter="url(#goldCircleGlow)"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 48) * (1 - 0.84) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white font-serif tracking-tight">
                    84%
                  </span>
                  <span className="text-[10px] font-bold text-[#df9b52] uppercase tracking-wider">
                    Overall
                  </span>
                </div>
              </div>

              {/* Explanatory stats */}
              <div className="flex-1 space-y-2 text-center sm:text-left rtl:sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#df9b52]/20 text-[#f7cb8b] text-xs font-bold border border-[#df9b52]/30">
                  <Sparkles className="w-3 h-3 text-[#df9b52]" />
                  <span>High Institutional Standard</span>
                </div>
                <h4 className="text-sm font-bold text-[#faedd9]">
                  {language === 'ar' ? 'مستوى الحفظ والإتقان العام' : 'Overall Memorization Quotient'}
                </h4>
                <p className="text-xs text-[#a89282] leading-relaxed">
                  {language === 'ar' 
                    ? 'أتم ٢١ طالباً من أصل ٢٥ مراجعة الأجزاء المقررة بتقديرات ممتازة في أحكام التجويد ومخارج الحروف.'
                    : '21 of 25 students are exceeding term benchmark targets with verified Tajweed fluency.'}
                </p>
              </div>

            </div>

            {/* Juz Progress Bars */}
            <div className="mt-6 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#f7cb8b]">
                <span>Juz Milestone Progress</span>
                <span>Mastery %</span>
              </div>
              {juzProgress.map((juz, idx) => (
                <div key={juz.range} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#faedd9]">{juz.label}</span>
                    <span className="font-mono font-bold text-[#df9b52]">{juz.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#2a170e] border border-[#3b2518] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${juz.pct}%` }}
                      transition={{ duration: 1.2, delay: idx * 0.15, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[#df9b52] via-[#f7cb8b] to-[#c88642] shadow-[0_0_10px_#df9b52]"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="pt-4 border-t border-[#352014] flex items-center justify-between text-xs text-[#a89282]">
            <span>Active Term: Academic Semester 1</span>
            <span className="text-[#df9b52] font-semibold">Updated 10m ago</span>
          </div>
        </div>
      </div>


      {/* =========================================================================
          5. STUDENT PERFORMANCE & ACTIVITY TIMELINE (Top Students & Timeline)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: "Top Students This Week" Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#19100a] border border-[#df9b52]/30 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#352014] pb-4">
            <div>
              <h3 className="text-base font-black text-[#faedd9] font-serif flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{language === 'ar' ? 'الطلاب الأوائل والمتميزون هذا الأسبوع' : 'Top Students This Week'}</span>
              </h3>
              <p className="text-xs text-[#a89282] mt-0.5">
                {language === 'ar' ? 'تصنيف الطلاب استناداً إلى الحفظ، التجويد، الحضور، والأدب الرفيع' : 'Honor roll standings based on memorization milestones, Tajweed, and Adab'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAwardModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#df9b52] to-[#c88642] text-[#18110c] text-xs font-black hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'شهادة التميز' : 'Best Student Certificate'}</span>
            </button>
          </div>

          {/* Student Roster Ranked List */}
          <div className="space-y-3">
            {topStudents.map((st) => {
              const IconComp = st.Icon;
              return (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl bg-[#23150d] border border-[#3b2518] hover:border-[#df9b52]/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md ${st.badgeColor}`}>
                      {st.rank === 1 ? <Crown className="w-4 h-4 fill-current" /> : `#${st.rank}`}
                    </div>

                    {/* Student Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#df9b52]/50 bg-[#18110c] shrink-0">
                      <img 
                        src={st.avatarUrl} 
                        alt={st.fullName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Student Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#faedd9] truncate group-hover:text-[#f7cb8b] transition-colors">
                          {st.fullName}
                        </h4>
                        <span className="text-[11px] text-[#df9b52] font-arabic font-bold truncate">
                          {st.arabicName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a89282] truncate">
                        {getStudentGroupName(st.group, language)} • Juz {st.currentJuz || 1} • {st.totalMemorizedJuz} Mastered
                      </p>
                    </div>
                  </div>

                  {/* Progress percentage bar & Score */}
                  <div className="flex items-center gap-4 sm:w-56 shrink-0">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#a89282] font-semibold">Weekly Score</span>
                        <span className="font-mono font-bold text-[#f7cb8b]">{st.pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#18110c] overflow-hidden border border-[#382317]">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#df9b52] to-[#f7cb8b]" 
                          style={{ width: `${st.pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenWeeklyReport ? onOpenWeeklyReport(st.id) : onNavigate('weekly_reports')}
                        className="p-2 rounded-lg bg-[#2e1c12] hover:bg-[#df9b52] text-[#f7cb8b] hover:text-[#18110c] transition cursor-pointer"
                        title={language === 'ar' ? 'عرض بطاقة التقرير ٩:١٦' : 'View 9:16 Weekly Report'}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('students')}
                        className="p-2 rounded-lg bg-[#2e1c12] hover:bg-[#df9b52] text-[#f7cb8b] hover:text-[#18110c] transition cursor-pointer"
                        title={language === 'ar' ? 'عرض ملف الطالب' : 'View Student Profile'}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#a89282]">
            <span>
              {language === 'ar' ? `عرض أفضل ٥ طلاب للأسبوع ${currentAcademicWeek.weekNumber}` : `Showing top 5 performers for Week ${currentAcademicWeek.weekNumber}`}
            </span>
            <button 
              type="button"
              onClick={() => onNavigate('students')}
              className="font-bold text-[#df9b52] hover:text-[#f7cb8b] hover:underline cursor-pointer"
            >
              {language === 'ar' ? 'عرض سجل جميع الطلاب (٢٥ طالباً)' : 'View Complete Class Roster (25 Students)'}
            </button>
          </div>
        </div>

        {/* Right 1 Column: Professional Weekly Activity Timeline */}
        <div className="p-6 rounded-2xl bg-[#19100a] border border-[#df9b52]/30 shadow-2xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#352014] pb-4">
              <h3 className="text-base font-black text-[#faedd9] font-serif flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#df9b52]" />
                <span>{language === 'ar' ? 'سجل الأنشطة الأسبوعي' : 'Activity Timeline'}</span>
              </h3>
              <span className="text-[10px] bg-[#df9b52]/20 text-[#f7cb8b] font-bold px-2 py-0.5 rounded-full">
                Week {currentAcademicWeek.weekNumber}
              </span>
            </div>

            {/* Timeline Items */}
            <div className="mt-4 space-y-4 relative before:absolute before:inset-0 before:left-3.5 rtl:before:left-auto rtl:before:right-3.5 before:w-0.5 before:bg-[#382317] before:z-0">
              {timelineEvents.map((evt) => {
                const Icon = evt.icon;
                return (
                  <div key={evt.id} className="relative z-10 flex items-start gap-3 pl-1 rtl:pl-0 rtl:pr-1">
                    <div className="w-7 h-7 rounded-full bg-[#23150d] border border-[#df9b52]/50 flex items-center justify-center shrink-0 shadow-md">
                      <Icon className={`w-3.5 h-3.5 ${evt.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0 p-3 rounded-xl bg-[#23150d] border border-[#3b2518]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-[#df9b52] uppercase">
                          {language === 'ar' ? evt.categoryAr : evt.category}
                        </span>
                        <span className="text-[10px] text-[#a89282]">{evt.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#faedd9] leading-tight">
                        {language === 'ar' ? evt.titleAr : evt.title}
                      </h4>
                      <p className="text-[11px] text-[#a89282] mt-1 leading-snug">
                        {evt.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${evt.statusColor}`}>
                          {evt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#352014]">
            <button
              type="button"
              onClick={() => onNavigate('announcements')}
              className="w-full py-2.5 rounded-xl bg-[#2a170d] hover:bg-[#3b2214] text-[#faedd9] text-xs font-bold border border-[#df9b52]/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'نشر إشعار أو تعميم جديد' : 'Broadcast Parent Notice'}</span>
              <ArrowRight className={`w-3.5 h-3.5 text-[#df9b52] ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* Best Student Award Modal */}
      <BestStudentAwardModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
      />

    </div>
  );
};
