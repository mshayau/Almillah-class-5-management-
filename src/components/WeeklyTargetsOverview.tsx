import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StudentWeeklyTarget, StudentGroup, TargetStatus } from '../types';
import { getStudentGroupName } from '../data/studentGroups';
import { StudentWeeklyTargetModal } from './StudentWeeklyTargetModal';
import { QuranReferenceBrowserModal } from './QuranReferenceBrowserModal';
import { 
  Target, 
  Calendar, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Filter, 
  History, 
  Layers, 
  AlertCircle,
  ShieldCheck,
  Search,
  CheckCircle,
  Users,
  ChevronRight,
  BookMarked
} from 'lucide-react';

interface WeeklyTargetsOverviewProps {
  initialStudentId?: string;
  onOpenRecitation?: (studentId: string) => void;
}

export const WeeklyTargetsOverview: React.FC<WeeklyTargetsOverviewProps> = ({
  initialStudentId,
  onOpenRecitation
}) => {
  const { 
    students, 
    academicSessions, 
    activeSession, 
    activeTerm, 
    activeInstructionalWeeks,
    weeklyTargets,
    deleteWeeklyTarget,
    amendWeeklyTarget
  } = useClass();

  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const isAuthorized = user?.role === 'head_teacher' || user?.role === 'admin' || user?.role === 'teacher';

  // Selected filters
  const [selectedSessionId, setSelectedSessionId] = useState<string>(activeSession?.id || academicSessions[0]?.id || '');
  const [selectedTermId, setSelectedTermId] = useState<string>(activeTerm?.id || '');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(2); // Default to Week 2
  const [groupFilter, setGroupFilter] = useState<StudentGroup | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync initialStudentId if it updates externally
  React.useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  // Target modal state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [modalStudentId, setModalStudentId] = useState<string | undefined>(initialStudentId);
  const [modalEditingTarget, setModalEditingTarget] = useState<StudentWeeklyTarget | null>(null);

  // Reference browser modal state
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);

  // Active session and term objects
  const currentSession = useMemo(() => {
    return academicSessions.find(s => s.id === selectedSessionId) || activeSession || academicSessions[0];
  }, [academicSessions, selectedSessionId, activeSession]);

  const currentTerm = useMemo(() => {
    if (!currentSession) return activeTerm;
    return currentSession.terms.find(t => t.id === selectedTermId) || currentSession.terms[0];
  }, [currentSession, selectedTermId, activeTerm]);

  // Weeks available for this term
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

  // Selected week object
  const currentWeekInfo = useMemo(() => {
    return termWeeks.find(w => w.weekNumber === selectedWeekNumber) || termWeeks[0] || {
      weekNumber: selectedWeekNumber,
      label: `Week ${selectedWeekNumber}`,
      startDate: currentTerm?.startDate || '2026-09-05',
      endDate: currentTerm?.endDate || '2026-09-09'
    };
  }, [termWeeks, selectedWeekNumber, currentTerm]);

  // Targets for the selected session, term, and week
  const currentWeekTargets = useMemo(() => {
    return weeklyTargets.filter(t => 
      t.sessionId === selectedSessionId &&
      t.termId === selectedTermId &&
      t.weekNumber === selectedWeekNumber
    );
  }, [weeklyTargets, selectedSessionId, selectedTermId, selectedWeekNumber]);

  // Filter students based on group and search
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesGroup = groupFilter === 'all' || s.group === groupFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.fullName.toLowerCase().includes(q) || 
        s.arabicName.includes(q) || 
        s.rollNumber.toString() === q;

      if (!matchesGroup || !matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all') {
        const target = currentWeekTargets.find(t => t.studentId === s.id);
        if (statusFilter === 'missing') return !target;
        return target && target.status === statusFilter;
      }

      return true;
    });
  }, [students, groupFilter, searchQuery, statusFilter, currentWeekTargets]);

  // Metrics summary
  const summaryMetrics = useMemo(() => {
    const totalStudents = students.length;
    const assignedCount = currentWeekTargets.length;
    const completedCount = currentWeekTargets.filter(t => t.status === 'completed').length;
    const totalAyahsTargeted = currentWeekTargets.reduce((sum, t) => sum + t.totalTargetAyahs, 0);

    return {
      totalStudents,
      assignedCount,
      completedCount,
      totalAyahsTargeted,
      coverageRate: totalStudents > 0 ? Math.round((assignedCount / totalStudents) * 100) : 0
    };
  }, [students, currentWeekTargets]);

  // Selected individual student spotlight
  const spotlightStudent = useMemo(() => {
    if (selectedStudentId === 'all') return null;
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const spotlightTarget = useMemo(() => {
    if (!spotlightStudent) return null;
    return currentWeekTargets.find(t => t.studentId === spotlightStudent.id) || null;
  }, [currentWeekTargets, spotlightStudent]);

  const handleUpdateStatus = (target: StudentWeeklyTarget, newStatus: TargetStatus) => {
    amendWeeklyTarget(
      target.id,
      { status: newStatus },
      language === 'ar' ? `تحديث حالة الهدف إلى: ${newStatus}` : `Status updated to ${newStatus}`
    );
  };

  // Open modal to assign target
  const handleOpenAssignModal = (studentId?: string) => {
    setModalEditingTarget(null);
    setModalStudentId(studentId || students[0]?.id);
    setIsTargetModalOpen(true);
  };

  // Open modal to amend existing target
  const handleOpenAmendModal = (target: StudentWeeklyTarget) => {
    setModalEditingTarget(target);
    setModalStudentId(target.studentId);
    setIsTargetModalOpen(true);
  };

  const handleDeleteTarget = (targetId: string, studentName: string) => {
    if (window.confirm(language === 'ar' 
      ? `هل أنت متأكد من حذف هدف الحفظ للطالب: ${studentName}؟` 
      : `Are you sure you want to delete this memorization target for ${studentName}?`)) {
      deleteWeeklyTarget(targetId);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#1b110b] text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-[#854d2b]" />
              <span>{language === 'ar' ? 'إدارة خطط وأهداف الحفظ الأسبوعية (الصف الخامس)' : 'Student Weekly Memorization Targets'}</span>
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{language === 'ar' ? 'أهداف متمايزة • تدقيق السجل' : 'Differentiated Targets • Audit Trail'}</span>
            </span>
          </div>
          <p className="text-xs text-[#7c695d] mt-1">
            {language === 'ar'
              ? 'تحديد أهداف التسميع الأسبوعية لكل طالب مع دعم تعدد السور والربط بمصحف المدينة ٦٠٤ صفحات'
              : 'Configure individual student weekly recitation goals with multi-range, multi-surah & Madinah page mappings'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReferenceModalOpen(true)}
            className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] text-xs font-semibold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#854d2b]" />
            <span>{language === 'ar' ? 'دليل المصحف (٦٠٤ ص)' : 'Browse Mushaf'}</span>
          </button>

          {isAuthorized && (
            <button
              onClick={() => handleOpenAssignModal()}
              className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#df9b52]" />
              <span>{language === 'ar' ? 'إسناد هدف جديد' : 'Assign Weekly Target'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#8c7464] block">
            {language === 'ar' ? 'الطلاب المشمولون بالهدف' : 'Weekly Coverage'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-[#1b110b]">{summaryMetrics.assignedCount}</span>
            <span className="text-xs text-[#7c695d]">/ {summaryMetrics.totalStudents} ({summaryMetrics.coverageRate}%)</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#8c7464] block">
            {language === 'ar' ? 'إجمالي الآيات المستهدفة' : 'Targeted Ayahs'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-800">{summaryMetrics.totalAyahsTargeted}</span>
            <span className="text-xs text-emerald-600">{language === 'ar' ? 'آية هذا الأسبوع' : 'Ayahs total'}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#8c7464] block">
            {language === 'ar' ? 'الأهداف المكتملة' : 'Completed Targets'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-[#2d6639]">{summaryMetrics.completedCount}</span>
            <span className="text-xs text-[#2d6639]">{language === 'ar' ? 'طالباً اجتاز' : 'Students passed'}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#e5dad0] shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#8c7464] block">
            {language === 'ar' ? 'بانتظار تحديد الهدف' : 'Pending Targets'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-amber-700">
              {summaryMetrics.totalStudents - summaryMetrics.assignedCount}
            </span>
            <span className="text-xs text-amber-600">{language === 'ar' ? 'طالب بحاجة لهدف' : 'need target'}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card with Integrated Filters */}
      <div className="bg-white rounded-xl border border-[#e5dad0] shadow-2xs overflow-hidden">
        
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-[#e5dad0] bg-[#faf7f3] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Period Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#635043] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#854d2b]" />
                <span>{language === 'ar' ? 'الفترة:' : 'Period:'}</span>
              </span>

              {/* Session */}
              <select
                value={selectedSessionId}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  const sess = academicSessions.find(s => s.id === e.target.value);
                  if (sess && sess.terms[0]) {
                    setSelectedTermId(sess.terms[0].id);
                  }
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

              {/* Week Number */}
              <select
                value={selectedWeekNumber}
                onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
                className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b] font-bold"
              >
                {termWeeks.map(w => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Week Boundary Info */}
            <div className="text-[11px] text-[#7c695d]">
              {language === 'ar' ? 'الأسبوع:' : 'Dates:'}{' '}
              <strong className="text-[#1b110b]">{currentWeekInfo.startDate}</strong> {language === 'ar' ? 'إلى' : 'to'} <strong className="text-[#1b110b]">{currentWeekInfo.endDate}</strong>
            </div>
          </div>

          {/* Group, Student, and Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e5dad0]/70">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-[#8c7464]" />
              
              {/* Class / Halaqah Group */}
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value as any);
                  setSelectedStudentId('all');
                }}
                className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b]"
              >
                <option value="all">{language === 'ar' ? 'جميع الحلقات (الفصول)' : 'All Halaqah Groups (Classes)'}</option>
                <option value="khaleelul_hussary">{getStudentGroupName('khaleelul_hussary', language)}</option>
                <option value="seddeq_minshawy">{getStudentGroupName('seddeq_minshawy', language)}</option>
                <option value="abdulbasit">{getStudentGroupName('abdulbasit', language)}</option>
              </select>

              {/* Individual Student Selector */}
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[#854d2b]" />
                <select
                  id="target-filter-student-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b] font-bold focus:ring-1 focus:ring-[#854d2b]"
                >
                  <option value="all">
                    {language === 'ar' ? `جميع الطلاب (${students.length} طلاب)` : `All Students (${students.length} Students)`}
                  </option>
                  {students
                    .filter(s => groupFilter === 'all' || s.group === groupFilter)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        #{s.rollNumber} {language === 'ar' ? (s.arabicName || s.fullName) : `${s.fullName} (${s.arabicName})`}
                      </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-[#e5dad0] rounded-lg px-2.5 py-1 text-[#1b110b]"
              >
                <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="assigned">{language === 'ar' ? 'مسند (Assigned)' : 'Assigned'}</option>
                <option value="in_progress">{language === 'ar' ? 'قيد التسميع (In Progress)' : 'In Progress'}</option>
                <option value="completed">{language === 'ar' ? 'مكتمل (Completed)' : 'Completed'}</option>
                <option value="amended">{language === 'ar' ? 'معدل (Amended)' : 'Amended'}</option>
                <option value="missing">{language === 'ar' ? 'لم يحدد هدف بعد (Pending)' : 'No Target Set'}</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1.5 h-3.5 w-3.5 text-[#8c7464]" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'بحث باسم الطالب...' : 'Search student...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 rtl:pl-2 rtl:pr-8 pr-2 py-1 text-xs bg-white border border-[#e5dad0] rounded-lg text-[#1b110b] focus:ring-1 focus:ring-[#854d2b]"
              />
            </div>
          </div>
        </div>

        {/* Selected Individual Student Spotlight Card */}
        {spotlightStudent && (
          <div className="p-4 bg-gradient-to-r from-[#faf7f3] to-white border-b border-[#e5dad0]">
            <div className="bg-white p-4 rounded-xl border-2 border-[#854d2b]/20 shadow-xs space-y-3">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e6dc]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#faedd9] text-[#854d2b] font-bold text-base flex items-center justify-center border border-[#df9b52]/40 shadow-2xs shrink-0">
                    {spotlightStudent.rollNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#1b110b] text-base">
                        {language === 'ar' ? (spotlightStudent.arabicName || spotlightStudent.fullName) : spotlightStudent.fullName}
                      </h4>
                      <span className="text-xs font-serif text-[#854d2b]">({spotlightStudent.arabicName})</span>
                      <span className="text-[11px] bg-[#faf7f3] border border-[#e5dad0] text-[#635043] px-2 py-0.5 rounded font-semibold">
                        {getStudentGroupName(spotlightStudent.group, language)}
                      </span>
                    </div>
                    <div className="text-xs text-[#7c695d] flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>{currentSession?.name || '2026/2027'}</span>
                      <span>•</span>
                      <span>{language === 'ar' ? currentTerm?.nameAr : currentTerm?.nameEn}</span>
                      <span>•</span>
                      <span className="font-bold text-[#1b110b]">
                        {language === 'ar' ? `الأسبوع ${selectedWeekNumber}` : `Week ${selectedWeekNumber}`} ({currentWeekInfo.startDate} – {currentWeekInfo.endDate})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudentId('all')}
                    className="text-xs text-[#8c7464] hover:text-[#3b2317] bg-[#faf7f3] hover:bg-[#f0e6dc] border border-[#e5dad0] px-3 py-1.5 rounded-lg transition font-semibold cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'عرض جدول الكل' : 'View All Students'}</span>
                  </button>
                </div>
              </div>

              {/* Target Details or Prompt to Assign */}
              {spotlightTarget ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Ranges */}
                    <div className="bg-[#faf7f3] p-3 rounded-lg border border-[#e5dad0] space-y-2">
                      <span className="text-[11px] uppercase font-bold text-[#8c7464] flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-[#854d2b]" />
                        <span>{language === 'ar' ? 'الهدف القرآني المحدد لهذا الأسبوع:' : 'Assigned Qur’an Target:'}</span>
                      </span>

                      <div className="space-y-1.5">
                        {spotlightTarget.ranges.map((rng, rIdx) => (
                          <div key={rIdx} className="bg-white p-2.5 rounded-lg border border-[#e5dad0] flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-[#1b110b]">{rng.surahName}</span>
                                <span className="font-serif text-[#854d2b] font-bold text-sm">({rng.surahArabicName})</span>
                                <span className="text-xs bg-[#faedd9] text-[#854d2b] px-2 py-0.5 rounded font-bold">
                                  {language === 'ar' ? `الآيات: ${rng.startAyah}–${rng.endAyah}` : `Ayahs: ${rng.startAyah}–${rng.endAyah}`}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#7c695d] mt-1 flex items-center gap-2 flex-wrap">
                                <span>
                                  {language === 'ar' ? 'صفحات المصحف:' : 'Mushaf Pages:'}{' '}
                                  <strong className="text-[#1b110b] font-mono">
                                    {rng.startPage === rng.endPage ? `ص ${rng.startPage}` : `ص ${rng.startPage}–${rng.endPage}`}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-800">{rng.totalAyahs} {language === 'ar' ? 'آية' : 'ayahs'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {spotlightTarget.notes && (
                        <div className="p-2 bg-amber-50/70 border border-amber-200/90 rounded-lg text-xs text-amber-900">
                          <strong>{language === 'ar' ? 'توجيهات المعلم:' : 'Teacher Instructions:'} </strong>
                          <span>{spotlightTarget.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Completion Status & Controls */}
                    <div className="bg-[#faf7f3] p-3 rounded-lg border border-[#e5dad0] flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-[#8c7464] block mb-2">
                          {language === 'ar' ? 'حالة إنجاز الهدف والمتابعة:' : 'Current Completion Status:'}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                            spotlightTarget.status === 'completed'
                              ? 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]'
                              : spotlightTarget.status === 'in_progress'
                              ? 'bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]'
                              : spotlightTarget.status === 'amended'
                              ? 'bg-[#faf5ff] text-[#6b21a8] border border-[#e9d5ff]'
                              : 'bg-[#fef9ee] text-[#a46312] border border-[#fbe4b4]'
                          }`}>
                            {spotlightTarget.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                            {spotlightTarget.status === 'in_progress' && <Clock className="h-4 w-4" />}
                            {spotlightTarget.status === 'amended' && <History className="h-4 w-4" />}
                            {spotlightTarget.status === 'assigned' && <AlertCircle className="h-4 w-4" />}
                            <span>{spotlightTarget.status.toUpperCase()}</span>
                          </span>

                          <span className="text-xs text-[#7c695d]">
                            {language === 'ar' ? 'الموعد النهائي:' : 'Deadline:'}{' '}
                            <strong className="text-[#1b110b]">{spotlightTarget.assignmentDeadline}</strong>
                          </span>
                        </div>

                        {/* Status Transition buttons */}
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <span className="text-[11px] font-bold text-[#635043]">
                            {language === 'ar' ? 'تعديل الحالة:' : 'Set Status:'}
                          </span>
                          {spotlightTarget.status !== 'assigned' && (
                            <button
                              onClick={() => handleUpdateStatus(spotlightTarget, 'assigned')}
                              className="text-[11px] bg-white border border-[#e5dad0] hover:bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                            >
                              {language === 'ar' ? 'مسند (Assigned)' : 'Assigned'}
                            </button>
                          )}
                          {spotlightTarget.status !== 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(spotlightTarget, 'in_progress')}
                              className="text-[11px] bg-white border border-[#e5dad0] hover:bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                            >
                              {language === 'ar' ? 'قيد التسميع (In Progress)' : 'In Progress'}
                            </button>
                          )}
                          {spotlightTarget.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(spotlightTarget, 'completed')}
                              className="text-[11px] bg-white border border-[#e5dad0] hover:bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                            >
                              {language === 'ar' ? 'مكتمل (Completed)' : 'Completed'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-[#e5dad0] flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {onOpenRecitation && (
                            <button
                              onClick={() => onOpenRecitation(spotlightStudent.id)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <BookMarked className="h-4 w-4" />
                              <span>{language === 'ar' ? 'تسجيل تسميع لهذا الهدف' : 'Record Recitation for Target'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenAmendModal(spotlightTarget)}
                            className="bg-[#faedd9] hover:bg-[#f3dfbf] text-[#854d2b] border border-[#e5dad0] text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>{language === 'ar' ? 'تعديل الهدف (مراجعة)' : 'Amend Target'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteTarget(spotlightTarget.id, spotlightStudent.fullName)}
                          className="text-red-700 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                          title={language === 'ar' ? 'حذف الهدف' : 'Delete target'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-900 text-xs">
                    <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
                    <div>
                      <p className="font-bold">
                        {language === 'ar'
                          ? `لا يوجد هدف حفظ محدد للطالب: ${spotlightStudent.arabicName || spotlightStudent.fullName} في الأسبوع ${selectedWeekNumber}`
                          : `No weekly memorization target assigned yet for ${spotlightStudent.fullName} in Week ${selectedWeekNumber}`}
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {language === 'ar'
                          ? 'يمكنك تحديد خطة تلاوة وحفظ مخصصة لهذا الطالب ومستقلة عن بقية الطلاب'
                          : 'You can configure an individual Quran recitation goal for this student independently of other students'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAssignModal(spotlightStudent.id)}
                    className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4 text-[#df9b52]" />
                    <span>{language === 'ar' ? 'إسناد هدف للطالب الآن' : 'Assign Target to Student'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Targets Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#f5ede4] border-b border-[#e5dad0] text-[#635043]">
                <th className="py-3 px-3.5 font-semibold">{t('students')}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'الحلقة' : 'Halaqah'}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'خطة الحفظ الأسبوعية (السور والآيات)' : 'Weekly Qur’an Target Ranges'}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'صفحات المصحف' : 'Mushaf Pages'}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'المجموع' : 'Scope'}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'الموعد النهائي' : 'Deadline'}</th>
                <th className="py-3 px-3.5 font-semibold">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-3.5 font-semibold text-right rtl:text-left">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e6dc]">
              {filteredStudents.map(student => {
                const target = currentWeekTargets.find(t => t.studentId === student.id);

                return (
                  <tr key={student.id} className="hover:bg-[#faf7f3] transition">
                    {/* Student Info */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#faedd9] text-[#854d2b] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {student.rollNumber}
                        </span>
                        <div>
                          <span className="font-bold text-[#1b110b] block">
                            {language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}
                          </span>
                          <span className="text-[10px] text-[#7c695d]">
                            {student.arabicName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Group */}
                    <td className="py-3 px-3.5 font-medium text-[#635043]">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-[#faf7f3] border border-[#e5dad0]">
                        {getStudentGroupName(student.group, language)}
                      </span>
                    </td>

                    {/* Target Ranges */}
                    <td className="py-3 px-3.5">
                      {target ? (
                        <div className="space-y-1">
                          {target.ranges.map((range, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#1b110b]">
                                {range.surahName}
                              </span>
                              <span className="text-[#7c695d]">
                                ({range.startAyah}–{range.endAyah})
                              </span>
                              <span className="font-serif text-[#854d2b] text-[11px]">
                                {range.surahArabicName}
                              </span>
                            </div>
                          ))}
                          {target.notes && (
                            <p className="text-[10px] text-[#8c7464] italic truncate max-w-xs" title={target.notes}>
                              "{target.notes}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#8c7464] italic text-[11px]">
                          {language === 'ar' ? 'لم يُحدد هدف لهذا الأسبوع' : 'No target configured yet'}
                        </span>
                      )}
                    </td>

                    {/* Pages */}
                    <td className="py-3 px-3.5">
                      {target ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {target.ranges.map((range, rIdx) => (
                            <span 
                              key={rIdx}
                              className="font-mono text-[10px] bg-[#faf7f3] text-[#635043] border border-[#e5dad0] px-1.5 py-0.5 rounded font-bold"
                            >
                              {range.startPage === range.endPage ? `p. ${range.startPage}` : `pp. ${range.startPage}–${range.endPage}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#c4b3a4]">—</span>
                      )}
                    </td>

                    {/* Scope */}
                    <td className="py-3 px-3.5">
                      {target ? (
                        <div>
                          <span className="font-bold text-emerald-800 text-[11px] block">
                            {target.totalTargetAyahs} {language === 'ar' ? 'آية' : 'Ayahs'}
                          </span>
                          <span className="text-[10px] text-[#7c695d]">
                            {target.totalTargetPages} {language === 'ar' ? 'صفحة' : 'pages'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#c4b3a4]">—</span>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {target ? (
                        <span className="font-medium text-[#635043]">
                          {target.assignmentDeadline}
                        </span>
                      ) : (
                        <span className="text-[#c4b3a4]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5">
                      {target ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          target.status === 'completed'
                            ? 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]'
                            : target.status === 'in_progress'
                            ? 'bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]'
                            : target.status === 'amended'
                            ? 'bg-[#faf5ff] text-[#6b21a8] border border-[#e9d5ff]'
                            : 'bg-[#fef9ee] text-[#a46312] border border-[#fbe4b4]'
                        }`}>
                          {target.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {target.status === 'in_progress' && <Clock className="h-3 w-3" />}
                          {target.status === 'amended' && <History className="h-3 w-3" />}
                          <span>{target.status.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold">
                          {language === 'ar' ? 'غير مسند' : 'Unassigned'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right rtl:text-left">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Spotlight / View Target Button */}
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          className="text-[#635043] hover:text-[#1b110b] bg-[#faf7f3] hover:bg-[#ede5dc] p-1.5 rounded transition cursor-pointer"
                          title={language === 'ar' ? 'عرض تفاصيل هدف هذا الطالب' : 'Inspect student target'}
                        >
                          <Target className="h-3.5 w-3.5 text-[#854d2b]" />
                        </button>

                        {target ? (
                          <>
                            {onOpenRecitation && (
                              <button
                                onClick={() => onOpenRecitation(student.id)}
                                className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded transition cursor-pointer"
                                title={language === 'ar' ? 'تسجيل تسميع للهدف' : 'Record Recitation'}
                              >
                                <BookMarked className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenAmendModal(target)}
                              className="text-[#854d2b] hover:text-[#5c351f] bg-[#faedd9] hover:bg-[#f3dfbf] p-1.5 rounded transition cursor-pointer"
                              title={language === 'ar' ? 'تعديل الهدف (سجل مراجعة)' : 'Amend target'}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTarget(target.id, student.fullName)}
                              className="text-[#8c7464] hover:text-red-700 p-1.5 rounded transition cursor-pointer"
                              title={language === 'ar' ? 'حذف الهدف' : 'Delete target'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(student.id)}
                            className="text-xs bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] font-bold px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3 text-[#df9b52]" />
                            <span>{language === 'ar' ? 'تحديد هدف' : 'Set Target'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7c695d]">
                    {language === 'ar' ? 'لا توجد نتائج مطابقة للتصفية الحالية' : 'No students match current filter criteria'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#faf7f3] border-t border-[#e5dad0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7c695d]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {language === 'ar'
                ? 'جميع الأهداف تتبع موعداً نهائياً ومربوطة بأسابيع التقويم وتمنع التكرار العرضي'
                : 'All weekly targets strictly enforce academic week relationships, assignment deadlines, and anti-duplication'}
            </span>
          </div>

          <span className="font-semibold text-[#854d2b]">
            {language === 'ar' ? `إجمالي الأهداف المسجلة: ${currentWeekTargets.length}` : `Active targets configured: ${currentWeekTargets.length}`}
          </span>
        </div>

      </div>

      {/* Target Modal */}
      <StudentWeeklyTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        initialStudentId={modalStudentId}
        initialTarget={modalEditingTarget}
        initialSessionId={selectedSessionId}
        initialTermId={selectedTermId}
        initialWeekNumber={selectedWeekNumber}
      />

      {/* Quran Reference Browser Modal */}
      <QuranReferenceBrowserModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />

    </div>
  );
};
