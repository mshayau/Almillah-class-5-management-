import React from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  CalendarDays, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Layers,
  History
} from 'lucide-react';
import { getSchoolDaysForWeek } from '../data/academicCalendar';

interface AcademicCalendarSelectorProps {
  compact?: boolean;
  onSelectionChange?: () => void;
  showDayPicker?: boolean;
}

export const AcademicCalendarSelector: React.FC<AcademicCalendarSelectorProps> = ({
  compact = false,
  onSelectionChange,
  showDayPicker = true
}) => {
  const { 
    academicSessions, 
    activeSession, 
    activeTerm,
    activeInstructionalWeeks, 
    calendarSelection, 
    selectCalendarPeriod,
    selectedDate,
    setSelectedDate
  } = useClass();

  const { language, isRTL } = useLanguage();

  const currentSelectedSession = academicSessions.find(s => s.id === calendarSelection.sessionId) || activeSession;
  const currentSelectedTerm = currentSelectedSession?.terms.find(t => t.id === calendarSelection.termId) || activeTerm;

  // Selected week object
  const currentWeek = activeInstructionalWeeks.find(w => w.weekNumber === calendarSelection.weekNumber) || 
                      activeInstructionalWeeks[0];

  // School days for selected week
  const schoolDays = currentWeek ? getSchoolDaysForWeek(currentWeek.startDate) : [];

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSessionId = e.target.value;
    const session = academicSessions.find(s => s.id === newSessionId);
    if (!session) return;
    const firstTerm = session.terms.find(t => t.isCurrent) || session.terms[0];
    selectCalendarPeriod({
      sessionId: newSessionId,
      termId: firstTerm?.id || '',
      weekNumber: 1
    });
    if (onSelectionChange) onSelectionChange();
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTermId = e.target.value;
    selectCalendarPeriod({
      termId: newTermId,
      weekNumber: 1
    });
    if (onSelectionChange) onSelectionChange();
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWeekNum = Number(e.target.value);
    const targetWeek = activeInstructionalWeeks.find(w => w.weekNumber === newWeekNum);
    const firstDayDate = targetWeek ? targetWeek.startDate : calendarSelection.date;
    
    selectCalendarPeriod({
      weekNumber: newWeekNum,
      date: firstDayDate
    });
    if (onSelectionChange) onSelectionChange();
  };

  const handleDaySelect = (dayDate: string, dayNameEn: string, dayNameAr: string) => {
    selectCalendarPeriod({
      date: dayDate,
      dayNameEn,
      dayNameAr
    });
    setSelectedDate(dayDate);
    if (onSelectionChange) onSelectionChange();
  };

  const isCurrentWeek = currentWeek?.status === 'current';
  const isPastWeek = currentWeek?.status === 'completed';

  return (
    <div className={`bg-gradient-to-r from-[#21140d] via-[#2a1910] to-[#21140d] border border-[#df9b52]/30 rounded-xl text-[#faedd9] shadow-sm ${
      compact ? 'p-2.5' : 'p-3.5 sm:p-4'
    }`}>
      {/* Top Banner / Selection summary */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 border-b border-[#3d2518] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#df9b52]/20 border border-[#df9b52]/40 flex items-center justify-center text-[#f0ba78]">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {language === 'ar' ? 'التقويم الأكاديمي والجدول الدراسي' : 'Academic Calendar Period'}
              </span>
              {currentSelectedSession?.isCurrent && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600/40 px-1.5 py-0.2 rounded font-semibold">
                  {language === 'ar' ? 'الجلسة الحالية' : 'Active Session'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#c4b3a4] truncate">
              {language === 'ar'
                ? `جلسة ${currentSelectedSession?.name} • ${currentSelectedTerm?.nameAr || currentSelectedTerm?.nameEn} • الأسبوع ${calendarSelection.weekNumber}`
                : `Session ${currentSelectedSession?.name} • ${currentSelectedTerm?.nameEn} • Week ${calendarSelection.weekNumber}`}
            </p>
          </div>
        </div>

        {/* Status notice */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {isCurrentWeek ? (
            <span className="inline-flex items-center gap-1 bg-[#df9b52]/20 text-[#f0ba78] border border-[#df9b52]/40 px-2 py-0.5 rounded-full font-semibold">
              <Clock className="w-3 h-3 text-[#df9b52]" />
              {language === 'ar' ? 'الأسبوع الحالي المعتمد' : 'Current Week'}
            </span>
          ) : isPastWeek ? (
            <span className="inline-flex items-center gap-1 bg-amber-950/70 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full font-semibold">
              <History className="w-3 h-3" />
              {language === 'ar' ? 'تسجيل متأخر (أسبوع سابق)' : 'Late Entry (Past Week)'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-blue-950/60 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full font-semibold">
              <Calendar className="w-3 h-3" />
              {language === 'ar' ? 'أسبوع قادم' : 'Upcoming Week'}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown controls grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        
        {/* 1. Academic Session */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#d4c1b2] mb-1">
            {language === 'ar' ? '١. الجلسة الأكاديمية' : '1. Academic Session'}
          </label>
          <select
            id="calendar-session-select"
            value={calendarSelection.sessionId}
            onChange={handleSessionChange}
            className="w-full bg-[#160d08] border border-[#4a2e1e] hover:border-[#df9b52]/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#df9b52] cursor-pointer"
          >
            {academicSessions.map(sess => (
              <option key={sess.id} value={sess.id}>
                {sess.name} {sess.isCurrent ? (language === 'ar' ? '(الحالية)' : '(Current)') : sess.status === 'completed' ? (language === 'ar' ? '(مكتملة)' : '(Completed)') : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Term Selection */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#d4c1b2] mb-1">
            {language === 'ar' ? '٢. الفصل الدراسي (٣ فصول)' : '2. Academic Term (3 Terms)'}
          </label>
          <select
            id="calendar-term-select"
            value={calendarSelection.termId}
            onChange={handleTermChange}
            className="w-full bg-[#160d08] border border-[#4a2e1e] hover:border-[#df9b52]/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#df9b52] cursor-pointer"
          >
            {currentSelectedSession?.terms.map(t => (
              <option key={t.id} value={t.id}>
                {language === 'ar' ? t.nameAr : t.nameEn} ({t.instructionalWeeksCount} {language === 'ar' ? 'أسبوعاً' : 'Weeks'})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Week Number */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#d4c1b2] mb-1">
            {language === 'ar' ? '٣. رقم الأسبوع الدراسي' : '3. Instructional Week'}
          </label>
          <select
            id="calendar-week-select"
            value={calendarSelection.weekNumber}
            onChange={handleWeekChange}
            className="w-full bg-[#160d08] border border-[#4a2e1e] hover:border-[#df9b52]/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#df9b52] cursor-pointer"
          >
            {activeInstructionalWeeks.map(w => (
              <option key={w.id} value={w.weekNumber}>
                {language === 'ar' ? `الأسبوع ${w.weekNumber}` : `Week ${w.weekNumber}`} ({w.datesFormattedEn.split(' – ')[0].replace('Saturday ', '')} – {w.datesFormattedEn.split(' – ')[1]?.replace('Wednesday ', '') || ''}) {w.status === 'current' ? '★ Current' : ''}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 4. Day of the Week Picker (5 school days: Sat to Wed) */}
      {showDayPicker && schoolDays.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[#3d2518]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d4c1b2]">
              {language === 'ar' ? '٤. يوم التسميع / الجلسة المحددة (أسبوع مدرسي ٥ أيام):' : '4. Recitation Day (5-Day School Week):'}
            </span>
            <span className="text-[11px] text-[#df9b52] font-semibold">
              {language === 'ar' ? `التاريخ النشط: ${selectedDate}` : `Selected: ${selectedDate}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {schoolDays.map(sd => {
              const isSelected = selectedDate === sd.date;
              return (
                <button
                  key={sd.date}
                  type="button"
                  onClick={() => handleDaySelect(sd.date, sd.dayNameEn, sd.dayNameAr)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#df9b52] to-[#b87635] text-[#140c08] font-bold border-[#df9b52] shadow-xs'
                      : 'bg-[#180f0a] hover:bg-[#251710] text-[#d4c1b2] border-[#3d2518]'
                  }`}
                >
                  <span className="text-[11px] leading-tight">
                    {language === 'ar' ? sd.dayNameAr : sd.dayNameEn}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-[#140c08]/90 font-black' : 'text-[#8c7464]'}`}>
                    {sd.shortDate}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Surah & Curriculum Preview for selected week */}
      {currentWeek && (
        <div className="mt-2.5 text-[11px] bg-[#160d08]/70 rounded-lg p-2 border border-[#3d2518] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#df9b52] font-semibold">
              {language === 'ar' ? 'مقرر الحفظ المستهدف:' : 'Week Qur’an Target:'}
            </span>
            <span className="text-white truncate">
              {language === 'ar' ? currentWeek.targetSurahAr : currentWeek.targetSurahEn}
            </span>
          </div>
          <span className="text-[10px] text-[#a89282] shrink-0">
            {language === 'ar' ? currentWeek.hijriRangeAr : currentWeek.hijriRangeEn}
          </span>
        </div>
      )}

    </div>
  );
};
