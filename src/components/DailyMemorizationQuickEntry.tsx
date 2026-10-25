import React, { useState, useMemo, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  DailyMemorizationEntry, 
  MemorizationReviewStatus, 
  Student, 
  StudentGroup,
  TajweedRating
} from '../types';
import { 
  VERIFIED_SURAHS, 
  getPageForAyah, 
  getAyahsOnPage, 
  validateAndCalculateQuranRange, 
  getSurahByNumber 
} from '../data/quranReferenceData';
import { getStudentGroupName } from '../data/studentGroups';
import { getDayOfWeekName } from '../data/academicCalendar';
import { QuranReferenceBrowserModal } from './QuranReferenceBrowserModal';
import { 
  BookMarked, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  ShieldCheck, 
  Save, 
  ArrowRight, 
  Plus, 
  Edit3, 
  Trash2, 
  History, 
  Sparkles, 
  BookOpen, 
  Filter, 
  CheckCircle, 
  Search, 
  Layers, 
  UserCheck, 
  X,
  Target
} from 'lucide-react';

interface DailyMemorizationQuickEntryProps {
  initialStudentId?: string;
  onOpenWeeklyTargets?: (studentId?: string) => void;
}

export const DailyMemorizationQuickEntry: React.FC<DailyMemorizationQuickEntryProps> = ({
  initialStudentId,
  onOpenWeeklyTargets
}) => {
  const { 
    students, 
    academicSessions, 
    activeSession, 
    activeTerm, 
    activeInstructionalWeeks,
    weeklyTargets,
    dailyMemorizationEntries,
    createDailyMemorizationEntry,
    correctDailyMemorizationEntry,
    deleteDailyMemorizationEntry,
    selectedDate
  } = useClass();

  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const teacherName = user?.name || user?.email || "Ustadh Muhammad Shaya'u";

  // Academic Period Filters
  const [selectedSessionId, setSelectedSessionId] = useState<string>(activeSession?.id || academicSessions[0]?.id || '');
  const [selectedTermId, setSelectedTermId] = useState<string>(activeTerm?.id || '');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(2); // Default Week 2
  const [groupFilter, setGroupFilter] = useState<StudentGroup | 'all'>('all');

  // Active student selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || students[0]?.id || '');

  // Quick-entry form fields
  const [submissionDate, setSubmissionDate] = useState<string>(selectedDate || '2026-09-05');
  const [surahNumber, setSurahNumber] = useState<number>(78); // Default An-Naba
  const [startPage, setStartPage] = useState<number>(582);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(582);
  const [endAyah, setEndAyah] = useState<number>(10);
  const [reviewStatus, setReviewStatus] = useState<MemorizationReviewStatus>('accepted');
  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    language === 'ar' ? 'ما شاء الله، إتقان تام وتلاوة متصلة سليمة.' : "Masha'Allah, fluent recitation and good tajweed."
  );
  const [tajweedRating, setTajweedRating] = useState<TajweedRating>('mumtaz');
  const [mistakeCount, setMistakeCount] = useState<number>(0);

  // Correction Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [entryToCorrect, setEntryToCorrect] = useState<DailyMemorizationEntry | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [correctionSurahNumber, setCorrectionSurahNumber] = useState<number>(78);
  const [correctionStartPage, setCorrectionStartPage] = useState<number>(582);
  const [correctionStartAyah, setCorrectionStartAyah] = useState<number>(1);
  const [correctionEndPage, setCorrectionEndPage] = useState<number>(582);
  const [correctionEndAyah, setCorrectionEndAyah] = useState<number>(10);
  const [correctionReviewStatus, setCorrectionReviewStatus] = useState<MemorizationReviewStatus>('accepted');
  const [correctionFeedback, setCorrectionFeedback] = useState<string>('');
  const [showCorrectionAuditHistory, setShowCorrectionAuditHistory] = useState(false);

  // Mushaf reference browser
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  const correctionSurah = useMemo(() => {
    return getSurahByNumber(correctionSurahNumber) || VERIFIED_SURAHS[0];
  }, [correctionSurahNumber]);

  // Status alerts & feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DailyMemorizationEntry | null>(null);

  // Sync initial student
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  // Active Session & Term objects
  const currentSession = useMemo(() => {
    return academicSessions.find(s => s.id === selectedSessionId) || activeSession || academicSessions[0];
  }, [academicSessions, selectedSessionId, activeSession]);

  const currentTerm = useMemo(() => {
    if (!currentSession) return activeTerm;
    return currentSession.terms.find(t => t.id === selectedTermId) || currentSession.terms[0];
  }, [currentSession, selectedTermId, activeTerm]);

  // Weeks for current term
  const termWeeks = useMemo(() => {
    if (!currentSession || !currentTerm) return activeInstructionalWeeks;
    const count = currentTerm.instructionalWeeksCount || 16;
    const weeks: { weekNumber: number; label: string; startDate: string; endDate: string }[] = [];

    if (currentTerm.id === activeTerm?.id && activeInstructionalWeeks.length > 0) {
      return activeInstructionalWeeks.map(w => ({
        weekNumber: w.weekNumber,
        label: language === 'ar' ? w.labelAr : w.labelEn,
        startDate: w.startDate,
        endDate: w.endDate
      }));
    }

    const tStart = new Date(currentTerm.startDate || '2026-08-29');
    for (let w = 1; w <= count; w++) {
      const wStart = new Date(tStart);
      wStart.setDate(tStart.getDate() + (w - 1) * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 4);

      const sStr = wStart.toISOString().split('T')[0];
      const eStr = wEnd.toISOString().split('T')[0];
      weeks.push({
        weekNumber: w,
        label: `Week ${w} (${sStr} – ${eStr})`,
        startDate: sStr,
        endDate: eStr
      });
    }
    return weeks;
  }, [currentSession, currentTerm, activeTerm, activeInstructionalWeeks, language]);

  const currentWeekInfo = useMemo(() => {
    return termWeeks.find(w => w.weekNumber === selectedWeekNumber) || termWeeks[0] || {
      weekNumber: selectedWeekNumber,
      label: `Week ${selectedWeekNumber}`,
      startDate: currentTerm?.startDate || '2026-09-05',
      endDate: currentTerm?.endDate || '2026-09-09'
    };
  }, [termWeeks, selectedWeekNumber, currentTerm]);

  // Filter students based on groupFilter
  const halaqahStudents = useMemo(() => {
    if (groupFilter === 'all') return students;
    return students.filter(s => s.group === groupFilter);
  }, [students, groupFilter]);

  // Current student object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || halaqahStudents[0] || students[0];
  }, [students, selectedStudentId, halaqahStudents]);

  // Student navigation indexes
  const currentStudentIndex = useMemo(() => {
    return halaqahStudents.findIndex(s => s.id === currentStudent?.id);
  }, [halaqahStudents, currentStudent]);

  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setSelectedStudentId(halaqahStudents[currentStudentIndex - 1].id);
      setFormError(null);
      setFormSuccess(null);
      setDuplicateWarning(null);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < halaqahStudents.length - 1) {
      setSelectedStudentId(halaqahStudents[currentStudentIndex + 1].id);
      setFormError(null);
      setFormSuccess(null);
      setDuplicateWarning(null);
    }
  };

  // Connected Weekly Target for current student in selected week
  const studentWeeklyTarget = useMemo(() => {
    if (!currentStudent) return null;
    return weeklyTargets.find(t => 
      t.studentId === currentStudent.id &&
      t.sessionId === selectedSessionId &&
      t.termId === selectedTermId &&
      t.weekNumber === selectedWeekNumber
    ) || null;
  }, [currentStudent, weeklyTargets, selectedSessionId, selectedTermId, selectedWeekNumber]);

  // Surah reference metadata
  const currentSurah = useMemo(() => {
    return getSurahByNumber(surahNumber) || VERIFIED_SURAHS[0];
  }, [surahNumber]);

  // Real-time Range Calculation
  const rangeCalculation = useMemo(() => {
    return validateAndCalculateQuranRange(surahNumber, startAyah, surahNumber, endAyah);
  }, [surahNumber, startAyah, endAyah]);

  // Day of week calculation for submission date
  const dayOfWeekInfo = useMemo(() => {
    return getDayOfWeekName(submissionDate);
  }, [submissionDate]);

  // Late Entry Detection: true if actualSubmissionDate is before currentWeekInfo.startDate
  const isLateEntryDetected = useMemo(() => {
    if (!submissionDate || !currentWeekInfo.startDate) return false;
    return submissionDate < currentWeekInfo.startDate;
  }, [submissionDate, currentWeekInfo]);

  // Real-time Duplicate Check
  useEffect(() => {
    if (!currentStudent || !surahNumber || !startAyah || !endAyah || !submissionDate) {
      setDuplicateWarning(null);
      return;
    }

    const duplicate = dailyMemorizationEntries.find(e => 
      e.studentId === currentStudent.id &&
      e.surahNumber === surahNumber &&
      e.reviewStatus !== 'requires_correction' &&
      (e.actualSubmissionDate === submissionDate || (e.sessionId === selectedSessionId && e.termId === selectedTermId && e.weekNumber === selectedWeekNumber)) &&
      (startAyah <= e.endAyah && endAyah >= e.startAyah)
    );

    setDuplicateWarning(duplicate || null);
  }, [currentStudent, surahNumber, startAyah, endAyah, submissionDate, selectedSessionId, selectedTermId, selectedWeekNumber, dailyMemorizationEntries]);

  // Synchronize start ayah when start page changes
  const handleStartPageChange = (p: number) => {
    const clamped = Math.max(currentSurah.startPage, Math.min(currentSurah.endPage, p));
    setStartPage(clamped);
    const ayahs = getAyahsOnPage(clamped).filter(a => a.surahNumber === currentSurah.number);
    if (ayahs.length > 0) {
      setStartAyah(ayahs[0].startAyah);
    }
    if (endPage < clamped) {
      setEndPage(clamped);
      if (ayahs.length > 0) {
        setEndAyah(ayahs[ayahs.length - 1].endAyah);
      }
    }
  };

  // Synchronize end page when end page changes
  const handleEndPageChange = (p: number) => {
    const clamped = Math.max(startPage, Math.min(currentSurah.endPage, p));
    setEndPage(clamped);
    const ayahs = getAyahsOnPage(clamped).filter(a => a.surahNumber === currentSurah.number);
    if (ayahs.length > 0) {
      setEndAyah(ayahs[ayahs.length - 1].endAyah);
    }
  };

  // Synchronize start ayah change
  const handleStartAyahChange = (a: number) => {
    const clamped = Math.max(1, Math.min(currentSurah.ayahCount, a));
    setStartAyah(clamped);
    const page = getPageForAyah(currentSurah.number, clamped);
    setStartPage(page);
    if (endAyah < clamped) {
      setEndAyah(clamped);
      setEndPage(page);
    }
  };

  // Synchronize end ayah change
  const handleEndAyahChange = (a: number) => {
    const clamped = Math.max(startAyah, Math.min(currentSurah.ayahCount, a));
    setEndAyah(clamped);
    const page = getPageForAyah(currentSurah.number, clamped);
    setEndPage(page);
  };

  // Fill form from Weekly Target
  const handleFillFromTarget = (rangeIndex = 0) => {
    if (!studentWeeklyTarget || studentWeeklyTarget.ranges.length === 0) return;
    const r = studentWeeklyTarget.ranges[rangeIndex] || studentWeeklyTarget.ranges[0];
    setSurahNumber(r.surahNumber);
    setStartPage(r.startPage);
    setStartAyah(r.startAyah);
    setEndPage(r.endPage);
    setEndAyah(r.endAyah);
    setFormSuccess(language === 'ar' ? `تم ملء النموذج من الهدف الأسبوعي: ${r.surahName}` : `Filled from Weekly Target: ${r.surahName}`);
    setTimeout(() => setFormSuccess(null), 3000);
  };

  // Quick feedback presets
  const feedbackPresets = language === 'ar' ? [
    'ما شاء الله، إتقان تام وتلاوة متصلة سليمة.',
    'انتباه لأحكام النون الساكنة والتنوين ومقدار الغنة.',
    'توضيح حروف القلقلة بدقة (قطب جد).',
    'إعادة مراجعة الآيات الأخيرة غداً للتمكين.',
    'تم إتقان المطلوب واجتياز الهدف الأسبوعي بنجاح.'
  ] : [
    "Masha'Allah, fluent recitation and good tajweed.",
    'Focus on Noon Sakinah rulings and 2-count ghunnah.',
    'Pronounce Qalqalah distinctly on stopping.',
    'Re-revise the last few ayahs tomorrow for fluency.',
    'Successfully mastered the target range!'
  ];

  // Submit memorization entry
  const handleSubmitEntry = (e: React.FormEvent, andAdvance = false) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!currentStudent) {
      setFormError('Please select a student.');
      return;
    }

    if (!rangeCalculation.valid) {
      setFormError(rangeCalculation.errors[0] || 'Invalid Qur’an range.');
      return;
    }

    // Determine target connection
    let matchedRangeId: string | undefined = undefined;
    if (studentWeeklyTarget) {
      const match = studentWeeklyTarget.ranges.find(r => 
        r.surahNumber === surahNumber && startAyah >= r.startAyah && endAyah <= r.endAyah
      );
      if (match) matchedRangeId = match.id;
    }

    const res = createDailyMemorizationEntry({
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentArabicName: currentStudent.arabicName,
      rollNumber: currentStudent.rollNumber,
      group: currentStudent.group,
      sessionId: selectedSessionId,
      sessionName: currentSession?.name || '2026/2027',
      termId: selectedTermId,
      termName: currentTerm ? (language === 'ar' ? currentTerm.nameAr : currentTerm.nameEn) : 'Term 1',
      weekNumber: selectedWeekNumber,
      dayOfWeek: dayOfWeekInfo.dayNameEn,
      dayOfWeekAr: dayOfWeekInfo.dayNameAr,
      surahNumber,
      surahName: currentSurah.name,
      surahArabicName: currentSurah.arabicName,
      startPage,
      startAyah,
      endPage,
      endAyah,
      totalAyahs: rangeCalculation.totalAyahs,
      totalPages: rangeCalculation.totalPagesCovered,
      juzNumber: currentSurah.juzNumber,
      isCrossPage: rangeCalculation.isCrossPage,
      actualSubmissionDate: submissionDate,
      isLateEntry: isLateEntryDetected,
      teacher: teacherName,
      reviewStatus,
      teacherFeedback,
      weeklyTargetId: studentWeeklyTarget?.id,
      targetRangeId: matchedRangeId,
      tajweedRating,
      mistakeCount: Number(mistakeCount) || 0
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to save memorization entry.');
      return;
    }

    const msg = language === 'ar' 
      ? `تم تسجيل الحفظ للطالب: ${currentStudent.arabicName || currentStudent.fullName} بنجاح!`
      : `Memorization entry recorded for ${currentStudent.fullName} successfully!`;
    
    setFormSuccess(msg);

    if (andAdvance) {
      // Advance to next student in halaqah
      if (currentStudentIndex < halaqahStudents.length - 1) {
        setTimeout(() => {
          setSelectedStudentId(halaqahStudents[currentStudentIndex + 1].id);
          setFormSuccess(null);
        }, 500);
      }
    } else {
      setTimeout(() => setFormSuccess(null), 4000);
    }
  };

  // Open correction modal for existing entry
  const handleOpenCorrection = (entry: DailyMemorizationEntry) => {
    setEntryToCorrect(entry);
    setCorrectionReason('');
    setCorrectionSurahNumber(entry.surahNumber);
    setCorrectionStartPage(entry.startPage);
    setCorrectionStartAyah(entry.startAyah);
    setCorrectionEndPage(entry.endPage);
    setCorrectionEndAyah(entry.endAyah);
    setCorrectionReviewStatus(entry.reviewStatus);
    setCorrectionFeedback(entry.teacherFeedback);
    setShowCorrectionAuditHistory(false);
    setIsCorrectionModalOpen(true);
  };

  // Save correction
  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryToCorrect) return;

    if (!correctionReason.trim()) {
      alert(language === 'ar' ? 'سبب التعديل إلزامي لتوثيق سجل التدقيق' : 'Correction reason is required for audit history.');
      return;
    }

    const cSurah = getSurahByNumber(correctionSurahNumber);
    const res = correctDailyMemorizationEntry(
      entryToCorrect.id,
      {
        surahNumber: correctionSurahNumber,
        surahName: cSurah?.name || entryToCorrect.surahName,
        surahArabicName: cSurah?.arabicName || entryToCorrect.surahArabicName,
        startPage: correctionStartPage,
        startAyah: correctionStartAyah,
        endPage: correctionEndPage,
        endAyah: correctionEndAyah,
        reviewStatus: correctionReviewStatus,
        teacherFeedback: correctionFeedback
      },
      correctionReason
    );

    if (!res.success) {
      alert(res.error || 'Failed to update entry.');
      return;
    }

    setIsCorrectionModalOpen(false);
    setEntryToCorrect(null);
  };

  // Delete entry
  const handleDeleteEntry = (entryId: string, studentName: string) => {
    if (window.confirm(language === 'ar' 
      ? `هل أنت متأكد من حذف سجل التسميع للطالب: ${studentName}؟` 
      : `Are you sure you want to delete this memorization entry for ${studentName}?`)) {
      deleteDailyMemorizationEntry(entryId);
    }
  };

  // Target progress calculation for current student
  const studentTargetProgress = useMemo(() => {
    if (!studentWeeklyTarget) return null;
    const acceptedSet = new Set<number>();
    
    dailyMemorizationEntries
      .filter(e => 
        e.studentId === studentWeeklyTarget.studentId &&
        e.sessionId === studentWeeklyTarget.sessionId &&
        e.termId === studentWeeklyTarget.termId &&
        e.weekNumber === studentWeeklyTarget.weekNumber &&
        e.reviewStatus === 'accepted'
      )
      .forEach(entry => {
        for (let a = entry.startAyah; a <= entry.endAyah; a++) {
          const inTarget = studentWeeklyTarget.ranges.some(r => 
            r.surahNumber === entry.surahNumber && a >= r.startAyah && a <= r.endAyah
          );
          if (inTarget) acceptedSet.add(a);
        }
      });

    const completed = acceptedSet.size;
    const total = studentWeeklyTarget.totalTargetAyahs || 1;
    const pct = Math.min(100, Math.round((completed / total) * 100));

    return {
      completed,
      total,
      pct,
      isComplete: completed >= total
    };
  }, [studentWeeklyTarget, dailyMemorizationEntries]);

  // Filtered recent entries for selected period
  const periodDailyEntries = useMemo(() => {
    return dailyMemorizationEntries.filter(e => 
      e.sessionId === selectedSessionId &&
      e.termId === selectedTermId &&
      e.weekNumber === selectedWeekNumber &&
      (groupFilter === 'all' || e.group === groupFilter)
    );
  }, [dailyMemorizationEntries, selectedSessionId, selectedTermId, selectedWeekNumber, groupFilter]);

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#1b110b] text-base flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-[#854d2b]" />
              <span>{language === 'ar' ? 'تسجيل التسميع والحفظ اليومي (Phase 5)' : 'Daily Qur’an Memorization Quick Entry'}</span>
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{language === 'ar' ? 'ربط مباشر بالهدف الأسبوعي' : 'Weekly Target Connected'}</span>
            </span>
          </div>
          <p className="text-xs text-[#7c695d] mt-1">
            {language === 'ar'
              ? 'تسجيل سريع لتسميع الطلاب مع دعم السور والصفحات والآيات المعتمدة واعتماد الحفظ وتوثيق السجل'
              : 'Record student daily memorization recitations, review submissions, and track progress toward weekly targets'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReferenceModalOpen(true)}
            className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#854d2b]" />
            <span>{language === 'ar' ? 'دليل المصحف (٦٠٤ ص)' : 'Browse Mushaf'}</span>
          </button>

          {onOpenWeeklyTargets && (
            <button
              onClick={() => onOpenWeeklyTargets(selectedStudentId)}
              className="bg-[#faf7f3] hover:bg-[#faedd9] text-[#854d2b] border border-[#df9b52]/40 text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Target className="h-4 w-4 text-[#854d2b]" />
              <span>{language === 'ar' ? 'عرض الأهداف الأسبوعية' : 'View Weekly Targets'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#635043] flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#854d2b]" />
            <span>{language === 'ar' ? 'الفترة الأكاديمية:' : 'Period:'}</span>
          </span>

          {/* Session */}
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              const sess = academicSessions.find(s => s.id === e.target.value);
              if (sess && sess.terms[0]) setSelectedTermId(sess.terms[0].id);
            }}
            className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b] font-semibold"
          >
            {academicSessions.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Term */}
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b] font-semibold"
          >
            {currentSession?.terms.map(t => (
              <option key={t.id} value={t.id}>{language === 'ar' ? t.nameAr : t.nameEn}</option>
            ))}
          </select>

          {/* Week */}
          <select
            value={selectedWeekNumber}
            onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
            className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b] font-bold"
          >
            {termWeeks.map(w => (
              <option key={w.weekNumber} value={w.weekNumber}>{w.label}</option>
            ))}
          </select>

          {/* Class / Group */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as any)}
            className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b]"
          >
            <option value="all">{language === 'ar' ? 'جميع الحلقات' : 'All Halaqahs'}</option>
            <option value="khaleelul_hussary">{getStudentGroupName('khaleelul_hussary', language)}</option>
            <option value="seddeq_minshawy">{getStudentGroupName('seddeq_minshawy', language)}</option>
            <option value="abdulbasit">{getStudentGroupName('abdulbasit', language)}</option>
          </select>
        </div>

        <div className="text-[11px] text-[#7c695d]">
          {language === 'ar' ? 'حدود الأسبوع:' : 'Dates:'}{' '}
          <strong className="text-[#1b110b]">{currentWeekInfo.startDate}</strong> {language === 'ar' ? 'إلى' : 'to'} <strong className="text-[#1b110b]">{currentWeekInfo.endDate}</strong>
        </div>
      </div>

      {/* Quick Student Navigation Carousel / Strip */}
      <div className="bg-[#faf7f3] p-3 rounded-xl border border-[#e5dad0] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#854d2b]" />
            <span className="text-xs font-bold text-[#1b110b]">
              {language === 'ar' ? 'التنقل السريع بين طلاب الحلقة:' : 'Quick Student Navigation:'}
            </span>
            <span className="text-[11px] text-[#7c695d]">
              ({currentStudentIndex + 1} / {halaqahStudents.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevStudent}
              disabled={currentStudentIndex <= 0}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                currentStudentIndex > 0
                  ? 'bg-white border-[#e5dad0] hover:bg-[#ede5dc] text-[#1b110b] cursor-pointer'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              title="Previous Student"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{language === 'ar' ? 'السابق' : 'Prev'}</span>
            </button>

            <button
              onClick={handleNextStudent}
              disabled={currentStudentIndex >= halaqahStudents.length - 1}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                currentStudentIndex < halaqahStudents.length - 1
                  ? 'bg-white border-[#e5dad0] hover:bg-[#ede5dc] text-[#1b110b] cursor-pointer'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              title="Next Student"
            >
              <span className="hidden sm:inline">{language === 'ar' ? 'التالي' : 'Next'}</span>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Student Carousel Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {halaqahStudents.map(student => {
            const isSelected = student.id === currentStudent?.id;
            const hasEntryToday = periodDailyEntries.some(e => e.studentId === student.id && e.actualSubmissionDate === submissionDate);
            const target = weeklyTargets.find(t => t.studentId === student.id && t.weekNumber === selectedWeekNumber);

            return (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border transition shrink-0 text-left rtl:text-right cursor-pointer ${
                  isSelected
                    ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317] shadow-xs'
                    : 'bg-white hover:bg-[#ede5dc] text-[#1b110b] border-[#e5dad0]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isSelected ? 'bg-[#df9b52] text-[#1b110b]' : 'bg-[#faedd9] text-[#854d2b]'
                }`}>
                  {student.rollNumber}
                </div>
                <div>
                  <span className="font-bold text-xs block leading-tight truncate max-w-[130px]">
                    {language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {hasEntryToday ? (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                        {language === 'ar' ? 'سمّع اليوم' : 'Recited'}
                      </span>
                    ) : (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                        isSelected ? 'bg-white/20 text-[#faedd9]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {target ? (language === 'ar' ? 'له هدف' : 'Target set') : (language === 'ar' ? 'بلا هدف' : 'No target')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quick Entry Form Card */}
      <div className="bg-white rounded-xl border border-[#e5dad0] shadow-2xs overflow-hidden">
        
        {/* Form Title & Student Spotlight */}
        <div className="p-4 bg-gradient-to-r from-[#faf7f3] to-white border-b border-[#e5dad0] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#faedd9] text-[#854d2b] font-bold text-lg flex items-center justify-center border-2 border-[#df9b52]/40 shrink-0">
              {currentStudent?.rollNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base text-[#1b110b]">
                  {language === 'ar' ? (currentStudent?.arabicName || currentStudent?.fullName) : currentStudent?.fullName}
                </h4>
                <span className="text-xs text-[#854d2b] font-serif font-bold">({currentStudent?.arabicName})</span>
                <span className="text-[11px] bg-[#faf7f3] border border-[#e5dad0] text-[#635043] px-2 py-0.5 rounded font-semibold">
                  {getStudentGroupName(currentStudent?.group || 'khaleelul_hussary', language)}
                </span>
              </div>
              <div className="text-xs text-[#7c695d] flex items-center gap-2 mt-0.5">
                <span>{currentSession?.name}</span>
                <span>•</span>
                <span>{currentTerm ? (language === 'ar' ? currentTerm.nameAr : currentTerm.nameEn) : 'Term 1'}</span>
                <span>•</span>
                <span className="font-bold text-[#1b110b]">
                  {language === 'ar' ? `الأسبوع ${selectedWeekNumber}` : `Week ${selectedWeekNumber}`}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Timestamp & Late Badge */}
          <div className="flex flex-col items-start md:items-end text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#854d2b]" />
              <span className="text-[#635043] font-medium">
                {language === 'ar' ? 'وقت توثيق السجل (الآن):' : 'Entry Timestamp:'}{' '}
                <strong className="text-[#1b110b] font-mono">{new Date().toLocaleTimeString()}</strong>
              </span>
            </div>
            {isLateEntryDetected && (
              <span className="mt-1 text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-700" />
                <span>{language === 'ar' ? 'تسجيل متأخر عن الأسبوع المحدد' : 'Late Submission Recorded'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Weekly Target Progress Callout */}
        {studentWeeklyTarget ? (
          <div className="p-3.5 bg-[#fdfaf6] border-b border-[#e5dad0]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#854d2b] flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    <span>{language === 'ar' ? 'الهدف الأسبوعي للطالب:' : 'Weekly Target Goal:'}</span>
                  </span>
                  {studentWeeklyTarget.ranges.map((r, idx) => (
                    <span key={idx} className="text-xs font-bold text-[#1b110b] bg-white border border-[#e5dad0] px-2 py-0.5 rounded">
                      {r.surahName} ({r.startAyah}–{r.endAyah}) • {r.totalAyahs} {language === 'ar' ? 'آية' : 'ayahs'}
                    </span>
                  ))}
                </div>
                {studentTargetProgress && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-32 bg-[#e5dad0] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${studentTargetProgress.pct}%` }}
                      />
                    </div>
                    <span className="font-bold text-emerald-800">
                      {studentTargetProgress.completed} / {studentTargetProgress.total} {language === 'ar' ? 'آية معتمدة' : 'accepted ayahs'} ({studentTargetProgress.pct}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Fill Button */}
              <button
                type="button"
                onClick={() => handleFillFromTarget(0)}
                className="bg-white hover:bg-[#faedd9] text-[#854d2b] border border-[#df9b52]/50 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#df9b52]" />
                <span>{language === 'ar' ? 'ملء من الهدف الأسبوعي' : 'Fill from Target'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50/50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
              <span>
                {language === 'ar' 
                  ? `لم يُحدد هدف أسبوعي للطالب في الأسبوع ${selectedWeekNumber}. يمكنك تسجيل التسميع وسيتم ربطه بسجل الطالب.` 
                  : `No weekly target assigned for this student in Week ${selectedWeekNumber}. Submission will be recorded directly.`}
              </span>
            </div>
            {onOpenWeeklyTargets && (
              <button
                type="button"
                onClick={() => onOpenWeeklyTargets(currentStudent?.id)}
                className="text-[#854d2b] hover:text-[#3b2317] font-bold text-xs underline cursor-pointer shrink-0"
              >
                {language === 'ar' ? '+ إسناد هدف أسبوعي' : '+ Set Target'}
              </button>
            )}
          </div>
        )}

        {/* Duplicate Warning Callout */}
        {duplicateWarning && (
          <div className="m-4 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
              <div>
                <strong className="block">
                  {language === 'ar' ? 'تنبيه: تكرار محتمل لنفس الآيات!' : 'Warning: Duplicate Submission Detected!'}
                </strong>
                <span>
                  {language === 'ar'
                    ? `الطالب مسجل له بالفعل تسميع لسورة ${duplicateWarning.surahName} (الآيات ${duplicateWarning.startAyah}–${duplicateWarning.endAyah}) بتاريخ ${duplicateWarning.actualSubmissionDate}.`
                    : `This student already has an entry for ${duplicateWarning.surahName} (Ayahs ${duplicateWarning.startAyah}–${duplicateWarning.endAyah}) on ${duplicateWarning.actualSubmissionDate}.`}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCorrection(duplicateWarning)}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
            >
              {language === 'ar' ? 'تعديل السجل السابق' : 'Edit Existing Entry'}
            </button>
          </div>
        )}

        {/* Success & Error alerts */}
        {formSuccess && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="m-4 p-3 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2 text-xs text-red-900 font-bold">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmitEntry(e, false)} className="p-4 space-y-4">
          
          {/* Row 1: Dates & Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Actual Submission Date */}
            <div>
              <label className="font-bold text-[#635043] block mb-1 text-xs">
                {language === 'ar' ? 'تاريخ التسميع الفعلي (Actual Submission Date):*' : 'Actual Submission Date:*'}
              </label>
              <input
                type="date"
                required
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-semibold text-xs focus:ring-1 focus:ring-[#854d2b]"
              />
              <span className="text-[10px] text-[#7c695d] mt-0.5 block">
                {dayOfWeekInfo.dayNameEn} ({dayOfWeekInfo.dayNameAr})
              </span>
            </div>

            {/* Teacher Name */}
            <div>
              <label className="font-bold text-[#635043] block mb-1 text-xs">
                {language === 'ar' ? 'المعلم الفاحص (Teacher):*' : 'Reviewing Teacher:*'}
              </label>
              <input
                type="text"
                readOnly
                value={teacherName}
                className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b] font-semibold text-xs"
              />
            </div>

            {/* Review Status Radio Selector */}
            <div>
              <label className="font-bold text-[#635043] block mb-1 text-xs">
                {language === 'ar' ? 'حالة الاعتماد (Review Status):*' : 'Review Status:*'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setReviewStatus('awaiting_review')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold text-center transition cursor-pointer ${
                    reviewStatus === 'awaiting_review'
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                      : 'bg-white border-[#e5dad0] text-[#635043] hover:bg-[#faf7f3]'
                  }`}
                >
                  {language === 'ar' ? 'قيد المراجعة' : 'Awaiting'}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus('accepted')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold text-center transition cursor-pointer ${
                    reviewStatus === 'accepted'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-2xs'
                      : 'bg-white border-[#e5dad0] text-[#635043] hover:bg-[#faf7f3]'
                  }`}
                >
                  {language === 'ar' ? 'معتمد ومقبول' : 'Accepted'}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus('requires_correction')}
                  className={`p-1.5 rounded-lg border text-[11px] font-bold text-center transition cursor-pointer ${
                    reviewStatus === 'requires_correction'
                      ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-2xs'
                      : 'bg-white border-[#e5dad0] text-[#635043] hover:bg-[#faf7f3]'
                  }`}
                >
                  {language === 'ar' ? 'يحتاج تصحيح' : 'Correction'}
                </button>
              </div>
              <span className="text-[10px] text-[#7c695d] mt-1 block">
                {reviewStatus === 'accepted'
                  ? (language === 'ar' ? '✓ يُحتسب ضمن الآيات المنجزة للهدف الأسبوعي' : '✓ Counts toward weekly target completion')
                  : (language === 'ar' ? '✕ لا يُحتسب حتى يتم الاعتماد والقبول' : '✕ Does not count until accepted')}
              </span>
            </div>
          </div>

          {/* Row 2: Qur'an Range Dropdowns */}
          <div className="bg-[#faf7f3] p-3.5 rounded-xl border border-[#e5dad0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1b110b] flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#854d2b]" />
                <span>{language === 'ar' ? 'النطاق القرآني للتسميع (سورة • صفحة • آية):' : 'Qur’an Recitation Range Selection:'}</span>
              </span>

              {rangeCalculation.valid && (
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                  {rangeCalculation.totalAyahs} {language === 'ar' ? 'آية' : 'ayahs'} • {rangeCalculation.startPage === rangeCalculation.endPage ? `ص ${rangeCalculation.startPage}` : `ص ${rangeCalculation.startPage}–${rangeCalculation.endPage}`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {/* Surah Dropdown */}
              <div className="sm:col-span-5">
                <label className="font-bold text-[#635043] block mb-1 text-xs">
                  {language === 'ar' ? 'السورة:*' : 'Surah:*'}
                </label>
                <select
                  value={surahNumber}
                  onChange={(e) => {
                    const sNum = Number(e.target.value);
                    setSurahNumber(sNum);
                    const s = getSurahByNumber(sNum);
                    if (s) {
                      setStartPage(s.startPage);
                      setStartAyah(1);
                      setEndPage(s.startPage);
                      setEndAyah(Math.min(10, s.ayahCount));
                    }
                  }}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold text-xs focus:ring-1 focus:ring-[#854d2b]"
                >
                  {VERIFIED_SURAHS.map(s => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.arabicName}) — {s.ayahCount} {language === 'ar' ? 'آية' : 'Ayahs'} • {language === 'ar' ? `ص ${s.startPage}` : `p. ${s.startPage}`} • {language === 'ar' ? `الجزء ${s.juzNumber}` : `Juz ${s.juzNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starting Page */}
              <div className="sm:col-span-1">
                <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                  {language === 'ar' ? 'صفحة البداية:*' : 'Starting Page:*'}
                </label>
                <select
                  value={startPage}
                  onChange={(e) => handleStartPageChange(Number(e.target.value))}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-mono text-xs font-bold"
                >
                  {Array.from({ length: currentSurah.endPage - currentSurah.startPage + 1 }, (_, i) => currentSurah.startPage + i).map(p => (
                    <option key={p} value={p}>
                      {language === 'ar' ? `صفحة ${p}` : `Page ${p}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starting Ayah */}
              <div className="sm:col-span-1">
                <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                  {language === 'ar' ? 'من آية:*' : 'Starting Ayah:*'}
                </label>
                <select
                  value={startAyah}
                  onChange={(e) => handleStartAyahChange(Number(e.target.value))}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold text-xs"
                >
                  {Array.from({ length: currentSurah.ayahCount }, (_, i) => i + 1).map(a => (
                    <option key={a} value={a}>
                      {language === 'ar' ? `آية ${a}` : `Ayah ${a}`} ({language === 'ar' ? `ص ${getPageForAyah(currentSurah.number, a)}` : `p. ${getPageForAyah(currentSurah.number, a)}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ending Page */}
              <div className="sm:col-span-1">
                <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                  {language === 'ar' ? 'صفحة النهاية:*' : 'Ending Page:*'}
                </label>
                <select
                  value={endPage}
                  onChange={(e) => handleEndPageChange(Number(e.target.value))}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-mono text-xs font-bold"
                >
                  {Array.from({ length: currentSurah.endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
                    <option key={p} value={p}>
                      {language === 'ar' ? `صفحة ${p}` : `Page ${p}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ending Ayah */}
              <div className="sm:col-span-1">
                <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                  {language === 'ar' ? 'إلى آية:*' : 'Ending Ayah:*'}
                </label>
                <select
                  value={endAyah}
                  onChange={(e) => handleEndAyahChange(Number(e.target.value))}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold text-xs"
                >
                  {Array.from({ length: currentSurah.ayahCount - startAyah + 1 }, (_, i) => startAyah + i).map(a => (
                    <option key={a} value={a}>
                      {language === 'ar' ? `آية ${a}` : `Ayah ${a}`} ({language === 'ar' ? `ص ${getPageForAyah(currentSurah.number, a)}` : `p. ${getPageForAyah(currentSurah.number, a)}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Range Scope Summary */}
              <div className="sm:col-span-1 flex flex-col justify-end">
                <div className="p-2 bg-white border border-[#e5dad0] rounded-lg text-center">
                  <span className="text-[10px] text-[#7c695d] block">
                    {language === 'ar' ? 'إجمالي التسميع' : 'Scope'}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {rangeCalculation.totalAyahs} {language === 'ar' ? 'آية' : 'ayahs'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Evaluation Details & Teacher Feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tajweed Rating */}
            <div>
              <label className="font-bold text-[#635043] block mb-1 text-xs">
                {language === 'ar' ? 'تقييم التجويد والأداء:' : 'Tajweed Rating:'}
              </label>
              <select
                value={tajweedRating}
                onChange={(e) => setTajweedRating(e.target.value as any)}
                className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-semibold text-xs"
              >
                <option value="mumtaz">{language === 'ar' ? 'ممتاز (Mumtaz)' : 'Mumtaz (Excellent)'}</option>
                <option value="jayyid_jiddan">{language === 'ar' ? 'جيد جداً (Jayyid Jiddan)' : 'Jayyid Jiddan (Very Good)'}</option>
                <option value="jayyid">{language === 'ar' ? 'جيد (Jayyid)' : 'Jayyid (Good)'}</option>
                <option value="maqbool">{language === 'ar' ? 'مقبول (Maqbool)' : 'Maqbool (Pass)'}</option>
                <option value="daeef">{language === 'ar' ? 'ضعيف (Da’eef)' : 'Da’eef (Needs Work)'}</option>
              </select>
            </div>

            {/* Mistakes count */}
            <div>
              <label className="font-bold text-[#635043] block mb-1 text-xs">
                {language === 'ar' ? 'عدد الترددات/الأخطاء:' : 'Mistakes / Stumbles:'}
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={mistakeCount}
                onChange={(e) => setMistakeCount(Number(e.target.value))}
                className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] text-xs font-bold"
              />
            </div>

            {/* Teacher Feedback with Quick Presets */}
            <div className="sm:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#635043] text-xs">
                  {language === 'ar' ? 'ملاحظات وتوجيهات المعلم (Teacher Feedback):' : 'Teacher Feedback & Notes:'}
                </label>
                <span className="text-[10px] text-[#8c7464]">
                  {language === 'ar' ? 'عبارات سريعة:' : 'Quick Presets:'}
                </span>
              </div>
              <textarea
                rows={2}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب ملاحظات التوجيه أو اختر من العبارات السريعة أدناه...' : 'Enter feedback or select preset below...'}
                className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] text-xs"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {feedbackPresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setTeacherFeedback(preset)}
                    className="text-[10px] bg-[#faf7f3] hover:bg-[#faedd9] text-[#635043] border border-[#e5dad0] px-2 py-0.5 rounded cursor-pointer transition truncate max-w-xs"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-3 border-t border-[#e5dad0] flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-[#7c695d]">
              {language === 'ar'
                ? 'يتم توثيق الطابع الزمني وتحديث نسبة إنجاز الهدف الأسبوعي فوراً عند الاعتماد'
                : 'Timestamp recorded & weekly target progress automatically updated upon acceptance'}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto bg-white hover:bg-[#ede5dc] text-[#3b2317] border border-[#e5dad0] text-xs font-bold px-4 py-2.5 sm:py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs min-h-[44px] sm:min-h-0"
              >
                <Save className="h-4 w-4 text-[#854d2b]" />
                <span>{language === 'ar' ? 'حفظ السجل' : 'Save Entry'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmitEntry(e, true)}
                className="w-full sm:w-auto bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-5 py-2.5 sm:py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[44px] sm:min-h-0"
              >
                <CheckCircle className="h-4 w-4 text-[#df9b52]" />
                <span>{language === 'ar' ? 'حفظ والانتقال للطالب التالي ←' : 'Save & Next Student →'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Period Submissions History Table */}
      <div className="bg-white rounded-xl border border-[#e5dad0] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#e5dad0] bg-[#faf7f3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#854d2b]" />
            <h4 className="font-bold text-xs text-[#1b110b]">
              {language === 'ar' 
                ? `سجل التسميع اليومي المسجل في الأسبوع ${selectedWeekNumber} (${periodDailyEntries.length} سجلات)`
                : `Recorded Submissions in Week ${selectedWeekNumber} (${periodDailyEntries.length} entries)`}
            </h4>
          </div>

          <span className="text-xs text-[#7c695d]">
            {language === 'ar'
              ? `المعتمدة: ${periodDailyEntries.filter(e => e.reviewStatus === 'accepted').length} • بانتظار المراجعة: ${periodDailyEntries.filter(e => e.reviewStatus === 'awaiting_review').length}`
              : `Accepted: ${periodDailyEntries.filter(e => e.reviewStatus === 'accepted').length} • Awaiting: ${periodDailyEntries.filter(e => e.reviewStatus === 'awaiting_review').length}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#f5ede4] border-b border-[#e5dad0] text-[#635043]">
                <th className="py-2.5 px-3 font-semibold">{t('students')}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'اليوم والتاريخ' : 'Day & Date'}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'وقت الإدخال' : 'Entry Time'}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'السورة والآيات' : 'Surah & Ayahs'}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'الصفحات' : 'Pages'}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'المجموع' : 'Scope'}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'حالة الاعتماد' : 'Review Status'}</th>
                <th className="py-2.5 px-3 font-semibold">{language === 'ar' ? 'المعلم والتوجيهات' : 'Feedback'}</th>
                <th className="py-2.5 px-3 font-semibold text-right rtl:text-left">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e6dc]">
              {periodDailyEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-[#faf7f3] transition">
                  {/* Student */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#faedd9] text-[#854d2b] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {entry.rollNumber || '•'}
                      </span>
                      <span className="font-bold text-[#1b110b]">
                        {language === 'ar' ? (entry.studentArabicName || entry.studentName) : entry.studentName}
                      </span>
                    </div>
                  </td>

                  {/* Day & Submission Date */}
                  <td className="py-2.5 px-3">
                    <div>
                      <span className="font-bold text-[#1b110b] block">
                        {language === 'ar' ? (entry.dayOfWeekAr || entry.dayOfWeek) : entry.dayOfWeek}
                      </span>
                      <span className="text-[10px] text-[#7c695d]">
                        {entry.actualSubmissionDate}
                      </span>
                      {entry.isLateEntry && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-bold block mt-0.5">
                          {language === 'ar' ? 'متأخر' : 'Late'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Entry Timestamp */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#7c695d]">
                    {entry.entryTimestamp ? new Date(entry.entryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>

                  {/* Surah & Ayahs */}
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#1b110b]">
                      {entry.surahName} ({entry.startAyah}–{entry.endAyah})
                    </span>
                    <span className="text-[10px] text-[#854d2b] block font-serif">
                      {entry.surahArabicName}
                    </span>
                  </td>

                  {/* Pages */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#635043]">
                    {entry.startPage === entry.endPage ? `p. ${entry.startPage}` : `pp. ${entry.startPage}–${entry.endPage}`}
                  </td>

                  {/* Total Ayahs */}
                  <td className="py-2.5 px-3 font-bold text-emerald-800">
                    {entry.totalAyahs} {language === 'ar' ? 'آية' : 'ayahs'}
                  </td>

                  {/* Review Status */}
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      entry.reviewStatus === 'accepted'
                        ? 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]'
                        : entry.reviewStatus === 'awaiting_review'
                        ? 'bg-[#fef9ee] text-[#a46312] border border-[#fbe4b4]'
                        : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
                    }`}>
                      {entry.reviewStatus === 'accepted' && <CheckCircle className="h-3 w-3" />}
                      {entry.reviewStatus === 'awaiting_review' && <Clock className="h-3 w-3" />}
                      {entry.reviewStatus === 'requires_correction' && <AlertCircle className="h-3 w-3" />}
                      <span>{entry.reviewStatus.toUpperCase()}</span>
                    </span>
                  </td>

                  {/* Teacher Feedback */}
                  <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-[#635043]" title={entry.teacherFeedback}>
                    {entry.teacherFeedback || '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right rtl:text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenCorrection(entry)}
                        className="text-[#854d2b] hover:text-[#5c351f] bg-[#faedd9] hover:bg-[#f3dfbf] p-1.5 rounded transition cursor-pointer"
                        title={language === 'ar' ? 'تصحيح السجل (توثيق التدقيق)' : 'Correct Entry (Audit Trail)'}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteEntry(entry.id, entry.studentName)}
                        className="text-[#8c7464] hover:text-red-700 p-1.5 rounded transition cursor-pointer"
                        title={language === 'ar' ? 'حذف السجل' : 'Delete Entry'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {periodDailyEntries.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#7c695d]">
                    {language === 'ar' ? 'لا توجد سجلات تسميع مسجلة في هذا الأسبوع بعد' : 'No memorization records found for this week.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorized Correction Modal */}
      {isCorrectionModalOpen && entryToCorrect && (
        <div className="fixed inset-0 z-50 bg-[#1b110b]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            dir={isRTL ? 'rtl' : 'ltr'}
            className="bg-white rounded-2xl max-w-xl w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-8"
          >
            <form onSubmit={handleSaveCorrection}>
              <div className="bg-[#2a170d] text-white p-4 flex items-center justify-between border-b border-[#3b2317]">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-[#df9b52]" />
                  <h3 className="font-bold text-sm text-[#faedd9]">
                    {language === 'ar' ? 'تصحيح معتمد لسجل التسميع (Audit Correction)' : 'Authorized Memorization Record Correction'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="text-gray-300 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3.5">
                <div className="p-2.5 bg-[#faf7f3] border border-[#e5dad0] rounded-lg text-xs">
                  <span className="text-[#7c695d]">{language === 'ar' ? 'الطالب المستهدف:' : 'Student:'} </span>
                  <strong className="text-[#1b110b]">{entryToCorrect.studentName}</strong>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-[#7c695d]">{language === 'ar' ? 'تاريخ التسميع:' : 'Date:'} </span>
                  <strong className="text-[#1b110b]">{entryToCorrect.actualSubmissionDate}</strong>
                </div>

                {/* Mandatory Correction Reason */}
                <div>
                  <label className="font-bold text-[#1b110b] block mb-1 text-xs">
                    {language === 'ar' ? 'سبب التصحيح المعتمد (إلزامي للتوثيق):*' : 'Authorized Correction Reason (Required for Audit Trail):*'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'مثال: إعادة تسميع الآيات بإتقان، أو تصحيح رقم الآية...' : 'e.g. Student re-recited with tajweed corrections, or adjusted boundary...'}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full p-2 border border-amber-300 rounded-lg bg-amber-50/40 text-[#1b110b] text-xs font-semibold"
                  />
                </div>

                {/* Corrected Surah and Ayahs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="col-span-2 sm:col-span-4">
                    <label className="font-bold text-[#635043] block mb-1 text-xs">{language === 'ar' ? 'السورة:' : 'Surah:'}</label>
                    <select
                      value={correctionSurahNumber}
                      onChange={(e) => {
                        const sNum = Number(e.target.value);
                        setCorrectionSurahNumber(sNum);
                        const s = getSurahByNumber(sNum);
                        if (s) {
                          setCorrectionStartPage(s.startPage);
                          setCorrectionStartAyah(1);
                          setCorrectionEndPage(s.startPage);
                          setCorrectionEndAyah(Math.min(10, s.ayahCount));
                        }
                      }}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-xs font-bold"
                    >
                      {VERIFIED_SURAHS.map(s => (
                        <option key={s.number} value={s.number}>{s.number}. {s.name} ({s.arabicName})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#635043] block mb-1 text-[11px]">{language === 'ar' ? 'من آية:*' : 'Start Ayah:*'}</label>
                    <select
                      value={correctionStartAyah}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCorrectionStartAyah(v);
                        setCorrectionStartPage(getPageForAyah(correctionSurahNumber, v));
                        if (correctionEndAyah < v) {
                          setCorrectionEndAyah(v);
                          setCorrectionEndPage(getPageForAyah(correctionSurahNumber, v));
                        }
                      }}
                      className="w-full p-1.5 border border-[#e5dad0] rounded-lg text-xs"
                    >
                      {Array.from({ length: correctionSurah.ayahCount }, (_, i) => i + 1).map(a => (
                        <option key={a} value={a}>
                          {language === 'ar' ? `آية ${a}` : `Ayah ${a}`} ({language === 'ar' ? `ص ${getPageForAyah(correctionSurahNumber, a)}` : `p. ${getPageForAyah(correctionSurahNumber, a)}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#635043] block mb-1 text-[11px]">{language === 'ar' ? 'إلى آية:*' : 'End Ayah:*'}</label>
                    <select
                      value={correctionEndAyah}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCorrectionEndAyah(v);
                        setCorrectionEndPage(getPageForAyah(correctionSurahNumber, v));
                      }}
                      className="w-full p-1.5 border border-[#e5dad0] rounded-lg text-xs"
                    >
                      {Array.from({ length: correctionSurah.ayahCount - correctionStartAyah + 1 }, (_, i) => correctionStartAyah + i).map(a => (
                        <option key={a} value={a}>
                          {language === 'ar' ? `آية ${a}` : `Ayah ${a}`} ({language === 'ar' ? `ص ${getPageForAyah(correctionSurahNumber, a)}` : `p. ${getPageForAyah(correctionSurahNumber, a)}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#635043] block mb-1 text-[11px]">{language === 'ar' ? 'صفحة البداية:' : 'Start Page:'}</label>
                    <select
                      value={correctionStartPage}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setCorrectionStartPage(p);
                        const ayahs = getAyahsOnPage(p).filter(a => a.surahNumber === correctionSurahNumber);
                        if (ayahs.length > 0) {
                          setCorrectionStartAyah(ayahs[0].startAyah);
                        }
                      }}
                      className="w-full p-1.5 border border-[#e5dad0] rounded-lg bg-white text-xs font-mono"
                    >
                      {Array.from({ length: correctionSurah.endPage - correctionSurah.startPage + 1 }, (_, i) => correctionSurah.startPage + i).map(p => (
                        <option key={p} value={p}>{language === 'ar' ? `صفحة ${p}` : `Page ${p}`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#635043] block mb-1 text-[11px]">{language === 'ar' ? 'صفحة النهاية:' : 'End Page:'}</label>
                    <select
                      value={correctionEndPage}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setCorrectionEndPage(p);
                        const ayahs = getAyahsOnPage(p).filter(a => a.surahNumber === correctionSurahNumber);
                        if (ayahs.length > 0) {
                          setCorrectionEndAyah(ayahs[ayahs.length - 1].endAyah);
                        }
                      }}
                      className="w-full p-1.5 border border-[#e5dad0] rounded-lg bg-white text-xs font-mono"
                    >
                      {Array.from({ length: correctionSurah.endPage - correctionStartPage + 1 }, (_, i) => correctionStartPage + i).map(p => (
                        <option key={p} value={p}>{language === 'ar' ? `صفحة ${p}` : `Page ${p}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status and Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-[#635043] block mb-1 text-xs">{language === 'ar' ? 'حالة المراجعة:' : 'Review Status:'}</label>
                    <select
                      value={correctionReviewStatus}
                      onChange={(e) => setCorrectionReviewStatus(e.target.value as any)}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg text-xs font-bold"
                    >
                      <option value="awaiting_review">{language === 'ar' ? 'قيد المراجعة' : 'Awaiting Review'}</option>
                      <option value="accepted">{language === 'ar' ? 'معتمد ومقبول' : 'Accepted'}</option>
                      <option value="requires_correction">{language === 'ar' ? 'بحاجة إلى تصحيح' : 'Requires Correction'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#635043] block mb-1 text-xs">{language === 'ar' ? 'توجيهات المعلم:' : 'Feedback:'}</label>
                    <input
                      type="text"
                      value={correctionFeedback}
                      onChange={(e) => setCorrectionFeedback(e.target.value)}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Audit Trail History Accordion */}
                <div className="pt-2 border-t border-[#e5dad0]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#635043]">
                      {language === 'ar' ? 'سجل التدقيق والتعديلات السابقة:' : 'Previous Audit Trail Entries:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCorrectionAuditHistory(!showCorrectionAuditHistory)}
                      className="text-[11px] text-[#854d2b] font-semibold underline cursor-pointer"
                    >
                      {showCorrectionAuditHistory ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'عرض السجل' : 'View History')}
                    </button>
                  </div>

                  {showCorrectionAuditHistory && (
                    <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto border border-[#e5dad0] rounded-lg p-2 bg-[#faf7f3] text-[11px]">
                      {entryToCorrect.auditTrail.map(audit => (
                        <div key={audit.id} className="bg-white p-1.5 rounded border border-[#e5dad0]">
                          <div className="flex items-center justify-between font-bold">
                            <span>{audit.action.toUpperCase()} by {audit.modifiedBy}</span>
                            <span className="text-[#8c7464] font-mono">{new Date(audit.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-[#635043]">{audit.changeSummary}</p>
                          {audit.reason && <p className="text-amber-800 italic">Reason: {audit.reason}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#faf7f3] border-t border-[#e5dad0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-1.5 border border-[#e5dad0] rounded-lg text-xs font-semibold text-[#635043] hover:bg-white transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-4 py-1.5 rounded-lg transition cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ التصحيح وتوثيق التدقيق' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reference Browser Modal */}
      <QuranReferenceBrowserModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />

    </div>
  );
};
