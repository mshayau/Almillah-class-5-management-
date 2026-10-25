import React, { useState, useMemo, useRef } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { Student, StudentGroup, WeeklyReportSummary } from '../types';
import { StudentReportCard916 } from './StudentReportCard916';
import { buildStudentReportCardData } from '../utils/studentReportGenerator';
import { ACADEMIC_WEEKS, getCurrentAcademicWeek } from '../data/academicCalendar';
import {
  generateStudentWeeklyReportWordBlob,
  generateClassWeeklyReportWordBlob,
  downloadWordBlob,
  shareReportToWhatsAppAsWord
} from '../utils/reportWordService';
import { 
  FileText, 
  Search, 
  Sparkles, 
  BookOpen, 
  User, 
  CheckCircle2, 
  MessageCircle, 
  Smartphone
} from 'lucide-react';
import { ACADEMY_LOGO_URL, ACADEMY_LOGO_FALLBACK } from './AcademyLogo';

interface WeeklyReportsViewProps {
  initialStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
}

const WEEKS_LIST = ACADEMIC_WEEKS;

export const WeeklyReportsView: React.FC<WeeklyReportsViewProps> = ({
  initialStudentId,
  onSelectStudent
}) => {
  const { students, generateWeeklyReport } = useClass();
  const { language, isRTL } = useLanguage();

  const defaultWeekIdx = useMemo(() => {
    const cur = getCurrentAcademicWeek();
    const idx = ACADEMIC_WEEKS.findIndex(w => w.weekNumber === cur.weekNumber);
    return idx !== -1 ? idx : 0;
  }, []);

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(defaultWeekIdx);
  const currentWeek = WEEKS_LIST[selectedWeekIndex] || WEEKS_LIST[0];

  // Selected student state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students.length > 0 ? students[0].id : '')
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'roll' | 'score'>('roll');
  const [mobileTab, setMobileTab] = useState<'selector' | 'preview'>('preview');

  // Export / share state
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [customComment, setCustomComment] = useState<string>('');

  const reportCardRef = useRef<HTMLDivElement>(null);

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Reports map for the selected week
  const reportsMap = useMemo(() => {
    const map = new Map<string, WeeklyReportSummary>();
    if (!students || !generateWeeklyReport) return map;
    for (const st of students) {
      const rep = generateWeeklyReport(st.id, currentWeek.startDate, currentWeek.endDate);
      if (rep) {
        map.set(st.id, rep);
      }
    }
    return map;
  }, [students, generateWeeklyReport, currentWeek]);

  // Active weekly report for student
  const activeReport = useMemo(() => {
    if (!activeStudent) return null;
    return reportsMap.get(activeStudent.id) || (generateWeeklyReport ? generateWeeklyReport(activeStudent.id, currentWeek.startDate, currentWeek.endDate) : null) || {
      id: `rep-${activeStudent.id}-${currentWeek.weekNumber}`,
      studentId: activeStudent.id,
      weekStartDate: currentWeek.startDate,
      weekEndDate: currentWeek.endDate,
      sabaqMemorizedPages: 4,
      sabqiRevisionJuz: 1.5,
      attendancePercentage: 100,
      adabAverageRating: 4.9,
      punctualityRating: 5,
      homeworkCompletionRate: 98,
      neatnessRating: 4.8,
      standing: 'Mumtaz' as const,
      totalAyahsMemorized: 38,
      teacherRemarks: `Masha'Allah, an exemplary week of Tahfeez and noble character.`
    };
  }, [activeStudent, reportsMap, generateWeeklyReport, currentWeek]);

  // Filtered & sorted student roster
  const filteredStudents = useMemo(() => {
    let list = students.filter(s => {
      const matchesGroup = selectedGroup === 'ALL' || s.group === selectedGroup;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        s.fullName.toLowerCase().includes(query) ||
        (s.arabicName && s.arabicName.includes(query)) ||
        s.rollNumber.toString().includes(query);
      return matchesGroup && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'score') {
        const scoreA = reportsMap.get(a.id)?.attendancePercentage ?? 90;
        const scoreB = reportsMap.get(b.id)?.attendancePercentage ?? 90;
        return scoreB - scoreA;
      }
      return a.rollNumber - b.rollNumber;
    });
  }, [students, selectedGroup, searchQuery, sortBy, reportsMap]);

  // Report Card 9:16 structured data
  const reportCardData = useMemo(() => {
    if (!activeStudent || !activeReport) return null;
    const data = buildStudentReportCardData(
      activeStudent,
      activeReport,
      currentWeek.startDate,
      currentWeek.endDate,
      currentWeek.weekNumber
    );
    if (customComment) {
      data.teacherComment = customComment;
    }
    return data;
  }, [activeStudent, activeReport, currentWeek, customComment]);

  // Handlers
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCustomComment('');
    setMobileTab('preview');
    if (onSelectStudent) {
      onSelectStudent(studentId);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };



  // Share via WhatsApp in Microsoft Word (.docx) tabular format (User requested feature)
  const handleShareWhatsAppWord = async () => {
    if (!activeStudent || !activeReport || !reportCardData) return;
    setIsExporting(true);
    try {
      const res = await shareReportToWhatsAppAsWord({
        student: activeStudent,
        report: activeReport,
        weekNumber: currentWeek.weekNumber,
        weekLabel: language === 'ar' ? currentWeek.labelAr : currentWeek.labelEn,
        summaryMetrics: {
          attendancePct: reportCardData.summaryMetrics.attendancePct,
          overallCompositeScore: reportCardData.summaryMetrics.overallCompositeScore,
          totalAyahsMemorized: reportCardData.quranTracker.totalAyahsMemorized
        },
        teacherComment: reportCardData.teacherComment,
        language: language === 'ar' ? 'ar' : 'en'
      });

      if (res.method === 'native-share') {
        showFeedback(language === 'ar' ? 'تمت مشاركة تقرير وورد (Word) بنجاح عبر الواتساب!' : 'Weekly Report MS Word (.docx) shared directly to WhatsApp!');
      } else {
        showFeedback(
          language === 'ar'
            ? 'تم تنزيل تقرير مايكروسوفت وورد وفتح محادثة الواتساب! يرجى إرفاق الملف المُنَزَّل في المحادثة.'
            : 'Microsoft Word tabular report downloaded & WhatsApp chat opened! Attach the downloaded .docx document to send.'
        );
      }
    } catch (err) {
      console.error('Word WhatsApp Share failed:', err);
      showFeedback(language === 'ar' ? 'حدث خطأ أثناء إعداد أو مشاركة تقرير Word' : 'Failed to generate Word report for WhatsApp.');
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Download of Student Weekly Report as Microsoft Word (.docx) in Tabular Form
  const handleDownloadWord = async () => {
    if (!activeStudent || !activeReport) return;
    setIsExporting(true);
    try {
      const blob = await generateStudentWeeklyReportWordBlob(
        activeStudent,
        activeReport,
        currentWeek.weekNumber
      );
      const safeName = activeStudent.fullName.replace(/\s+/g, '_');
      const filename = `AlMillah_Weekly_Report_${safeName}_Std${activeStudent.rollNumber}_Week${currentWeek.weekNumber}.docx`;
      downloadWordBlob(blob, filename);
      showFeedback(language === 'ar' ? 'تم تنزيل تقرير مايكروسوفت وورد الجدولي (.docx) بنجاح!' : 'Weekly Report MS Word tabular dossier (.docx) downloaded successfully!');
    } catch (err) {
      console.error('Word download failed:', err);
      showFeedback(language === 'ar' ? 'فشل تنزيل ملف Word' : 'Failed to download Microsoft Word document.');
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Download of Full Class 5 Master Word (.docx) Tabular Dossier
  const handleDownloadClassMasterWord = async () => {
    setIsExporting(true);
    try {
      const blob = await generateClassWeeklyReportWordBlob(
        students,
        reportsMap,
        currentWeek.weekNumber
      );
      const filename = `AlMillah_Class5_Master_Weekly_Report_Week${currentWeek.weekNumber}.docx`;
      downloadWordBlob(blob, filename);
      showFeedback(language === 'ar' ? 'تم تنزيل سجل الصف الشامل بصيغة وورد (Word) بنجاح!' : 'Class 5 Master Word Dossier (.docx) downloaded successfully!');
    } catch (err) {
      console.error('Class Master Word download failed:', err);
      showFeedback(language === 'ar' ? 'فشل تنزيل السجل الشامل للوورد' : 'Failed to download Class Master Word file.');
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <div className="space-y-4 sm:space-y-6 pb-16">
      {/* =========================================================================
          1. EXECUTIVE HEADER BANNER & WEEK SELECTOR
          ========================================================================= */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a0f08] via-[#2a170d] to-[#180f08] border border-[#df9b52]/40 shadow-2xl p-4 sm:p-6 md:p-8 no-print">
        {/* Subtle Decorative Arabic Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#df9b52_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-[#df9b52] via-[#faedd9] to-[#854d2b] shadow-xl shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#1a0f08] flex items-center justify-center p-1 overflow-hidden">
                <img 
                  src={ACADEMY_LOGO_URL} 
                  alt="Al-Millah Academy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = ACADEMY_LOGO_FALLBACK;
                  }}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#df9b52]/20 text-[#f7cb8b] border border-[#df9b52]/40">
                  {language === 'ar' ? 'الصف الخامس (بنين)' : 'Class 5 Management'}
                </span>
                <span className="text-[11px] text-[#c4b3a4] font-bold">
                  • MS Word Tabular Dossiers (.docx)
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white font-serif tracking-tight mt-1 truncate">
                {language === 'ar' ? 'تقارير الإنجاز الأسبوعية للطلاب' : 'Weekly Student Performance Reports'}
              </h1>
              <p className="text-xs sm:text-sm text-[#c4b3a4] mt-0.5 sm:mt-1 font-arabic line-clamp-2 sm:line-clamp-none">
                {language === 'ar' 
                  ? 'إصدار تقارير الأداء الأسبوعية الفردية والشاملة بصيغة مايكروسوفت وورد (MS Word) في جداول رسمية متكاملة للمشاركة عبر واتساب والأرشفة الإدارية.'
                  : 'Official weekly student performance reports formatted exclusively in Microsoft Word (.docx) structured tables for WhatsApp sharing and archival.'}
              </p>
            </div>
          </div>

          {/* Week Selector Dropdown & Quick Stats */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-[#1f130c] border border-[#df9b52]/40 rounded-2xl p-2 px-3 shadow-inner">
              <label className="block text-[10px] uppercase font-bold text-[#df9b52] tracking-wider mb-1">
                {language === 'ar' ? 'اختر الأسبوع الدراسي:' : 'Academic Week Cycle:'}
              </label>
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                className="w-full bg-[#2a170d] text-[#faedd9] font-bold text-xs rounded-xl px-3 py-2 border border-[#df9b52]/30 focus:outline-none focus:ring-2 focus:ring-[#df9b52] cursor-pointer"
              >
                {WEEKS_LIST.map((w, idx) => {
                  const statusBadge = w.status === 'completed'
                    ? (language === 'ar' ? ' [مكتمل]' : ' [Completed]')
                    : w.status === 'current'
                    ? (language === 'ar' ? ' [الأسبوع الحالي]' : ' [Current Week]')
                    : (language === 'ar' ? ' [قادم]' : ' [Upcoming]');
                  return (
                    <option key={w.weekNumber} value={idx}>
                      {language === 'ar' ? `${w.labelAr}${statusBadge}` : `${w.labelEn}${statusBadge}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Academic Week Status Strip */}
        <div className="mt-5 pt-4 border-t border-[#df9b52]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
              currentWeek.status === 'completed'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : currentWeek.status === 'current'
                ? 'bg-[#df9b52]/20 text-[#f7cb8b] border-[#df9b52]/60 animate-pulse'
                : 'bg-sky-950/80 text-sky-300 border-sky-500/50'
            }`}>
              {currentWeek.status === 'completed' 
                ? (language === 'ar' ? '✓ أسبوع دراسي مكتمل' : '✓ Completed Academic Week')
                : currentWeek.status === 'current'
                ? (language === 'ar' ? '★ الأسبوع الأكاديمي الجاري' : '★ Current Active Academic Week')
                : (language === 'ar' ? '⏳ أسبوع دراسي قادم' : '⏳ Upcoming Academic Week')}
            </span>

            <span className="text-[#faedd9] font-bold">
              {language === 'ar' ? currentWeek.labelAr : currentWeek.labelEn}
            </span>

            <span className="text-[#a89282] hidden sm:inline">
              • {language === 'ar' ? currentWeek.hijriRangeAr : currentWeek.hijriRangeEn}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#f7cb8b] bg-[#22130b] px-3 py-1.5 rounded-xl border border-[#df9b52]/30">
            <BookOpen className="w-3.5 h-3.5 text-[#df9b52]" />
            <span className="font-semibold">
              {language === 'ar' ? 'مقرر الحفظ:' : 'Tahfeez Target:'}
            </span>
            <span className="font-bold text-white">
              {language === 'ar' ? currentWeek.targetSurahAr : currentWeek.targetSurahEn}
            </span>
          </div>
        </div>

        {/* Feedback Alert Pill */}
        {feedbackMessage && (
          <div className="mt-4 p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MOBILE NAVIGATION TABS (Selector vs Live Preview)
          ========================================================================= */}
      <div className="lg:hidden flex rounded-2xl bg-[#19100a] p-1.5 border border-[#df9b52]/30 no-print">
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
            mobileTab === 'preview'
              ? 'bg-gradient-to-r from-[#df9b52] to-[#b37535] text-[#180f08] shadow-md'
              : 'text-[#c4b3a4] hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{language === 'ar' ? 'بطاقة التقرير ٩:١٦' : '9:16 Report Card'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('selector')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
            mobileTab === 'selector'
              ? 'bg-gradient-to-r from-[#df9b52] to-[#b37535] text-[#180f08] shadow-md'
              : 'text-[#c4b3a4] hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{language === 'ar' ? 'قائمة الطلاب (٢٥)' : 'Class Roster (25)'}</span>
        </button>
      </div>

      {/* =========================================================================
          3. MAIN DUAL-PANE WORKSPACE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: STUDENT ROSTER SELECTOR & QUICK METRICS (4 cols on lg) */}
        <div className={`lg:col-span-4 space-y-4 no-print ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-[#19100a] rounded-3xl border border-[#df9b52]/30 shadow-xl p-4 sm:p-5 space-y-4">
            
            {/* Header with Student Count */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-black text-white font-serif">
                  {language === 'ar' ? 'سجل طلاب الصف الخامس' : 'Class Five Students'}
                </h2>
                <p className="text-[11px] text-[#a89282]">
                  {language === 'ar' ? 'اختر طالباً لعرض بطاقته' : 'Select a student to inspect report'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadClassMasterWord}
                  disabled={isExporting}
                  className="p-1.5 px-2.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-200 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  title="Download complete Class 5 Master Word Dossier (.docx) in tabular form"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'ar' ? 'وورد الصف' : 'Class Word'}</span>
                </button>
                <span className="text-xs font-black text-[#f7cb8b] bg-[#df9b52]/20 border border-[#df9b52]/40 px-2.5 py-0.5 rounded-full">
                  {filteredStudents.length} / {students.length}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#a89282] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم أو الرقم...' : 'Search student or roll #...'}
                className="w-full bg-[#23150d] text-xs text-[#faedd9] placeholder-[#8c7667] pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-[#df9b52]/30 focus:outline-none focus:ring-1 focus:ring-[#df9b52]"
              />
            </div>

            {/* Group Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['ALL', 'abu_bakr', 'umar', 'uthman', 'ali'] as const).map((grp) => {
                const isSelected = selectedGroup === grp;
                const label = grp === 'ALL' 
                  ? (language === 'ar' ? 'الكل' : 'All')
                  : grp === 'abu_bakr' ? 'Abu Bakr'
                  : grp === 'umar' ? 'Umar'
                  : grp === 'uthman' ? 'Uthman' : 'Ali';

                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#df9b52] to-[#b37535] text-[#180f08] shadow-sm font-black'
                        : 'bg-[#23150d] text-[#c4b3a4] hover:text-white border border-[#3e271a]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#df9b52]/30">
              {filteredStudents.map((st) => {
                const isSelected = st.id === selectedStudentId;
                const studentReport = reportsMap.get(st.id);
                const score = studentReport?.attendancePercentage ?? 96;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStudent(st.id)}
                    className={`w-full text-left rtl:text-right p-3 rounded-2xl transition-all duration-200 border flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#321c10] to-[#24140b] border-[#df9b52] shadow-lg ring-1 ring-[#df9b52]/60'
                        : 'bg-[#21130a]/80 hover:bg-[#28180e] border-[#382316]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar with status ring */}
                      <div className="relative shrink-0">
                        <img 
                          src={st.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'} 
                          alt={st.fullName}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#df9b52]/60"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-[#180f08] border border-[#df9b52]/50 text-[9px] font-black text-[#df9b52] w-4 h-4 rounded-full flex items-center justify-center">
                          {st.rollNumber}
                        </span>
                      </div>

                      {/* Name & details */}
                      <div className="min-w-0">
                        <h4 className={`text-xs font-black truncate leading-tight ${isSelected ? 'text-[#f7cb8b]' : 'text-[#faedd9]'}`}>
                          {st.fullName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#a89282]">
                          <span>Roll #{st.rollNumber}</span>
                          <span>•</span>
                          <span className="text-[#df9b52] font-semibold uppercase">{st.group.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="shrink-0 text-right rtl:text-left">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                        score >= 95 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      }`}>
                        {score}%
                      </span>
                      <div className="text-[9px] text-[#8c7667] mt-0.5">Standing</div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE 9:16 VERTICAL REPORT CARD & ACTION DOCK (8 cols on lg) */}
        <div className={`lg:col-span-8 space-y-4 ${mobileTab === 'selector' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Action Control Bar (WhatsApp Share, Download, Copy, Print) */}
          <div className="bg-[#19100a] rounded-3xl border border-[#df9b52]/30 shadow-xl p-4 sm:p-5 space-y-4 no-print">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#352014] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#df9b52]" />
                  <h3 className="text-sm sm:text-base font-black text-white font-serif">
                    {activeStudent?.fullName || 'Student'} • {language === 'ar' ? currentWeek.datesFormattedAr : currentWeek.datesFormattedEn}
                  </h3>
                </div>
                <p className="text-xs text-[#a89282] mt-0.5">
                  {language === 'ar' 
                    ? 'سجل دراسي جدولي رسمي بصيغة Microsoft Word (.docx) • جاهز للمشاركة الفورية عبر واتساب والأرشفة الإدارية'
                    : 'Official Microsoft Word Tabular Dossier (.docx) • Ready for WhatsApp delivery & administrative archival'}
                </p>
              </div>

              {/* Action Buttons: Microsoft Word Tabular Features Only */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {/* 1. Share via WhatsApp as Microsoft Word (.docx) (Tabular Form) */}
                <button
                  id="report-action-whatsapp-word"
                  type="button"
                  disabled={isExporting}
                  onClick={handleShareWhatsAppWord}
                  className="w-full sm:w-auto justify-center min-h-[44px] p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#185abd] via-[#2368c4] to-[#124b9c] hover:from-[#2368c4] hover:to-[#185abd] text-white font-black text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Share weekly report directly to WhatsApp in MS Word tabular form (.docx)"
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <FileText className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  <span>{language === 'ar' ? 'مشاركة واتساب (Word)' : 'Share to WhatsApp (Word)'}</span>
                  <span className="bg-blue-950/80 text-blue-200 border border-blue-400/40 text-[10px] px-1.5 py-0.5 rounded-sm font-mono font-black uppercase">
                    DOCX
                  </span>
                </button>

                {/* 2. Download Student Microsoft Word (.docx) in Tabular Form */}
                <button
                  id="report-action-download-word"
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadWord}
                  className="w-full sm:w-auto justify-center min-h-[44px] p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#1e3a8a] hover:from-[#1d4ed8] hover:to-[#2563eb] text-blue-50 font-black text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-blue-400/30"
                  title="Download student report in MS Word tabular form (.docx)"
                >
                  <FileText className="w-4 h-4 text-blue-300 shrink-0" />
                  <span>
                    {isExporting ? 'Exporting...' : (language === 'ar' ? 'تنزيل Word (جدول)' : 'Download Word (Tables)')}
                  </span>
                  <span className="bg-blue-950/90 text-blue-200 border border-blue-400/40 text-[10px] px-1.5 py-0.5 rounded-sm font-mono font-black uppercase">
                    .docx
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Tips & Parent Notification Preview Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#c4b3a4] bg-[#22130a] p-3 rounded-2xl border border-[#3b2518]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#df9b52]" />
                <span>
                  <strong>Parent Contact:</strong> {activeStudent?.parentPhone || '08031234567'} ({activeStudent?.parentName || 'Parent / Guardian'})
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Live 9:16 Luxury Student Report Card Container */}
          <div className="bg-[#120a06] rounded-2xl sm:rounded-3xl p-2 sm:p-6 md:p-8 border border-[#df9b52]/20 shadow-2xl flex flex-col items-center justify-center min-h-[500px] overflow-hidden">
            {reportCardData ? (
              <div className="w-full flex justify-center py-1 sm:py-2">
                <StudentReportCard916
                  data={reportCardData}
                  cardRef={reportCardRef}
                  allowCustomComment={true}
                  onCustomCommentChange={(newComment) => setCustomComment(newComment)}
                  isWhatsAppMode={false}
                />
              </div>
            ) : (
              <div className="text-center py-16 text-[#a89282]">
                <FileText className="w-12 h-12 text-[#df9b52]/40 mx-auto mb-3" />
                <p>Select a student to preview their weekly performance report.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
