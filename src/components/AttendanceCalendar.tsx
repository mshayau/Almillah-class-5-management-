import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { AttendanceStatus } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Award, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HeartPulse, 
  Users, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const WEEKDAY_NAMES_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKDAY_NAMES_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

// Approximate Hijri months for 2026
const getHijriMonthLabel = (year: number, monthIndex: number, isArabic: boolean): string => {
  const hijriMapEn: Record<string, string> = {
    '2026-0': 'Rajab 1447 AH',
    '2026-1': 'Shaʿbān 1447 AH',
    '2026-2': 'Ramaḍān 1447 AH',
    '2026-3': 'Shawwāl 1447 AH',
    '2026-4': 'Dhū al-Qaʿdah 1447 AH',
    '2026-5': 'Dhū al-Ḥijjah 1447 AH',
    '2026-6': 'Muḥarram 1448 AH',
    '2026-7': 'Ṣafar 1448 AH',
    '2026-8': 'Rabīʿ al-Awwal 1448 AH',
    '2026-9': 'Rabīʿ al-Thānī 1448 AH',
    '2026-10': 'Jumādā al-Ūlā 1448 AH',
    '2026-11': 'Jumādā al-Ākhirah 1448 AH'
  };

  const hijriMapAr: Record<string, string> = {
    '2026-0': 'رجب ١٤٤٧ هـ',
    '2026-1': 'شعبان ١٤٤٧ هـ',
    '2026-2': 'رمضان ١٤٤٧ هـ',
    '2026-3': 'شوال ١٤٤٧ هـ',
    '2026-4': 'ذو القعدة ١٤٤٧ هـ',
    '2026-5': 'ذو الحجة ١٤٤٧ هـ',
    '2026-6': 'محرم ١٤٤٨ هـ',
    '2026-7': 'صفر ١٤٤٨ هـ',
    '2026-8': 'ربيع الأول ١٤٤٨ هـ',
    '2026-9': 'ربيع الثاني ١٤٤٨ هـ',
    '2026-10': 'جمادى الأولى ١٤٤٨ هـ',
    '2026-11': 'جمادى الآخرة ١٤٤٨ هـ'
  };

  if (isArabic) {
    return hijriMapAr[`${year}-${monthIndex}`] || '١٤٤٨ هـ';
  }
  return hijriMapEn[`${year}-${monthIndex}`] || '1448 AH';
};

interface DayAttendanceStats {
  dateString: string;
  totalStudents: number;
  recordedCount: number;
  present: number;
  late: number;
  absent: number;
  sick: number;
  rate: number; // 0-100
  hasRecord: boolean;
}

export const AttendanceCalendar: React.FC = () => {
  const { 
    students, 
    attendance, 
    selectedDate, 
    setSelectedDate 
  } = useClass();
  const { language, isRTL, t } = useLanguage();

  const MONTH_NAMES = language === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const WEEKDAY_NAMES = language === 'ar' ? WEEKDAY_NAMES_AR : WEEKDAY_NAMES_EN;

  // Calendar navigation state (parsed from selectedDate or default 2026-09)
  const initialDate = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
    }
    return { year: 2026, month: 8 }; // September 2026 (0-indexed 8)
  }, []);

  const [viewYear, setViewYear] = useState<number>(initialDate.year);
  const [viewMonth, setViewMonth] = useState<number>(initialDate.month);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all'); // 'all' or studentId
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return false;
    }
    return true;
  });
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      setViewYear(parseInt(parts[0], 10));
      setViewMonth(parseInt(parts[1], 10) - 1);
    }
  };

  // Compute days in month and start weekday
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // 0 = Saturday, 1 = Sunday, ..., 4 = Wednesday, 5 = Thursday, 6 = Friday
    const firstDayWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 1) % 7;
    
    // Group attendance records by date for fast lookup
    const attendanceByDate = new Map<string, typeof attendance>();
    for (const record of attendance) {
      const existing = attendanceByDate.get(record.date) || [];
      existing.push(record);
      attendanceByDate.set(record.date, existing);
    }

    const days: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isWeekend: boolean;
      isFriday: boolean;
      stats: DayAttendanceStats;
      studentStatus?: {
        status: AttendanceStatus;
        arrivalTime?: string;
        notes?: string;
      };
    }> = [];

    const pad = (n: number) => n.toString().padStart(2, '0');

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
      const dayDate = new Date(viewYear, viewMonth, day);
      const weekday = dayDate.getDay();
      // School Days: Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3)
      const isSchoolDay = weekday === 6 || weekday === 0 || weekday === 1 || weekday === 2 || weekday === 3;
      // Weekend / Recess: Thursday (4) & Friday (5)
      const isWeekend = weekday === 4 || weekday === 5;
      const isFriday = weekday === 5; // Friday Jumu'ah
      const isThursday = weekday === 4;

      const dayRecords = attendanceByDate.get(dateString) || [];
      
      // Calculate class-wide stats
      const morningRecords = dayRecords.filter(r => r.session === 'morning');
      const recordsToUse = morningRecords.length > 0 ? morningRecords : dayRecords;

      const present = recordsToUse.filter(r => r.status === 'present').length;
      const late = recordsToUse.filter(r => r.status === 'late').length;
      const absent = recordsToUse.filter(r => r.status === 'absent').length;
      const sick = recordsToUse.filter(r => r.status === 'sick' || r.status === 'excused').length;
      const recordedCount = recordsToUse.length;
      const rate = recordedCount > 0 ? Math.round(((present + late) / recordedCount) * 100) : 0;
      const hasRecord = recordedCount > 0;

      // Student-specific record
      let studentStatus: { status: AttendanceStatus; arrivalTime?: string; notes?: string } | undefined;
      if (selectedStudentId !== 'all') {
        const studentRecord = recordsToUse.find(r => r.studentId === selectedStudentId);
        if (studentRecord) {
          studentStatus = {
            status: studentRecord.status,
            arrivalTime: studentRecord.arrivalTime,
            notes: studentRecord.notes
          };
        }
      }

      days.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === '2026-09-03',
        isSelected: dateString === selectedDate,
        isWeekend,
        isFriday,
        stats: {
          dateString,
          totalStudents: students.length,
          recordedCount,
          present,
          late,
          absent,
          sick,
          rate,
          hasRecord
        },
        studentStatus
      });
    }

    return { days, firstDayWeekday, daysInMonth };
  }, [viewYear, viewMonth, attendance, selectedDate, selectedStudentId, students.length]);

  // Calculate monthly streak and statistics
  const monthAnalytics = useMemo(() => {
    const days = calendarDays.days;
    const activeDays = days.filter(d => d.stats.hasRecord);
    
    if (activeDays.length === 0) {
      return {
        averageRate: 100,
        activeStreak: 0,
        longestStreak: 0,
        perfectDays: 0,
        totalRecordedDays: 0,
        studentStreak: 0
      };
    }

    // Class average rate
    const totalRateSum = activeDays.reduce((acc, d) => acc + d.stats.rate, 0);
    const averageRate = Math.round(totalRateSum / activeDays.length);

    // Perfect 100% days
    const perfectDays = activeDays.filter(d => d.stats.rate === 100).length;

    // Calculate class streak: consecutive active school days with rate >= 90%
    let currentClassStreak = 0;
    let longestClassStreak = 0;
    let tempStreak = 0;

    // Sorted chronologically
    for (const d of activeDays) {
      if (d.stats.rate >= 90) {
        tempStreak++;
        if (tempStreak > longestClassStreak) longestClassStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    currentClassStreak = tempStreak;

    // Calculate individual student streak if selected
    let currentStudentStreak = 0;
    let longestStudentStreak = 0;
    if (selectedStudentId !== 'all') {
      let tempStdStreak = 0;
      for (const d of activeDays) {
        if (d.studentStatus && (d.studentStatus.status === 'present' || d.studentStatus.status === 'late')) {
          tempStdStreak++;
          if (tempStdStreak > longestStudentStreak) longestStudentStreak = tempStdStreak;
        } else if (d.studentStatus && d.studentStatus.status === 'absent') {
          tempStdStreak = 0;
        }
      }
      currentStudentStreak = tempStdStreak;
    }

    return {
      averageRate,
      activeStreak: currentClassStreak,
      longestStreak: longestClassStreak,
      perfectDays,
      totalRecordedDays: activeDays.length,
      studentStreak: currentStudentStreak,
      studentLongestStreak: longestStudentStreak
    };
  }, [calendarDays.days, selectedStudentId]);

  // Selected student details
  const currentSelectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
      
      {/* Calendar Header with Navigation and Mode Controls */}
      <div className="p-4 sm:p-5 border-b border-[#3b2317] bg-linear-to-r from-[#24140c] via-[#1b110b] to-[#24140c] text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Title & Hijri Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b2317] border border-[#854d2b]/50 flex items-center justify-center text-[#df9b52] shrink-0 shadow-inner">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                  <span>{language === 'ar' ? 'التقويم الشهري وسلسلة الحضور المتواصل' : 'Monthly Attendance & Streak Calendar'}</span>
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#df9b52]/20 text-[#df9b52] border border-[#df9b52]/30">
                  {getHijriMonthLabel(viewYear, viewMonth, language === 'ar')}
                </span>
              </div>
              <p className="text-xs text-[#faedd9]/70 mt-0.5">
                {language === 'ar' 
                  ? 'خريطة الحضور التفاعلية، وسلاسل الانضباط، وتتبع الأيام الدراسية' 
                  : 'Visual attendance heatmap, punctuality streaks, and roll call navigation'}
              </p>
            </div>
          </div>

          {/* Controls: Student Selector, Month Nav & Expand/Collapse */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Student Filter Dropdown */}
            <div className="flex items-center bg-[#2d1a10] border border-[#4a2e1d] rounded-lg px-2.5 py-1 text-xs">
              <Users className="h-3.5 w-3.5 text-[#df9b52] mr-1.5 rtl:mr-0 rtl:ml-1.5" />
              <select
                id="attendance-calendar-student-filter"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent font-medium text-[#faedd9] focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-[#1b110b] text-white">
                  {language === 'ar' ? 'جميع طلاب الصف (نظرة عامة)' : 'Whole Class (Overview)'}
                </option>
                {students.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#1b110b] text-white">
                    #{s.rollNumber} {language === 'ar' ? (s.arabicName || s.fullName) : `${s.fullName} (${s.arabicName})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Switcher Controls */}
            <div className="flex items-center gap-1 bg-[#2d1a10] border border-[#4a2e1d] rounded-lg p-0.5">
              <button
                type="button"
                id="attendance-cal-prev-month"
                onClick={handlePrevMonth}
                title={language === 'ar' ? 'الشهر السابق' : 'Previous Month'}
                className="p-1 rounded text-[#d6c4b6] hover:text-white hover:bg-[#3b2317] transition cursor-pointer"
              >
                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              
              <span className="px-2 font-bold text-xs text-white min-w-[110px] text-center">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                id="attendance-cal-next-month"
                onClick={handleNextMonth}
                title={language === 'ar' ? 'الشهر التالي' : 'Next Month'}
                className="p-1 rounded text-[#d6c4b6] hover:text-white hover:bg-[#3b2317] transition cursor-pointer"
              >
                <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Jump to Today Button */}
            <button
              type="button"
              id="attendance-cal-today-btn"
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] border border-[#854d2b]/50 transition cursor-pointer"
            >
              {language === 'ar' ? 'اليوم' : 'Today'}
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              id="attendance-cal-toggle-btn"
              onClick={() => setIsExpanded(prev => !prev)}
              title={isExpanded ? 'Collapse Calendar' : 'Expand Calendar'}
              className="p-1.5 rounded-lg bg-[#2d1a10] hover:bg-[#3b2317] text-[#d6c4b6] transition cursor-pointer ml-1 rtl:ml-0 rtl:mr-1"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

          </div>
        </div>

        {/* Streaks and Monthly Analytics Bar */}
        {isExpanded && (
          <div className="mt-4 pt-3.5 border-t border-emerald-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            
            {/* Streak Counter */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="h-4 w-4 fill-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                  {selectedStudentId === 'all' ? 'Active Class Streak' : 'Student Streak'}
                </span>
                <span className="font-extrabold text-white text-sm">
                  {selectedStudentId === 'all' ? monthAnalytics.activeStreak : monthAnalytics.studentStreak} Days
                </span>
              </div>
            </div>

            {/* Monthly Attendance Rate */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                  Monthly Rate
                </span>
                <span className="font-extrabold text-emerald-300 text-sm">
                  {monthAnalytics.averageRate}%
                </span>
              </div>
            </div>

            {/* Perfect Attendance Days */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                  {language === 'ar' ? 'أيام الحضور الكامل' : 'Perfect Attendance Days'}
                </span>
                <span className="font-extrabold text-white text-sm">
                  {monthAnalytics.perfectDays} Days (100%)
                </span>
              </div>
            </div>

            {/* Logged School Days */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                  Sessions Logged
                </span>
                <span className="font-extrabold text-white text-sm">
                  {monthAnalytics.totalRecordedDays} School Days
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Main Calendar Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Calendar Grid Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
                {WEEKDAY_NAMES.map((name, idx) => {
                  const isSchoolDay = idx <= 4;
                  const isThu = idx === 5;
                  const isFri = idx === 6;
                  return (
                    <div 
                      key={name} 
                      className={`py-1.5 px-1 text-xs font-bold rounded-lg border transition ${
                        isFri 
                          ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/70' 
                          : isThu
                          ? 'text-[#8c7464] bg-[#faf7f3] border-[#e5dad0]' 
                          : 'text-[#1b110b] bg-[#faedd9]/70 border-[#df9b52]/40 shadow-2xs'
                      }`}
                    >
                      <span className="block">{name}</span>
                      {isSchoolDay && (
                        <span className="block text-[9px] font-semibold text-[#854d2b]">
                          {language === 'ar' ? `يوم ${idx + 1}` : `Day ${idx + 1}`}
                        </span>
                      )}
                      {isThu && (
                        <span className="block text-[9px] font-medium text-[#8c7464]">
                          {language === 'ar' ? 'عطلة' : 'Weekend'}
                        </span>
                      )}
                      {isFri && (
                        <span className="block text-[9px] font-bold text-emerald-700">
                          {language === 'ar' ? 'الجمعة' : 'Jumuʿah'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                
                {/* Empty cells before the first weekday */}
                {Array.from({ length: calendarDays.firstDayWeekday }).map((_, i) => (
                  <div
                    key={`empty-start-${i}`}
                    className="h-20 sm:h-22 rounded-xl bg-slate-50/50 border border-dashed border-slate-200/50 opacity-40"
                  />
                ))}

                {/* Days of Current Month */}
                {calendarDays.days.map(dayItem => {
                  const { 
                    dayNumber, 
                    dateString, 
                    isToday, 
                    isSelected, 
                    isWeekend, 
                    isFriday,
                    stats, 
                    studentStatus 
                  } = dayItem;

                  const hasRecord = stats.hasRecord;
                  const isHovered = hoveredDay === dateString;

                  // Determine color styling based on Mode:
                  let cellBg = 'bg-white hover:bg-slate-50/80 border-slate-200';
                  let statusBadgeText = '';
                  let statusBadgeStyle = '';

                  if (selectedStudentId === 'all') {
                    // Whole Class Mode: Color-coded streaks by attendance rate
                    if (hasRecord) {
                      if (stats.rate >= 90) {
                        cellBg = isSelected 
                          ? 'bg-emerald-100 border-emerald-500 shadow-xs' 
                          : 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-300';
                        statusBadgeText = `${stats.rate}%`;
                        statusBadgeStyle = 'bg-emerald-700 text-white';
                      } else if (stats.rate >= 75) {
                        cellBg = isSelected 
                          ? 'bg-amber-100 border-amber-500 shadow-xs' 
                          : 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-300';
                        statusBadgeText = `${stats.rate}%`;
                        statusBadgeStyle = 'bg-amber-700 text-white';
                      } else {
                        cellBg = isSelected 
                          ? 'bg-rose-100 border-rose-500 shadow-xs' 
                          : 'bg-rose-50/80 hover:bg-rose-100/70 border-rose-300';
                        statusBadgeText = `${stats.rate}%`;
                        statusBadgeStyle = 'bg-rose-700 text-white';
                      }
                    } else if (isWeekend) {
                      cellBg = 'bg-slate-50/60 border-slate-100 text-slate-400';
                    }
                  } else {
                    // Single Student Mode: Color-coded by individual status
                    if (studentStatus) {
                      if (studentStatus.status === 'present') {
                        cellBg = isSelected 
                          ? 'bg-emerald-100 border-emerald-500' 
                          : 'bg-emerald-50/90 hover:bg-emerald-100/80 border-emerald-300';
                        statusBadgeText = 'Present';
                        statusBadgeStyle = 'bg-emerald-700 text-white';
                      } else if (studentStatus.status === 'late') {
                        cellBg = isSelected 
                          ? 'bg-amber-100 border-amber-500' 
                          : 'bg-amber-50/90 hover:bg-amber-100/80 border-amber-300';
                        statusBadgeText = studentStatus.arrivalTime || 'Late';
                        statusBadgeStyle = 'bg-amber-600 text-white';
                      } else if (studentStatus.status === 'absent') {
                        cellBg = isSelected 
                          ? 'bg-rose-100 border-rose-500' 
                          : 'bg-rose-50/90 hover:bg-rose-100/80 border-rose-300';
                        statusBadgeText = 'Absent';
                        statusBadgeStyle = 'bg-rose-700 text-white';
                      } else if (studentStatus.status === 'sick' || studentStatus.status === 'excused') {
                        cellBg = isSelected 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-blue-50/90 hover:bg-blue-100/80 border-blue-300';
                        statusBadgeText = 'Sick';
                        statusBadgeStyle = 'bg-blue-700 text-white';
                      }
                    } else if (isWeekend) {
                      cellBg = 'bg-slate-50/60 border-slate-100 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={dateString}
                      id={`attendance-calendar-day-${dateString}`}
                      type="button"
                      onClick={() => setSelectedDate(dateString)}
                      onMouseEnter={() => setHoveredDay(dateString)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`h-20 sm:h-22 p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${cellBg} ${
                        isSelected 
                          ? 'ring-2 ring-emerald-700 ring-offset-2 z-10 shadow-sm' 
                          : ''
                      }`}
                    >
                      {/* Top Row: Day Number & Badges */}
                      <div className="flex items-center justify-between w-full">
                        <span 
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                            isToday 
                              ? 'bg-emerald-900 text-white shadow-2xs' 
                              : isSelected
                              ? 'bg-slate-900 text-amber-300'
                              : 'text-slate-800'
                          }`}
                        >
                          {dayNumber}
                        </span>

                        {/* Friday / Jumu'ah Indicator */}
                        {isFriday && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">
                            Jumuʿah
                          </span>
                        )}

                        {/* Today Marker */}
                        {isToday && (
                          <span className="text-[9px] font-extrabold uppercase tracking-tight text-emerald-900 bg-emerald-200 px-1 py-0.2 rounded">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Middle & Bottom: Status / Streak Indicator */}
                      <div className="mt-auto pt-1">
                        {hasRecord ? (
                          <div>
                            {/* Status Chip */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md inline-block ${statusBadgeStyle}`}>
                                {statusBadgeText}
                              </span>

                              {/* Flame streak indicator if rate is 100% */}
                              {selectedStudentId === 'all' && stats.rate === 100 && (
                                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>

                            {/* Mini Breakdown Dots in Class Mode */}
                            {selectedStudentId === 'all' && (
                              <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-600 font-medium">
                                <span className="text-emerald-800 font-bold">{stats.present}P</span>
                                {stats.late > 0 && <span className="text-amber-800 font-bold">{stats.late}L</span>}
                                {stats.absent > 0 && <span className="text-rose-800 font-bold">{stats.absent}A</span>}
                                {stats.sick > 0 && <span className="text-blue-800 font-bold">{stats.sick}S</span>}
                              </div>
                            )}

                            {/* Student Note in Student Mode */}
                            {selectedStudentId !== 'all' && studentStatus?.notes && (
                              <p className="text-[9px] text-slate-600 truncate mt-0.5 italic">
                                {studentStatus.notes}
                              </p>
                            )}
                          </div>
                        ) : isWeekend ? (
                          <span className="text-[10px] text-slate-400 italic">No class</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 transition">
                            + Take Roll
                          </span>
                        )}
                      </div>

                      {/* Tooltip on Hover */}
                      {isHovered && hasRecord && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl z-30 pointer-events-none space-y-1">
                          <p className="font-bold border-b border-slate-700 pb-1 text-amber-300">
                            {dateString}
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <span className="text-emerald-300">Present: {stats.present}</span>
                            <span className="text-amber-300">Late: {stats.late}</span>
                            <span className="text-rose-300">Absent: {stats.absent}</span>
                            <span className="text-blue-300">Sick/Excused: {stats.sick}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
                            Overall: <strong className="text-white">{stats.rate}%</strong> • Click to view
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}

              </div>

            </div>
          </div>

          {/* Color Legend & Guide Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            
            {/* Color Swatches */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-800 text-[11px]">Color Legend:</span>
              
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                <span className="text-[11px] font-medium text-slate-700">90–100% Exemplary (Present)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-[11px] font-medium text-slate-700">75–89% Fair (Late)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-600 inline-block" />
                <span className="text-[11px] font-medium text-slate-700">&lt;75% Low (Absent)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                <span className="text-[11px] font-medium text-slate-700">Sick / Excused</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-dashed border-slate-300 inline-block" />
                <span className="text-[11px] font-medium text-slate-500">Weekend / No Class</span>
              </div>
            </div>

            {/* Selected Date Notice */}
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg font-semibold text-[11px] border border-emerald-200">
              <Info className="h-3.5 w-3.5 text-emerald-700" />
              <span>
                Active Selected Date: <strong>{selectedDate}</strong> (Click any day to view or edit roll call)
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
