import { jsPDF } from 'jspdf';
import { generateReportImageBlob } from './reportImageService';

export interface ReportPdfOptions {
  orientation?: 'portrait' | 'landscape';
  format?: '9:16' | 'a4';
  title?: string;
  author?: string;
  studentName?: string;
  studentRoll?: number;
  weekNumber?: number;
}

/**
 * Converts a Blob to a Base64 data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Loads an image to read its natural width and height
 */
function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 1422
      });
    };
    img.onerror = () => reject(new Error('Failed to load image for dimension calculation'));
    img.src = dataUrl;
  });
}

/**
 * Generates an official, high-resolution PDF Blob from a report DOM element
 */
export async function generateReportPdfBlob(
  element: HTMLElement,
  options: ReportPdfOptions = {}
): Promise<Blob> {
  // Capture high-fidelity image with 2.5x pixel ratio for crystal clear text in PDF
  const imgBlob = await generateReportImageBlob(element, { pixelRatio: 2.5 });
  const dataUrl = await blobToDataUrl(imgBlob);
  const dims = await getImageDimensions(dataUrl);

  const isA4 = options.format === 'a4';
  let pdf: jsPDF;

  if (isA4) {
    // Standard A4 Portrait (210mm x 297mm)
    pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8; // 8mm margin
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const imgAspect = dims.width / dims.height;

    let renderWidth = maxWidth;
    let renderHeight = renderWidth / imgAspect;

    if (renderHeight > maxHeight) {
      renderHeight = maxHeight;
      renderWidth = renderHeight * imgAspect;
    }

    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
  } else {
    // 9:16 Vertical Document - Perfectly formatted for smartphone viewing on WhatsApp
    // Standard mobile document width in pt: 540 pt
    const targetWidth = 540;
    const targetHeight = Math.round((dims.height / dims.width) * targetWidth);

    pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [targetWidth, targetHeight],
      compress: true
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, targetWidth, targetHeight, undefined, 'FAST');
  }

  // Official Document Metadata
  const studentInfo = options.studentName ? ` - ${options.studentName}` : '';
  const weekInfo = options.weekNumber ? ` - Week ${options.weekNumber}` : '';
  pdf.setProperties({
    title: options.title || `Al-Millah Weekly Performance Report${studentInfo}${weekInfo}`,
    subject: `Al-Millah Islamic Academy Weekly Student Performance Report`,
    author: options.author || 'Al-Millah Islamic Academy',
    keywords: 'Quran, Hifz, Performance Report, Class 5, Al-Millah',
    creator: 'Al-Millah Islamic Academy Management Portal'
  });

  return pdf.output('blob');
}

/**
 * Downloads a generated PDF blob with appropriate .pdf extension
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 6000);
}

/**
 * Shares a PDF blob using Web Share API (native WhatsApp file sharing on mobile/tablet)
 */
export async function sharePdfBlob(
  blob: Blob,
  title: string,
  text: string,
  filename: string
): Promise<{ shared: boolean; supported: boolean }> {
  try {
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    const file = new File([blob], finalFilename, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text
      });
      return { shared: true, supported: true };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { shared: false, supported: true }; // User cancelled the picker
    }
    console.warn('Web Share failed for PDF:', err);
  }
  return { shared: false, supported: false };
}

/**
 * Complete WhatsApp PDF workflow:
 * 1. Generates PDF blob.
 * 2. Attempts native Web Share with the PDF attached (on iOS/Android opens WhatsApp with PDF).
 * 3. On desktop or unsupported platforms: automatically downloads PDF & opens WhatsApp chat with parent.
 */
export async function shareReportToWhatsAppAsPdf(params: {
  element: HTMLElement;
  studentName: string;
  studentArabicName?: string;
  studentRoll: number;
  parentName?: string;
  parentPhone?: string;
  weekNumber: number;
  weekLabel: string;
  format?: '9:16' | 'a4';
  summaryMetrics?: {
    attendancePct: number;
    overallCompositeScore: number;
    totalAyahsMemorized: number;
  };
  teacherComment?: string;
  language?: 'ar' | 'en';
}): Promise<{
  success: boolean;
  method: 'native-share' | 'download-and-whatsapp';
  filename: string;
}> {
  const {
    element,
    studentName,
    studentArabicName,
    studentRoll,
    parentName,
    parentPhone,
    weekNumber,
    weekLabel,
    format = '9:16',
    summaryMetrics,
    teacherComment,
    language = 'en'
  } = params;

  const pdfBlob = await generateReportPdfBlob(element, {
    studentName,
    studentRoll,
    weekNumber,
    format
  });

  const safeName = studentName.replace(/\s+/g, '_');
  const filename = `AlMillah_Report_Week${weekNumber}_Std${studentRoll}_${safeName}.pdf`;

  const guardianTitle = parentName || (language === 'ar' ? 'ولي الأمر المحترم' : 'Respected Guardian');
  const studentDisplayName = language === 'ar' && studentArabicName ? `${studentArabicName} (${studentName})` : studentName;

  const messageText = language === 'ar'
    ? `السلام عليكم ورحمة الله وبركاته\n` +
      `ولي أمر الطالب الكريم: *${guardianTitle}*\n\n` +
      `نرفق لكم طيه ملف التقرير الأسبوعي بصيغة (PDF) لنجلكم: *${studentDisplayName}* (رقم القيد #${studentRoll}) في مَعهَدِ المِلَّةِ الإِسْلَامِي — الصف الخامس:\n\n` +
      `📅 *الأسبوع الدراسي:* ${weekLabel}\n` +
      (summaryMetrics ? `📖 *إجمالي الآيات المحفوظة:* ${summaryMetrics.totalAyahsMemorized} آية\n` : '') +
      (summaryMetrics ? `🕌 *نسبة الحضور:* ${summaryMetrics.attendancePct}%\n` : '') +
      (summaryMetrics ? `⭐ *النتيجة العامة المركبة:* ${summaryMetrics.overallCompositeScore}%\n\n` : '') +
      (teacherComment ? `💬 *ملاحظات المعلم:* "${teacherComment}"\n\n` : '') +
      `📎 *الملف المرفق:* ${filename}\n\n` +
      `_معهد الملة الإسلامي • إدارة شؤون القرآن الكريم والتربية الأخلاقية_`
    : `*AL-MILLAH ISLAMIC ACADEMY*\n` +
      `*Weekly Student Performance Report (Official PDF Document)*\n\n` +
      `Assalamu Alaikum wa Rahmatullah,\n` +
      `Dear Guardian: *${guardianTitle}*\n\n` +
      `Attached is the official Weekly Performance Report (PDF) for student: *${studentName}* (Roll #${studentRoll}) • Class 5.\n\n` +
      `📅 *Academic Week:* ${weekLabel}\n` +
      (summaryMetrics ? `📖 *Qur'an Memorized:* ${summaryMetrics.totalAyahsMemorized} Ayahs\n` : '') +
      (summaryMetrics ? `📊 *Attendance Rate:* ${summaryMetrics.attendancePct}%\n` : '') +
      (summaryMetrics ? `⭐ *Overall Standing:* ${summaryMetrics.overallCompositeScore}%\n\n` : '') +
      (teacherComment ? `💬 *Teacher's Note:* "${teacherComment}"\n\n` : '') +
      `📎 *Document Attached:* ${filename}\n\n` +
      `_Al-Millah Islamic Academy • Hifz & Moral Excellence_`;

  // 1. Try native Web Share
  const shareResult = await sharePdfBlob(
    pdfBlob,
    `Al-Millah Weekly Report (PDF) - ${studentName}`,
    messageText,
    filename
  );

  if (shareResult.shared) {
    return {
      success: true,
      method: 'native-share',
      filename
    };
  }

  // 2. Fallback for Desktop/unsupported Web Share:
  // Automatically download the PDF to user's device so it's ready to send
  downloadPdfBlob(pdfBlob, filename);

  // Open WhatsApp chat directly with the parent
  const phone = parentPhone ? parentPhone.replace(/[^0-9]/g, '') : '';
  const encodedMsg = encodeURIComponent(messageText);
  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, '_blank', 'noopener,noreferrer');

  return {
    success: true,
    method: 'download-and-whatsapp',
    filename
  };
}
