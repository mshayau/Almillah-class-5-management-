import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Student, WeeklyReportSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useClass } from '../context/ClassContext';
import { StudentPhotoFrame } from './StudentPhotoFrame';
import { StudentReportCard916 } from './StudentReportCard916';
import { buildStudentReportCardData } from '../utils/studentReportGenerator';
import {
  generateStudentWeeklyReportWordBlob,
  downloadWordBlob,
  shareReportToWhatsAppAsWord
} from '../utils/reportWordService';
import { 
  X, 
  MessageCircle, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Star, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Upload, 
  Trash2, 
  FileText,
  GraduationCap,
  Mail,
  Phone
} from 'lucide-react';

interface ReportCardImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  report: WeeklyReportSummary;
  week: {
    startDate: string;
    endDate: string;
    labelEn: string;
    labelAr: string;
    weekNumber: number;
  };
  customRemarks?: string;
}

export const ReportCardImageModal: React.FC<ReportCardImageModalProps> = ({
  isOpen,
  onClose,
  student,
  report,
  week,
  customRemarks
}) => {
  const { language, isRTL, t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedState, setCopiedState] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'info'>('success');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [cardFormat, setCardFormat] = useState<'luxury916' | 'classicFlyer'>('luxury916');
  const [customTeacherComment, setCustomTeacherComment] = useState<string>('');
  const { updateStudent } = useClass();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>(student.avatarUrl || '');

  const remarksToDisplay = customRemarks || report.teacherRemarks;

  const reportCard916Data = useMemo(() => {
    const data = buildStudentReportCardData(student, report, week.startDate, week.endDate, week.weekNumber);
    if (customRemarks) {
      data.teacherComment = customRemarks;
    }
    if (customTeacherComment) {
      data.teacherComment = customTeacherComment;
    }
    return data;
  }, [student, report, week.startDate, week.endDate, week.weekNumber, customRemarks, customTeacherComment]);



  // Sync photo state when modal opens or student changes
  useEffect(() => {
    setCurrentPhotoUrl(student.avatarUrl || '');
  }, [student.avatarUrl, student.id]);

  // Clear states when opened
  useEffect(() => {
    if (isOpen) {
      setFeedbackMessage(null);
      setImagePreviewUrl(null);
      setCopiedState(false);
      setCurrentPhotoUrl(student.avatarUrl || '');
    }
  }, [isOpen, student.id, week.startDate]);

  const handlePhotoChange = (newPhotoUrl: string) => {
    setCurrentPhotoUrl(newPhotoUrl);
    updateStudent({
      ...student,
      avatarUrl: newPhotoUrl
    });
    showFeedback(
      language === 'ar' ? 'تم إدراج وتحديث صورة الطالب في منشور التقرير بنجاح!' : 'Student photo inserted and updated in the weekly report flyer!',
      'success'
    );
  };

  const handlePhotoRemove = () => {
    setCurrentPhotoUrl('');
    updateStudent({
      ...student,
      avatarUrl: ''
    });
    showFeedback(
      language === 'ar' ? 'تمت إزالة صورة الطالب من إطار المنشور.' : 'Student photo removed from flyer frame.',
      'info'
    );
  };

  if (!isOpen) return null;

  const showFeedback = (msg: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage(msg);
    setFeedbackType(type);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };



  /**
   * 4d. Send Weekly Report formatted in MS Word tabular form to Parent via WhatsApp
   */
  const handleSendWordToWhatsApp = async () => {
    setIsGenerating(true);
    try {
      const res = await shareReportToWhatsAppAsWord({
        student,
        report,
        weekNumber: week.weekNumber,
        weekLabel: language === 'ar' ? week.labelAr : week.labelEn,
        summaryMetrics: {
          attendancePct: reportCard916Data.summaryMetrics.attendancePct,
          overallCompositeScore: reportCard916Data.summaryMetrics.overallCompositeScore,
          totalAyahsMemorized: reportCard916Data.quranTracker.totalAyahsMemorized
        },
        teacherComment: remarksToDisplay,
        language: language === 'ar' ? 'ar' : 'en'
      });

      if (res.method === 'native-share') {
        showFeedback(
          language === 'ar'
            ? 'تمت مشاركة تقرير وورد (Word) بنجاح عبر الواتساب!'
            : 'Weekly report Word document shared successfully to WhatsApp!'
        );
      } else {
        showFeedback(
          language === 'ar'
            ? 'تم تنزيل تقرير وورد وفُتحت محادثة الواتساب! يرجى إرفاق الملف المُنَزَّل في المحادثة.'
            : 'Word document downloaded & WhatsApp chat opened! Attach the downloaded .docx file to send.',
          'success'
        );
      }
    } catch (err) {
      console.error('Send Word via WhatsApp failed:', err);
      showFeedback(
        language === 'ar' ? 'حدث خطأ أثناء إعداد ملف Word.' : 'Failed to generate Word document for WhatsApp.',
        'info'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 4e. Direct Download of Report as Microsoft Word (.docx) in Tabular Form
   */
  const handleDownloadWord = async () => {
    setIsGenerating(true);
    try {
      const wordBlob = await generateStudentWeeklyReportWordBlob(
        student,
        report,
        week.weekNumber
      );
      const safeName = student.fullName.replace(/\s+/g, '_');
      const wordFilename = `Al_Millah_Weekly_Report_${safeName}_Std${student.rollNumber}_Week${week.weekNumber}.docx`;
      downloadWordBlob(wordBlob, wordFilename);
      showFeedback(
        language === 'ar'
          ? 'تم تنزيل ملف التقرير الجدولي بصيغة Microsoft Word بنجاح!'
          : 'Weekly report Microsoft Word tabular dossier (.docx) downloaded successfully!'
      );
    } catch (err) {
      console.error('Download Word failed:', err);
      showFeedback(
        language === 'ar' ? 'فشل تنزيل ملف Word.' : 'Failed to download Word document.',
        'info'
      );
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#1b110b]/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div className="bg-[#f7f3ee] rounded-3xl max-w-4xl w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Modal Header Toolbar */}
        <div className="bg-[#24140c] text-white p-3.5 sm:p-4 px-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#3b2317] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b2317] border border-[#5c3722] flex items-center justify-center text-[#df9b52]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#fdfaf7] flex items-center gap-2">
                <span>{language === 'ar' ? 'تقرير الطالب الأسبوعي • وورد جدولي رسمي' : 'Student Weekly Report • Official MS Word Tabular Dossier'}</span>
                <span className="text-[10px] bg-[#185abd] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Word (.docx)
                </span>
              </h3>
              <p className="text-[11px] text-[#d6c4b6]">
                {student.fullName} (#{student.rollNumber}) • {student.parentPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#d6c4b6] hover:text-white hover:bg-[#3b2317] transition cursor-pointer"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Top) */}
        <div className="bg-white border-b border-[#e5dad0] p-3 px-5 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Primary Action 0: Send MS Word Tabular Dossier to WhatsApp */}
            <button
              id="send-report-word-whatsapp-btn"
              type="button"
              disabled={isGenerating}
              onClick={handleSendWordToWhatsApp}
              className="bg-gradient-to-r from-[#185abd] via-[#2368c4] to-[#124b9c] hover:from-[#2368c4] hover:to-[#185abd] text-white text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98 disabled:opacity-70"
              title="Share weekly report directly to WhatsApp in MS Word tabular form (.docx)"
            >
              <MessageCircle className="h-4 w-4 fill-white shrink-0" />
              <FileText className="h-3.5 w-3.5 text-blue-200 shrink-0" />
              <span>{language === 'ar' ? 'مشاركة واتساب (Word)' : 'Share to WhatsApp (Word)'}</span>
              <span className="bg-blue-950/70 text-blue-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-black">
                DOCX
              </span>
            </button>

            {/* Download Microsoft Word (.docx) Button */}
            <button
              id="download-report-word-btn"
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadWord}
              className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-blue-50 border border-blue-400/40 text-xs font-black px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 disabled:opacity-70"
              title="Download weekly report as Microsoft Word (.docx) in clean tabular form"
            >
              <FileText className="h-4 w-4 text-blue-300" />
              <span>{isGenerating ? '...' : (language === 'ar' ? 'تنزيل Word (جدول)' : 'Download Word (Tables)')}</span>
              <span className="bg-blue-950/80 text-blue-200 text-[10px] px-1 py-0.5 rounded font-mono">
                .docx
              </span>
            </button>

          </div>

          <div className="flex items-center gap-2 text-xs text-[#7c695d]">
            <span className="inline-flex items-center gap-1 bg-blue-950/90 text-blue-200 font-semibold px-2.5 py-1 rounded-lg border border-blue-500/40">
              <FileText className="h-3.5 w-3.5 text-blue-300" />
              <span>{language === 'ar' ? 'جداول Word المعتمدة (.docx)' : 'Official Word Tabular Dossier (.docx)'}</span>
            </span>
          </div>
        </div>

        {/* Microsoft Word Tabular Dossier Preview Ribbon */}
        <div className="bg-[#f0e8de] px-4 sm:px-6 py-2.5 border-b border-[#e2d5c7] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#854d2b]" />
            <span className="text-xs font-bold text-[#635043]">
              {language === 'ar' ? 'معاينة تقرير الطالب وملاحظات المعلم المضمنة في ملف Word:' : 'Student Report Preview & Teacher Remarks (Embedded into MS Word):'}
            </span>
          </div>

          <div className="text-[11px] text-[#854d2b] font-semibold hidden md:block">
            {language === 'ar' ? '📄 جداول وورد الأكاديمية: ٨ بطاقات أداء + سجل السبت-الأربعاء + متتبع الحفظ' : '📄 MS Word Tabular Dossier: 8 Metrics + 5-Day Saturday–Wednesday Log + Quran Tracker'}
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            feedbackType === 'success' 
              ? 'bg-[#edf9ee] text-[#1e6e28] border-b border-[#c2e8c6]' 
              : 'bg-[#fff8eb] text-[#8c5717] border-b border-[#fde1ab]'
          }`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Scrollable Container with the Renderable Card */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#eae3d9]/60">
          
          {cardFormat === 'luxury916' ? (
            <StudentReportCard916
              data={reportCard916Data}
              cardRef={cardRef}
              allowCustomComment={true}
              onCustomCommentChange={setCustomTeacherComment}
              isWhatsAppMode={true}
            />
          ) : (
          /* THE OFFICIAL REPORT CARD TO BE CONVERTED INTO AN IMAGE */
          <div
            ref={cardRef}
            id="report-card-image-render-target"
            className="w-full max-w-[760px] bg-white rounded-2xl shadow-xl overflow-hidden border-[3px] border-[#854d2b] relative text-[#1b110b] p-6 sm:p-8 space-y-5 select-none"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Inner Golden Border Framing */}
            <div className="absolute inset-2 sm:inset-3 border border-[#df9b52]/50 pointer-events-none rounded-xl" />

            {/* Corner Rosettes / Ornaments */}
            <div className="absolute top-4 left-4 text-[#df9b52]/70 text-lg font-serif">❖</div>
            <div className="absolute top-4 right-4 text-[#df9b52]/70 text-lg font-serif">❖</div>
            <div className="absolute bottom-4 left-4 text-[#df9b52]/70 text-lg font-serif">❖</div>
            <div className="absolute bottom-4 right-4 text-[#df9b52]/70 text-lg font-serif">❖</div>

            {/* INSTITUTIONAL HEADER */}
            <div className="text-center border-b-2 border-[#3b2317] pb-4 pt-1">
              <p className="font-arabic text-xl sm:text-2xl font-bold text-[#3b2317] tracking-wider mb-1">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              
              <div className="flex items-center justify-center gap-2.5">
                <img
                  src="/logo.jpg"
                  alt="Al-Millah Islamic Academy Logo"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-[#854d2b]/40 shadow-xs bg-white shrink-0 aspect-square"
                />
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#1b110b] uppercase">
                  Al-Millah Islamic Academy
                </h2>
              </div>

              <p className="font-arabic text-xs sm:text-sm text-[#854d2b] font-bold mt-0.5">
                مَعهَدُ المِلَّةِ الإِسْلَامِي لِتَعْلِيمِ القُرْآنِ الكَرِيمِ وَالعُلُومِ الإِسْلَامِيَّةِ
              </p>

              <div className="mt-2.5 inline-flex items-center gap-2 bg-[#faedd9] border border-[#c88642]/40 rounded-full px-3.5 py-0.5 text-[11px] font-extrabold text-[#854d2b]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#854d2b]" />
                <span>CLASS FIVE (BOYS) • OFFICIAL WEEKLY HIFZ & PERFORMANCE REPORT</span>
              </div>
            </div>

            {/* FLYER HERO: STUDENT PHOTO FRAME & IDENTITY DOSSIER */}
            <div className="bg-[#faf7f3] p-5 rounded-2xl border-2 border-[#e5dad0] shadow-2xs relative">
              {/* Top Period & Standing Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#ebdcd0]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8c7464] uppercase font-black tracking-wider">
                    {language === 'ar' ? 'فترة التقرير الأسبوعي:' : 'Reporting Period:'}
                  </span>
                  <span className="text-xs font-bold text-[#1b110b] bg-white px-2.5 py-0.5 rounded-lg border border-[#e5dad0]">
                    {week.startDate} — {week.endDate} ({language === 'ar' ? `الأسبوع ${week.weekNumber}` : `Week ${week.weekNumber}`})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#8c7464]">
                    {language === 'ar' ? 'التقييم العام:' : 'Weekly Standing:'}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#faedd9] text-[#854d2b] border border-[#c88642]/50 shadow-2xs">
                    ★ {report.gradeStatus} ★
                  </span>
                </div>
              </div>

              {/* CENTERED STUDENT PHOTO FRAME & NAME UNDER THE FRAME */}
              <StudentPhotoFrame
                photoUrl={currentPhotoUrl}
                studentName={student.fullName}
                arabicName={student.arabicName}
                rollNumber={student.rollNumber}
                classNameText={language === 'ar' ? 'الصف الخامس (بنين)' : 'Class Five (Boys)'}
                parentName={student.parentName}
                parentPhone={student.parentPhone}
                groupName={language === 'ar' ? 'حلقة الشيخ خليل الحصري' : 'Halaqah Khaleelul Hussary'}
                onPhotoChange={handlePhotoChange}
                onPhotoRemove={handlePhotoRemove}
                allowEdit={true}
                size="normal"
              />
            </div>

            {/* 4 CORE KPI METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              
              {/* Sabaq */}
              <div className="border border-[#e5dad0] rounded-xl p-3 bg-white shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-[#8c7464] block">
                  Sabaq Memorization
                </span>
                <div className="text-xl font-black text-[#1b110b] mt-0.5">
                  {report.totalAyahsMemorized} <span className="text-xs font-normal text-[#8c7464]">Ayahs</span>
                </div>
                <span className="text-[10px] text-[#854d2b] font-bold block mt-0.5">
                  {report.memorizationPercentage || 95}% Accuracy
                </span>
              </div>

              {/* Attendance */}
              <div className="border border-[#e5dad0] rounded-xl p-3 bg-white shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-[#8c7464] block">
                  Class Attendance
                </span>
                <div className="text-xl font-black text-[#2d6639] mt-0.5">
                  {report.attendancePercentage || report.attendanceRate}%
                </div>
                <span className="text-[10px] text-[#2d6639] font-bold block mt-0.5">
                  {report.presentDays} of {report.totalDays} Days Present
                </span>
              </div>

              {/* Activities Score */}
              <div className="border border-[#e5dad0] rounded-xl p-3 bg-white shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-[#8c7464] block">
                  Activities Marks
                </span>
                <div className="text-xl font-black text-[#c88642] mt-0.5">
                  {report.activitiesMarksObtained || 57.8} <span className="text-xs font-normal text-[#8c7464]">/ 60</span>
                </div>
                <span className="text-[10px] text-[#2d6639] font-bold block mt-0.5">
                  {report.activitiesScorePct || 96}% Aggregate
                </span>
              </div>

              {/* Overall Score */}
              <div className="border-2 border-[#df9b52] rounded-xl p-3 bg-[#faf7f3] shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-[#854d2b] block">
                  Overall Score
                </span>
                <div className="text-xl font-black text-[#3b2317] mt-0.5">
                  {report.compositeScore || report.overallPercentage || report.overallScore}%
                </div>
                <span className="text-[10px] text-[#854d2b] font-black block mt-0.5">
                  Rank: Grade A
                </span>
              </div>

            </div>

            {/* DAILY ACTIVITIES MARKS BREAKDOWN (6 CATEGORIES) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1b110b] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#854d2b]" />
                  <span>Daily Activities & Behavioral Conduct Marks (6 Core Categories)</span>
                </h4>
                <span className="text-[10px] text-[#854d2b] font-extrabold">
                  Total: {report.activitiesMarksObtained || 57.8} / 60 pts ({report.activitiesScorePct || 96}%)
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                {[
                  { key: 'adab', label: 'Adab' },
                  { key: 'attentiveness', label: 'Attentiveness' },
                  { key: 'neatness', label: 'Neatness' },
                  { key: 'performance', label: 'Performance' },
                  { key: 'coming_earlier', label: 'Early Arrival' },
                  { key: 'good_manner', label: 'Good Manner' }
                ].map(cat => {
                  const b = (report.categoryBreakdown as any)?.[cat.key];
                  return (
                    <div key={cat.key} className="border border-[#e5dad0] p-1.5 rounded-lg bg-[#faf7f3]">
                      <span className="text-[10px] font-bold text-[#635043] block truncate">{cat.label}</span>
                      <strong className="text-xs text-[#1b110b] block mt-0.5">{b?.marks || '9.5'}/{b?.maxMarks || '10'}</strong>
                      <span className="text-[9px] text-emerald-700 font-bold block">{b?.percentage || 95}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECITATION SUMMARY LOG TABLE & HIFZ TRACKER */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1b110b] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#854d2b]" />
                  <span>Qur'an Memorization Tracker & Weekly Recitations</span>
                </h4>
                <span className="text-[10px] text-[#7c695d]">
                  Standard: Hafs 'an 'Asim • Total Ayahs: <strong className="text-[#854d2b]">{report.totalAyahsMemorized}</strong>
                </span>
              </div>

              <div className="border border-[#e5dad0] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#faf7f3] text-[#635043] border-b border-[#e5dad0] text-[11px]">
                    <tr>
                      <th className="p-2 font-bold">Date</th>
                      <th className="p-2 font-bold">Category</th>
                      <th className="p-2 font-bold">Surah & Ayahs</th>
                      <th className="p-2 font-bold">Tajweed</th>
                      <th className="p-2 font-bold text-center">Mistakes</th>
                      <th className="p-2 font-bold text-center">Status</th>
                      <th className="p-2 font-bold">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e6dc] text-[11px]">
                    {(report.quranRecitations || []).map((log, idx) => (
                      <tr key={idx} className="hover:bg-[#faf7f3]">
                        <td className="p-2 text-[#7c695d] font-medium whitespace-nowrap">{log.date}</td>
                        <td className="p-2 font-bold text-[#854d2b] uppercase text-[10px]">
                          {log.category === 'sabaq' ? 'Sabaq (New)' : log.category === 'sabqi' ? 'Sabqi' : 'Manzil'}
                        </td>
                        <td className="p-2 font-bold text-[#1b110b]">
                          {log.surahName} {log.surahArabic ? `(${log.surahArabic})` : ''} (Ayah {log.ayahStart} – {log.ayahEnd})
                          {log.juzNumber ? <span className="text-[#8c7464] text-[10px]"> • Juz {log.juzNumber}</span> : null}
                        </td>
                        <td className="p-2 font-semibold text-[#2d6639] uppercase text-[10px]">
                          {log.tajweedRating.replace('_', ' ')}
                        </td>
                        <td className="p-2 text-center font-bold text-[#635043]">
                          {log.mistakeCount ?? 0}
                        </td>
                        <td className="p-2 text-center">
                          <span className="font-bold text-[#2d6639] bg-[#eef7ef] px-2 py-0.5 rounded text-[10px]">
                            Passed (مجاز)
                          </span>
                        </td>
                        <td className="p-2 text-[10px] text-[#635043] italic">
                          {log.notes || 'Fluent recitation with excellent tajweed.'}
                        </td>
                      </tr>
                    ))}
                    {(!report.quranRecitations || report.quranRecitations.length === 0) && (
                      <tr>
                        <td colSpan={7} className="p-3 text-center text-[#8c7464] italic">
                          No recitation entries logged for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5-DAY ATTENDANCE REGISTER & PUNCTUALITY */}
            <div className="p-3 rounded-xl bg-[#faf7f3] border border-[#e5dad0] text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#854d2b]" />
                <div>
                  <strong className="text-[#1b110b] block text-[11px]">Weekly 5-Day Attendance Record:</strong>
                  <span className="text-[#7c695d] text-[10px]">
                    {report.attendanceSummary?.presentDays || report.presentDays || 5} of {report.attendanceSummary?.totalDays || report.totalDays || 5} Days Present ({report.attendancePercentage || 100}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="bg-white px-2 py-1 rounded border border-[#e5dad0] font-mono text-[#854d2b] font-bold">
                  Avg Arrival: 06:40 AM
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">
                  Punctual & Disciplined
                </span>
              </div>
            </div>

            {/* TEACHER'S GUIDANCE & CREDENTIALS PROFILE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-[#e5dad0] rounded-xl p-3 bg-[#faf7f3] relative">
                <span className="font-bold text-[#1b110b] block text-[11px] mb-1">
                  Ustadh’s Feedback for Guardian:
                </span>
                <p className="text-[#4b3c32] italic leading-relaxed text-xs">
                  "{remarksToDisplay}"
                </p>
              </div>

              <div className="border-2 border-[#854d2b]/40 rounded-xl p-3 bg-gradient-to-r from-[#faf7f3] to-[#f4ece3] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[#1b110b] text-[11px] flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-[#df9b52]" />
                    <span>{report.teacherDetails?.name || "Ustadh Muhammad Shaya'u"}</span>
                  </strong>
                  <span className="text-[9px] bg-[#3b2317] text-[#faedd9] font-bold px-1.5 py-0.5 rounded">
                    {report.teacherDetails?.credentials || "Ijāzah in Hafs 'an 'Asim"}
                  </span>
                </div>
                <p className="font-arabic text-xs text-[#854d2b] font-bold">
                  {report.teacherDetails?.arabicName || "الشيخ أ. محمد شايعو"} — {report.teacherDetails?.arabicRole || "مشرف ومعلم حلقات الصف الخامس"}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#635043]">
                  <span className="flex items-center gap-1">
                    <Mail className="h-2.5 w-2.5 text-[#854d2b]" />
                    <span>{report.teacherDetails?.email || "mohdshayau46@gmail.com"}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5 text-[#854d2b]" />
                    <span>{report.teacherDetails?.phone || "+234 803 891 2345"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ENDORSEMENT, STAMP & SIGNATURES */}
            <div className="pt-4 border-t-2 border-[#e5dad0] flex items-center justify-between text-xs">
              
              {/* Teacher Signature */}
              <div className="w-1/3">
                <div className="font-arabic text-sm text-[#3b2317] font-bold border-b border-[#8c7464] pb-1">
                  محمد شايعو — مُعَلِّمُ الحَلَقَةِ
                </div>
                <span className="text-[10px] text-[#7c695d] block mt-0.5">
                  Ustadh Mohd Shayau (Class Five Supervisor)
                </span>
              </div>

              {/* Official Seal / Stamp Emblem */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#854d2b] flex flex-col items-center justify-center text-[#854d2b] p-1 text-center bg-[#faedd9]/50 shadow-inner">
                  <Award className="h-5 w-5 text-[#854d2b]" />
                  <span className="text-[7px] font-black uppercase tracking-tight leading-tight">
                    OFFICIAL SEAL
                  </span>
                </div>
                <span className="text-[9px] text-[#8c7464] font-semibold mt-0.5">
                  Al-Millah Verified
                </span>
              </div>

              {/* Guardian Signature Line */}
              <div className="w-1/3 text-right">
                <div className="border-b border-[#8c7464] pb-1 h-6"></div>
                <span className="text-[10px] text-[#7c695d] block mt-0.5">
                  Parent / Guardian Endorsement
                </span>
              </div>

            </div>

          </div>
          )}
        </div>

        {/* Modal Footer Quick Guidance */}
        <div className="bg-white border-t border-[#e5dad0] p-3 px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7c695d] shrink-0">
          <p>
            {language === 'ar'
              ? '💡 نصيحة: يمكنك النقر على "نسخ الصورة" ثم الضغط على (Ctrl+V) في تطبيق واتساب ويب لإرسالها مباشرة لولي الأمر.'
              : '💡 Tip: Click "Copy Image" then press Ctrl+V in WhatsApp Web to send the photo directly to the parent.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#ede5dc] hover:bg-[#e2d5c7] text-[#635043] rounded-lg font-bold text-xs transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>

      </div>
    </div>
  );
};
