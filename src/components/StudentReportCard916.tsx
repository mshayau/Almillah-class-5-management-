import React, { useState } from 'react';
import { StudentReportCardData } from '../utils/studentReportGenerator';
import { 
  BookOpen, 
  Calendar, 
  Check, 
  Copy, 
  Edit3, 
  CheckCircle2, 
  Star, 
  MessageSquare
} from 'lucide-react';
import { ACADEMY_LOGO_URL, ACADEMY_LOGO_FALLBACK } from './AcademyLogo';

interface StudentReportCard916Props {
  data: StudentReportCardData;
  cardRef?: React.RefObject<HTMLDivElement>;
  allowCustomComment?: boolean;
  onCustomCommentChange?: (newComment: string) => void;
  isWhatsAppMode?: boolean;
}

export const StudentReportCard916: React.FC<StudentReportCard916Props> = ({
  data,
  cardRef,
  allowCustomComment = true,
  onCustomCommentChange,
  isWhatsAppMode = false
}) => {
  const {
    student,
    weekNumber,
    weekRangeText,
    weekRangeDates,
    dailyRecords,
    quranTracker,
    teacherComment
  } = data;

  const [activeComment, setActiveComment] = useState(teacherComment);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentCopied, setCommentCopied] = useState(false);

  const handleCopyComment = () => {
    navigator.clipboard.writeText(activeComment);
    setCommentCopied(true);
    setTimeout(() => setCommentCopied(false), 2000);
  };

  const handleCommentChange = (newVal: string) => {
    setActiveComment(newVal);
    if (onCustomCommentChange) {
      onCustomCommentChange(newVal);
    }
  };

  return (
    <div
      ref={cardRef}
      id="student-916-report-card-container"
      className={`relative w-full max-w-[640px] mx-auto bg-gradient-to-b from-[#1b1009] via-[#24160d] to-[#160d07] text-[#faedd9] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-2 border-[#c88642]/60 overflow-hidden select-none p-4 sm:p-7 space-y-5 ${
        isWhatsAppMode ? 'aspect-[9/16] overflow-y-auto' : ''
      }`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* BACKGROUND SUBTLE WATERMARK OF THE OFFICIAL ACADEMY LOGO */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden"
      >
        <img 
          src={ACADEMY_LOGO_URL} 
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = ACADEMY_LOGO_FALLBACK;
          }}
          className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] object-contain rounded-full opacity-[0.035] filter sepia-[0.35] contrast-150"
        />
      </div>

      {/* LUXURY INNER GOLD ACCENT BORDER & CORNER ROSETTES */}
      <div className="absolute inset-2 sm:inset-3 border border-[#df9b52]/30 pointer-events-none rounded-2xl z-0" />
      <div className="absolute top-4 left-4 text-[#df9b52]/60 text-sm font-serif z-10">۞</div>
      <div className="absolute top-4 right-4 text-[#df9b52]/60 text-sm font-serif z-10">۞</div>
      <div className="absolute bottom-4 left-4 text-[#df9b52]/60 text-sm font-serif z-10">۞</div>
      <div className="absolute bottom-4 right-4 text-[#df9b52]/60 text-sm font-serif z-10">۞</div>

      {/* =========================================================================
          STUDENT & REPORT HEADER
          ========================================================================= */}
      <header className="relative z-10 text-center pb-3 border-b border-[#df9b52]/30 space-y-2">
        <p className="font-arabic text-lg sm:text-xl font-bold text-[#df9b52] tracking-wider drop-shadow-sm">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <div className="flex items-center justify-center gap-3">
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#df9b52] via-[#f7cb8b] to-[#854d2b] shadow-md shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#1b110b] p-0.5 overflow-hidden flex items-center justify-center">
              <img 
                src={ACADEMY_LOGO_URL} 
                alt="Al-Millah Academy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = ACADEMY_LOGO_FALLBACK;
                }}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-base sm:text-lg font-black tracking-wider text-[#faedd9] uppercase font-serif leading-none">
              AL-MILLAH ISLAMIC ACADEMY
            </h1>
            <p className="font-arabic text-xs font-semibold text-[#df9b52] mt-0.5">
              مَعهَدُ المِلَّةِ الإِسْلَامِي — الصف الخامس (بنين)
            </p>
          </div>
        </div>

        {/* Student Identification Banner */}
        <div className="bg-[#241710]/95 rounded-xl p-3 border border-[#df9b52]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-[#faedd9] truncate">
                {student.fullName}
              </h2>
              {student.arabicName && (
                <span className="font-arabic text-xs font-bold text-[#df9b52]">
                  ({student.arabicName})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#cbb6a3] mt-0.5 flex-wrap">
              <span>Roll #{student.rollNumber}</span>
              <span>•</span>
              <span>Halaqah: <strong className="text-[#f7cb8b]">{student.group.replace('_', ' ').toUpperCase()}</strong></span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 border-[#382317] pt-2 sm:pt-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#f7cb8b] bg-[#362114] px-2.5 py-1 rounded-lg border border-[#df9b52]/30">
              <Calendar className="w-3 h-3 text-[#df9b52]" />
              <span>Week {weekNumber}</span>
            </div>
            <span className="text-[10px] text-[#a99585] block sm:mt-0.5">{weekRangeDates}</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          1. QUR'AN MEMORIZATION RESULT
          ========================================================================= */}
      <section className="relative z-10 space-y-2.5 bg-[#241710]/95 p-3 sm:p-4 rounded-2xl border border-[#df9b52]/40 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3b2417] pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#df9b52] shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#faedd9] font-serif">
              Qur'an Memorization Result / نتيجة حفظ القرآن الكريم
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#df9b52] bg-[#362114] px-2.5 py-0.5 rounded-full border border-[#df9b52]/40">
            {quranTracker.totalAyahsMemorized} Ayahs Memorized
          </span>
        </div>

        {/* Day-by-day Quran Recitation Results */}
        <div className="space-y-1.5 pt-0.5">
          {quranTracker.dailyRecords.map((log, idx) => (
            <div 
              key={idx} 
              className="bg-[#1c120c] p-2.5 rounded-xl border border-[#3e2619] flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-[#df9b52] uppercase">{log.dayNameEn}</span>
                  <span className="text-[9px] bg-[#2e1c12] text-[#f7cb8b] px-1.5 py-0.2 rounded font-semibold">
                    {log.type}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate mt-0.5">
                  {log.surahNameEn} {log.surahNameAr ? `(${log.surahNameAr})` : ''} • {log.ayahRange}
                </div>
                <div className="text-[10px] text-[#a99585] mt-0.5">
                  {log.ayahCount} Verses • Tajweed: <span className="text-[#f7cb8b] font-medium">{log.tajweedQuality}</span>
                </div>
              </div>

              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>{log.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          2. DAILY ACTIVITIES RESULT
          ========================================================================= */}
      <section className="relative z-10 space-y-2.5 bg-[#241710]/95 p-3 sm:p-4 rounded-2xl border border-[#df9b52]/40 shadow-md">
        <div className="flex items-center justify-between border-b border-[#3b2417] pb-2 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#df9b52] shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#faedd9] font-serif">
              Daily Activities Result / نتيجة الأنشطة اليومية
            </h3>
          </div>
          <span className="text-[10px] text-[#cbb6a3]">
            {weekRangeText || 'Saturday – Wednesday'}
          </span>
        </div>

        {/* Mobile Horizontal Scroll Indicator Banner */}
        <div className="sm:hidden flex items-center justify-between text-[10px] text-[#cbb6a3] bg-[#2c1a11] px-2.5 py-1 rounded-lg border border-[#3b2518]">
          <span>← Swipe table horizontally to view all activities →</span>
        </div>

        {/* Responsive Daily Activities Table with min-width to avoid crushed columns on mobile */}
        <div className="overflow-x-auto rounded-xl border border-[#df9b52]/30 bg-[#21140d]/90 shadow-inner scrollbar-thin scrollbar-thumb-[#df9b52]/40">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead className="bg-[#2d1b11] border-b border-[#df9b52]/30 text-[#f7cb8b] text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-2 text-center">Attendance</th>
                <th className="py-2.5 px-1.5 text-center">Part.</th>
                <th className="py-2.5 px-1.5 text-center">HW</th>
                <th className="py-2.5 px-1.5 text-center">Early</th>
                <th className="py-2.5 px-1.5 text-center">Neat</th>
                <th className="py-2.5 px-1.5 text-center">Manners</th>
                <th className="py-2.5 px-1.5 text-center">Focus</th>
                <th className="py-2.5 px-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#382317] text-[#faedd9]">
              {dailyRecords.map((day, idx) => (
                <tr key={idx} className="hover:bg-[#2b1910]/70 transition">
                  {/* Day */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="font-bold text-[#faedd9] text-[11px]">{day.dayNameEn}</span>
                    <span className="font-arabic text-[9px] text-[#df9b52] ml-1">({day.dayNameAr})</span>
                  </td>

                  {/* Attendance */}
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      day.attendanceStatus === 'present' 
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50' 
                        : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                    }`}>
                      {day.attendanceStatus === 'present' ? 'Present' : 'Late'}
                    </span>
                  </td>

                  {/* Participation */}
                  <td className="py-2 px-1.5 text-center font-bold text-amber-300 text-[11px] tabular-nums">
                    {day.participationScore}
                  </td>

                  {/* Homework */}
                  <td className="py-2 px-1.5 text-center font-bold text-cyan-300 text-[11px] tabular-nums">
                    {day.homeworkScore}
                  </td>

                  {/* Earlier Coming */}
                  <td className="py-2 px-1.5 text-center font-bold text-emerald-300 text-[11px] tabular-nums">
                    {day.earlierComingScore}
                  </td>

                  {/* Neatness */}
                  <td className="py-2 px-1.5 text-center font-bold text-sky-300 text-[11px] tabular-nums">
                    {day.neatnessScore}
                  </td>

                  {/* Good Manners */}
                  <td className="py-2 px-1.5 text-center font-bold text-rose-300 text-[11px] tabular-nums">
                    {day.goodMannersScore}
                  </td>

                  {/* Concentration */}
                  <td className="py-2 px-1.5 text-center font-bold text-indigo-300 text-[11px] tabular-nums">
                    {day.concentrationScore}
                  </td>

                  {/* Daily Rating */}
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-[#3a2316] text-[#f7cb8b] border border-[#df9b52]/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-[#df9b52] text-[#df9b52]" />
                      <span>{day.dailyRating.split(' ')[0]}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          3. SMALL EDITABLE MESSAGE FOR TEACHER REMARK
          ========================================================================= */}
      <section className="relative z-10 space-y-2 bg-[#26170f]/95 p-3.5 sm:p-4 rounded-2xl border border-[#df9b52]/40 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#df9b52]" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#faedd9] font-serif">
              Teacher's Remark / ملاحظة المعلم
            </h3>
          </div>
          {allowCustomComment && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingComment(!isEditingComment)}
                className="text-[10px] font-bold text-[#df9b52] hover:text-[#f7cb8b] flex items-center gap-1 cursor-pointer transition px-2 py-0.5 rounded bg-[#351e12] border border-[#df9b52]/30"
                title={isEditingComment ? 'Done Editing' : 'Edit Remark'}
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingComment ? 'Done' : 'Edit'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyComment}
                className="text-[10px] font-bold text-[#cbb6a3] hover:text-white flex items-center gap-1 cursor-pointer transition px-2 py-0.5 rounded bg-[#351e12] border border-[#df9b52]/30"
                title="Copy Remark"
              >
                {commentCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{commentCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Small Editable Message Area */}
        {isEditingComment ? (
          <div className="space-y-2">
            <textarea
              value={activeComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              rows={3}
              placeholder="Enter teacher remark here..."
              className="w-full bg-[#1b110b] border border-[#df9b52]/60 rounded-xl p-3 text-xs text-[#faedd9] placeholder-[#8c7667] focus:outline-none focus:ring-1 focus:ring-[#df9b52]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditingComment(false)}
                className="text-[11px] font-bold px-3 py-1 bg-[#df9b52] hover:bg-[#f7cb8b] text-[#1b1009] rounded-lg cursor-pointer transition shadow-xs"
              >
                Save Remark
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => allowCustomComment && setIsEditingComment(true)}
            className="group relative cursor-pointer"
            title="Click to edit remark"
          >
            <p className="text-xs sm:text-[13px] text-[#faedd9] leading-relaxed italic font-serif bg-[#1a100a] p-3 rounded-xl border border-[#3e271a] group-hover:border-[#df9b52]/60 transition">
              "{activeComment}"
            </p>
            {allowCustomComment && (
              <span className="absolute bottom-2 right-2 text-[9px] text-[#df9b52] opacity-0 group-hover:opacity-100 transition">
                Click to edit
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
