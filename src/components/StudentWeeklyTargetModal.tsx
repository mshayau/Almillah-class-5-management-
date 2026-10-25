import React, { useState, useEffect, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Student, 
  StudentWeeklyTarget, 
  TargetQuranRange, 
  TargetStatus,
  StudentGroup 
} from '../types';
import { 
  VERIFIED_SURAHS, 
  getPageForAyah, 
  getAyahsOnPage,
  validateAndCalculateQuranRange,
  getSurahByNumber 
} from '../data/quranReferenceData';
import { getStudentGroupName } from '../data/studentGroups';
import { 
  Target, 
  Calendar, 
  Layers, 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  History, 
  Edit3, 
  UserCheck, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface StudentWeeklyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudentId?: string;
  initialTarget?: StudentWeeklyTarget | null;
  initialSessionId?: string;
  initialTermId?: string;
  initialWeekNumber?: number;
}

export const StudentWeeklyTargetModal: React.FC<StudentWeeklyTargetModalProps> = ({
  isOpen,
  onClose,
  initialStudentId,
  initialTarget,
  initialSessionId,
  initialTermId,
  initialWeekNumber
}) => {
  const { 
    students, 
    academicSessions, 
    activeSession, 
    activeTerm, 
    activeInstructionalWeeks,
    weeklyTargets,
    createWeeklyTarget,
    amendWeeklyTarget
  } = useClass();

  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // Workflow Step 1: Academic Session
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialTarget?.sessionId || initialSessionId || activeSession?.id || academicSessions[0]?.id || ''
  );

  const currentSession = useMemo(() => {
    return academicSessions.find(s => s.id === selectedSessionId) || activeSession || academicSessions[0];
  }, [academicSessions, selectedSessionId, activeSession]);

  // Workflow Step 2: Term
  const [selectedTermId, setSelectedTermId] = useState<string>(
    initialTarget?.termId || initialTermId || activeTerm?.id || currentSession?.terms[0]?.id || ''
  );

  const currentTerm = useMemo(() => {
    if (!currentSession) return activeTerm;
    return currentSession.terms.find(t => t.id === selectedTermId) || currentSession.terms[0];
  }, [currentSession, selectedTermId, activeTerm]);

  // Workflow Step 3: Week Number
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(
    initialTarget?.weekNumber || initialWeekNumber || 2
  );

  // Available weeks for current term
  const termWeeks = useMemo(() => {
    if (!currentSession || !currentTerm) return activeInstructionalWeeks;
    const count = currentTerm.instructionalWeeksCount || 16;
    const weeks: { weekNumber: number; label: string; startDate: string; endDate: string }[] = [];
    
    // Attempt to match activeInstructionalWeeks if current term
    if (currentTerm.id === activeTerm?.id && activeInstructionalWeeks.length > 0) {
      return activeInstructionalWeeks.map(w => ({
        weekNumber: w.weekNumber,
        label: language === 'ar' ? w.labelAr : w.labelEn,
        startDate: w.startDate,
        endDate: w.endDate
      }));
    }

    // Otherwise generate clean week boundaries based on term start date
    const tStart = new Date(currentTerm.startDate || '2026-08-29');
    for (let w = 1; w <= count; w++) {
      const wStart = new Date(tStart);
      wStart.setDate(tStart.getDate() + (w - 1) * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 4); // Sat to Wed

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

  const selectedWeekInfo = useMemo(() => {
    return termWeeks.find(w => w.weekNumber === selectedWeekNumber) || termWeeks[0] || {
      weekNumber: selectedWeekNumber,
      label: `Week ${selectedWeekNumber}`,
      startDate: currentTerm?.startDate || '2026-09-05',
      endDate: currentTerm?.endDate || '2026-09-09'
    };
  }, [termWeeks, selectedWeekNumber, currentTerm]);

  // Workflow Step 4: Class or Group Filter & Student(s)
  const [groupFilter, setGroupFilter] = useState<StudentGroup | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialTarget?.studentId || initialStudentId || students[0]?.id || ''
  );
  
  // Optional multi-select for batch creation
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);

  // Workflow Step 5: Define exact Qur'an ranges (supports multiple ranges & different Surahs)
  const [ranges, setRanges] = useState<Omit<TargetQuranRange, 'id'>[]>([
    {
      surahNumber: 78,
      surahName: 'An-Naba',
      surahArabicName: 'النبأ',
      startPage: 582,
      startAyah: 1,
      endPage: 582,
      endAyah: 20,
      totalAyahs: 20,
      isCrossPage: false,
      notes: ''
    }
  ]);

  // Target Parameters
  const [assignmentDeadline, setAssignmentDeadline] = useState<string>(
    initialTarget?.assignmentDeadline || selectedWeekInfo.endDate || '2026-09-09'
  );
  const [targetNotes, setTargetNotes] = useState<string>(initialTarget?.notes || '');
  const [targetStatus, setTargetStatus] = useState<TargetStatus>(initialTarget?.status || 'assigned');
  const [amendmentReason, setAmendmentReason] = useState<string>('');

  // UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [showAuditHistory, setShowAuditHistory] = useState<boolean>(false);

  // Sync state if initialTarget is provided
  useEffect(() => {
    if (initialTarget) {
      setSelectedSessionId(initialTarget.sessionId);
      setSelectedTermId(initialTarget.termId);
      setSelectedWeekNumber(initialTarget.weekNumber);
      setSelectedStudentId(initialTarget.studentId);
      setRanges(initialTarget.ranges.map(r => ({
        surahNumber: r.surahNumber,
        surahName: r.surahName,
        surahArabicName: r.surahArabicName,
        startPage: r.startPage,
        startAyah: r.startAyah,
        endPage: r.endPage,
        endAyah: r.endAyah,
        totalAyahs: r.totalAyahs,
        isCrossPage: r.isCrossPage,
        notes: r.notes || ''
      })));
      setAssignmentDeadline(initialTarget.assignmentDeadline);
      setTargetNotes(initialTarget.notes || '');
      setTargetStatus(initialTarget.status);
    } else {
      if (initialStudentId) setSelectedStudentId(initialStudentId);
      if (initialWeekNumber) setSelectedWeekNumber(initialWeekNumber);
    }
  }, [initialTarget, initialStudentId, initialWeekNumber]);

  // Update deadline when week changes if not explicitly overridden
  useEffect(() => {
    if (!initialTarget && selectedWeekInfo?.endDate) {
      setAssignmentDeadline(selectedWeekInfo.endDate);
    }
  }, [selectedWeekInfo, initialTarget]);

  // Filter students based on groupFilter
  const filteredStudents = useMemo(() => {
    if (groupFilter === 'all') return students;
    return students.filter(s => s.group === groupFilter);
  }, [students, groupFilter]);

  // Anti-duplication check: Is there already a target for this student and week?
  const existingDuplicateTarget = useMemo(() => {
    if (initialTarget) return null; // Editing existing target is an amendment, not duplicate
    return weeklyTargets.find(t => 
      t.studentId === selectedStudentId &&
      t.sessionId === selectedSessionId &&
      t.termId === selectedTermId &&
      t.weekNumber === selectedWeekNumber
    );
  }, [weeklyTargets, initialTarget, selectedStudentId, selectedSessionId, selectedTermId, selectedWeekNumber]);

  // Workflow Step 6: Validate all ranges against verified Qur'an reference dataset
  const validatedRanges = useMemo(() => {
    return ranges.map((r, index) => {
      const calc = validateAndCalculateQuranRange(
        r.surahNumber,
        r.startAyah,
        r.surahNumber,
        r.endAyah
      );

      return {
        ...r,
        index,
        isValid: calc.valid,
        errors: calc.errors,
        calculatedTotalAyahs: calc.totalAyahs,
        calculatedStartPage: calc.startPage,
        calculatedEndPage: calc.endPage,
        isCrossPage: calc.isCrossPage
      };
    });
  }, [ranges]);

  const allRangesValid = useMemo(() => {
    return validatedRanges.length > 0 && validatedRanges.every(r => r.isValid);
  }, [validatedRanges]);

  const totalTargetAyahs = useMemo(() => {
    return validatedRanges.reduce((sum, r) => sum + (r.isValid ? r.calculatedTotalAyahs : 0), 0);
  }, [validatedRanges]);

  const totalTargetPages = useMemo(() => {
    const pageSet = new Set<number>();
    validatedRanges.forEach(r => {
      if (r.isValid) {
        for (let p = r.calculatedStartPage; p <= r.calculatedEndPage; p++) {
          pageSet.add(p);
        }
      }
    });
    return pageSet.size;
  }, [validatedRanges]);

  // Handlers for modifying range list
  const handleAddRange = () => {
    // Default to the next Surah or next Ayah chunk
    const lastRange = ranges[ranges.length - 1];
    let nextSurahNum = lastRange ? lastRange.surahNumber : 78;
    const curSurah = getSurahByNumber(nextSurahNum);
    
    // If last range completed the surah, advance to next surah
    if (lastRange && curSurah && lastRange.endAyah >= curSurah.ayahCount) {
      nextSurahNum = Math.min(114, nextSurahNum + 1);
    }

    const nextSurah = getSurahByNumber(nextSurahNum) || VERIFIED_SURAHS[0];
    const sPage = getPageForAyah(nextSurah.number, 1);

    setRanges([
      ...ranges,
      {
        surahNumber: nextSurah.number,
        surahName: nextSurah.name,
        surahArabicName: nextSurah.arabicName,
        startPage: sPage,
        startAyah: 1,
        endPage: sPage,
        endAyah: Math.min(15, nextSurah.ayahCount),
        totalAyahs: Math.min(15, nextSurah.ayahCount),
        isCrossPage: false,
        notes: ''
      }
    ]);
  };

  const handleRemoveRange = (index: number) => {
    if (ranges.length <= 1) return;
    setRanges(ranges.filter((_, idx) => idx !== index));
  };

  const handleRangeSurahChange = (index: number, surahNum: number) => {
    const s = getSurahByNumber(surahNum);
    if (!s) return;

    const sPage = getPageForAyah(s.number, 1);
    const updated = [...ranges];
    updated[index] = {
      ...updated[index],
      surahNumber: s.number,
      surahName: s.name,
      surahArabicName: s.arabicName,
      startPage: sPage,
      startAyah: 1,
      endPage: sPage,
      endAyah: Math.min(15, s.ayahCount),
      totalAyahs: Math.min(15, s.ayahCount),
      isCrossPage: false
    };
    setRanges(updated);
  };

  const handleRangeAyahChange = (
    index: number, 
    field: 'startAyah' | 'endAyah', 
    val: number
  ) => {
    const updated = [...ranges];
    const item = { ...updated[index] };
    const surah = getSurahByNumber(item.surahNumber);
    const maxAyahs = surah ? surah.ayahCount : 286;

    const clampedVal = Math.max(1, Math.min(maxAyahs, val));
    if (field === 'startAyah') {
      item.startAyah = clampedVal;
      item.startPage = getPageForAyah(item.surahNumber, clampedVal);
      if (item.endAyah < clampedVal) {
        item.endAyah = clampedVal;
        item.endPage = item.startPage;
      }
    } else {
      item.endAyah = clampedVal;
      item.endPage = getPageForAyah(item.surahNumber, clampedVal);
    }
    
    item.totalAyahs = Math.max(1, item.endAyah - item.startAyah + 1);
    item.isCrossPage = item.startPage !== item.endPage;
    updated[index] = item;
    setRanges(updated);
  };

  const handleRangePageChange = (
    index: number,
    field: 'startPage' | 'endPage',
    val: number
  ) => {
    const updated = [...ranges];
    const item = { ...updated[index] };
    const surah = getSurahByNumber(item.surahNumber);
    if (!surah) return;

    const clampedPage = Math.max(surah.startPage, Math.min(surah.endPage, val));
    const ayahsOnPage = getAyahsOnPage(clampedPage).filter(a => a.surahNumber === surah.number);

    if (field === 'startPage') {
      item.startPage = clampedPage;
      if (ayahsOnPage.length > 0) {
        item.startAyah = ayahsOnPage[0].startAyah;
      }
      if (item.endPage < clampedPage) {
        item.endPage = clampedPage;
        if (ayahsOnPage.length > 0) {
          item.endAyah = ayahsOnPage[ayahsOnPage.length - 1].endAyah;
        }
      }
    } else {
      item.endPage = clampedPage;
      if (ayahsOnPage.length > 0) {
        item.endAyah = ayahsOnPage[ayahsOnPage.length - 1].endAyah;
      }
      if (item.startPage > clampedPage) {
        item.startPage = clampedPage;
        if (ayahsOnPage.length > 0) {
          item.startAyah = ayahsOnPage[0].startAyah;
        }
      }
    }

    item.totalAyahs = Math.max(1, item.endAyah - item.startAyah + 1);
    item.isCrossPage = item.startPage !== item.endPage;
    updated[index] = item;
    setRanges(updated);
  };

  // Workflow Step 7: Save & Display in student profile
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!allRangesValid) {
      setFormError('Please resolve all validation errors in the target Qur’an ranges.');
      return;
    }

    if (existingDuplicateTarget && !initialTarget) {
      setFormError(
        `Target already exists for this student in Week ${selectedWeekNumber}. Please edit the existing target to record an authorized amendment.`
      );
      return;
    }

    const preparedRanges: TargetQuranRange[] = validatedRanges.map((vr, idx) => ({
      id: `range-${Date.now()}-${idx + 1}`,
      surahNumber: vr.surahNumber,
      surahName: vr.surahName,
      surahArabicName: vr.surahArabicName,
      startPage: vr.calculatedStartPage,
      startAyah: vr.startAyah,
      endPage: vr.calculatedEndPage,
      endAyah: vr.endAyah,
      totalAyahs: vr.calculatedTotalAyahs,
      isCrossPage: vr.isCrossPage,
      notes: vr.notes
    }));

    if (initialTarget) {
      // Amending existing target
      const res = amendWeeklyTarget(
        initialTarget.id,
        {
          ranges: preparedRanges,
          totalTargetAyahs,
          totalTargetPages,
          assignmentDeadline,
          notes: targetNotes,
          status: targetStatus
        },
        amendmentReason || 'Teacher updated target ranges and assignment notes'
      );

      if (!res.success) {
        setFormError(res.error || 'Failed to amend target');
        return;
      }
    } else {
      // Creating target (single student or batch)
      const targetStudentIds = isBatchMode && batchSelectedIds.length > 0 
        ? batchSelectedIds 
        : [selectedStudentId];

      for (const sId of targetStudentIds) {
        const student = students.find(s => s.id === sId);
        const res = createWeeklyTarget({
          studentId: sId,
          sessionId: selectedSessionId,
          sessionName: currentSession?.name || '2026/2027',
          termId: selectedTermId,
          termType: currentTerm?.type || 'term_1',
          termName: currentTerm ? (language === 'ar' ? currentTerm.nameAr : currentTerm.nameEn) : 'Term 1',
          weekNumber: selectedWeekNumber,
          weekStartDate: selectedWeekInfo.startDate,
          weekEndDate: selectedWeekInfo.endDate,
          group: student?.group,
          ranges: preparedRanges,
          totalTargetAyahs,
          totalTargetPages,
          assignmentDeadline,
          notes: targetNotes,
          status: 'assigned',
          createdBy: user?.name || user?.email || 'Authorized Teacher'
        });

        if (!res.success) {
          setFormError(res.error || 'Failed to create weekly target');
          return;
        }
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1b110b]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        dir={isRTL ? 'rtl' : 'ltr'}
        className="bg-white rounded-2xl max-w-3xl w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1c120c] via-[#2d1b11] to-[#1c120c] text-white p-5 flex items-center justify-between border-b border-[#3b2317] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#df9b52]/20 border border-[#df9b52]/40 flex items-center justify-center text-[#df9b52] shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#faedd9]">
                  {initialTarget 
                    ? (language === 'ar' ? 'تعديل هدف الحفظ الأسبوعي (مع سجل المراجعة)' : 'Amend Weekly Memorization Target')
                    : (language === 'ar' ? 'تحديد هدف حفظ أسبوعي جديد للطالب' : 'Assign Weekly Memorization Target')}
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                  {language === 'ar' ? 'مصحف المدينة ٦٠٤ ص' : 'Madinah Mushaf 604p'}
                </span>
              </div>
              <p className="text-[11px] text-[#c4b3a4] mt-0.5">
                {language === 'ar'
                  ? 'تحديد ومتابعة أهداف التسميع الأسبوعية مع إمكانية تعدد السور ومطابقة مصحف المدينة'
                  : 'Assign, validate and track weekly student recitation goals with multi-surah & page support'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#d6c4b6] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Error Banner */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-900 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Duplicate Target Warning */}
          {existingDuplicateTarget && !initialTarget && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  {language === 'ar' 
                    ? `تنبيه: يوجد هدف مسبق لهذا الطالب في الأسبوع ${selectedWeekNumber}!`
                    : `Notice: A target already exists for this student in Week ${selectedWeekNumber}!`}
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                {language === 'ar'
                  ? 'لمنع التكرار العرضي، يرجى تعديل الهدف القائم أو اختيار أسبوع آخر.'
                  : 'To avoid accidental duplicates, please amend the existing target or select another week.'}
              </p>
            </div>
          )}

          {/* Workflow Steps 1, 2, 3: Calendar Period Pickers */}
          <div className="bg-[#faf7f3] p-4 rounded-xl border border-[#e5dad0] space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#3b2317]">
              <Calendar className="h-4 w-4 text-[#854d2b]" />
              <span>{language === 'ar' ? '١. الفترة الأكاديمية (العام، الفصل، والأسبوع)' : '1. Academic Calendar Period'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Session */}
              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'العام الدراسي (Session)' : 'Academic Session'}
                </label>
                <select
                  value={selectedSessionId}
                  disabled={Boolean(initialTarget)}
                  onChange={(e) => {
                    setSelectedSessionId(e.target.value);
                    const sess = academicSessions.find(s => s.id === e.target.value);
                    if (sess && sess.terms[0]) {
                      setSelectedTermId(sess.terms[0].id);
                    }
                  }}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-semibold focus:ring-1 focus:ring-[#854d2b]"
                >
                  {academicSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.isCurrent ? (language === 'ar' ? '★ (الحالي)' : '★ (Active)') : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'الفصل الدراسي (Term)' : 'Academic Term'}
                </label>
                <select
                  value={selectedTermId}
                  disabled={Boolean(initialTarget)}
                  onChange={(e) => setSelectedTermId(e.target.value)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-semibold focus:ring-1 focus:ring-[#854d2b]"
                >
                  {currentSession?.terms.map(t => (
                    <option key={t.id} value={t.id}>
                      {language === 'ar' ? t.nameAr : t.nameEn} ({t.instructionalWeeksCount} {language === 'ar' ? 'أسابيع' : 'weeks'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Number */}
              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'رقم الأسبوع التعليمي' : 'Instructional Week'}
                </label>
                <select
                  value={selectedWeekNumber}
                  disabled={Boolean(initialTarget)}
                  onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold focus:ring-1 focus:ring-[#854d2b]"
                >
                  {termWeeks.map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-[11px] text-[#7c695d] flex items-center justify-between pt-1 border-t border-[#e5dad0]/60">
              <span>
                {language === 'ar' ? 'فترة الأسبوع المحدد:' : 'Week Range:'}{' '}
                <strong>{selectedWeekInfo.startDate}</strong> {language === 'ar' ? 'إلى' : 'to'} <strong>{selectedWeekInfo.endDate}</strong>
              </span>
              <span className="text-[#854d2b] font-semibold">
                {language === 'ar' ? 'الطلاب يمكنهم الحصول على أهداف متمايزة' : 'Each student can have a distinct target'}
              </span>
            </div>
          </div>

          {/* Workflow Step 4: Student Selection & Group Filter */}
          <div className="bg-[#faf7f3] p-4 rounded-xl border border-[#e5dad0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#3b2317]">
                <UserCheck className="h-4 w-4 text-[#854d2b]" />
                <span>{language === 'ar' ? '٢. اختيار الطالب أو الحلقة (الصف الخامس)' : '2. Student Selection & Group'}</span>
              </div>

              {!initialTarget && (
                <button
                  type="button"
                  onClick={() => setIsBatchMode(!isBatchMode)}
                  className="text-[#854d2b] hover:text-[#3b2317] font-semibold text-[11px] underline cursor-pointer"
                >
                  {isBatchMode 
                    ? (language === 'ar' ? '← التبديل لطالب فردي' : '← Switch to Single Student')
                    : (language === 'ar' ? 'تخصيص لمجموعة طلاب دفعة واحدة' : 'Batch Assign to Multiple Students')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Group Filter */}
              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'تصفية حسب الحلقة/المجموعة:' : 'Filter by Halaqah Group:'}
                </label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value as any)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b]"
                >
                  <option value="all">{language === 'ar' ? 'جميع الحلقات (١٠ طلاب)' : 'All Groups (10 Students)'}</option>
                  <option value="khaleelul_hussary">{getStudentGroupName('khaleelul_hussary', language)}</option>
                  <option value="seddeq_minshawy">{getStudentGroupName('seddeq_minshawy', language)}</option>
                  <option value="abdulbasit">{getStudentGroupName('abdulbasit', language)}</option>
                </select>
              </div>

              {/* Student Picker (Single mode) */}
              {!isBatchMode ? (
                <div>
                  <label className="font-bold text-[#635043] block mb-1">
                    {language === 'ar' ? 'الطالب المستهدف:*' : 'Target Student:*'}
                  </label>
                  <select
                    value={selectedStudentId}
                    disabled={Boolean(initialTarget)}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold focus:ring-1 focus:ring-[#854d2b]"
                  >
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        #{s.rollNumber} — {language === 'ar' ? (s.arabicName || s.fullName) : s.fullName} ({getStudentGroupName(s.group, language)})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-[#635043] block mb-1">
                    {language === 'ar' ? 'اختر الطلاب المراد إسناد الهدف لهم:' : 'Select Students for Target:'}
                  </label>
                  <div className="max-h-28 overflow-y-auto border border-[#e5dad0] rounded-lg p-2 bg-white space-y-1">
                    {filteredStudents.map(s => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-[#faf7f3] p-1 rounded">
                        <input
                          type="checkbox"
                          checked={batchSelectedIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatchSelectedIds([...batchSelectedIds, s.id]);
                            } else {
                              setBatchSelectedIds(batchSelectedIds.filter(id => id !== s.id));
                            }
                          }}
                          className="rounded text-[#854d2b] focus:ring-[#854d2b]"
                        />
                        <span className="font-semibold text-[11px] text-[#1b110b]">
                          #{s.rollNumber} {language === 'ar' ? (s.arabicName || s.fullName) : s.fullName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Step 5: Exact Qur'an Ranges (Multi-Range & Multi-Surah Support) */}
          <div className="bg-[#faf7f3] p-4 rounded-xl border border-[#e5dad0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#3b2317]">
                <BookOpen className="h-4 w-4 text-[#854d2b]" />
                <span>{language === 'ar' ? '٣. نطاقات الحفظ القرآنية المطلوبة (يدعم تعدد السور)' : '3. Target Qur’an Ranges (Multi-Surah Supported)'}</span>
              </div>

              <button
                type="button"
                onClick={handleAddRange}
                className="bg-white hover:bg-[#ede5dc] text-[#854d2b] border border-[#e5dad0] text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'إضافة نطاق/سورة أخرى' : 'Add Another Range'}</span>
              </button>
            </div>

            {/* List of Target Ranges */}
            <div className="space-y-3">
              {validatedRanges.map((range, idx) => {
                const surahInfo = getSurahByNumber(range.surahNumber) || VERIFIED_SURAHS[0];

                return (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border bg-white space-y-2.5 transition ${
                      range.isValid ? 'border-[#e5dad0]' : 'border-red-300 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#f0e6dc]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#faedd9] text-[#854d2b] font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#1b110b]">
                          {language === 'ar' ? `نطاق الحفظ رقم ${idx + 1}` : `Target Range #${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {range.isValid && (
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            {range.calculatedTotalAyahs} {language === 'ar' ? 'آية' : 'Ayahs'} • {range.calculatedStartPage === range.calculatedEndPage ? `ص ${range.calculatedStartPage}` : `ص ${range.calculatedStartPage}–${range.calculatedEndPage}`}
                          </span>
                        )}

                        {ranges.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRange(idx)}
                            className="text-[#8c7464] hover:text-red-700 p-1 transition cursor-pointer"
                            title={language === 'ar' ? 'حذف هذا النطاق' : 'Remove range'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {/* 1. Target Surah */}
                      <div className="sm:col-span-5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-[#635043] text-xs">
                            {language === 'ar' ? 'السورة المستهدفة:*' : 'Target Surah:*'}
                          </label>
                          <span className="text-[11px] text-[#854d2b] font-medium">
                            {language === 'ar'
                              ? `صفحات السورة بمصحف المدينة: ص ${surahInfo.startPage} – ص ${surahInfo.endPage} (إجمالي ${surahInfo.ayahCount} آية)`
                              : `Madinah Mushaf Pages: pp. ${surahInfo.startPage}–${surahInfo.endPage} (${surahInfo.ayahCount} Ayahs total)`}
                          </span>
                        </div>
                        <select
                          value={range.surahNumber}
                          onChange={(e) => handleRangeSurahChange(idx, Number(e.target.value))}
                          className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b] font-bold text-xs"
                        >
                          {VERIFIED_SURAHS.map(s => (
                            <option key={s.number} value={s.number}>
                              {s.number}. {s.name} ({s.arabicName}) — {s.ayahCount} {language === 'ar' ? 'آية' : 'Ayahs'} • {language === 'ar' ? `ص ${s.startPage}` : `p. ${s.startPage}`} • {language === 'ar' ? `الجزء ${s.juzNumber}` : `Juz ${s.juzNumber}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Starting Page */}
                      <div className="sm:col-span-1">
                        <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                          {language === 'ar' ? 'صفحة البداية:' : 'Starting Page:'}
                        </label>
                        <input
                          type="number"
                          min={surahInfo.startPage}
                          max={surahInfo.endPage}
                          value={range.startPage}
                          onChange={(e) => handleRangePageChange(idx, 'startPage', Number(e.target.value))}
                          className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-mono text-xs font-bold"
                          title="Madinah Mushaf page (1-604)"
                        />
                      </div>

                      {/* 3. Starting Ayah */}
                      <div className="sm:col-span-1">
                        <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                          {language === 'ar' ? 'من آية (بداية):' : 'Starting Ayah:'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={surahInfo.ayahCount}
                          value={range.startAyah}
                          onChange={(e) => handleRangeAyahChange(idx, 'startAyah', Number(e.target.value))}
                          className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold text-xs"
                        />
                      </div>

                      {/* 4. Ending Page */}
                      <div className="sm:col-span-1">
                        <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                          {language === 'ar' ? 'صفحة النهاية:' : 'Ending Page:'}
                        </label>
                        <input
                          type="number"
                          min={range.startPage}
                          max={surahInfo.endPage}
                          value={range.endPage}
                          onChange={(e) => handleRangePageChange(idx, 'endPage', Number(e.target.value))}
                          className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-mono text-xs font-bold"
                          title="Madinah Mushaf page (1-604)"
                        />
                      </div>

                      {/* 5. Ending Ayah */}
                      <div className="sm:col-span-1">
                        <label className="font-bold text-[#635043] block mb-1 text-[11px]">
                          {language === 'ar' ? 'إلى آية (نهاية):' : 'Ending Ayah:'}
                        </label>
                        <input
                          type="number"
                          min={range.startAyah}
                          max={surahInfo.ayahCount}
                          value={range.endAyah}
                          onChange={(e) => handleRangeAyahChange(idx, 'endAyah', Number(e.target.value))}
                          className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-bold text-xs"
                        />
                      </div>

                      {/* Range Calculated Scope Pill */}
                      <div className="sm:col-span-1 flex flex-col justify-end">
                        <div className="p-1.5 bg-[#faf7f3] border border-[#e5dad0] rounded-lg text-center">
                          <span className="text-[10px] text-[#7c695d] block">
                            {language === 'ar' ? 'المجموع' : 'Scope'}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            {range.totalAyahs} {language === 'ar' ? 'آية' : 'ayahs'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Range validation errors if any */}
                    {!range.isValid && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] space-y-0.5">
                        {range.errors.map((err, errIdx) => (
                          <div key={errIdx} className="flex items-center gap-1.5">
                            <AlertCircle className="h-3 w-3 text-red-600 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Target Summary Bar */}
            <div className="p-3 bg-white border border-[#e5dad0] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-[#3b2317]">
                  {language === 'ar' ? 'إجمالي المطلوب لهذا الهدف:' : 'Total Target Scope:'}
                </span>
              </div>
              <div className="flex items-center gap-3 font-bold text-xs">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {totalTargetAyahs} {language === 'ar' ? 'آية' : 'Total Ayahs'}
                </span>
                <span className="text-[#854d2b] bg-[#faf7f3] px-2 py-0.5 rounded border border-[#e5dad0]">
                  {totalTargetPages} {language === 'ar' ? 'صفحة بمصحف المدينة' : 'Madinah Pages'}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Step 7: Assignment Deadline & Teacher Notes */}
          <div className="bg-[#faf7f3] p-4 rounded-xl border border-[#e5dad0] space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#3b2317]">
              <Clock className="h-4 w-4 text-[#854d2b]" />
              <span>{language === 'ar' ? '٤. موعد التسميع النهائي والملاحظات' : '4. Assignment Deadline & Instructions'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'الموعد النهائي للتسميع (Deadline):*' : 'Assignment Deadline:*'}
                </label>
                <input
                  type="date"
                  required
                  value={assignmentDeadline}
                  onChange={(e) => setAssignmentDeadline(e.target.value)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'حالة الإنجاز:' : 'Initial Status:'}
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b] font-semibold"
                >
                  <option value="assigned">{language === 'ar' ? 'مسند (Assigned)' : 'Assigned'}</option>
                  <option value="in_progress">{language === 'ar' ? 'قيد التسميع (In Progress)' : 'In Progress'}</option>
                  <option value="completed">{language === 'ar' ? 'مكتمل بنجاح (Completed)' : 'Completed'}</option>
                  <option value="amended">{language === 'ar' ? 'معدل (Amended)' : 'Amended'}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'ملاحظات أو توجيهات للمعلم أو الطالب:' : 'Notes or Instructions:'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'مثال: التركيز على أحكام الغنة ومخارج الحروف، أو التسميع على مرحلتين...' : 'e.g., Focus on Ghunnah rules, recite in two sessions...'}
                  value={targetNotes}
                  onChange={(e) => setTargetNotes(e.target.value)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-white text-[#1b110b]"
                />
              </div>
            </div>
          </div>

          {/* If Amending: Required Audit Trail Explanation */}
          {initialTarget && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <Edit3 className="h-4 w-4 text-amber-700" />
                  <span>{language === 'ar' ? 'سجل المراجعة والتعديل المعتمد (Audit Trail):' : 'Authorized Amendment Audit Note:'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditHistory(!showAuditHistory)}
                  className="text-amber-800 hover:text-amber-950 font-bold text-[11px] underline flex items-center gap-1"
                >
                  <History className="h-3 w-3" />
                  <span>{showAuditHistory ? (language === 'ar' ? 'إخفاء السجل' : 'Hide History') : (language === 'ar' ? 'عرض السجل السابق' : 'View History')}</span>
                </button>
              </div>

              <input
                type="text"
                required
                placeholder={language === 'ar' ? 'اذكر سبب تعديل الهدف (إلزامي للتوثيق)...' : 'State reason for target amendment (required for audit trail)...'}
                value={amendmentReason}
                onChange={(e) => setAmendmentReason(e.target.value)}
                className="w-full p-2 border border-amber-300 rounded-lg bg-white text-[#1b110b] text-xs"
              />

              {showAuditHistory && initialTarget.auditTrail && (
                <div className="mt-2 pt-2 border-t border-amber-200 space-y-1.5 max-h-32 overflow-y-auto">
                  {initialTarget.auditTrail.map((audit) => (
                    <div key={audit.id} className="text-[11px] bg-white p-2 rounded border border-amber-200">
                      <div className="flex items-center justify-between font-bold text-[#1b110b]">
                        <span>{audit.action.toUpperCase()} by {audit.modifiedBy}</span>
                        <span className="text-[#8c7464]">{new Date(audit.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[#635043] mt-0.5">{audit.changeSummary}</p>
                      {audit.previousSummary && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">Previous: {audit.previousSummary}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 border-t border-[#e5dad0] flex items-center justify-between">
            <div className="text-[11px] text-[#7c695d]">
              {language === 'ar' ? 'حفظ دائم في قاعدة البيانات وسجل الطالب' : 'Persisted in student profile & database'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#e5dad0] rounded-lg font-semibold text-[#635043] hover:bg-white transition cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!allRangesValid || (Boolean(existingDuplicateTarget) && !initialTarget)}
                className={`px-5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs ${
                  allRangesValid && (!existingDuplicateTarget || initialTarget)
                    ? 'bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-[#df9b52]" />
                <span>
                  {initialTarget
                    ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Amendment')
                    : (language === 'ar' ? 'إسناد الهدف' : 'Assign Target')}
                </span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
