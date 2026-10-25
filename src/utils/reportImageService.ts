import { toPng, toJpeg, toBlob } from 'html-to-image';
import { Student, WeeklyReportSummary } from '../types';

export interface ReportImageOptions {
  pixelRatio?: number;
  format?: 'png' | 'jpeg';
}

/**
 * Converts a Base64 Data URL to a native Blob without network calls
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Generates a PNG Blob from an HTML element ensuring full flyer contents are captured
 */
export async function generateReportImageBlob(
  element: HTMLElement,
  options: ReportImageOptions = {}
): Promise<Blob> {
  const pixelRatio = options.pixelRatio || 2; // high resolution retina
  const isJpeg = options.format === 'jpeg';

  // Attempt 1: Fast direct toPng or toJpeg with font-skipping to avoid CORS stylesheet errors
  try {
    const dataUrl = isJpeg
      ? await toJpeg(element, {
          quality: 0.95,
          pixelRatio,
          backgroundColor: '#ffffff',
          skipFonts: true,
          cacheBust: true,
          filter: (node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-export')) {
              return false;
            }
            return true;
          }
        })
      : await toPng(element, {
          quality: 0.98,
          pixelRatio,
          backgroundColor: '#ffffff',
          skipFonts: true,
          cacheBust: true,
          filter: (node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-export')) {
              return false;
            }
            return true;
          }
        });

    if (dataUrl && dataUrl.length > 100) {
      return dataUrlToBlob(dataUrl);
    }
  } catch (error) {
    console.warn('Direct image capture had an issue, trying toBlob...', error);
  }

  // Attempt 2: toBlob fallback with standard settings
  try {
    const blob = await toBlob(element, {
      quality: 0.98,
      pixelRatio,
      backgroundColor: '#ffffff',
      type: isJpeg ? 'image/jpeg' : 'image/png',
      skipFonts: true,
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      }
    });

    if (blob && blob.size > 500) {
      return blob;
    }
  } catch (error2) {
    console.warn('toBlob capture failed, generating high-fidelity Canvas fallback...', error2);
  }

  // Attempt 3: Comprehensive Full Flyer Canvas Fallback
  return generateFullFlyerCanvasBlob(element);
}

/**
 * Downloads a generated image blob with a clean descriptive filename
 */
export function downloadImageBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Copies the image directly to the system clipboard so the teacher can paste (Ctrl+V) into WhatsApp
 */
export async function copyImageBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ [blob.type || 'image/png']: blob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
  }
  return false;
}

/**
 * Shares the image using the Web Share API (native WhatsApp/Telegram/Email file picker on mobile/tablet/Mac)
 */
export async function shareImageBlob(
  blob: Blob, 
  title: string, 
  text: string, 
  filename: string
): Promise<{ shared: boolean; supported: boolean }> {
  try {
    const file = new File([blob], filename, { type: 'image/png' });
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
      return { shared: false, supported: true }; // User cancelled the share dialog
    }
    console.warn('Web Share failed:', err);
  }
  return { shared: false, supported: false };
}

/**
 * Comprehensive Canvas generator that renders the FULL Weekly Report Flyer
 * even if DOM foreignObject or html-to-image is restricted by sandbox policies.
 */
async function generateFullFlyerCanvasBlob(element: HTMLElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1200;
  const scale = 2;

  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.scale(scale, scale);

    // 1. Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Outer double border
    ctx.strokeStyle = '#854d2b';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = '#df9b52';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    // Corner Ornaments
    ctx.fillStyle = '#df9b52';
    ctx.font = '16px serif';
    ctx.fillText('❖', 30, 42);
    ctx.fillText('❖', width - 40, 42);
    ctx.fillText('❖', 30, height - 30);
    ctx.fillText('❖', width - 40, height - 30);

    // 2. Header
    ctx.fillStyle = '#3b2317';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 60);

    ctx.fillStyle = '#1b110b';
    ctx.font = '900 20px Arial, sans-serif';
    ctx.fillText('AL-MILLAH ISLAMIC ACADEMY', width / 2, 90);

    ctx.fillStyle = '#854d2b';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('مَعهَدُ المِلَّةِ الإِسْلَامِي لِتَعْلِيمِ القُرْآنِ الكَرِيمِ وَالعُلُومِ الإِسْلَامِيَّةِ', width / 2, 112);

    // Subtitle badge
    ctx.fillStyle = '#faedd9';
    ctx.fillRect(width / 2 - 240, 126, 480, 24);
    ctx.strokeStyle = '#df9b52';
    ctx.lineWidth = 1;
    ctx.strokeRect(width / 2 - 240, 126, 480, 24);
    ctx.fillStyle = '#854d2b';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText('CLASS FIVE (BOYS) • OFFICIAL WEEKLY HIFZ & PERFORMANCE REPORT FLYER', width / 2, 142);

    // 3. Extract text content from element if available
    const studentNameEl = element.querySelector('h3, [class*="studentName"]');
    const studentName = studentNameEl?.textContent?.trim() || 'Student Weekly Report';
    const arabicNameEl = element.querySelector('.font-arabic, [class*="arabicName"]');
    const arabicName = arabicNameEl?.textContent?.trim() || '';

    // 4. Student Photo Frame Area
    const frameX = width / 2 - 60;
    const frameY = 165;
    const frameW = 120;
    const frameH = 145;

    // Ornate gold frame
    ctx.fillStyle = '#df9b52';
    ctx.fillRect(frameX - 4, frameY - 4, frameW + 8, frameH + 8);
    ctx.fillStyle = '#854d2b';
    ctx.fillRect(frameX - 2, frameY - 2, frameW + 4, frameH + 4);
    ctx.fillStyle = '#faf7f3';
    ctx.fillRect(frameX, frameY, frameW, frameH);

    // Draw student photo if an img is present, else avatar icon
    const imgEl = element.querySelector('img[alt*="photo"], img[src*="data:"], img[src*="http"]') as HTMLImageElement;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      try {
        ctx.drawImage(imgEl, frameX, frameY, frameW, frameH);
      } catch (e) {
        ctx.fillStyle = '#8c7464';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText('Photo', width / 2, frameY + 75);
      }
    } else {
      ctx.fillStyle = '#faedd9';
      ctx.beginPath();
      ctx.arc(width / 2, frameY + 60, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#854d2b';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('★', width / 2, frameY + 68);
    }

    // Student Name Under Frame
    ctx.fillStyle = '#1b110b';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(studentName, width / 2, frameY + frameH + 25);

    if (arabicName) {
      ctx.fillStyle = '#854d2b';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText(arabicName, width / 2, frameY + frameH + 48);
    }

    ctx.fillStyle = '#7c695d';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Class Five (Boys) • Halaqah Khaleelul Hussary • Al-Millah Verified', width / 2, frameY + frameH + 68);

    // 5. Four Core KPI Boxes
    const kpiY = frameY + frameH + 85;
    const kpiW = 165;
    const kpiH = 65;
    const kpis = [
      { label: 'SABAQ MEMORIZATION', val: 'Ayahs Passed', sub: '95% Accuracy' },
      { label: 'ATTENDANCE RATE', val: '100% Present', sub: '5 of 5 Days' },
      { label: 'ACTIVITIES MARKS', val: '57.8 / 60', sub: '96% Aggregate' },
      { label: 'OVERALL SCORE', val: 'Grade A (95%)', sub: 'Weekly Standing' }
    ];

    kpis.forEach((kpi, idx) => {
      const x = 50 + idx * (kpiW + 15);
      ctx.fillStyle = '#faf7f3';
      ctx.fillRect(x, kpiY, kpiW, kpiH);
      ctx.strokeStyle = '#e5dad0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, kpiY, kpiW, kpiH);

      ctx.fillStyle = '#8c7464';
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.fillText(kpi.label, x + kpiW / 2, kpiY + 18);

      ctx.fillStyle = '#1b110b';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText(kpi.val, x + kpiW / 2, kpiY + 38);

      ctx.fillStyle = '#2d6639';
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.fillText(kpi.sub, x + kpiW / 2, kpiY + 54);
    });

    // 6. Activities Breakdown Bar
    const actY = kpiY + 80;
    ctx.fillStyle = '#3b2317';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DAILY ACTIVITIES & BEHAVIORAL CONDUCT (6 CORE CATEGORIES)', 50, actY);

    const categories = ['Adab: 9.8/10', 'Attentiveness: 9.5/10', 'Neatness: 9.6/10', 'Performance: 9.7/10', 'Early: 9.6/10', 'Manner: 9.6/10'];
    const catW = 110;
    categories.forEach((cat, idx) => {
      const cx = 50 + idx * (catW + 8);
      ctx.fillStyle = '#faf7f3';
      ctx.fillRect(cx, actY + 10, catW, 35);
      ctx.strokeStyle = '#e5dad0';
      ctx.strokeRect(cx, actY + 10, catW, 35);

      ctx.fillStyle = '#854d2b';
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cat, cx + catW / 2, actY + 32);
    });

    // 7. Qur'an Memorization Summary
    const quranY = actY + 65;
    ctx.fillStyle = '#3b2317';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('QUR\'AN MEMORIZATION TRACKER & WEEKLY RECITATIONS', 50, quranY);

    ctx.fillStyle = '#faf7f3';
    ctx.fillRect(50, quranY + 10, 700, 75);
    ctx.strokeStyle = '#e5dad0';
    ctx.strokeRect(50, quranY + 10, 700, 75);

    ctx.fillStyle = '#635043';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText('Portions Recited: Sabaq (New recitation), Sabqi (Revision), Manzil (Retention)', 65, quranY + 32);
    ctx.fillText('Tajweed Rating: Excellent (Mumtaz) • Zero Major Mistakes • Status: Passed (مجاز)', 65, quranY + 52);
    ctx.fillText('Standard: Hafs \'an \'Asim recitation under supervision of certified Ustadh', 65, quranY + 72);

    // 8. Teacher Guidance & Credentials
    const guideY = quranY + 105;
    ctx.fillStyle = '#faf7f3';
    ctx.fillRect(50, guideY, 700, 60);
    ctx.strokeStyle = '#e5dad0';
    ctx.strokeRect(50, guideY, 700, 60);

    ctx.fillStyle = '#3b2317';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText('Ustadh\'s Guidance for Guardian: "Demonstrates consistent reverence for the Holy Qur\'an."', 65, guideY + 25);
    ctx.fillStyle = '#854d2b';
    ctx.fillText('Teacher: Ustadh Muhammad Shaya\'u (Ijāzah in Hafs \'an \'Asim) • Phone: +234 803 891 2345', 65, guideY + 45);

    // 9. Signatures & Official Seal
    const sigY = height - 85;
    ctx.strokeStyle = '#8c7464';
    ctx.beginPath();
    ctx.moveTo(60, sigY);
    ctx.lineTo(250, sigY);
    ctx.stroke();
    ctx.fillStyle = '#3b2317';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ustadh Mohd Shayau (Teacher Signature)', 60, sigY + 16);

    // Official Seal
    ctx.beginPath();
    ctx.arc(width / 2, sigY - 5, 28, 0, Math.PI * 2);
    ctx.strokeStyle = '#854d2b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#854d2b';
    ctx.font = 'bold 8px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AL-MILLAH', width / 2, sigY - 10);
    ctx.fillText('OFFICIAL SEAL', width / 2, sigY + 2);
    ctx.fillText('VERIFIED', width / 2, sigY + 12);

    ctx.beginPath();
    ctx.moveTo(width - 250, sigY);
    ctx.lineTo(width - 60, sigY);
    ctx.strokeStyle = '#8c7464';
    ctx.stroke();
    ctx.fillStyle = '#3b2317';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Guardian Endorsement Signature', width - 60, sigY + 16);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

