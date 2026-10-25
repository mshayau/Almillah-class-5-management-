import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { TajweedRating } from '../types';
import { getStudentGroupName } from '../data/studentGroups';
import { AcademicCalendarSelector } from './AcademicCalendarSelector';
import { QuranReferenceBrowserModal } from './QuranReferenceBrowserModal';
import { 
  VERIFIED_SURAHS, 
  QURAN_DATASET_METADATA, 
  getPageForAyah, 
  getPageDetails,
  validateAndCalculateQuranRange,
  getSurahByNumber
} from '../data/quranReferenceData';
import { 
  BookMarked, 
  Plus, 
  Trash2, 
  CheckCircle, 
  RotateCcw, 
  Filter,
  BookOpen,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Target
} from 'lucide-react';
import { WeeklyTargetsOverview } from './WeeklyTargetsOverview';
import { StudentWeeklyTargetModal } from './StudentWeeklyTargetModal';
import { DailyMemorizationQuickEntry } from './DailyMemorizationQuickEntry';

interface QuranTrackerViewProps {
  initialStudentId?: string;
  isLogModalOpen?: boolean;
  onCloseModal?: () => void;
}

export const QuranTrackerView: React.FC<QuranTrackerViewProps> = ({
  initialStudentId,
  isLogModalOpen: externalModalOpen,
  onCloseModal
}) => {
  const { 
    students, 
    quranLogs, 
    addQuranLog, 
    deleteQuranLog, 
    selectedDate,
    calendarSelection,
    getStudentTargetForWeek,
    weeklyTargets,
    dailyMemorizationEntries
  } = useClass();
  const { language, isRTL, t } = useLanguage();

  // Active Tracker sub-view: 'daily' (Phase 5 Daily Memorization Entry), 'targets' (Phase 4 Weekly Memorization Targets), or 'ledger' (Daily Recitation Ledger)
  const [activeSection, setActiveSection] = useState<'daily' | 'targets' | 'ledger'>('daily');

  // Target modal state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetModalStudentId, setTargetModalStudentId] = useState<string | undefined>(initialStudentId);

  // Sync initialStudentId if it updates externally
  React.useEffect(() => {
    if (initialStudentId) {
      setTargetModalStudentId(initialStudentId);
      setTargetStudentId(initialStudentId);
      setActiveSection('daily');
    }
  }, [initialStudentId]);

  // Filter state
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');

  // Internal modal state
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setModalOpen = (open: boolean) => {
    if (onCloseModal && !open) onCloseModal();
    setInternalModalOpen(open);
  };

  // Reference browser modal state
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  // Form state
  const [targetStudentId, setTargetStudentId] = useState<string>(initialStudentId || students[0]?.id || '');
  
  // Selection mode: 'surah' (Surah & Ayahs) or 'page' (By 604-page Madinah Mushaf)
  const [entryMode, setEntryMode] = useState<'surah' | 'page'>('surah');
  const [isCrossSurahEnabled, setIsCrossSurahEnabled] = useState(false);

  // Surah / Ayah range state
  const [startSurahNumber, setStartSurahNumber] = useState<number>(2); // Default Al-Baqarah
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endSurahNumber, setEndSurahNumber] = useState<number>(2);
  const [endAyah, setEndAyah] = useState<number>(10);

  // By-Page selector state
  const [selectedMushafPage, setSelectedMushafPage] = useState<number>(2);

  // Evaluation details
  const [tajweedRating, setTajweedRating] = useState<TajweedRating>('mumtaz');
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [status, setStatus] = useState<'passed' | 'repeat' | 'in_progress'>('passed');
  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    language === 'ar' ? 'ما شاء الله، تلاوة متقنة وسليمة.' : "Masha'Allah, very fluent recitation."
  );

  // Current start surah info
  const startSurah = useMemo(() => {
    return getSurahByNumber(startSurahNumber) || VERIFIED_SURAHS[1];
  }, [startSurahNumber]);

  // Current end surah info
  const endSurah = useMemo(() => {
    const sNum = isCrossSurahEnabled ? endSurahNumber : startSurahNumber;
    return getSurahByNumber(sNum) || startSurah;
  }, [isCrossSurahEnabled, endSurahNumber, startSurahNumber, startSurah]);

  // Real-time range calculation and validation against verified 604-page dataset
  const rangeValidation = useMemo(() => {
    const finalEndSurah = isCrossSurahEnabled ? endSurahNumber : startSurahNumber;
    return validateAndCalculateQuranRange(startSurahNumber, startAyah, finalEndSurah, endAyah);
  }, [startSurahNumber, startAyah, isCrossSurahEnabled, endSurahNumber, endAyah]);

  // Phase 4: Active weekly target for the selected student in current calendar selection
  const activeStudentWeeklyTarget = useMemo(() => {
    if (!targetStudentId || !calendarSelection) return undefined;
    return getStudentTargetForWeek(
      targetStudentId,
      calendarSelection.sessionId,
      calendarSelection.termId,
      calendarSelection.weekNumber
    );
  }, [targetStudentId, calendarSelection, getStudentTargetForWeek]);

  const handleApplyTargetToRecitation = () => {
    if (!activeStudentWeeklyTarget || activeStudentWeeklyTarget.ranges.length === 0) return;
    const firstRange = activeStudentWeeklyTarget.ranges[0];
    setStartSurahNumber(firstRange.surahNumber);
    setStartAyah(firstRange.startAyah);
    setEndSurahNumber(firstRange.surahNumber);
    setEndAyah(firstRange.endAyah);
    setIsCrossSurahEnabled(false);
  };

  const handleOpenAddModal = (studentId?: string) => {
    if (studentId) setTargetStudentId(studentId);
    setModalOpen(true);
  };

  // Surah selection change
  const handleStartSurahChange = (num: number) => {
    setStartSurahNumber(num);
    const surah = getSurahByNumber(num);
    if (surah) {
      setStartAyah(1);
      setEndAyah(Math.min(10, surah.ayahCount));
      if (!isCrossSurahEnabled || endSurahNumber < num) {
        setEndSurahNumber(num);
      }
    }
  };

  const handleEndSurahChange = (num: number) => {
    setEndSurahNumber(num);
    const surah = getSurahByNumber(num);
    if (surah) {
      setEndAyah(Math.min(10, surah.ayahCount));
    }
  };

  // When selecting by Madinah Mushaf Page
  const handlePageSelectChange = (pageNum: number) => {
    const p = Math.max(1, Math.min(604, pageNum));
    setSelectedMushafPage(p);
    const details = getPageDetails(p);
    if (details) {
      setStartSurahNumber(details.startSurah);
      setStartAyah(details.startAyah);
      setEndSurahNumber(details.endSurah);
      setEndAyah(details.endAyah);
      setIsCrossSurahEnabled(details.startSurah !== details.endSurah);
    }
  };

  // Handle selection from Reference Browser Modal
  const handleSelectFromReferenceBrowser = (
    sSurah: number, 
    sAyah: number, 
    eSurah: number, 
    eAyah: number
  ) => {
    setStartSurahNumber(sSurah);
    setStartAyah(sAyah);
    setEndSurahNumber(eSurah);
    setEndAyah(eAyah);
    setIsCrossSurahEnabled(sSurah !== eSurah);
    setEntryMode('surah');
    setIsReferenceModalOpen(false);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rangeValidation.valid) {
      return;
    }

    const student = students.find(s => s.id === targetStudentId);
    if (!student) return;

    const finalEndSurahNum = isCrossSurahEnabled ? endSurahNumber : startSurahNumber;
    const finalEndSurah = getSurahByNumber(finalEndSurahNum) || startSurah;

    addQuranLog({
      studentId: targetStudentId,
      date: selectedDate,
      category: 'sabaq',
      surahNumber: startSurahNumber,
      surahName: startSurah.name,
      surahArabicName: startSurah.arabicName,
      ayahStart: Number(startAyah),
      ayahEnd: Number(endAyah),
      juzNumber: startSurah.juzNumber,
      tajweedRating,
      mistakeCount: Number(mistakeCount),
      status,
      teacherFeedback,
      // Verified Phase 3 dataset enrichment
      endSurahNumber: finalEndSurahNum,
      endSurahName: finalEndSurah.name,
      endSurahArabicName: finalEndSurah.arabicName,
      startPage: rangeValidation.startPage,
      endPage: rangeValidation.endPage,
      totalPagesCovered: rangeValidation.totalPagesCovered,
      isCrossSurah: rangeValidation.isCrossSurah,
      isCrossPage: rangeValidation.isCrossPage
    });

    setModalOpen(false);
  };

  // Filter logs
  const filteredLogs = quranLogs.filter(log => {
    return selectedStudentFilter === 'all' || log.studentId === selectedStudentFilter;
  });

  const feedbackPresets = language === 'ar' ? [
    'ما شاء الله، تلاوة متقنة وسليمة.',
    'مراعاة مقدار الغنة حركتين.',
    'توضيح حروف القلقلة بدقة.',
    'بارك الله فيه، جاهز للجزء القادم.',
    'يرجى مراجعة الآيات في المنزل الليلة.'
  ] : [
    "Masha'Allah, very fluent recitation.",
    'Hold Ghunnah for 2 Harakahs.',
    'Pronounce Qalqalah distinctly.',
    'Barakallahu feeh, ready for next Juz.',
    'Must revise Ayahs at home tonight.'
  ];

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#1b110b] text-base flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-[#854d2b]" />
              <span>{language === 'ar' ? 'متابعة القرآن الكريم وإدارة خطط الحفظ الأسبوعية' : 'Qur’an Tracker & Weekly Memorization Management'}</span>
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{language === 'ar' ? 'مصحف المدينة (٦٠٤ ص)' : 'Madinah Mushaf (604p)'}</span>
            </span>
          </div>
          <p className="text-xs text-[#7c695d] mt-1">
            {language === 'ar'
              ? 'إدارة خطط وأهداف الحفظ الأسبوعية للطلاب وتوثيق التسميع اليومي وفق مصحف مجمع الملك فهد (١١٤ سورة • ٦٠٤ صفحات)'
              : 'Configure individual student weekly targets, verify Madinah page ranges, and record daily halaqah recitations'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="quran-browse-reference-btn"
            onClick={() => setIsReferenceModalOpen(true)}
            className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#854d2b]" />
            <span>{language === 'ar' ? 'دليل المصحف (٦٠٤ ص)' : 'Browse Mushaf'}</span>
          </button>

          <button
            id="quran-assign-target-header-btn"
            onClick={() => {
              setTargetModalStudentId(targetStudentId || initialStudentId || students[0]?.id);
              setIsTargetModalOpen(true);
            }}
            className="bg-[#faf7f3] hover:bg-[#faedd9] text-[#854d2b] border border-[#df9b52]/40 text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Target className="h-4 w-4 text-[#854d2b]" />
            <span>{language === 'ar' ? 'إسناد هدف أسبوعي' : 'Assign Weekly Target'}</span>
          </button>

          <button
            id="quran-open-log-modal-btn"
            onClick={() => {
              setActiveSection('daily');
            }}
            className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#df9b52]" />
            <span>{language === 'ar' ? 'تسجيل تسميع لطالب' : 'Record Recitation'}</span>
          </button>
        </div>
      </div>

      {/* Primary Section Switcher: Daily Memorization (Phase 5) vs Weekly Targets (Phase 4) vs Recitation Ledger */}
      <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#faf7f3] border border-[#e5dad0] rounded-xl shadow-2xs">
        <button
          id="quran-nav-daily"
          onClick={() => setActiveSection('daily')}
          className={`flex-1 w-full sm:w-auto py-2.5 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSection === 'daily'
              ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
              : 'text-[#635043] hover:text-[#1b110b] hover:bg-[#ede5dc]'
          }`}
        >
          <Sparkles className="h-4 w-4 text-[#df9b52]" />
          <span>{language === 'ar' ? 'تسجيل التسميع اليومي (Daily Entry)' : 'Daily Memorization Quick Entry'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeSection === 'daily' ? 'bg-[#df9b52]/25 text-[#df9b52]' : 'bg-[#e5dad0] text-[#635043]'
          }`}>
            {dailyMemorizationEntries.length}
          </span>
        </button>

        <button
          id="quran-nav-targets"
          onClick={() => setActiveSection('targets')}
          className={`flex-1 w-full sm:w-auto py-2.5 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSection === 'targets'
              ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
              : 'text-[#635043] hover:text-[#1b110b] hover:bg-[#ede5dc]'
          }`}
        >
          <Target className="h-4 w-4 text-[#df9b52]" />
          <span>{language === 'ar' ? 'أهداف الحفظ الأسبوعية (Weekly Targets)' : 'Weekly Memorization Targets'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeSection === 'targets' ? 'bg-[#df9b52]/25 text-[#df9b52]' : 'bg-[#e5dad0] text-[#635043]'
          }`}>
            {weeklyTargets.length}
          </span>
        </button>

        <button
          id="quran-nav-ledger"
          onClick={() => setActiveSection('ledger')}
          className={`flex-1 w-full sm:w-auto py-2.5 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSection === 'ledger'
              ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
              : 'text-[#635043] hover:text-[#1b110b] hover:bg-[#ede5dc]'
          }`}
        >
          <BookMarked className="h-4 w-4 text-[#854d2b]" />
          <span>{language === 'ar' ? 'سجل التسميع والحلقة (Recitations)' : 'Recitation Ledger & Evaluation'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeSection === 'ledger' ? 'bg-[#df9b52]/25 text-[#df9b52]' : 'bg-[#e5dad0] text-[#635043]'
          }`}>
            {filteredLogs.length}
          </span>
        </button>
      </div>

      {/* Conditional View Rendering */}
      {activeSection === 'daily' ? (
        <DailyMemorizationQuickEntry
          initialStudentId={targetStudentId || initialStudentId}
          onOpenWeeklyTargets={(studentId) => {
            if (studentId) setTargetModalStudentId(studentId);
            setActiveSection('targets');
          }}
        />
      ) : activeSection === 'targets' ? (
        <WeeklyTargetsOverview
          initialStudentId={initialStudentId}
          onOpenRecitation={(studentId) => {
            setTargetStudentId(studentId);
            setActiveSection('daily');
          }}
        />
      ) : (
        <>
          {/* Academic Calendar Period Selector (Phase 2) */}
          <AcademicCalendarSelector />

          {/* Filter and Log Table */}
          <div className="bg-white rounded-xl border border-[#e5dad0] shadow-2xs overflow-hidden">
        
        {/* Table Header Filter controls */}
        <div className="p-4 border-b border-[#e5dad0] bg-[#faf7f3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#8c7464]" />
            <span className="text-xs font-bold text-[#635043]">
              {language === 'ar' ? 'تصفية التسميع:' : 'Filter Recitations:'}
            </span>
            
            {/* Student Filter */}
            <select
              id="quran-student-filter"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#854d2b] text-[#1b110b]"
            >
              <option value="all">{language === 'ar' ? `جميع الطلاب (${students.length} طلاب)` : `All ${students.length} Students`}</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  #{s.rollNumber} {language === 'ar' ? (s.arabicName || s.fullName) : `${s.fullName} (${s.arabicName})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#7c695d]">
            <span>
              {language === 'ar'
                ? <>عرض <strong>{filteredLogs.length}</strong> سجلاً للتسميع</>
                : <>Showing <strong>{filteredLogs.length}</strong> recitations</>}
            </span>
            <span className="hidden sm:inline-block text-[#d6c4b6]">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#854d2b] font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'بيانات مصحف المدينة موثقة' : 'Madinah Mushaf Verified'}</span>
            </span>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#f5ede4] border-b border-[#e5dad0] text-[#635043]">
                <th className="py-3 px-3.5 font-semibold">{t('date')}</th>
                <th className="py-3 px-3.5 font-semibold">{t('students')}</th>
                <th className="py-3 px-3.5 font-semibold">{t('surah')} & {t('ayahRange')}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'صفحة المصحف' : 'Mushaf Page'}</th>
                <th className="py-3 px-3.5 font-semibold">{t('juz')}</th>
                <th className="py-3 px-3.5 font-semibold">{t('tajweedRating')}</th>
                <th className="py-3 px-3.5 font-semibold">{t('mistakes')}</th>
                <th className="py-3 px-3.5 font-semibold">{t('status')}</th>
                <th className="py-3 px-3.5 font-semibold">{t('teacherNotes')}</th>
                <th className="py-3 px-3.5 font-semibold text-right rtl:text-left">{t('delete')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e6dc]">
              {filteredLogs.map(log => {
                const student = students.find(s => s.id === log.studentId);
                
                // Fallback page computation if not stored
                const pageStart = log.startPage || getPageForAyah(log.surahNumber, log.ayahStart);
                const pageEnd = log.endPage || getPageForAyah(log.endSurahNumber || log.surahNumber, log.ayahEnd);
                const isCrossP = log.isCrossPage !== undefined ? log.isCrossPage : (pageStart !== pageEnd);
                const isCrossS = Boolean(log.isCrossSurah || (log.endSurahNumber && log.endSurahNumber !== log.surahNumber));

                return (
                  <tr key={log.id} className="hover:bg-[#faf7f3] transition">
                    <td className="py-3 px-3.5 whitespace-nowrap text-[#7c695d] font-medium">
                      {log.date}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#faedd9] text-[#854d2b] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {student?.rollNumber || '?'}
                        </span>
                        <span className="font-bold text-[#1b110b]">
                          {language === 'ar' ? (student?.arabicName || student?.fullName) : student?.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div>
                        {isCrossS ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-bold text-[#1b110b]">
                              <span>{log.surahName} ({log.ayahStart})</span>
                              <ChevronRight className="h-3 w-3 text-[#854d2b] rtl:rotate-180" />
                              <span>{log.endSurahName || log.surahName} ({log.ayahEnd})</span>
                            </div>
                            <span className="inline-block text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded font-semibold">
                              {language === 'ar' ? 'متعدد السور' : 'Cross-Surah'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-[#1b110b]">{log.surahName}</span>{' '}
                            <span className="text-[#7c695d]">({log.ayahStart}–{log.ayahEnd})</span>
                            <span className="font-serif text-[#854d2b] ml-1.5 rtl:ml-0 rtl:mr-1.5">{log.surahArabicName}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] bg-[#faf7f3] text-[#635043] border border-[#e5dad0] px-2 py-0.5 rounded font-bold">
                          {language === 'ar' 
                            ? (pageStart === pageEnd ? `ص ${pageStart}` : `ص ${pageStart}–${pageEnd}`)
                            : (pageStart === pageEnd ? `p. ${pageStart}` : `pp. ${pageStart}–${pageEnd}`)}
                        </span>
                        {isCrossP && (
                          <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded font-bold">
                            {language === 'ar' ? 'عبر الصفحات' : 'Cross-Page'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-[#635043]">
                      {language === 'ar' ? `الجزء ${log.juzNumber}` : `Juz ${log.juzNumber}`}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`font-bold uppercase text-[11px] ${
                        log.tajweedRating === 'mumtaz'
                          ? 'text-[#2d6639]'
                          : log.tajweedRating === 'jayyid_jiddan'
                          ? 'text-[#854d2b]'
                          : log.tajweedRating === 'jayyid'
                          ? 'text-[#c88642]'
                          : 'text-[#b91c1c]'
                      }`}>
                        {log.tajweedRating.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        log.mistakeCount === 0 ? 'bg-[#f0f9f1] text-[#2d6639]' : 'bg-[#fef2f2] text-[#b91c1c]'
                      }`}>
                        {log.mistakeCount}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        log.status === 'passed'
                          ? 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]'
                          : 'bg-[#fef9ee] text-[#a46312] border border-[#fbe4b4]'
                      }`}>
                        {log.status === 'passed' ? <CheckCircle className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                        <span>
                          {log.status === 'passed'
                            ? (language === 'ar' ? 'اجتاز' : 'Passed')
                            : (language === 'ar' ? 'إعادة' : 'Repeat')}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[#7c695d] max-w-xs truncate" title={log.teacherFeedback}>
                      {log.teacherFeedback || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-right rtl:text-left">
                      <button
                        onClick={() => deleteQuranLog(log.id)}
                        className="text-[#8c7464] hover:text-[#b91c1c] p-1 transition cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#7c695d]">
                    {language === 'ar' ? 'لا توجد سجلات تسميع مسجلة بعد لهذا الطالب' : 'No recitation records found for this student'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dataset Attribution Footer in Table */}
        <div className="p-3 bg-[#faf7f3] border-t border-[#e5dad0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7c695d]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#635043]">
              {language === 'ar' ? 'مصدر قاعدة البيانات:' : 'Dataset Source:'}
            </span>
            <span>{QURAN_DATASET_METADATA.source} ({QURAN_DATASET_METADATA.editionName})</span>
          </div>
          <button
            onClick={() => setIsReferenceModalOpen(true)}
            className="text-[#854d2b] hover:text-[#3b2317] font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'ar' ? 'عرض تفاصيل الاعتماد والتراخيص' : 'View Verification & Attribution'}</span>
          </button>
        </div>
      </div>
      </>
      )}

      {/* Recitation Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1b110b]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            dir={isRTL ? 'rtl' : 'ltr'}
            className="bg-white rounded-2xl max-w-xl w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-8"
          >
            <form onSubmit={handleSaveLog}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#1c120c] via-[#2a170d] to-[#1c120c] text-white p-5 flex items-center justify-between border-b border-[#3b2317]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#df9b52]/20 border border-[#df9b52]/30 flex items-center justify-center text-[#df9b52]">
                    <BookMarked className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#faedd9]">
                      {language === 'ar' ? 'تسجيل تسميع وحفظ القرآن الكريم' : 'Record Student Quran Recitation'}
                    </h3>
                    <p className="text-[11px] text-[#c4b3a4]">
                      {language === 'ar' ? 'مصحف المدينة النبوية (٦٠٤ صفحات معتمدة)' : 'Madinah Mushaf Edition (604 Verified Pages)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-[#d6c4b6] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                
                {/* Academic Calendar Selection in Modal (Phase 2) */}
                <AcademicCalendarSelector compact showDayPicker={true} />

                {/* Select Student */}
                <div>
                  <label className="font-bold text-[#635043] block mb-1">
                    {language === 'ar' ? 'اختر الطالب (الصف الخامس)*' : 'Select Student (Class Five)*'}
                  </label>
                  <select
                    id="quran-log-student-select"
                    required
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full p-2.5 border border-[#e5dad0] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-[#faf7f3] text-[#1b110b]"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        #{s.rollNumber} — {language === 'ar' ? (s.arabicName || s.fullName) : s.fullName} ({s.arabicName}) • {getStudentGroupName(s.group, language)}
                      </option>
                    ))}
                  </select>

                  {/* Active Student Target for Current Calendar Week */}
                  {activeStudentWeeklyTarget && (
                    <div className="mt-2 p-2 bg-[#fdfbf8] border border-amber-200 rounded-lg flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#635043]">
                        <span className="font-bold text-[#854d2b]">
                          {language === 'ar' ? 'هدف الأسبوع الحالي:' : 'Assigned Weekly Target:'}{' '}
                        </span>
                        <span>
                          {activeStudentWeeklyTarget.ranges.map(r => `${r.surahName} (${r.startAyah}–${r.endAyah})`).join(' + ')} • {activeStudentWeeklyTarget.totalTargetAyahs} {language === 'ar' ? 'آية' : 'ayahs'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyTargetToRecitation}
                        className="text-[10px] font-bold text-[#854d2b] bg-[#faedd9] hover:bg-[#f3dfbf] px-2 py-1 rounded transition cursor-pointer shrink-0"
                      >
                        {language === 'ar' ? 'تطبيق الهدف' : 'Apply Range'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Entry Mode Switcher (Surah vs Madinah Mushaf Page) */}
                <div className="bg-[#faf7f3] p-2 rounded-xl border border-[#e5dad0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEntryMode('surah')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                        entryMode === 'surah'
                          ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
                          : 'bg-white text-[#635043] border border-[#e5dad0]'
                      }`}
                    >
                      {language === 'ar' ? 'تحديد بالسورة والآيات' : 'By Surah & Ayahs'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEntryMode('page');
                        handlePageSelectChange(selectedMushafPage);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                        entryMode === 'page'
                          ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
                          : 'bg-white text-[#635043] border border-[#e5dad0]'
                      }`}
                    >
                      {language === 'ar' ? 'تحديد برقم صفحة المصحف (٦٠٤)' : 'By Mushaf Page (604p)'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReferenceModalOpen(true)}
                    className="text-[#854d2b] hover:text-[#3b2317] font-semibold text-[11px] underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{language === 'ar' ? 'دليل المصحف' : 'Browse'}</span>
                  </button>
                </div>

                {/* Mode: By 604-page Mushaf Page */}
                {entryMode === 'page' && (
                  <div className="p-3 bg-[#fdfbf8] border border-[#e5dad0] rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#635043]">
                        {language === 'ar' ? 'اختر صفحة المصحف (من ١ إلى ٦٠٤):' : 'Select Madinah Mushaf Page (1 to 604):'}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePageSelectChange(Math.max(1, selectedMushafPage - 1))}
                          className="px-2 py-0.5 bg-white border border-[#e5dad0] rounded hover:bg-[#faf7f3] font-bold"
                        >
                          ‹
                        </button>
                        <span className="font-mono font-bold text-[#854d2b]">
                          {selectedMushafPage} / 604
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePageSelectChange(Math.min(604, selectedMushafPage + 1))}
                          className="px-2 py-0.5 bg-white border border-[#e5dad0] rounded hover:bg-[#faf7f3] font-bold"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={604}
                      value={selectedMushafPage}
                      onChange={(e) => handlePageSelectChange(Number(e.target.value))}
                      className="w-full accent-[#854d2b] cursor-pointer"
                    />

                    {/* Page Content Summary */}
                    {(() => {
                      const pd = getPageDetails(selectedMushafPage);
                      if (!pd) return null;
                      const sSurah = getSurahByNumber(pd.startSurah);
                      const eSurah = getSurahByNumber(pd.endSurah);
                      return (
                        <div className="text-[11px] bg-white p-2 rounded-lg border border-[#e5dad0] text-[#635043] flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#1b110b]">
                              {sSurah?.name} ({sSurah?.arabicName}) {pd.startAyah}
                            </span>
                            {pd.startSurah !== pd.endSurah && (
                              <span> → {eSurah?.name} ({eSurah?.arabicName}) {pd.endAyah}</span>
                            )}
                            {pd.startSurah === pd.endSurah && pd.startAyah !== pd.endAyah && (
                              <span> – {pd.endAyah}</span>
                            )}
                          </div>
                          <span className="font-semibold text-[#854d2b]">
                            {language === 'ar' ? `الجزء ${pd.juz}` : `Juz ${pd.juz}`}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Primary Surah Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#635043]">
                      {language === 'ar' ? 'السورة (بداية التسميع)*' : 'Start Surah (1 to 114)*'}
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-[#854d2b] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCrossSurahEnabled}
                        onChange={(e) => {
                          setIsCrossSurahEnabled(e.target.checked);
                          if (!e.target.checked) setEndSurahNumber(startSurahNumber);
                        }}
                        className="rounded text-[#854d2b] focus:ring-[#854d2b]"
                      />
                      <span>{language === 'ar' ? 'تسميع عبر عدة سور (Cross-Surah)' : 'Spans multiple Surahs'}</span>
                    </label>
                  </div>
                  <select
                    id="quran-log-surah-select"
                    value={startSurahNumber}
                    onChange={(e) => handleStartSurahChange(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#e5dad0] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-[#faf7f3] text-[#1b110b]"
                  >
                    {VERIFIED_SURAHS.map(s => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.name} ({s.arabicName}) — {s.ayahCount} {language === 'ar' ? 'آية' : 'Ayahs'} • {language === 'ar' ? `الجزء ${s.juzNumber}` : `Juz ${s.juzNumber}`} • {s.startPage === s.endPage ? `ص ${s.startPage}` : `ص ${s.startPage}–${s.endPage}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional End Surah Picker if Cross-Surah */}
                {isCrossSurahEnabled && (
                  <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1.5">
                    <label className="font-bold text-purple-900 block">
                      {language === 'ar' ? 'سورة نهاية التسميع (Cross-Surah End):' : 'End Surah (Cross-Surah End):'}
                    </label>
                    <select
                      value={endSurahNumber}
                      onChange={(e) => handleEndSurahChange(Number(e.target.value))}
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs font-semibold bg-white text-[#1b110b] focus:ring-1 focus:ring-purple-700"
                    >
                      {VERIFIED_SURAHS.filter(s => s.number >= startSurahNumber).map(s => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.name} ({s.arabicName}) — {s.ayahCount} {language === 'ar' ? 'آية' : 'Ayahs'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Ayah Start and End */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#635043] block mb-1">
                      {language === 'ar' 
                        ? `من آية (${startSurah.name}: ١ إلى ${startSurah.ayahCount})` 
                        : `From Ayah (1 to ${startSurah.ayahCount})`}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={startSurah.ayahCount}
                      value={startAyah}
                      onChange={(e) => setStartAyah(Number(e.target.value))}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#635043] block mb-1">
                      {language === 'ar' 
                        ? `إلى آية (${endSurah.name}: ١ إلى ${endSurah.ayahCount})` 
                        : `To Ayah (1 to ${endSurah.ayahCount})`}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={endSurah.ayahCount}
                      value={endAyah}
                      onChange={(e) => setEndAyah(Number(e.target.value))}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b]"
                    />
                  </div>
                </div>

                {/* Dynamic Live Validation & Mushaf Page Mapping Banner */}
                {rangeValidation.valid ? (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>{language === 'ar' ? 'نطاق تلاوة سليم ومطابق للمصحف' : 'Valid Quran Range & Page Mapping'}</span>
                      </div>
                      <span className="font-mono text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                        {rangeValidation.totalAyahs} {language === 'ar' ? 'آية' : 'Ayahs'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-emerald-800">
                      <span className="font-bold">
                        {language === 'ar' 
                          ? `صفحات المصحف: ${rangeValidation.startPage === rangeValidation.endPage ? `ص ${rangeValidation.startPage}` : `ص ${rangeValidation.startPage} إلى ص ${rangeValidation.endPage}`} (${rangeValidation.totalPagesCovered} ص)`
                          : `Mushaf Pages: ${rangeValidation.startPage === rangeValidation.endPage ? `Page ${rangeValidation.startPage}` : `Pages ${rangeValidation.startPage}–${rangeValidation.endPage}`} (${rangeValidation.totalPagesCovered} pages)`}
                      </span>
                      {rangeValidation.isCrossPage && (
                        <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                          {language === 'ar' ? 'عبر الصفحات' : 'Cross-Page'}
                        </span>
                      )}
                      {rangeValidation.isCrossSurah && (
                        <span className="bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                          {language === 'ar' ? 'متعدد السور' : 'Cross-Surah'}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-900 text-xs">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>{language === 'ar' ? 'خطأ في نطاق الآيات المدخل:' : 'Invalid Recitation Range:'}</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-red-800 space-y-0.5">
                      {rangeValidation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tajweed Rating and Mistakes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#635043] block mb-1">{t('tajweedRating')}</label>
                    <select
                      value={tajweedRating}
                      onChange={(e) => setTajweedRating(e.target.value as any)}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b]"
                    >
                      <option value="mumtaz">{language === 'ar' ? 'ممتاز (Mumtaz)' : 'Mumtaz (Excellent)'}</option>
                      <option value="jayyid_jiddan">{language === 'ar' ? 'جيد جداً (Jayyid Jiddan)' : 'Jayyid Jiddan (Very Good)'}</option>
                      <option value="jayyid">{language === 'ar' ? 'جيد (Jayyid)' : 'Jayyid (Good)'}</option>
                      <option value="maqbool">{language === 'ar' ? 'مقبول (Maqbool)' : 'Maqbool (Acceptable)'}</option>
                      <option value="daeef">{language === 'ar' ? 'ضعيف (Daeef)' : 'Daeef (Needs Work)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#635043] block mb-1">{t('mistakes')}</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setMistakeCount(Math.max(0, mistakeCount - 1))}
                        className="px-3 py-1.5 bg-[#faf7f3] hover:bg-[#ede5dc] border border-[#e5dad0] rounded-l-lg font-bold text-[#1b110b] cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={mistakeCount}
                        onChange={(e) => setMistakeCount(Number(e.target.value))}
                        className="w-full p-1.5 border-y border-[#e5dad0] text-center font-bold bg-[#faf7f3] text-[#1b110b]"
                      />
                      <button
                        type="button"
                        onClick={() => setMistakeCount(mistakeCount + 1)}
                        className="px-3 py-1.5 bg-[#faf7f3] hover:bg-[#ede5dc] border border-[#e5dad0] rounded-r-lg font-bold text-[#1b110b] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="font-bold text-[#635043] block mb-1">{language === 'ar' ? 'نتيجة التسميع' : 'Outcome Status'}</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'passed', labelEn: 'Passed & Advance', labelAr: 'اجتاز وتقدم' },
                      { id: 'repeat', labelEn: 'Repeat Tomorrow', labelAr: 'إعادة غداً' },
                      { id: 'in_progress', labelEn: 'In Progress', labelAr: 'قيد الإكمال' },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id as any)}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-center transition cursor-pointer font-semibold ${
                          status === st.id ? 'bg-[#3b2317] text-[#faedd9] font-bold border-[#3b2317]' : 'bg-[#faf7f3] text-[#635043] border-[#e5dad0]'
                        }`}
                      >
                        {language === 'ar' ? st.labelAr : st.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Teacher Remarks */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#635043]">{t('teacherNotes')}</label>
                    <span className="text-[10px] text-[#8c7464]">
                      {language === 'ar' ? 'عبارات جاهزة:' : 'Presets below:'}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b] focus:ring-1 focus:ring-[#854d2b]"
                  />
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                    {feedbackPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTeacherFeedback(preset)}
                        className="px-2 py-0.5 bg-[#faf7f3] hover:bg-[#ede5dc] border border-[#e5dad0] rounded text-[10px] whitespace-nowrap text-[#635043] cursor-pointer"
                      >
                        {preset.slice(0, 25)}...
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-[#faf7f3] border-t border-[#e5dad0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsReferenceModalOpen(true)}
                  className="text-xs text-[#854d2b] hover:text-[#3b2317] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{language === 'ar' ? 'فتح دليل المصحف (٦٠٤ ص)' : 'Open 604p Mushaf Explorer'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-[#e5dad0] rounded-lg font-semibold text-[#635043] hover:bg-white transition cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    id="quran-submit-log-btn"
                    type="submit"
                    disabled={!rangeValidation.valid}
                    className={`px-5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs ${
                      rangeValidation.valid
                        ? 'bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 text-[#df9b52]" />
                    <span>{t('save')}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Student Weekly Target Creation & Assignment Modal */}
      <StudentWeeklyTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        initialStudentId={targetModalStudentId}
        initialSessionId={calendarSelection?.sessionId}
        initialTermId={calendarSelection?.termId}
        initialWeekNumber={calendarSelection?.weekNumber}
      />

      {/* Verified Quran Reference Browser & Calculator Modal */}
      <QuranReferenceBrowserModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        onSelectSurahRange={handleSelectFromReferenceBrowser}
      />

    </div>
  );
};
