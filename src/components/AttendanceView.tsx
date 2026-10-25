import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { AttendanceStatus, AttendanceSession } from '../types';
import { AttendanceCalendar } from './AttendanceCalendar';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HelpCircle, 
  CheckCheck, 
  Calendar, 
  HeartPulse,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const AttendanceView: React.FC = () => {
  const { 
    students, 
    selectedDate, 
    setSelectedDate, 
    setStudentAttendance, 
    markAllAttendance, 
    getAttendanceForDate 
  } = useClass();
  const { language, isRTL, t } = useLanguage();

  const currentSession: AttendanceSession = 'morning';
  const [editingNoteStudentId, setEditingNoteStudentId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [tempArrivalTime, setTempArrivalTime] = useState('07:15 AM');

  // Calculate Saturday through Wednesday school week days for any selected date
  const schoolDays = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    const baseDate = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    const dow = baseDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Offset to Saturday (day 0 of the Islamic academic week)
    const offsetToSaturday = (dow + 1) % 7;

    const saturday = new Date(baseDate);
    saturday.setDate(baseDate.getDate() - offsetToSaturday);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const daysDefinition = [
      { key: 'saturday', nameEn: 'Saturday', nameAr: 'السبت', shortEn: 'Sat', shortAr: 'سبت', offset: 0 },
      { key: 'sunday', nameEn: 'Sunday', nameAr: 'الأحد', shortEn: 'Sun', shortAr: 'أحد', offset: 1 },
      { key: 'monday', nameEn: 'Monday', nameAr: 'الاثنين', shortEn: 'Mon', shortAr: 'اثنين', offset: 2 },
      { key: 'tuesday', nameEn: 'Tuesday', nameAr: 'الثلاثاء', shortEn: 'Tue', shortAr: 'ثلاثاء', offset: 3 },
      { key: 'wednesday', nameEn: 'Wednesday', nameAr: 'الأربعاء', shortEn: 'Wed', shortAr: 'أربعاء', offset: 4 },
    ];

    return daysDefinition.map((def, index) => {
      const d = new Date(saturday);
      d.setDate(saturday.getDate() + def.offset);
      const dateString = formatYMD(d);
      const dayNum = d.getDate();
      const monthIdx = d.getMonth();
      const monthShortEn = d.toLocaleDateString('en-US', { month: 'short' });
      const monthShortAr = MONTH_NAMES_AR[monthIdx] || '';

      return {
        ...def,
        dayIndex: index + 1,
        date: d,
        dateString,
        dayNum,
        formattedDate: language === 'ar' ? `${dayNum} ${monthShortAr}` : `${dayNum} ${monthShortEn}`
      };
    });
  }, [selectedDate, language]);

  const weekRangeLabel = useMemo(() => {
    if (schoolDays.length < 5) return '';
    return `${schoolDays[0].formattedDate} — ${schoolDays[4].formattedDate}`;
  }, [schoolDays]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const handlePrevWeek = () => {
    if (schoolDays.length === 0) return;
    const prevSat = new Date(schoolDays[0].date);
    prevSat.setDate(prevSat.getDate() - 7);
    setSelectedDate(formatYMD(prevSat));
  };

  const handleNextWeek = () => {
    if (schoolDays.length === 0) return;
    const nextSat = new Date(schoolDays[0].date);
    nextSat.setDate(nextSat.getDate() + 7);
    setSelectedDate(formatYMD(nextSat));
  };

  const activeDayInfo = schoolDays.find(d => d.dateString === selectedDate);

  const records = getAttendanceForDate(selectedDate, currentSession);

  // Status mapping helper
  const getRecordForStudent = (studentId: string) => {
    return records.find(r => r.studentId === studentId);
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const sickCount = records.filter(r => r.status === 'sick' || r.status === 'excused').length;
  const rate = students.length > 0 ? Math.round(((presentCount + lateCount) / students.length) * 100) : 0;

  const handleOpenNoteModal = (studentId: string) => {
    const rec = getRecordForStudent(studentId);
    setEditingNoteStudentId(studentId);
    setTempNote(rec?.notes || '');
    setTempArrivalTime(rec?.arrivalTime || '07:15 AM');
  };

  const handleSaveNote = () => {
    if (editingNoteStudentId) {
      const currentStatus = getRecordForStudent(editingNoteStudentId)?.status || 'late';
      setStudentAttendance(editingNoteStudentId, currentStatus, currentSession, tempNote, tempArrivalTime);
      setEditingNoteStudentId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Visual Monthly Calendar Component with Streaks */}
      <AttendanceCalendar />

      {/* Header & Daily Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs space-y-3">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#1b110b] text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#854d2b]" />
              <span>{language === 'ar' ? 'سجل الحضور اليومي وتفقد الطلاب' : 'Daily Attendance Register & Roll Call'}</span>
            </h3>
            <p className="text-xs text-[#7c695d] mt-0.5">
              {language === 'ar'
                ? `طلاب الصف الخامس (${students.length} طلاب) — سجل الحضور وتفقد الطلاب اليومي`
                : `Class Five (${students.length} students) daily roll call and attendance tracking`}
            </p>
          </div>

          {/* Quick Date Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Picker */}
            <div className="flex items-center bg-[#faf7f3] border border-[#e5dad0] rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="h-3.5 w-3.5 text-[#8c7464] mr-2 rtl:mr-0 rtl:ml-2" />
              <input
                id="attendance-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-medium text-[#1b110b] focus:outline-none cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Batch Operations & Stat Counters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-3 border-t border-[#f0e6dc]">
          
          {/* Summary Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9] font-bold px-2.5 py-1 rounded-lg">
              {t('present')}: {presentCount}
            </span>
            <span className="bg-[#fef9ee] text-[#a46312] border border-[#fbe4b4] font-bold px-2.5 py-1 rounded-lg">
              {t('late')}: {lateCount}
            </span>
            <span className="bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] font-bold px-2.5 py-1 rounded-lg">
              {t('absent')}: {absentCount}
            </span>
            <span className="bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] font-bold px-2.5 py-1 rounded-lg">
              {t('excused')}: {sickCount}
            </span>
            <span className="text-[#7c695d] font-medium ml-1 rtl:ml-0 rtl:mr-1">
              {language === 'ar' ? 'نسبة الحضور الإجمالية:' : 'Overall Rate:'} <strong className="text-[#1b110b]">{rate}%</strong>
            </span>
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="attendance-mark-all-present-btn"
              onClick={() => markAllAttendance('present', currentSession)}
              className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-[#df9b52]" />
              <span>{t('markAllPresent')}</span>
            </button>
            <button
              id="attendance-mark-all-excused-btn"
              onClick={() => markAllAttendance('excused', currentSession)}
              className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {language === 'ar' ? 'رصد عذر للجميع' : 'Mark All Excused'}
            </button>
          </div>

        </div>

      </div>

      {/* Academy School Days Selector (Saturday, Sunday, Monday, Tuesday, Wednesday) */}
      <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-[#f0e6dc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#faedd9] text-[#854d2b] border border-[#df9b52]/30 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1b110b] flex items-center gap-2">
                <span>{language === 'ar' ? 'أيام الأسبوع الدراسي (السبت – الأربعاء)' : 'Academy School Days (Saturday – Wednesday)'}</span>
                <span className="text-[10px] bg-[#3b2317] text-[#faedd9] font-semibold px-2 py-0.5 rounded-full">
                  {language === 'ar' ? '٥ أيام دراسية' : '5 School Days'}
                </span>
              </h4>
              <p className="text-xs text-[#7c695d] mt-0.5">
                {language === 'ar'
                  ? 'أيام حضور الطلاب المعتمدة: السبت، الأحد، الاثنين، الثلاثاء، والأربعاء (الخميس والجمعة عطلة)'
                  : 'Official Madrasa school days: Saturday, Sunday, Monday, Tuesday, Wednesday (Thu & Fri off)'}
              </p>
            </div>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <button
              id="attendance-prev-week-btn"
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg border border-[#e5dad0] bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] transition cursor-pointer flex items-center gap-1"
              title={language === 'ar' ? 'الأسبوع السابق' : 'Previous Week'}
            >
              <ChevronLeft className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="hidden md:inline">{language === 'ar' ? 'السابق' : 'Prev'}</span>
            </button>

            <span className="font-semibold text-xs text-[#3b2317] px-3 py-1.5 bg-[#faf7f3] rounded-lg border border-[#e5dad0] min-w-[120px] text-center">
              {weekRangeLabel}
            </span>

            <button
              id="attendance-next-week-btn"
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg border border-[#e5dad0] bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] transition cursor-pointer flex items-center gap-1"
              title={language === 'ar' ? 'الأسبوع التالي' : 'Next Week'}
            >
              <span className="hidden md:inline">{language === 'ar' ? 'التالي' : 'Next'}</span>
              <ChevronRight className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 School Days Grid: Saturday, Sunday, Monday, Tuesday, Wednesday */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {schoolDays.map((day, idx) => {
            const isSelected = selectedDate === day.dateString;
            const dayRecords = getAttendanceForDate(day.dateString, currentSession);
            const dayPresent = dayRecords.filter(r => r.status === 'present').length;
            const dayLate = dayRecords.filter(r => r.status === 'late').length;
            const hasRecords = dayRecords.length > 0;
            const isLastOdd = idx === 4;

            return (
              <button
                key={day.key}
                id={`attendance-day-${day.key}`}
                type="button"
                onClick={() => setSelectedDate(day.dateString)}
                className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[92px] ${
                  isLastOdd ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isSelected
                    ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317] shadow-sm ring-2 ring-[#df9b52]/50'
                    : 'bg-[#faf7f3] hover:bg-[#f5ede3] text-[#1b110b] border-[#e5dad0]'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-2.5 h-2.5 bg-[#df9b52]" />
                )}

                {/* Day Header */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isSelected ? 'text-[#df9b52]' : 'text-[#854d2b]'
                  }`}>
                    {language === 'ar' ? `اليوم ${idx + 1}` : `Day ${idx + 1}`}
                  </span>

                  {isSelected ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#df9b52] text-slate-950">
                      {language === 'ar' ? 'المحدد' : 'Selected'}
                    </span>
                  ) : hasRecords ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]">
                      {dayPresent + dayLate}/{students.length}
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#a49080]">
                      {language === 'ar' ? 'لم يُرصد' : 'Pending'}
                    </span>
                  )}
                </div>

                {/* Day Name */}
                <div className="my-1">
                  <div className="font-extrabold text-sm sm:text-base leading-tight">
                    {language === 'ar' ? day.nameAr : day.nameEn}
                  </div>
                  <div className={`text-[11px] font-medium ${
                    isSelected ? 'text-[#d6c4b6]' : 'text-[#7c695d]'
                  }`}>
                    {day.formattedDate}
                  </div>
                </div>

                {/* Attendance Mini Status */}
                <div className="pt-1.5 border-t border-current/10 w-full flex items-center justify-between text-[10px]">
                  {hasRecords ? (
                    <span className={`flex items-center gap-1 font-semibold ${
                      isSelected ? 'text-emerald-300' : 'text-[#2d6639]'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>{dayPresent} {language === 'ar' ? 'حاضر' : 'Present'}</span>
                    </span>
                  ) : (
                    <span className={isSelected ? 'text-[#d6c4b6]' : 'text-[#8c7464]'}>
                      {language === 'ar' ? 'انقر للتسجيل' : 'Click to record'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Status Banner */}
        {activeDayInfo && (
          <div className="bg-[#faf7f3] border border-[#e5dad0] rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#854d2b]" />
              <span className="text-[#635043]">
                {language === 'ar' ? 'اليوم المختار للرصد والتفقد:' : 'Active Day for Roll Call:'}
              </span>
              <strong className="text-[#1b110b] font-bold text-sm">
                {language === 'ar' ? activeDayInfo.nameAr : activeDayInfo.nameEn} ({activeDayInfo.formattedDate})
              </strong>
            </div>
            <div className="text-[11px] text-[#7c695d] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>
                {language === 'ar' 
                  ? `إجمالي المقيدين: ${students.length} طالب`
                  : `Enrolled: ${students.length} Students`}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {students.map(student => {
          const record = getRecordForStudent(student.id);
          const currentStatus: AttendanceStatus = record?.status || 'present';

          return (
            <div
              key={student.id}
              id={`attendance-card-${student.id}`}
              className={`p-3.5 rounded-xl border transition-all ${
                currentStatus === 'present'
                  ? 'bg-white border-[#d8c8ba] shadow-2xs'
                  : currentStatus === 'late'
                  ? 'bg-[#fefbf7] border-[#e7bc8c] shadow-2xs'
                  : currentStatus === 'absent'
                  ? 'bg-[#fdf7f7] border-[#e5a6a6] shadow-2xs'
                  : 'bg-[#f7fbff] border-[#b4daf3] shadow-2xs'
              }`}
            >
              {/* Student Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#3b2317] text-[#df9b52] font-bold text-xs flex items-center justify-center">
                    {student.rollNumber}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1b110b] truncate">
                      {language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}
                    </h4>
                    <span className="text-[11px] text-[#854d2b] truncate block">
                      {language === 'ar' ? student.fullName : student.arabicName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenNoteModal(student.id)}
                  title={language === 'ar' ? 'إضافة ملاحظة أو سبب التأخر' : 'Add Excuse / Tardy Note'}
                  className="text-[11px] text-[#8c7464] hover:text-[#1b110b] p-1 cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Status Selector Buttons */}
              <div className="grid grid-cols-4 gap-1 mt-3">
                
                {/* Present */}
                <button
                  type="button"
                  onClick={() => setStudentAttendance(student.id, 'present', currentSession)}
                  className={`min-h-[44px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                    currentStatus === 'present'
                      ? 'bg-[#2d6639] text-white shadow-2xs'
                      : 'bg-[#faf7f3] text-[#7c695d] hover:bg-[#e8f5ea] hover:text-[#2d6639]'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mb-0.5" />
                  <span>{t('present')}</span>
                </button>

                {/* Late */}
                <button
                  type="button"
                  onClick={() => setStudentAttendance(student.id, 'late', currentSession, record?.notes, record?.arrivalTime || '07:15 AM')}
                  className={`min-h-[44px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                    currentStatus === 'late'
                      ? 'bg-[#c88642] text-white shadow-2xs'
                      : 'bg-[#faf7f3] text-[#7c695d] hover:bg-[#fef3dc] hover:text-[#c88642]'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 mb-0.5" />
                  <span>{t('late')}</span>
                </button>

                {/* Absent */}
                <button
                  type="button"
                  onClick={() => setStudentAttendance(student.id, 'absent', currentSession)}
                  className={`min-h-[44px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                    currentStatus === 'absent'
                      ? 'bg-[#b91c1c] text-white shadow-2xs'
                      : 'bg-[#faf7f3] text-[#7c695d] hover:bg-[#fee2e2] hover:text-[#b91c1c]'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5 mb-0.5" />
                  <span>{t('absent')}</span>
                </button>

                {/* Sick */}
                <button
                  type="button"
                  onClick={() => setStudentAttendance(student.id, 'sick', currentSession, 'Medical / Sick excuse')}
                  className={`min-h-[44px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                    currentStatus === 'sick' || currentStatus === 'excused'
                      ? 'bg-[#0369a1] text-white shadow-2xs'
                      : 'bg-[#faf7f3] text-[#7c695d] hover:bg-[#e0f2fe] hover:text-[#0369a1]'
                  }`}
                >
                  <HeartPulse className="h-3.5 w-3.5 mb-0.5" />
                  <span>{t('excused')}</span>
                </button>

              </div>

              {/* Tardy / Note display */}
              {(record?.arrivalTime || record?.notes) && (
                <div className="mt-2 text-[10px] text-[#635043] bg-white/90 p-1.5 rounded border border-[#e5dad0]">
                  {record.arrivalTime && <span className="font-bold text-[#c88642] block">{language === 'ar' ? `وقت الحضور: ${record.arrivalTime}` : `Arrived: ${record.arrivalTime}`}</span>}
                  {record.notes && <span className="italic truncate block">{record.notes}</span>}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Edit Note Modal */}
      {editingNoteStudentId && (
        <div className="fixed inset-0 z-50 bg-[#1b110b]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-[#e5dad0] shadow-xl space-y-4">
            <h3 className="font-bold text-[#1b110b] text-sm">
              {language === 'ar' ? 'ملاحظة أو عذر غياب للطالب:' : 'Attendance Note for'}{' '}
              <span className="text-[#854d2b]">
                {language === 'ar'
                  ? students.find(s => s.id === editingNoteStudentId)?.arabicName || students.find(s => s.id === editingNoteStudentId)?.fullName
                  : students.find(s => s.id === editingNoteStudentId)?.fullName}
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'وقت الوصول (في حال التأخر)' : 'Arrival Time (if late)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 07:15 AM"
                  value={tempArrivalTime}
                  onChange={(e) => setTempArrivalTime(e.target.value)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b]"
                />
              </div>

              <div>
                <label className="font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'السبب أو إشعار ولي الأمر' : 'Reason / Guardian Notice'}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ar' ? 'مثال: موعد طبي، إفادة هاتفية من ولي الأمر...' : 'e.g., Medical appointment, parent called school office...'}
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] text-[#1b110b]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingNoteStudentId(null)}
                className="px-3 py-1.5 bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] rounded-lg text-xs font-bold cursor-pointer"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
