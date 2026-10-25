import React, { useState, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { DailyEvaluation, SalahStatus, HomeworkStatus } from '../types';
import { getStudentGroupName } from '../data/studentGroups';
import { 
  Star, 
  Award, 
  Calendar, 
  Check, 
  Users, 
  ShieldCheck, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Search,
  Printer,
  FileText,
  Sliders,
  Table,
  CheckCircle2,
  AlertCircle,
  Lock,
  BookOpen,
  BookMarked,
  Minus,
  Plus
} from 'lucide-react';
import { BehaviorNotesSection } from './BehaviorNotesSection';
import { ClassBehaviorLogView } from './ClassBehaviorLogView';

const AVAILABLE_BADGES_EN = [
  'Halaqah Leader',
  'Adab Excellence',
  'Tajweed Star',
  'Brotherhood Award',
  'Quran Champion',
  'Salah Devotion',
  'Rehal Organizer',
  'Diligent Revision'
];

const AVAILABLE_BADGES_AR = [
  'رائد الحلقة',
  'تميز في الآداب',
  'نجم التجويد',
  'الأخوة والمحبة',
  'بطل الحفظ',
  'المحافظ على الصلاة',
  'منظم المصاحف والرحال',
  'المثابر في المراجعة'
];

const CONDUCT_NOTE_PRESETS_EN = [
  'Participated with exemplary respect and proper Halaqah etiquette.',
  'Attentive during Dhuhr prayer and respectful in recitation circle.',
  'Barakallahu feeh, assisted classmates with Tajweed Makharij.',
  'Quiet and focused during long Muraja’ah revision rounds.',
  'Shows great improvement in Adab and brotherly conduct.'
];

const CONDUCT_NOTE_PRESETS_AR = [
  'مشاركة باحترام وانضباط تام في آداب وحلقات العلم.',
  'خشوع في صلاة الظهر جماعة وأدب جم في حلقة التلاوة.',
  'بارك الله فيه، ساعد زملاءه في تحسين مخارج التجويد.',
  'هدوء وتركيز عالٍ أثناء جولات المراجعة والتدبر.',
  'تحسن ملحوظ في السلوك والأخوة والمحافظة على المصحف الشريف.'
];

interface DailyEvaluationViewProps {
  initialStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  onOpenWeeklyReport?: (studentId: string) => void;
}

export const DailyEvaluationView: React.FC<DailyEvaluationViewProps> = ({
  initialStudentId,
  onSelectStudent,
  onOpenWeeklyReport
}) => {
  const { 
    students, 
    selectedDate, 
    setSelectedDate, 
    saveEvaluation, 
    batchSaveEvaluations, 
    getStudentEvaluation,
    getStudentAverageAdab,
    behaviorNotes
  } = useClass();
  const { language, isRTL, t } = useLanguage();

  const [viewMode, setViewMode] = useState<'individual' | 'matrix' | 'behavior_log'>('individual');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Sync when initialStudentId prop changes
  useEffect(() => {
    if (initialStudentId && students.some(s => s.id === initialStudentId)) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId, students]);

  // Active evaluation state for the selected student on the selected date
  const currentEval = getStudentEvaluation(selectedStudentId, selectedDate);

  const [adabScore, setAdabScore] = useState<number>(currentEval?.adabScore || 5);
  const [salahPerformance, setSalahPerformance] = useState<SalahStatus>(currentEval?.salahPerformance || 'with_jamaah');
  const [islamicStudiesPrep, setIslamicStudiesPrep] = useState<number>(currentEval?.islamicStudiesPrep || 5);
  const [homeworkStatus, setHomeworkStatus] = useState<HomeworkStatus>(currentEval?.homeworkStatus || 'completed');
  const [conductNotes, setConductNotes] = useState<string>(
    currentEval?.conductNotes || (language === 'ar' ? CONDUCT_NOTE_PRESETS_AR[0] : CONDUCT_NOTE_PRESETS_EN[0])
  );
  const [awardedBadges, setAwardedBadges] = useState<string[]>(currentEval?.awardedBadges || ['Adab Excellence']);
  
  // Daily Activity Percentages
  const [quranMemorizationPct, setQuranMemorizationPct] = useState<number>(currentEval?.quranMemorizationPct ?? 95);
  const [homeworkPct, setHomeworkPct] = useState<number>(currentEval?.homeworkPct ?? 100);
  const [classParticipationPct, setClassParticipationPct] = useState<number>(currentEval?.classParticipationPct ?? 95);
  const [neatnessPct, setNeatnessPct] = useState<number>(currentEval?.neatnessPct ?? 95);
  const [respectPct, setRespectPct] = useState<number>(currentEval?.respectPct ?? 98);
  const [selfControlPct, setSelfControlPct] = useState<number>(currentEval?.selfControlPct ?? 94);

  // Sync local form state when student or date changes
  useEffect(() => {
    const existing = getStudentEvaluation(selectedStudentId, selectedDate);
    if (existing) {
      setAdabScore(existing.adabScore);
      setSalahPerformance(existing.salahPerformance);
      setIslamicStudiesPrep(existing.islamicStudiesPrep);
      setHomeworkStatus(existing.homeworkStatus);
      setConductNotes(existing.conductNotes);
      setAwardedBadges(existing.awardedBadges);
      setQuranMemorizationPct(existing.quranMemorizationPct ?? 95);
      setHomeworkPct(existing.homeworkPct ?? 100);
      setClassParticipationPct(existing.classParticipationPct ?? 95);
      setNeatnessPct(existing.neatnessPct ?? 95);
      setRespectPct(existing.respectPct ?? 98);
      setSelfControlPct(existing.selfControlPct ?? 94);
    } else {
      setAdabScore(5);
      setSalahPerformance('with_jamaah');
      setIslamicStudiesPrep(5);
      setHomeworkStatus('completed');
      setConductNotes(language === 'ar' ? CONDUCT_NOTE_PRESETS_AR[0] : CONDUCT_NOTE_PRESETS_EN[0]);
      setAwardedBadges(['Adab Excellence']);
      setQuranMemorizationPct(95);
      setHomeworkPct(100);
      setClassParticipationPct(95);
      setNeatnessPct(95);
      setRespectPct(98);
      setSelfControlPct(94);
    }
  }, [selectedStudentId, selectedDate, language]);

  const handleStudentClick = (id: string) => {
    setSelectedStudentId(id);
    if (onSelectStudent) {
      onSelectStudent(id);
    }
  };

  const handleToggleBadge = (badge: string) => {
    if (awardedBadges.includes(badge)) {
      setAwardedBadges(prev => prev.filter(b => b !== badge));
    } else {
      setAwardedBadges(prev => [...prev, badge]);
    }
  };

  const calculateActivityAverage = () => {
    return Math.round(
      (quranMemorizationPct + homeworkPct + classParticipationPct + neatnessPct + respectPct + selfControlPct) / 6
    );
  };

  const getTotalMarks = () => {
    const sum = (quranMemorizationPct + homeworkPct + classParticipationPct + neatnessPct + respectPct + selfControlPct) / 10;
    return Number(sum.toFixed(1));
  };

  const getAverageMarks = () => {
    return Number((getTotalMarks() / 6).toFixed(1));
  };

  const getMarksRating = (marksOutOf10: number, isArabic: boolean) => {
    if (marksOutOf10 >= 9.5) {
      return { 
        label: isArabic ? 'ممتاز مرتفع' : 'Outstanding', 
        badgeClass: 'bg-[#f0f9f1] text-[#2d6639] border-[#c4e6c9]' 
      };
    }
    if (marksOutOf10 >= 9.0) {
      return { 
        label: isArabic ? 'ممتاز' : 'Excellent', 
        badgeClass: 'bg-[#faedd9] text-[#854d2b] border-[#e8d7c8]' 
      };
    }
    if (marksOutOf10 >= 8.0) {
      return { 
        label: isArabic ? 'جيد جداً' : 'Very Good', 
        badgeClass: 'bg-[#f5eee6] text-[#635043] border-[#ded0c3]' 
      };
    }
    if (marksOutOf10 >= 7.0) {
      return { 
        label: isArabic ? 'جيد' : 'Good', 
        badgeClass: 'bg-[#faf7f3] text-[#7c695d] border-[#e5dad0]' 
      };
    }
    if (marksOutOf10 >= 6.0) {
      return { 
        label: isArabic ? 'مقبول' : 'Satisfactory', 
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' 
      };
    }
    return { 
      label: isArabic ? 'يحتاج توجيه' : 'Needs Guidance', 
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' 
    };
  };

  const applyRubricPreset = (level: 'full' | 'mumtaz' | 'jayyid' | 'needs_guidance') => {
    if (level === 'full') {
      setAdabScore(5);
      setQuranMemorizationPct(100);
      setHomeworkPct(100);
      setClassParticipationPct(100);
      setNeatnessPct(100);
      setRespectPct(100);
      setSelfControlPct(100);
    } else if (level === 'mumtaz') {
      setAdabScore(5);
      setQuranMemorizationPct(98);
      setHomeworkPct(100);
      setClassParticipationPct(96);
      setNeatnessPct(98);
      setRespectPct(100);
      setSelfControlPct(96);
    } else if (level === 'jayyid') {
      setAdabScore(4);
      setQuranMemorizationPct(90);
      setHomeworkPct(90);
      setClassParticipationPct(88);
      setNeatnessPct(92);
      setRespectPct(92);
      setSelfControlPct(88);
    } else {
      setAdabScore(3);
      setQuranMemorizationPct(75);
      setHomeworkPct(70);
      setClassParticipationPct(78);
      setNeatnessPct(82);
      setRespectPct(80);
      setSelfControlPct(72);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStudentId) return;

    saveEvaluation({
      studentId: selectedStudentId,
      date: selectedDate,
      adabScore,
      salahPerformance,
      islamicStudiesPrep,
      homeworkStatus,
      conductNotes,
      awardedBadges,
      quranMemorizationPct,
      homeworkPct,
      classParticipationPct,
      neatnessPct,
      respectPct,
      selfControlPct
    });

    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  const handleSaveAndNext = () => {
    handleSave();
    const currentIndex = students.findIndex(s => s.id === selectedStudentId);
    if (currentIndex >= 0 && currentIndex < students.length - 1) {
      const nextStudent = students[currentIndex + 1];
      setSelectedStudentId(nextStudent.id);
      if (onSelectStudent) onSelectStudent(nextStudent.id);
    }
  };

  // Batch grade all class exemplary
  const handleBatchMarkAllExemplary = () => {
    const confirmation = window.confirm(
      language === 'ar' 
        ? 'هل تود وضع تقييم ممتاز (٥ نجوم، حضور صلاة الظهر جماعة، ونسبة نشاط ٩٥٪+) لجميع طلاب الحلقة لليوم؟'
        : 'Set exemplary grade (5★ Adab, Dhuhr with Jama’ah, and 95%+ activity metrics) for all 15 students today?'
    );
    if (!confirmation) return;

    const batchEvals = students.map(s => {
      const existing = getStudentEvaluation(s.id, selectedDate);
      return {
        studentId: s.id,
        date: selectedDate,
        adabScore: 5,
        salahPerformance: 'with_jamaah' as SalahStatus,
        islamicStudiesPrep: 5,
        homeworkStatus: 'completed' as HomeworkStatus,
        conductNotes: existing?.conductNotes || (language === 'ar' ? 'أداء ممتاز وانضباط تام في آداب الحلقة وصلاة الظهر.' : 'Exemplary performance and devout Halaqah etiquette.'),
        awardedBadges: existing?.awardedBadges?.length ? existing.awardedBadges : ['Adab Excellence'],
        quranMemorizationPct: existing?.quranMemorizationPct ?? 96,
        homeworkPct: existing?.homeworkPct ?? 100,
        classParticipationPct: existing?.classParticipationPct ?? 95,
        neatnessPct: existing?.neatnessPct ?? 96,
        respectPct: existing?.respectPct ?? 98,
        selfControlPct: existing?.selfControlPct ?? 95
      };
    });

    batchSaveEvaluations(batchEvals);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  // Date step handlers
  const changeDateByDays = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const newDateStr = dateObj.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Filter students
  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(query) ||
      (s.arabicName && s.arabicName.includes(query)) ||
      s.rollNumber.toString().includes(query)
    );
  });

  // Calculate Class KPIs for the selected date
  const evaluatedTodayCount = students.filter(s => !!getStudentEvaluation(s.id, selectedDate)).length;
  const evalsToday = students
    .map(s => getStudentEvaluation(s.id, selectedDate))
    .filter((e): e is DailyEvaluation => !!e);

  const avgClassAdab = evalsToday.length > 0
    ? (evalsToday.reduce((sum, e) => sum + e.adabScore, 0) / evalsToday.length).toFixed(1)
    : '5.0';

  const jamaahCount = evalsToday.filter(e => e.salahPerformance === 'with_jamaah').length;
  const jamaahRate = evalsToday.length > 0
    ? Math.round((jamaahCount / evalsToday.length) * 100)
    : 100;

  const avgClassActivity = evalsToday.length > 0
    ? Math.round(
        evalsToday.reduce((sum, e) => {
          const m = (e.quranMemorizationPct || 90) +
                    (e.homeworkPct || 90) +
                    (e.classParticipationPct || 90) +
                    (e.neatnessPct || 90) +
                    (e.respectPct || 90) +
                    (e.selfControlPct || 90);
          return sum + (m / 6);
        }, 0) / evalsToday.length
      )
    : 95;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#e5dad0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#faedd9] text-[#854d2b] flex items-center justify-center border border-[#e8d7c8]">
              <Star className="h-4.5 w-4.5 fill-[#df9b52] text-[#df9b52]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1b110b] text-base sm:text-lg">
                {language === 'ar' ? 'سجل تقييم الأنشطة اليومية والآداب' : 'Daily Student Activity & Adab Evaluation'}
              </h2>
              <p className="text-xs text-[#7c695d]">
                {language === 'ar'
                  ? 'سجل تقييم شامل: حفظ القرآن، الواجب، المشاركة، صلاة الظهر جماعة، والأخلاق الإسلامية'
                  : 'Comprehensive daily rubric: Qur’an memorization, homework, manners, Dhuhr congregational prayer'}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Date Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          
          {/* Mode Switcher */}
          <div className="flex bg-[#faf7f3] border border-[#e5dad0] p-1 rounded-xl text-xs font-bold text-[#635043]">
            <button
              id="eval-mode-individual-btn"
              type="button"
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-[#3b2317] text-[#faedd9] shadow-2xs'
                  : 'hover:text-[#1b110b]'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'التقييم الفردي' : 'Student Rubric'}</span>
            </button>
            <button
              id="eval-mode-matrix-btn"
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-[#3b2317] text-[#faedd9] shadow-2xs'
                  : 'hover:text-[#1b110b]'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'سجل الحلقة العام' : 'Class Matrix'}</span>
            </button>
            <button
              id="eval-mode-notes-btn"
              type="button"
              onClick={() => setViewMode('behavior_log')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'behavior_log'
                  ? 'bg-[#3b2317] text-[#faedd9] shadow-2xs'
                  : 'hover:text-[#1b110b]'
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-[#df9b52]" />
              <span>{language === 'ar' ? 'ملاحظات السلوك' : 'Behavior Notes'}</span>
              {behaviorNotes.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  viewMode === 'behavior_log' ? 'bg-[#df9b52] text-[#1b110b]' : 'bg-[#faedd9] text-[#854d2b]'
                }`}>
                  {behaviorNotes.length}
                </span>
              )}
            </button>
          </div>

          {/* Date Selector with Next/Prev Controls */}
          <div className="flex items-center bg-[#faf7f3] border border-[#e5dad0] rounded-xl px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => changeDateByDays(-1)}
              title={language === 'ar' ? 'اليوم السابق' : 'Previous day'}
              className="p-1 text-[#8c7464] hover:text-[#1b110b] hover:bg-[#ede5dc] rounded transition cursor-pointer"
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex items-center px-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#854d2b] mr-1.5 rtl:mr-0 rtl:ml-1.5" />
              <input
                id="evaluation-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-[#1b110b] focus:outline-none cursor-pointer text-xs"
              />
            </div>

            <button
              type="button"
              onClick={() => changeDateByDays(1)}
              title={language === 'ar' ? 'اليوم التالي' : 'Next day'}
              className="p-1 text-[#8c7464] hover:text-[#1b110b] hover:bg-[#ede5dc] rounded transition cursor-pointer"
            >
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Quick Print Button */}
          <button
            id="eval-print-summary-btn"
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-[#854d2b]" />
            <span className="hidden sm:inline">{language === 'ar' ? 'طباعة السجل' : 'Print Log'}</span>
          </button>
        </div>
      </div>

      {/* Class Activity KPIs Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#7c695d] block">{language === 'ar' ? 'نسبة إنجاز التقييم' : 'Graded Today'}</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#1b110b]">{evaluatedTodayCount}</span>
              <span className="text-xs text-[#7c695d]">/ {students.length}</span>
            </div>
            <span className="text-[11px] font-bold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded-full">
              {Math.round((evaluatedTodayCount / students.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#ede5dc] h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#854d2b] h-full rounded-full transition-all duration-300"
              style={{ width: `${(evaluatedTodayCount / students.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#7c695d] block">{language === 'ar' ? 'متوسط الآداب والسلوك' : 'Class Adab Average'}</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-[#1b110b]">{avgClassAdab}</span>
              <span className="text-xs text-[#7c695d]">/ 5.0</span>
            </div>
            <div className="flex text-[#df9b52]">
              <Star className="h-3.5 w-3.5 fill-[#df9b52]" />
            </div>
          </div>
          <p className="text-[10px] text-[#8c7464] mt-2 truncate">
            {language === 'ar' ? 'ممتاز، بيئة إيمانية منضبطة' : 'Exemplary Halaqah decorum'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#7c695d] block">{language === 'ar' ? 'صلاة الظهر جماعة' : 'Dhuhr with Jama’ah'}</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#1b110b]">{jamaahRate}%</span>
            </div>
            <span className="text-[10px] font-bold text-[#2d6639] bg-[#f0f9f1] px-1.5 py-0.5 rounded border border-[#c4e6c9]">
              {jamaahCount} {language === 'ar' ? 'طالب' : 'in row'}
            </span>
          </div>
          <p className="text-[10px] text-[#8c7464] mt-2 truncate">
            {language === 'ar' ? 'الصف الأول بمسجد المعهد' : 'First row devotion'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#7c695d] block">{language === 'ar' ? 'متوسط درجات الأنشطة' : 'Daily Activity Marks'}</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-[#854d2b]">{((avgClassActivity / 100) * 60).toFixed(1)}</span>
              <span className="text-xs text-[#7c695d]">/ 60</span>
            </div>
            <span className="text-[10px] font-bold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded">
              {((avgClassActivity / 100) * 10).toFixed(1)} / 10
            </span>
          </div>
          <p className="text-[10px] text-[#8c7464] mt-2 truncate">
            {language === 'ar' ? 'مجموع الحفظ والواجبات والمشاركة' : 'Overall student marks average'}
          </p>
        </div>

      </div>

      {/* Main Content Area */}
      {viewMode === 'individual' ? (
        /* INDIVIDUAL STUDENT RUBRIC VIEW */
        <div className="space-y-4">
          
          {/* Mobile Quick Student Carousel & Selector (Visible on small screens) */}
          <div className="lg:hidden bg-white rounded-2xl border border-[#e5dad0] p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1b110b]">
                {language === 'ar' ? 'اختر الطالب للتقييم:' : 'Select Student to Evaluate:'}
              </label>
              <span className="text-[10px] font-extrabold bg-[#faedd9] text-[#854d2b] px-2 py-0.5 rounded-full">
                {evaluatedTodayCount}/{students.length} Graded
              </span>
            </div>

            <select
              id="mobile-eval-student-picker"
              value={selectedStudentId}
              onChange={(e) => handleStudentClick(e.target.value)}
              className="w-full p-2.5 bg-[#faf7f3] border border-[#e5dad0] rounded-xl text-xs font-bold text-[#1b110b] focus:ring-1 focus:ring-[#854d2b]"
            >
              {students.map(st => {
                const evalData = getStudentEvaluation(st.id, selectedDate);
                return (
                  <option key={st.id} value={st.id}>
                    #{st.rollNumber} {st.fullName} ({st.arabicName}) {evalData ? '✓ [Graded]' : '• [Pending]'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Student Selection Roster (Desktop only) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[#e5dad0] p-4 shadow-xs space-y-3">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e6dc]">
              <div>
                <span className="text-xs font-bold text-[#1b110b] block">
                  {language === 'ar' ? `قائمة الطلاب (${students.length})` : `Class Roster (${students.length})`}
                </span>
                <span className="text-[11px] text-[#7c695d]">
                  {language === 'ar' ? 'اختر طالباً لتقييم أنشطته' : 'Select a student to evaluate'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleBatchMarkAllExemplary}
                className="text-[10px] font-bold text-[#854d2b] bg-[#faedd9] hover:bg-[#f5e3cb] px-2 py-1 rounded-lg transition cursor-pointer border border-[#e8d7c8]"
              >
                {language === 'ar' ? 'تمييز الكل' : 'Mark All Exemplary'}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-[#8c7464] absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
              <input
                id="eval-student-search-input"
                type="text"
                placeholder={language === 'ar' ? 'بحث بالاسم أو الرقم...' : 'Search student by name or #...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#faf7f3] border border-[#e5dad0] rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs text-[#1b110b] focus:outline-none focus:ring-1 focus:ring-[#854d2b]"
              />
            </div>

            {/* Student List */}
            <div className="max-h-[560px] overflow-y-auto space-y-1.5 pr-1">
              {filteredStudents.map(student => {
                const isSelected = student.id === selectedStudentId;
                const studentEval = getStudentEvaluation(student.id, selectedDate);
                const hasEvaluation = !!studentEval;
                const studentNoteCount = behaviorNotes.filter(n => n.studentId === student.id).length;

                return (
                  <button
                    key={student.id}
                    id={`eval-student-select-${student.id}`}
                    type="button"
                    onClick={() => handleStudentClick(student.id)}
                    className={`w-full p-2.5 rounded-xl text-left rtl:text-right transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
                        : 'hover:bg-[#faf7f3] text-[#1b110b] border border-transparent hover:border-[#ede5dc]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#df9b52] text-[#1b110b]' : 'bg-[#ede5dc] text-[#635043]'
                      }`}>
                        {student.rollNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs truncate font-bold">
                            {language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}
                          </p>
                          {studentNoteCount > 0 && (
                            <span 
                              title={`${studentNoteCount} behavior notes on record`}
                              className={`text-[9px] font-bold px-1 py-0.2 rounded inline-flex items-center gap-0.5 shrink-0 ${
                                isSelected ? 'bg-[#df9b52] text-[#1b110b]' : 'bg-[#faedd9] text-[#854d2b]'
                              }`}
                            >
                              <Lock className="h-2 w-2" />
                              <span>{studentNoteCount}</span>
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-[#d6c4b6]' : 'text-[#8c7464]'}`}>
                          {language === 'ar' ? student.fullName : student.arabicName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left shrink-0 ml-2 rtl:ml-0 rtl:mr-2">
                      {hasEvaluation ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-extrabold text-[#df9b52] flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-[#df9b52]" />
                            <span>{studentEval.adabScore}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#24140c] text-[#df9b52]' : 'bg-[#faedd9] text-[#854d2b]'
                          }`}>
                            {language === 'ar' ? 'مكتمل' : 'Graded'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#8c7464] font-medium bg-[#ede5dc]/60 px-1.5 py-0.5 rounded">
                          {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredStudents.length === 0 && (
                <p className="text-xs text-[#8c7464] italic text-center py-6">
                  {language === 'ar' ? 'لا يوجد طلاب مطابقين للبحث' : 'No students matching search'}
                </p>
              )}
            </div>

          </div>

          {/* Right Column (2 cols): Comprehensive Evaluation Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e5dad0] p-6 shadow-xs">
            {selectedStudent ? (
              <div className="space-y-6">
                <form onSubmit={handleSave} className="space-y-6">
                
                {/* Target Student Identity Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#f0e6dc]">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStudent.avatarUrl}
                      alt={selectedStudent.fullName}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-xl object-cover border-2 border-[#e5dad0] shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#faedd9] text-[#854d2b] font-extrabold text-xs px-2 py-0.5 rounded-md">
                          #{selectedStudent.rollNumber}
                        </span>
                        <h3 className="text-base font-bold text-[#1b110b]">
                          {language === 'ar' ? (selectedStudent.arabicName || selectedStudent.fullName) : selectedStudent.fullName}
                        </h3>
                      </div>
                      <p className="text-xs text-[#7c695d] mt-0.5 flex items-center gap-2">
                        <span>{language === 'ar' ? selectedStudent.fullName : selectedStudent.arabicName}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#854d2b]">{getStudentGroupName(selectedStudent.group, language)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenWeeklyReport && (
                      <button
                        type="button"
                        onClick={() => onOpenWeeklyReport(selectedStudent.id)}
                        className="px-3 py-1.5 bg-[#2a170d] hover:bg-[#3d2315] text-[#df9b52] border border-[#df9b52]/50 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title={language === 'ar' ? 'عرض بطاقة التقرير الأسبوعي ٩:١٦' : 'View 9:16 Weekly Report'}
                      >
                        <FileText className="h-3.5 w-3.5 text-[#df9b52]" />
                        <span>{language === 'ar' ? 'التقرير ٩:١٦' : 'Report 9:16'}</span>
                      </button>
                    )}
                    {showSavedFeedback && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6639] bg-[#f0f9f1] border border-[#c4e6c9] px-3 py-1.5 rounded-lg animate-fade-in">
                        <Check className="h-4 w-4" />
                        <span>{language === 'ar' ? 'تم الحفظ!' : 'Saved!'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 1: Adab & Akhlaq Rating */}
                <div className="bg-[#faf7f3] p-4 rounded-xl border border-[#e5dad0]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#1b110b] flex items-center gap-2">
                      <span>{language === 'ar' ? 'الآداب والأخلاق الإسلامية في الحلقة' : 'Adab & Islamic Etiquette in Halaqah'}</span>
                      <span className="text-[#854d2b] font-extrabold text-sm">{adabScore} / 5</span>
                    </label>
                    <span className="text-[11px] font-bold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded-full">
                      {adabScore === 5 && (language === 'ar' ? 'أدب متميز (ممتاز)' : 'Exemplary Adab (Mumtaz)')}
                      {adabScore === 4 && (language === 'ar' ? 'منضبط ومحترم (جيد جداً)' : 'Very Respectful (Jayyid Jiddan)')}
                      {adabScore === 3 && (language === 'ar' ? 'مقبول (يحتاج تركيزاً)' : 'Acceptable (Needs Focus)')}
                      {adabScore <= 2 && (language === 'ar' ? 'يحتاج توجيهاً وتذكيراً' : 'Needs Guidance & Reminder')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        id={`adab-star-btn-${star}`}
                        onClick={() => setAdabScore(star)}
                        className="p-1 text-[#d6c4b6] hover:text-[#df9b52] hover:scale-110 transition cursor-pointer"
                      >
                        <Star className={`h-7 w-7 ${
                          star <= adabScore ? 'text-[#df9b52] fill-[#df9b52]' : 'text-[#d6c4b6]'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Dhuhr Prayer with Jama'ah */}
                <div>
                  <label className="text-xs font-bold text-[#1b110b] block mb-2">
                    {language === 'ar' ? 'حضور وأداء صلاة الظهر جماعة بالمسجد' : 'Dhuhr Prayer with Congregation (Jama’ah)'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'with_jamaah', labelEn: 'With Jama’ah (First Row)', labelAr: 'مع الجماعة (الصف الأول)', descEn: 'On time in masjid', descAr: 'في المسجد بالصف الأول' },
                      { id: 'individual', labelEn: 'Individual Prayer', labelAr: 'صلاة منفردة', descEn: 'Prayed after jama’ah', descAr: 'صلى منفرداً' },
                      { id: 'excused', labelEn: 'Excused / Illness', labelAr: 'معذور / مريض', descEn: 'Valid reason', descAr: 'عذر شرعي / صحي' },
                      { id: 'missed', labelEn: 'Missed / Late', labelAr: 'تأخر / فاتته', descEn: 'Missed prayer time', descAr: 'فاتته الصلاة' },
                    ].map(item => (
                      <button
                        key={item.id}
                        id={`salah-opt-${item.id}`}
                        type="button"
                        onClick={() => setSalahPerformance(item.id as SalahStatus)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          salahPerformance === item.id
                            ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317] shadow-2xs font-bold'
                            : 'bg-[#faf7f3] text-[#635043] border-[#e5dad0] hover:bg-[#ede5dc]'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">
                          {language === 'ar' ? item.labelAr : item.labelEn}
                        </span>
                        <span className={`text-[10px] ${salahPerformance === item.id ? 'text-[#d6c4b6]' : 'text-[#8c7464]'}`}>
                          {language === 'ar' ? item.descAr : item.descEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3: Daily Activity Performance Rubric in Tabular Form with Marks */}
                <div className="bg-[#faf7f3] p-5 rounded-2xl border border-[#e5dad0] space-y-4">
                  {/* Rubric Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#e5dad0] pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4.5 w-4.5 text-[#854d2b]" />
                        <label className="text-sm font-extrabold text-[#1b110b]">
                          {language === 'ar' ? 'جدول معايير درجات الأداء اليومي والآداب (٦٠ درجة)' : 'Daily Activity Performance Rubric (60 Marks Total)'}
                        </label>
                      </div>
                      <p className="text-xs text-[#7c695d] mt-1">
                        {language === 'ar'
                          ? 'جدول تقييم معياري تفصيلي بالدرجات (١٠ درجات لكل نشاط) بدلاً من النسب المئوية'
                          : 'Tabular standards-based rubric with numerical marks (10 marks per criterion) instead of percentages'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Presets based on marks */}
                      <span className="text-[11px] font-bold text-[#7c695d]">{language === 'ar' ? 'نماذج جاهزة:' : 'Presets:'}</span>
                      <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => applyRubricPreset('full')}
                          className="px-2 py-1 rounded bg-white hover:bg-[#faedd9] text-[#2d6639] border border-[#c4e6c9] transition cursor-pointer"
                        >
                          {language === 'ar' ? 'الدرجة الكاملة (٦٠)' : 'Full (60/60)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyRubricPreset('mumtaz')}
                          className="px-2 py-1 rounded bg-white hover:bg-[#faedd9] text-[#854d2b] border border-[#e5dad0] transition cursor-pointer"
                        >
                          {language === 'ar' ? 'ممتاز (٥٨.٨)' : 'Top (58.8/60)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyRubricPreset('jayyid')}
                          className="px-2 py-1 rounded bg-white hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] transition cursor-pointer"
                        >
                          {language === 'ar' ? 'جيد جداً (٥٤)' : 'Good (54/60)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyRubricPreset('needs_guidance')}
                          className="px-2 py-1 rounded bg-white hover:bg-[#ede5dc] text-amber-800 border border-amber-200 transition cursor-pointer"
                        >
                          {language === 'ar' ? 'توجيه (٤٥.٧)' : 'Guidance (45.7/60)'}
                        </button>
                      </div>

                      {/* Total Score Highlights */}
                      <div className="flex items-center gap-1.5 ml-0 lg:ml-2 rtl:lg:mr-2 rtl:lg:ml-0">
                        <div className="bg-[#faedd9] border border-[#e8d7c8] px-3 py-1 rounded-lg flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-[#7c695d]">
                            {language === 'ar' ? 'المجموع:' : 'Total:'}
                          </span>
                          <span className="text-xs font-black text-[#854d2b]">
                            {getTotalMarks()} <span className="text-[10px] text-[#7c695d]">/ 60.0</span>
                          </span>
                        </div>
                        <div className="bg-white border border-[#e5dad0] px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-[#7c695d]">
                            {language === 'ar' ? 'المعدل:' : 'Avg:'}
                          </span>
                          <span className="text-xs font-bold text-[#1b110b]">
                            {getAverageMarks()} <span className="text-[9px] text-[#7c695d]">/ 10</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rubric Table */}
                  <div className="overflow-x-auto border border-[#e5dad0] rounded-xl bg-white shadow-2xs">
                    <table className="w-full min-w-[500px] text-xs text-left rtl:text-right border-collapse">
                      <thead>
                        <tr className="bg-[#faf7f3] border-b border-[#e5dad0] text-[#635043] font-bold">
                          <th className="py-3 px-3 w-10 text-center">#</th>
                          <th className="py-3 px-3 min-w-[200px]">
                            {language === 'ar' ? 'معيار التقييم والوصف' : 'Performance Criterion & Description'}
                          </th>
                          <th className="py-3 px-3 min-w-[220px] hidden md:table-cell">
                            {language === 'ar' ? 'المستوى المعياري للدرجات' : 'Benchmark Standards'}
                          </th>
                          <th className="py-3 px-3 text-center w-20">
                            {language === 'ar' ? 'العظمى' : 'Max'}
                          </th>
                          <th className="py-3 px-3 min-w-[160px] text-center">
                            {language === 'ar' ? 'الدرجة الممنوحة' : 'Marks Awarded'}
                          </th>
                          <th className="py-3 px-3 text-center w-28">
                            {language === 'ar' ? 'التقدير' : 'Standing'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0e6dc]">
                        {[
                          {
                            id: 'quran',
                            num: 1,
                            nameEn: 'Qur’an Memorization & Retention',
                            nameAr: 'حفظ القرآن الكريم وتثبيته',
                            descEn: 'Daily Sabaq fluency, tajweed precision, and verse retention without hesitation',
                            descAr: 'تسميع السبق اليومي، طلاقة الحفظ، إتقان أحكام التجويد ومخارج الحروف دون تردد',
                            standardEn: '9.0–10: Flawless recitation • 8.0–8.9: 1–2 slight pauses • 7.0–7.9: Frequent pauses • <7: Needs Muraja’ah',
                            standardAr: '٩-١٠: تلاوة متقنة بالتجويد • ٨-٨.٩: وقفة أو وقفتان • ٧-٧.٩: وقفات متكررة • أقل من ٧: يحتاج تثبيت',
                            maxMarks: 10,
                            marks: Number((quranMemorizationPct / 10).toFixed(1)),
                            setMarks: (val: number) => {
                              const clamped = Math.min(10, Math.max(0, val));
                              setQuranMemorizationPct(Math.round(clamped * 10));
                            },
                            icon: BookOpen
                          },
                          {
                            id: 'homework',
                            num: 2,
                            nameEn: 'Homework & Muraja’ah Revision',
                            nameAr: 'واجب المراجعة والمنزل',
                            descEn: 'Completion of evening Sabqi revision and Manzil recitation with parent verification',
                            descAr: 'إتمام مراجعة السبقي والمنزل يومياً والتسميع المنزلي بتوقيع ولي الأمر',
                            standardEn: '9.0–10: Full revision verified • 8.0–8.9: Majority revised • 7.0–7.9: Partial revision • <7: Neglected homework',
                            standardAr: '٩-١٠: إتمام كامل مع التوقيع • ٨-٨.٩: مراجعة معظم المقرر • ٧-٧.٩: مراجعة جزئية • أقل من ٧: تقصير في الواجب',
                            maxMarks: 10,
                            marks: Number((homeworkPct / 10).toFixed(1)),
                            setMarks: (val: number) => {
                              const clamped = Math.min(10, Math.max(0, val));
                              setHomeworkPct(Math.round(clamped * 10));
                            },
                            icon: BookMarked
                          },
                          {
                            id: 'participation',
                            num: 3,
                            nameEn: 'Halaqah Engagement & Alertness',
                            nameAr: 'المشاركة والتفاعل في الحلقة',
                            descEn: 'Attentiveness, eagerness to recite, listening to peers, and answering questions',
                            descAr: 'اليقظة وحسن الاستماع لتلاوة الزملاء، والمبادرة الإيجابية بالتسميع والتفاعل',
                            standardEn: '9.0–10: Keen, attentive, answers readily • 8.0–8.9: Active listener • 7.0–7.9: Occasional drift • <7: Passive or distracted',
                            standardAr: '٩-١٠: مبادر متيقظ طوال الوقت • ٨-٨.٩: إنصات مستمر • ٧-٧.٩: شتات يسير • أقل من ٧: خمول وتشتت',
                            maxMarks: 10,
                            marks: Number((classParticipationPct / 10).toFixed(1)),
                            setMarks: (val: number) => {
                              const clamped = Math.min(10, Math.max(0, val));
                              setClassParticipationPct(Math.round(clamped * 10));
                            },
                            icon: Activity
                          },
                          {
                            id: 'neatness',
                            num: 4,
                            nameEn: 'Islamic Attire & Neatness',
                            nameAr: 'النظافة والزي الشرعي',
                            descEn: 'Pristine white Thobe, clean Kufi cap, personal hygiene, and Mushaf care',
                            descAr: 'ارتداء الثوب الأبيض النظيف، الطاقية، النظافة الشخصية، وصون المصحف الشريف',
                            standardEn: '9.0–10: Impeccable thobe & cap, Mushaf care • 8.0–8.9: Tidy uniform • 7.0–7.9: Minor slip • <7: Untidy or missing cap',
                            standardAr: '٩-١٠: زي ناصع وطاقية وصون المصحف • ٨-٨.٩: مظهر مهندم • ٧-٧.٩: ملاحظة يسيرة • أقل من ٧: ثوب غير لائق أو إهمال',
                            maxMarks: 10,
                            marks: Number((neatnessPct / 10).toFixed(1)),
                            setMarks: (val: number) => {
                              const clamped = Math.min(10, Math.max(0, val));
                              setNeatnessPct(Math.round(clamped * 10));
                            },
                            icon: Sparkles
                          },
                          {
                            id: 'respect',
                            num: 5,
                            nameEn: 'Respect, Adab & Brotherhood',
                            nameAr: 'الاحترام وحسن الخلق والأخوة',
                            descEn: 'Adab towards Ustadh, greeting brothers with Salam, kindness, and cooperative spirit',
                            descAr: 'التأدب مع الشيخ، إفشاء السلام، التعاون والتراحم والأخوة مع طلاب الحلقة',
                            standardEn: '9.0–10: Exemplary Islamic conduct & Salam • 8.0–8.9: Courteous & respectful • 7.0–7.9: Polite with reminders • <7: Rough or impolite',
                            standardAr: '٩-١٠: أدب رفيع وإفشاء للسلام • ٨-٨.٩: خلق طيب وتعاون • ٧-٧.٩: استجابة للتوجيه • أقل من ٧: يحتاج تقويم في الأدب',
                            maxMarks: 10,
                            marks: Number((respectPct / 10).toFixed(1)),
                            setMarks: (val: number) => {
                              const clamped = Math.min(10, Math.max(0, val));
                              setRespectPct(Math.round(clamped * 10));
                            },
                            icon: ShieldCheck
                          },
                          {
                            id: 'selfControl',
                            num: 6,
                            nameEn: 'Self-Control, Focus & Tranquility',
                            nameAr: 'الانضباط والسكينة في المجلس',
                            descEn: 'Sitting respectfully, calm posture, avoiding fidgeting or interrupting recitations',
                            descAr: 'السكينة والوقار في مجلس القرآن، حسن الجلوس، وتجنب مقاطعة التلاوة أو العبث',
                            standardEn: '9.0–10: Dignified calm, deep concentration • 8.0–8.9: Well seated • 7.0–7.9: Slight restlessness • <7: Frequent disruptions',
                            standardAr: '٩-١٠: وقار وسكينة تامة وتركيز • ٨-٨.٩: التزام الجلسة • ٧-٧.٩: حركة يسيرة • أقل من ٧: تشويش ومقاطعة',
                            maxMarks: 10,
                            marks: Number((selfControlPct / 10).toFixed(1)),
                            setMarks: (val: number) => {
                              const clamped = Math.min(10, Math.max(0, val));
                              setSelfControlPct(Math.round(clamped * 10));
                            },
                            icon: Star
                          }
                        ].map((item) => {
                          const rating = getMarksRating(item.marks, language === 'ar');
                          const IconComp = item.icon;
                          return (
                            <tr key={item.id} className="hover:bg-[#faf7f3]/70 transition">
                              {/* # */}
                              <td className="py-3 px-3 text-center font-bold text-[#854d2b]">
                                {item.num}
                              </td>

                              {/* Criterion Title & Desc */}
                              <td className="py-3 px-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-[#faedd9]/60 text-[#854d2b] mt-0.5 shrink-0 border border-[#e8d7c8]">
                                    <IconComp className="h-3.5 w-3.5" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-[#1b110b] text-xs">
                                      {language === 'ar' ? item.nameAr : item.nameEn}
                                    </h5>
                                    <p className="text-[11px] text-[#7c695d] mt-0.5 leading-snug">
                                      {language === 'ar' ? item.descAr : item.descEn}
                                    </p>
                                    {/* Mobile-only standards reminder */}
                                    <p className="text-[10px] text-[#8c7464] mt-1 md:hidden italic">
                                      {language === 'ar' ? item.standardAr : item.standardEn}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Benchmark Standards */}
                              <td className="py-3 px-3 text-[11px] text-[#635043] hidden md:table-cell leading-relaxed">
                                <div className="bg-[#faf7f3] p-2 rounded-lg border border-[#ede5dc]">
                                  {language === 'ar' ? item.standardAr : item.standardEn}
                                </div>
                              </td>

                              {/* Max Marks */}
                              <td className="py-3 px-3 text-center font-bold text-[#7c695d]">
                                <span className="bg-[#faf7f3] border border-[#e5dad0] px-2 py-1 rounded text-xs">
                                  {item.maxMarks}
                                </span>
                              </td>

                              {/* Marks Awarded with Input & Steppers */}
                              <td className="py-3 px-3">
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => item.setMarks(Math.max(0, Number((item.marks - 0.5).toFixed(1))))}
                                      title="-0.5 marks"
                                      className="w-6 h-6 rounded bg-white hover:bg-[#ede5dc] border border-[#d6c5b6] text-[#635043] font-bold flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>

                                    <div className="flex items-center bg-[#faf7f3] border border-[#854d2b]/60 rounded-lg px-2 py-0.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#854d2b]">
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        value={item.marks}
                                        onChange={(e) => {
                                          const v = parseFloat(e.target.value);
                                          item.setMarks(isNaN(v) ? 0 : v);
                                        }}
                                        className="w-10 text-center font-black text-xs text-[#1b110b] focus:outline-none bg-transparent"
                                      />
                                      <span className="text-[10px] font-bold text-[#8c7464] ml-0.5 rtl:mr-0.5 rtl:ml-0">/ 10</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => item.setMarks(Math.min(10, Number((item.marks + 0.5).toFixed(1))))}
                                      title="+0.5 marks"
                                      className="w-6 h-6 rounded bg-white hover:bg-[#ede5dc] border border-[#d6c5b6] text-[#635043] font-bold flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>

                                  {/* Quick Score Chips */}
                                  <div className="flex items-center gap-1 text-[9px] font-bold">
                                    {[10, 9.5, 9.0, 8.5, 8.0].map((mk) => (
                                      <button
                                        key={mk}
                                        type="button"
                                        onClick={() => item.setMarks(mk)}
                                        className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                                          Math.abs(item.marks - mk) < 0.05
                                            ? 'bg-[#854d2b] text-white border-[#854d2b] shadow-2xs'
                                            : 'bg-white hover:bg-[#faedd9] text-[#635043] border-[#e5dad0]'
                                        }`}
                                      >
                                        {mk}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>

                              {/* Standing Badge */}
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${rating.badgeClass}`}>
                                  {rating.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-[#faf7f3] border-t-2 border-[#e5dad0] font-bold">
                        <tr>
                          <td colSpan={2} className="py-3 px-3 text-[#1b110b] font-extrabold text-xs">
                            <div className="flex items-center gap-2">
                              <span>{language === 'ar' ? 'مجموع درجات الأنشطة والآداب:' : 'Total Rubric Marks Awarded:'}</span>
                              <span className="text-[#854d2b] font-black text-sm">
                                {getTotalMarks()} / 60.0 {language === 'ar' ? 'درجة' : 'Marks'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell text-xs text-[#7c695d]">
                            <span>{language === 'ar' ? 'متوسط النشاط الواحد: ' : 'Average per Criterion: '}</span>
                            <span className="font-extrabold text-[#1b110b]">{getAverageMarks()} / 10.0</span>
                          </td>
                          <td className="py-3 px-3 text-center text-[#7c695d] text-xs">
                            60
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-xs font-black text-[#854d2b] bg-[#faedd9] px-2.5 py-1 rounded-lg border border-[#e8d7c8]">
                              {getTotalMarks()} / 60.0
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#faedd9] text-[#854d2b] border border-[#e8d7c8]">
                              {getMarksRating(getAverageMarks(), language === 'ar').label}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Section 4: Islamic Studies Prep & Homework Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#1b110b] block mb-1">
                      {language === 'ar' ? 'التحضير لدرس الدراسات الإسلامية (١-٥)' : 'Islamic Studies Lesson Preparation (1-5)'}
                    </label>
                    <select
                      value={islamicStudiesPrep}
                      onChange={(e) => setIslamicStudiesPrep(Number(e.target.value))}
                      className="w-full p-2.5 border border-[#e5dad0] rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-[#faf7f3] text-[#1b110b]"
                    >
                      <option value={5}>{language === 'ar' ? '٥ - تحضير متميز وإجابة وافية' : '5 - Thoroughly prepared & answered questions'}</option>
                      <option value={4}>{language === 'ar' ? '٤ - فهم واستيعاب جيد جداً' : '4 - Good understanding'}</option>
                      <option value={3}>{language === 'ar' ? '٣ - استيعاب مقبول' : '3 - Acceptable comprehension'}</option>
                      <option value={2}>{language === 'ar' ? '٢ - تحضير ناقص' : '2 - Incomplete preparation'}</option>
                      <option value={1}>{language === 'ar' ? '١ - لم يحضر الدرس' : '1 - Unprepared'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1b110b] block mb-1">
                      {language === 'ar' ? 'حالة المراجعة المنزلية (المرجأة)' : 'Home Muraja’ah (Revision) Status'}
                    </label>
                    <select
                      value={homeworkStatus}
                      onChange={(e) => setHomeworkStatus(e.target.value as HomeworkStatus)}
                      className="w-full p-2.5 border border-[#e5dad0] rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-[#faf7f3] text-[#1b110b]"
                    >
                      <option value="completed">{language === 'ar' ? 'مكتمل بالكامل' : 'Completed Fully'}</option>
                      <option value="partial">{language === 'ar' ? 'مكتمل جزئياً' : 'Partially Completed'}</option>
                      <option value="incomplete">{language === 'ar' ? 'غير مكتمل / نسي' : 'Incomplete / Forgot'}</option>
                    </select>
                  </div>
                </div>

                {/* Section 5: Merit Badges */}
                <div>
                  <label className="text-xs font-bold text-[#1b110b] block mb-2 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#df9b52]" />
                    <span>{language === 'ar' ? 'أوسمة التميز لليوم' : 'Award Merits & Badges for Today'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(language === 'ar' ? AVAILABLE_BADGES_AR : AVAILABLE_BADGES_EN).map(badge => {
                      const isSelected = awardedBadges.includes(badge);
                      return (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => handleToggleBadge(badge)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#faedd9] text-[#854d2b] border-[#c88642] shadow-2xs'
                              : 'bg-[#faf7f3] text-[#635043] border-[#e5dad0] hover:bg-[#ede5dc]'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#854d2b]" />}
                          <span>{badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 6: Conduct Notes & Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1b110b] block">
                      {language === 'ar' ? 'ملاحظات المعلم وسجل السلوك' : 'Teacher Observations & Conduct Notes'}
                    </label>
                    <span className="text-[10px] text-[#8c7464]">
                      {language === 'ar' ? 'انقر على العبارة للإدراج السريع:' : 'Quick insert presets:'}
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(language === 'ar' ? CONDUCT_NOTE_PRESETS_AR : CONDUCT_NOTE_PRESETS_EN).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setConductNotes(preset)}
                        className="text-[10px] bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] px-2 py-1 rounded-md transition cursor-pointer text-left rtl:text-right truncate max-w-[280px]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="eval-conduct-notes-textarea"
                    rows={2}
                    value={conductNotes}
                    onChange={(e) => setConductNotes(e.target.value)}
                    placeholder={language === 'ar' ? 'ملاحظات للمعلم وولي الأمر...' : 'Notes for teacher and parent report...'}
                    className="w-full p-3 border border-[#e5dad0] rounded-xl text-xs focus:ring-1 focus:ring-[#854d2b] bg-[#faf7f3] text-[#1b110b]"
                  />
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-2 border-t border-[#f0e6dc] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#7c695d]">
                    {language === 'ar' ? 'تاريخ التقييم:' : 'Evaluation Date:'} <strong className="text-[#1b110b]">{selectedDate}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      id="evaluation-save-btn"
                      type="submit"
                      className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#df9b52]" />
                      <span>{language === 'ar' ? 'حفظ تقييم الطالب' : 'Save Student Evaluation'}</span>
                    </button>

                    <button
                      id="evaluation-save-next-btn"
                      type="button"
                      onClick={handleSaveAndNext}
                      className="bg-[#c88642] hover:bg-[#d99753] text-[#18110c] text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <span>{language === 'ar' ? 'حفظ والتالي' : 'Save & Next Student'}</span>
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

              </form>

              {/* Private Classroom Conduct & Behavior Notes */}
              <div className="pt-2">
                <BehaviorNotesSection student={selectedStudent} currentDate={selectedDate} />
              </div>
            </div>
            ) : (
              <div className="text-center py-16 text-[#8c7464]">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">{language === 'ar' ? 'يرجى اختيار طالب لبدء التقييم' : 'Please select a student from the roster'}</p>
              </div>
            )}
          </div>

        </div>
        </div>
      ) : viewMode === 'matrix' ? (
        /* CLASS-WIDE REGISTER & MATRIX VIEW */
        <div className="bg-white rounded-2xl border border-[#e5dad0] p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e6dc]">
            <div>
              <h3 className="text-base font-bold text-[#1b110b] flex items-center gap-2">
                <Table className="h-4.5 w-4.5 text-[#854d2b]" />
                <span>{language === 'ar' ? 'سجل تقييم الأنشطة لكامل الحلقة' : 'Halaqah Daily Activity & Adab Matrix'}</span>
              </h3>
              <p className="text-xs text-[#7c695d] mt-0.5">
                {language === 'ar'
                  ? 'عرض شامل لدرجات الأنشطة، السلوك، وصلوات جميع الطلاب لليوم'
                  : 'Class-wide overview of all student activity percentages, Adab stars, and prayer attendance'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="matrix-mark-all-exemplary-btn"
                type="button"
                onClick={handleBatchMarkAllExemplary}
                className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#df9b52]" />
                <span>{language === 'ar' ? 'تمييز الجميع (٥ نجوم)' : 'Grade All Exemplary'}</span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-[#faf7f3] border-y border-[#e5dad0] text-[#635043] font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{language === 'ar' ? 'اسم الطالب' : 'Student Name'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'الآداب' : 'Adab'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'صلاة الظهر' : 'Dhuhr Salah'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'حفظ القرآن (١٠)' : 'Qur’an (/10)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'الواجب (١٠)' : 'Homework (/10)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'المشاركة (١٠)' : 'Participation (/10)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'النظافة (١٠)' : 'Neatness (/10)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'الاحترام (١٠)' : 'Respect (/10)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'الانضباط (١٠)' : 'Discipline (/10)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'مجموع الدرجات (٦٠)' : 'Total Marks (/60)'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'ملاحظات السلوك' : 'Behavior'}</th>
                  <th className="py-2.5 px-3 text-right rtl:text-left">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6dc]">
                {students.map(student => {
                  const ev = getStudentEvaluation(student.id, selectedDate);
                  const isEvaluated = !!ev;
                  const studentAdab = ev?.adabScore || 5;
                  const totalStudentMarks = (
                    ((ev?.quranMemorizationPct ?? 95) + 
                     (ev?.homeworkPct ?? 100) + 
                     (ev?.classParticipationPct ?? 95) + 
                     (ev?.neatnessPct ?? 95) + 
                     (ev?.respectPct ?? 98) + 
                     (ev?.selfControlPct ?? 94)) / 10
                  ).toFixed(1);
                  const bNotes = behaviorNotes.filter(n => n.studentId === student.id);
                  const hasConcern = bNotes.some(n => n.incidentType === 'concern' || n.incidentType === 'action_needed');

                  return (
                    <tr key={student.id} className="hover:bg-[#faf7f3]/80 transition">
                      <td className="py-2.5 px-3 font-bold text-[#854d2b]">
                        #{student.rollNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1b110b]">
                        <div>
                          <span>{language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}</span>
                          <span className="block text-[10px] text-[#8c7464] font-normal">
                            {language === 'ar' ? student.fullName : student.arabicName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-[#df9b52]">
                          <Star className="h-3.5 w-3.5 fill-[#df9b52]" />
                          <span>{studentAdab}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (ev?.salahPerformance || 'with_jamaah') === 'with_jamaah'
                            ? 'bg-[#f0f9f1] text-[#2d6639]'
                            : 'bg-[#faf7f3] text-[#8c7464]'
                        }`}>
                          {(ev?.salahPerformance || 'with_jamaah') === 'with_jamaah'
                            ? (language === 'ar' ? 'جماعة' : 'Jama’ah')
                            : (language === 'ar' ? 'منفرد' : 'Individual')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1b110b]">
                        {((ev?.quranMemorizationPct ?? 95) / 10).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1b110b]">
                        {((ev?.homeworkPct ?? 100) / 10).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1b110b]">
                        {((ev?.classParticipationPct ?? 95) / 10).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1b110b]">
                        {((ev?.neatnessPct ?? 95) / 10).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1b110b]">
                        {((ev?.respectPct ?? 98) / 10).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#1b110b]">
                        {((ev?.selfControlPct ?? 94) / 10).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-extrabold text-[#854d2b] bg-[#faedd9] px-2.5 py-1 rounded text-[11px] border border-[#e8d7c8]">
                          {totalStudentMarks} / 60
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            if (onSelectStudent) onSelectStudent(student.id);
                            setViewMode('individual');
                          }}
                          title={language === 'ar' ? 'عرض ملاحظات السلوك الخاصة' : 'View private behavior notes'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer border ${
                            bNotes.length > 0
                              ? hasConcern
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : 'bg-[#faedd9] text-[#854d2b] border-[#e8d7c8] hover:bg-[#f5e0c5]'
                              : 'bg-[#faf7f3] text-[#8c7464] border-[#e5dad0] hover:bg-[#ede5dc]'
                          }`}
                        >
                          <Lock className="h-2.5 w-2.5 text-[#df9b52]" />
                          <span>{bNotes.length} {language === 'ar' ? 'ملاحظة' : 'notes'}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right rtl:text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            if (onSelectStudent) onSelectStudent(student.id);
                            setViewMode('individual');
                          }}
                          className="text-[11px] font-bold text-[#854d2b] hover:text-[#5c351f] hover:underline cursor-pointer"
                        >
                          {language === 'ar' ? 'تعديل التقييم' : 'Edit Rubric'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* CLASS-WIDE BEHAVIOR NOTES & CONDUCT DOSSIER */
        <ClassBehaviorLogView 
          onSelectStudent={(studentId) => {
            setSelectedStudentId(studentId);
            if (onSelectStudent) onSelectStudent(studentId);
            setViewMode('individual');
          }}
        />
      )}

      {/* Printable Activity Log Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#e5dad0] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e6dc]">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-[#854d2b]" />
                <h4 className="font-bold text-[#1b110b] text-base">
                  {language === 'ar' ? 'سجل الأنشطة اليومية الرسمي — الصَّفُّ الخَامِسُ' : 'Official Class Five Daily Activity Ledger'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-[#8c7464] hover:text-[#1b110b] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <p className="font-arabic text-sm text-[#854d2b]">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <h5 className="font-bold text-sm text-[#1b110b]">
                {language === 'ar' ? 'معهد الملة الإسلامي — سجل التقييم والسلوك اليومي' : 'Al-Millah Islamic Academy — Daily Activity & Conduct Register'}
              </h5>
              <p className="text-xs text-[#7c695d]">
                {language === 'ar' ? `التاريخ: ${selectedDate} | الأستاذ المشرف: محمد شياعو` : `Date: ${selectedDate} | Supervisor: Ustadh Muhammad Shaya'u`}
              </p>
            </div>

            <div className="border border-[#e5dad0] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-[#faf7f3] border-b border-[#e5dad0] font-bold text-[#635043]">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">{language === 'ar' ? 'الطالب' : 'Student'}</th>
                    <th className="p-2 text-center">{language === 'ar' ? 'الآداب' : 'Adab'}</th>
                    <th className="p-2 text-center">{language === 'ar' ? 'صلاة الظهر' : 'Salah'}</th>
                    <th className="p-2 text-center">{language === 'ar' ? 'درجات الأنشطة (٦٠)' : 'Activity Marks (/60)'}</th>
                    <th className="p-2">{language === 'ar' ? 'الملاحظات والأوسمة' : 'Notes & Badges'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e6dc]">
                  {students.map(s => {
                    const ev = getStudentEvaluation(s.id, selectedDate);
                    const totalMarks = (
                      ((ev?.quranMemorizationPct ?? 95) +
                       (ev?.homeworkPct ?? 100) +
                       (ev?.classParticipationPct ?? 95) +
                       (ev?.neatnessPct ?? 95) +
                       (ev?.respectPct ?? 98) +
                       (ev?.selfControlPct ?? 94)) / 10
                    ).toFixed(1);
                    return (
                      <tr key={s.id}>
                        <td className="p-2 font-bold text-[#854d2b]">#{s.rollNumber}</td>
                        <td className="p-2 font-semibold text-[#1b110b]">
                          {language === 'ar' ? (s.arabicName || s.fullName) : s.fullName}
                        </td>
                        <td className="p-2 text-center font-bold text-[#df9b52]">
                          {ev?.adabScore || 5} ★
                        </td>
                        <td className="p-2 text-center">
                          {(ev?.salahPerformance || 'with_jamaah') === 'with_jamaah' ? 'Jama’ah' : 'Individual'}
                        </td>
                        <td className="p-2 text-center font-bold text-[#854d2b]">
                          {totalMarks} / 60
                        </td>
                        <td className="p-2 text-[10px] text-[#635043] truncate max-w-[200px]">
                          {ev?.conductNotes || 'Exemplary participation.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#f0e6dc]">
              <span className="text-[11px] text-[#7c695d]">
                {language === 'ar' ? 'توقيع المشرف: ________________________' : 'Ustadh Endorsement: ________________________'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5 text-[#df9b52]" />
                  <span>{language === 'ar' ? 'طباعة الآن' : 'Print Document'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
