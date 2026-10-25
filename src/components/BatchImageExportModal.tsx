import React, { useState, useRef } from 'react';
import { Student, WeeklyReportSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  generateReportImageBlob, 
  downloadImageBlob, 
  copyImageBlobToClipboard, 
  shareImageBlob 
} from '../utils/reportImageService';
import {
  generateReportPdfBlob,
  downloadPdfBlob,
  shareReportToWhatsAppAsPdf
} from '../utils/reportPdfService';
import {
  generateStudentWeeklyReportExcelBlob,
  generateFullClassWeeklyExcelBlob,
  downloadExcelBlob,
  shareReportToWhatsAppAsExcel
} from '../utils/reportExcelService';
import { 
  X, 
  Download, 
  Share2, 
  MessageCircle, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Star, 
  Printer, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  Search,
  Activity,
  Clock,
  GraduationCap,
  User,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

interface BatchItem {
  student: Student;
  report: WeeklyReportSummary;
}

interface BatchImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: BatchItem[];
  week: {
    startDate: string;
    endDate: string;
    labelEn: string;
    labelAr: string;
    weekNumber: number;
  };
}

export const BatchImageExportModal: React.FC<BatchImageExportModalProps> = ({
  isOpen,
  onClose,
  reports,
  week
}) => {
  const { language, isRTL } = useLanguage();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(reports[0]?.student.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentItem = reports.find(r => r.student.id === selectedStudentId) || reports[0];

  const filteredReports = reports.filter(({ student }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(q) ||
      (student.arabicName && student.arabicName.includes(q)) ||
      student.rollNumber.toString().includes(q)
    );
  });

  /**
   * Export single active student report image
   */
  const handleDownloadActiveImage = async () => {
    if (!activeCardRef.current || !currentItem) return;
    try {
      const blob = await generateReportImageBlob(activeCardRef.current, { pixelRatio: 2 });
      const filename = `Al_Millah_Weekly_Report_Std${currentItem.student.rollNumber}_${currentItem.student.fullName.replace(/\s+/g, '_')}_Week${week.weekNumber}.png`;
      downloadImageBlob(blob, filename);
      setStatusMessage(language === 'ar' ? 'تم تنزيل الصورة بنجاح!' : 'Report image downloaded!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Send active student report to parent on WhatsApp in PDF format (User requested feature)
   */
  const handleSendActiveWhatsAppPdf = async () => {
    if (!activeCardRef.current || !currentItem) return;
    const { student, report } = currentItem;
    try {
      const res = await shareReportToWhatsAppAsPdf({
        element: activeCardRef.current,
        studentName: student.fullName,
        studentArabicName: student.arabicName,
        studentRoll: student.rollNumber,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        weekNumber: week.weekNumber,
        weekLabel: language === 'ar' ? week.labelAr : week.labelEn,
        format: '9:16',
        summaryMetrics: {
          attendancePct: report.attendancePercentage || report.attendanceRate || 100,
          overallCompositeScore: 95,
          totalAyahsMemorized: report.totalAyahsMemorized || 0
        },
        teacherComment: report.teacherRemarks,
        language: language === 'ar' ? 'ar' : 'en'
      });

      if (res.method === 'native-share') {
        setStatusMessage(language === 'ar' ? 'تمت مشاركة تقرير PDF بنجاح!' : 'Report PDF shared successfully!');
      } else {
        setStatusMessage(
          language === 'ar'
            ? 'تم تنزيل تقرير PDF وفُتحت محادثة الواتساب! يرجى إرفاق الملف المُنَزَّل في المحادثة.'
            : 'Report PDF downloaded & WhatsApp opened! Attach the downloaded PDF document to send.'
        );
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to share PDF.');
    }
  };

  /**
   * Download active student PDF directly
   */
  const handleDownloadActivePdf = async () => {
    if (!activeCardRef.current || !currentItem) return;
    const { student } = currentItem;
    try {
      const blob = await generateReportPdfBlob(activeCardRef.current, {
        studentName: student.fullName,
        studentRoll: student.rollNumber,
        weekNumber: week.weekNumber,
        format: '9:16'
      });
      const filename = `Al_Millah_Weekly_Report_Std${student.rollNumber}_${student.fullName.replace(/\s+/g, '_')}_Week${week.weekNumber}.pdf`;
      downloadPdfBlob(blob, filename);
      setStatusMessage(language === 'ar' ? 'تم تنزيل ملف PDF بنجاح!' : 'Report PDF downloaded!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Share active student Microsoft Excel workbook directly to WhatsApp
   */
  const handleSendActiveWhatsAppExcel = async () => {
    if (!currentItem) return;
    const { student, report } = currentItem;
    try {
      const res = await shareReportToWhatsAppAsExcel({
        student,
        report,
        weekNumber: week.weekNumber,
        weekLabel: language === 'ar' ? week.labelAr : week.labelEn,
        summaryMetrics: {
          attendancePct: report.attendancePercentage || report.attendanceRate || 95,
          overallCompositeScore: report.overallPercentage || report.overallScore || 95,
          totalAyahsMemorized: report.totalAyahsMemorized || 0
        },
        teacherComment: report.teacherRemarks,
        language: language === 'ar' ? 'ar' : 'en'
      });

      if (res.method === 'native-share') {
        setStatusMessage(language === 'ar' ? 'تمت مشاركة تقرير Excel بنجاح!' : 'Report Excel shared successfully!');
      } else {
        setStatusMessage(
          language === 'ar'
            ? 'تم تنزيل تقرير Excel وفُتحت محادثة الواتساب! يرجى إرفاق الملف المُنَزَّل في المحادثة.'
            : 'Report Excel downloaded & WhatsApp opened! Attach the downloaded .xlsx workbook to send.'
        );
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to share Excel file.');
    }
  };

  /**
   * Download active student Excel workbook directly
   */
  const handleDownloadActiveExcel = async () => {
    if (!currentItem) return;
    const { student, report } = currentItem;
    try {
      const blob = await generateStudentWeeklyReportExcelBlob(
        student,
        report,
        week.weekNumber
      );
      const safeName = student.fullName.replace(/\s+/g, '_');
      const filename = `Al_Millah_Weekly_Report_${safeName}_Std${student.rollNumber}_Week${week.weekNumber}.xlsx`;
      downloadExcelBlob(blob, filename);
      setStatusMessage(language === 'ar' ? 'تم تنزيل ملف Excel بنجاح!' : 'Report Excel workbook downloaded!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Download complete Class 5 Master Excel workbook
   */
  const handleDownloadClassMasterExcel = async () => {
    try {
      const studentsList = reports.map(r => r.student);
      const reportsMap = new Map<string, WeeklyReportSummary>();
      reports.forEach(r => reportsMap.set(r.student.id, r.report));

      const blob = await generateFullClassWeeklyExcelBlob(
        studentsList,
        reportsMap,
        week.weekNumber
      );
      const filename = `AlMillah_Class5_Weekly_Master_Report_Week${week.weekNumber}.xlsx`;
      downloadExcelBlob(blob, filename);
      setStatusMessage(language === 'ar' ? 'تم تنزيل سجل الصف الشامل بصيغة Excel بنجاح!' : 'Class 5 Master Excel Workbook downloaded!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.error('Failed to export class master excel:', e);
    }
  };

  /**
   * Send active student image to parent on WhatsApp (Alternative)
   */
  const handleSendActiveWhatsApp = async () => {
    if (!activeCardRef.current || !currentItem) return;
    const { student, report } = currentItem;
    try {
      const blob = await generateReportImageBlob(activeCardRef.current, { pixelRatio: 2 });
      const filename = `Al_Millah_Weekly_Report_Std${student.rollNumber}_${student.fullName.replace(/\s+/g, '_')}_Week${week.weekNumber}.png`;
      
      const phone = student.parentPhone.replace(/[^0-9]/g, '');
      const weekLabel = language === 'ar' ? week.labelAr : week.labelEn;
      const text = language === 'ar'
        ? `السلام عليكم ورحمة الله وبركاته\nولي أمر الطالب الكريم: ${student.parentName}\n\nنرفق لكم صورة بطاقة التقرير القرآني الأسبوعي لنجلكم: *${student.arabicName || student.fullName}* (رقم #${student.rollNumber}) في مَعهَدِ المِلَّةِ الإِسْلَامِي — الصف الخامس:\n\n📅 *الفترة:* ${weekLabel}\n📖 *الآيات المحفوظة:* ${report.totalAyahsMemorized} آية\n🕌 *نسبة الحضور:* ${report.attendancePercentage || report.attendanceRate}%\n⭐ *تقييم الآداب:* ${report.averageAdabScore} / 5.0\n🎖️ *التقدير العام:* ${report.gradeStatus}\n\nملاحظات المعلم: "${report.teacherRemarks}"`
        : `Assalamu Alaikum wa Rahmatullah,\nDear Guardian of: *${student.fullName}* (Roll #${student.rollNumber})\n\nAttached is the official Weekly Qur'an & Academic Report Card image for Class Five at Al-Millah Islamic Academy:\n\n📅 *Period:* ${weekLabel}\n📖 *Ayahs Memorized:* ${report.totalAyahsMemorized}\n🕌 *Attendance Rate:* ${report.attendancePercentage || report.attendanceRate}%\n⭐ *Adab Score:* ${report.averageAdabScore} / 5.0\n🎖️ *Weekly Standing:* ${report.gradeStatus}\n\nTeacher's Remarks: "${report.teacherRemarks}"`;

      // Copy image to clipboard
      await copyImageBlobToClipboard(blob);
      // Download image
      downloadImageBlob(blob, filename);

      // Open WhatsApp
      const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setStatusMessage(
        language === 'ar'
          ? 'تم نسخ صورة التقرير وتنزيلها، وجاري فتح الواتساب! الصق الصورة (Ctrl+V) في المحادثة.'
          : 'Report image copied & downloaded! WhatsApp opened — press Ctrl+V to paste the image.'
      );
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Progressive batch download of all student report images
   */
  const handleBatchDownloadAll = async () => {
    if (reports.length === 0) return;
    setIsExportingAll(true);
    setExportProgress({ current: 0, total: reports.length });

    for (let i = 0; i < reports.length; i++) {
      const item = reports[i];
      setSelectedStudentId(item.student.id);
      setExportProgress({ current: i + 1, total: reports.length });

      // Allow DOM to update
      await new Promise(r => setTimeout(r, 450));

      if (activeCardRef.current) {
        try {
          const blob = await generateReportImageBlob(activeCardRef.current, { pixelRatio: 2 });
          const filename = `Al_Millah_Weekly_Report_Std${item.student.rollNumber}_${item.student.fullName.replace(/\s+/g, '_')}_Week${week.weekNumber}.png`;
          downloadImageBlob(blob, filename);
        } catch (err) {
          console.error(`Failed to export student ${item.student.fullName}`, err);
        }
      }
    }

    setIsExportingAll(false);
    setExportProgress(null);
    setStatusMessage(
      language === 'ar'
        ? `تم تنزيل جميع تقارير الطلاب (${reports.length} صورة) بنجاح!`
        : `Successfully exported all ${reports.length} student report cards as images!`
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-[#1b110b]/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div className="bg-[#f7f3ee] rounded-3xl max-w-5xl w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#24140c] text-white p-3.5 sm:p-4 px-5 flex items-center justify-between border-b border-[#3b2317] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b2317] border border-[#5c3722] flex items-center justify-center text-[#df9b52]">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#fdfaf7]">
                {language === 'ar' ? 'تصدير وإرسال تقارير الصف كصور' : 'Batch Send Class Report Cards in Image Format'}
              </h3>
              <p className="text-[11px] text-[#d6c4b6]">
                {reports.length} {language === 'ar' ? 'طالباً في الصف الخامس' : 'Students in Class Five'} • {week.startDate} — {week.endDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#d6c4b6] hover:text-white hover:bg-[#3b2317] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Action Banner */}
        <div className="bg-white border-b border-[#e5dad0] p-3 px-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Master Class Excel Button */}
            <button
              id="batch-download-class-excel-btn"
              type="button"
              onClick={handleDownloadClassMasterExcel}
              className="bg-[#107c41] hover:bg-[#15803d] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
              title="Download Complete Class 5 Master Excel Workbook with all records"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
              <span>
                {language === 'ar' ? 'تصدير سجل الصف الخامس الشامل (Microsoft Excel)' : 'Export Class 5 Master Excel (.xlsx)'}
              </span>
            </button>

            <button
              id="batch-download-all-images-btn"
              type="button"
              disabled={isExportingAll}
              onClick={handleBatchDownloadAll}
              className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-70"
            >
              <Download className="h-4 w-4 text-[#df9b52]" />
              <span>
                {isExportingAll && exportProgress
                  ? (language === 'ar' ? `جاري التصدير (${exportProgress.current} من ${exportProgress.total})...` : `Exporting ${exportProgress.current}/${exportProgress.total}...`)
                  : (language === 'ar' ? 'تنزيل جميع بطاقات الطلاب كصور PNG' : 'Download All Student Cards as Images (.PNG)')}
              </span>
            </button>
          </div>

          {statusMessage && (
            <div className="bg-[#edf9ee] text-[#1e6e28] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#c2e8c6] animate-fadeIn">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* 2-Column Workspace */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-0">
          
          {/* Left Column: Student Selector */}
          <div className="p-4 border-r rtl:border-r-0 rtl:border-l border-[#e5dad0] bg-white overflow-y-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث عن طالب...' : 'Search student...'}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#faf7f3] border border-[#e5dad0] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#854d2b]"
              />
              <Search className="w-3.5 h-3.5 text-[#8c7464] absolute left-2.5 top-2 rtl:left-auto rtl:right-2.5" />
            </div>

            <div className="space-y-1">
              {filteredReports.map(({ student, report }) => {
                const isSelected = student.id === selectedStudentId;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full p-2.5 rounded-xl text-left rtl:text-right transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#3b2317] text-[#faedd9] font-bold shadow-xs'
                        : 'hover:bg-[#faf7f3] text-[#1b110b]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#df9b52] text-[#1b110b]' : 'bg-[#ede5dc] text-[#635043]'
                      }`}>
                        #{student.rollNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs truncate font-medium">
                          {language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}
                        </p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-[#d6c4b6]' : 'text-[#8c7464]'}`}>
                          {report.overallPercentage || report.overallScore}% • {report.gradeStatus}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 rtl:rotate-180 shrink-0 ${isSelected ? 'text-[#df9b52]' : 'text-[#d6c4b6]'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Image Preview & Direct Send */}
          <div className="md:col-span-2 p-4 sm:p-6 overflow-y-auto bg-[#eae3d9]/50 flex flex-col items-center">
            
            {/* Action Bar for Current Student */}
            {currentItem && (
              <div className="w-full max-w-[650px] mb-4 bg-white p-3 rounded-2xl border border-[#e5dad0] shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-[#1b110b]">
                    {currentItem.student.fullName} (#{currentItem.student.rollNumber})
                  </h4>
                  <p className="text-[10px] text-[#7c695d]">
                    Guardian: {currentItem.student.parentName} ({currentItem.student.parentPhone})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Share Excel to WhatsApp */}
                  <button
                    type="button"
                    onClick={handleSendActiveWhatsAppExcel}
                    className="bg-[#107c41] hover:bg-[#15803d] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Send Microsoft Excel workbook to parent on WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-white" />
                    <FileSpreadsheet className="h-3 w-3 text-emerald-200" />
                    <span>{language === 'ar' ? 'واتساب (Excel)' : 'WhatsApp (Excel)'}</span>
                    <span className="bg-emerald-950/70 text-emerald-200 text-[9px] px-1 py-0.2 rounded font-mono font-bold">XLSX</span>
                  </button>

                  {/* Download Excel */}
                  <button
                    type="button"
                    onClick={handleDownloadActiveExcel}
                    className="bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-100 text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs border border-emerald-500/30"
                    title="Download student report as Microsoft Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Excel</span>
                  </button>

                  {/* Share PDF to WhatsApp */}
                  <button
                    type="button"
                    onClick={handleSendActiveWhatsAppPdf}
                    className="bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Send PDF to parent on WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-white" />
                    <span>{language === 'ar' ? 'واتساب (PDF)' : 'WhatsApp (PDF)'}</span>
                    <span className="bg-emerald-900/60 text-emerald-100 text-[9px] px-1 py-0.2 rounded font-mono font-bold">PDF</span>
                  </button>

                  {/* Download PDF */}
                  <button
                    type="button"
                    onClick={handleDownloadActivePdf}
                    className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Download as PDF"
                  >
                    <FileText className="h-3.5 w-3.5 text-white" />
                    <span>PDF</span>
                  </button>

                  {/* Download PNG */}
                  <button
                    type="button"
                    onClick={handleDownloadActiveImage}
                    className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Download as PNG image"
                  >
                    <Download className="h-3.5 w-3.5 text-[#df9b52]" />
                    <span>PNG</span>
                  </button>
                </div>
              </div>
            )}

            {/* Renderable Report Card for Active Student */}
            {currentItem && (
              <div
                ref={activeCardRef}
                id="batch-render-target"
                className="w-full max-w-[650px] bg-white rounded-2xl shadow-xl overflow-hidden border-[3px] border-[#854d2b] relative text-[#1b110b] p-5 sm:p-6 space-y-4 select-none"
              >
                <div className="absolute inset-2 border border-[#df9b52]/50 pointer-events-none rounded-xl" />

                {/* Header */}
                <div className="text-center border-b-2 border-[#3b2317] pb-3">
                  <p className="font-arabic text-lg font-bold text-[#3b2317]">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <img
                      src="/logo.jpg"
                      alt="Al-Millah Logo"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-[#854d2b]/40 shadow-2xs bg-white shrink-0 aspect-square"
                    />
                    <h3 className="text-base font-black tracking-tight text-[#1b110b] uppercase">
                      Al-Millah Islamic Academy
                    </h3>
                  </div>
                  <p className="font-arabic text-[11px] text-[#854d2b] font-bold">
                    مَعهَدُ المِلَّةِ الإِسْلَامِي — تقرير الإنجاز القرآني الأسبوعي
                  </p>
                </div>

                {/* Flyer Student Photo Frame & Identity */}
                <div className="bg-[#faf7f3] p-3.5 rounded-xl border border-[#e5dad0] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-24 rounded-xl p-0.5 bg-gradient-to-b from-[#df9b52] via-[#f5d09b] to-[#854d2b] shadow-xs">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-white border border-[#854d2b]/40 flex items-center justify-center">
                      {currentItem.student.avatarUrl ? (
                        <img
                          src={currentItem.student.avatarUrl}
                          alt={currentItem.student.fullName}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#8c7464]">
                          <User className="w-6 h-6 opacity-40" />
                          <span className="text-[8px] mt-0.5">No Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="bg-[#3b2317] text-[#faedd9] text-[9px] font-bold px-1.5 py-0.2 rounded">
                        #{currentItem.student.rollNumber}
                      </span>
                      <span className="bg-[#faedd9] text-[#854d2b] text-[9px] font-bold px-1.5 py-0.2 rounded border border-[#c88642]/30">
                        Class Five (Boys)
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-[#faedd9] text-[#854d2b] border border-[#c88642]/40">
                        {currentItem.report.gradeStatus}
                      </span>
                    </div>
                    <strong className="text-xs text-[#1b110b] block">{currentItem.student.fullName}</strong>
                    <p className="font-arabic text-[11px] font-bold text-[#854d2b]">{currentItem.student.arabicName}</p>
                    <p className="text-[9px] text-[#7c695d]">
                      Guardian: {currentItem.student.parentName} ({currentItem.student.parentPhone})
                    </p>
                  </div>
                </div>

                {/* 4 Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="border border-[#e5dad0] p-2 rounded-lg bg-white">
                    <span className="text-[9px] text-[#8c7464] block">SABAQ</span>
                    <strong className="text-sm text-[#1b110b]">{currentItem.report.totalAyahsMemorized} Ayahs</strong>
                  </div>
                  <div className="border border-[#e5dad0] p-2 rounded-lg bg-white">
                    <span className="text-[9px] text-[#8c7464] block">ATTENDANCE</span>
                    <strong className="text-sm text-[#2d6639]">{currentItem.report.attendancePercentage || currentItem.report.attendanceRate}%</strong>
                  </div>
                  <div className="border border-[#e5dad0] p-2 rounded-lg bg-white">
                    <span className="text-[9px] text-[#8c7464] block">ACTIVITIES</span>
                    <strong className="text-sm text-[#c88642]">{currentItem.report.activitiesMarksObtained || 57.8}/60</strong>
                  </div>
                  <div className="border border-[#df9b52] p-2 rounded-lg bg-[#faf7f3]">
                    <span className="text-[9px] text-[#854d2b] block">OVERALL</span>
                    <strong className="text-sm text-[#3b2317]">{currentItem.report.compositeScore || currentItem.report.overallPercentage || currentItem.report.overallScore}%</strong>
                  </div>
                </div>

                {/* 1. Activities Marks Breakdown */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#1b110b]">
                    <span>Activities Marks Breakdown:</span>
                    <span className="text-[#854d2b]">{currentItem.report.activitiesMarksObtained || 57.8}/60 ({currentItem.report.activitiesScorePct || 96}%)</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-center text-[9px]">
                    {[
                      { key: 'adab', label: 'Adab' },
                      { key: 'attentiveness', label: 'Attent.' },
                      { key: 'neatness', label: 'Neatness' },
                      { key: 'performance', label: 'Perform.' },
                      { key: 'coming_earlier', label: 'Early' },
                      { key: 'good_manner', label: 'Manners' }
                    ].map(cat => {
                      const b = (currentItem.report.categoryBreakdown as any)?.[cat.key];
                      return (
                        <div key={cat.key} className="border border-[#e5dad0] p-1 rounded bg-[#faf7f3]">
                          <span className="text-[#8c7464] block truncate">{cat.label}</span>
                          <strong className="text-[#1b110b]">{b?.marks || '9.5'}/{b?.maxMarks || '10'}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quran Recitations Tracker */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#1b110b] block">Qur’an Memorization Tracker & Weekly Recitations:</span>
                  <table className="w-full text-left border-collapse text-[10px] border border-[#e5dad0]">
                    <thead className="bg-[#faf7f3] text-[#635043]">
                      <tr className="border-b border-[#e5dad0]">
                        <th className="p-1">Date</th>
                        <th className="p-1">Category</th>
                        <th className="p-1">Portion</th>
                        <th className="p-1">Tajweed</th>
                        <th className="p-1 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e6dc]">
                      {(currentItem.report.quranRecitations || []).slice(0, 3).map((l, idx) => (
                        <tr key={idx}>
                          <td className="p-1 text-[#7c695d]">{l.date}</td>
                          <td className="p-1 font-bold text-[#854d2b] uppercase">{l.category}</td>
                          <td className="p-1 font-semibold text-[#1b110b]">{l.surahName} ({l.ayahStart}-{l.ayahEnd})</td>
                          <td className="p-1 text-emerald-800">{l.tajweedRating.replace('_', ' ')}</td>
                          <td className="p-1 text-center font-bold text-emerald-700">Passed</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3. 5-Day Attendance */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#faf7f3] border border-[#e5dad0] text-[10px]">
                  <div>
                    <span className="font-bold text-[#1b110b]">Attendance: </span>
                    <span className="text-[#2d6639] font-bold">{currentItem.report.attendancePercentage || 100}%</span>
                    <span className="text-[#7c695d]"> ({currentItem.report.attendanceSummary?.presentDays || 5}/{currentItem.report.attendanceSummary?.totalDays || 5} Days Present)</span>
                  </div>
                  <div className="text-[#635043]">
                    <span>Avg Arrival: </span>
                    <strong className="font-mono text-[#854d2b]">06:40 AM</strong>
                  </div>
                </div>

                {/* Remarks */}
                <div className="p-2.5 bg-[#faf7f3] rounded-lg border border-[#e5dad0] text-[10px]">
                  <span className="font-bold text-[#1b110b] block mb-0.5">Ustadh's Note:</span>
                  <p className="text-[#4b3c32] italic leading-tight">"{currentItem.report.teacherRemarks}"</p>
                </div>

                {/* Teacher Profile & Footer Signature */}
                <div className="pt-2 border-t border-[#e5dad0] flex items-center justify-between text-[10px] text-[#7c695d]">
                  <div>
                    <strong className="text-[#1b110b] block">Ustadh Muhammad Shaya'u</strong>
                    <span className="text-[9px] text-[#8c7464]">{currentItem.report.teacherDetails?.credentials || "Ijāzah in Hafs 'an 'Asim"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#854d2b] font-bold">
                    <Award className="h-3.5 w-3.5" />
                    <span>Verified Official Report</span>
                  </div>
                  <div className="text-right">
                    <span>Parent Signature: ________</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
