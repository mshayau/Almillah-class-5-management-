import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Student, WeeklyReportSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useClass } from '../context/ClassContext';
import { ACADEMIC_WEEKS, getCurrentAcademicWeek } from '../data/academicCalendar';
import { 
  generateReportImageBlob, 
  downloadImageBlob, 
  copyImageBlobToClipboard, 
  shareImageBlob 
} from '../utils/reportImageService';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  MessageCircle, 
  Printer, 
  Sparkles, 
  Crown, 
  Award, 
  CheckCircle2, 
  Star,
  BookOpen,
  CheckSquare,
  Users,
  HeartHandshake,
  ShieldCheck,
  Compass,
  Camera,
  RefreshCw,
  SlidersHorizontal,
  FileImage,
  Share2,
  Calendar,
  Phone,
  UserCheck
} from 'lucide-react';

interface WeekOption {
  id: string;
  weekNumber: number;
  labelEn: string;
  labelAr: string;
  startDate: string;
  endDate: string;
}

const WEEKS_LIST: WeekOption[] = ACADEMIC_WEEKS.map(w => ({
  id: w.id,
  weekNumber: w.weekNumber,
  labelEn: `${w.labelEn}${w.status === 'completed' ? ' [Completed]' : w.status === 'current' ? '' : ' [Upcoming]'}`,
  labelAr: `${w.labelAr}${w.status === 'completed' ? ' [مكتمل]' : w.status === 'current' ? '' : ' [قادم]'}`,
  startDate: w.startDate,
  endDate: w.endDate
}));

export interface BestStudentAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  report?: WeeklyReportSummary;
  week?: {
    id?: string;
    startDate: string;
    endDate: string;
    labelEn: string;
    labelAr: string;
    weekNumber: number;
  };
}

export const BestStudentAwardModal: React.FC<BestStudentAwardModalProps> = ({
  isOpen,
  onClose,
  student: initialStudent,
  report: initialReport,
  week: initialWeek
}) => {
  const { language, isRTL } = useLanguage();
  const { students, evaluations, generateWeeklyReport, calculateWeeklyStandings } = useClass();
  
  const certRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Week
  const [selectedWeek, setSelectedWeek] = useState<WeekOption>(() => {
    if (initialWeek) {
      const match = WEEKS_LIST.find(w => w.weekNumber === initialWeek.weekNumber);
      if (match) return match;
      return {
        id: initialWeek.id || `week-${initialWeek.weekNumber}`,
        weekNumber: initialWeek.weekNumber,
        labelEn: initialWeek.labelEn,
        labelAr: initialWeek.labelAr,
        startDate: initialWeek.startDate,
        endDate: initialWeek.endDate
      };
    }
    return WEEKS_LIST.find(w => w.weekNumber === getCurrentAcademicWeek().weekNumber) || WEEKS_LIST[0];
  });

  // Calculate top standings for the chosen week
  const standings = useMemo(() => {
    return calculateWeeklyStandings(selectedWeek.startDate, selectedWeek.endDate);
  }, [calculateWeeklyStandings, selectedWeek.startDate, selectedWeek.endDate]);

  // Selected Student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialStudent) return initialStudent.id;
    if (standings.bestStudent) return standings.bestStudent.student.id;
    if (students.length > 0) return students[0].id;
    return '';
  });

  // Keep student in sync if initialStudent changes
  useEffect(() => {
    if (initialStudent && initialStudent.id !== selectedStudentId) {
      setSelectedStudentId(initialStudent.id);
    }
  }, [initialStudent]);

  // Current Student Object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || initialStudent || students[0];
  }, [students, selectedStudentId, initialStudent]);

  // Auto-calculated weekly report for selected student and week
  const currentReport = useMemo(() => {
    if (!currentStudent) return initialReport || null;
    return generateWeeklyReport(currentStudent.id, selectedWeek.startDate, selectedWeek.endDate) || initialReport || null;
  }, [currentStudent, selectedWeek, generateWeeklyReport, initialReport]);

  // Custom photo upload state
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  // Reset custom photo when selected student changes
  useEffect(() => {
    setCustomPhotoUrl(null);
  }, [selectedStudentId]);

  // Active photo URL to render
  const activePhoto = customPhotoUrl || currentStudent?.avatarUrl || '';

  // Extract base metrics from evaluations / reports
  const computedMetrics = useMemo(() => {
    if (!currentStudent) {
      return {
        quranPct: 98,
        homeworkPct: 100,
        classParticipationPct: 96,
        neatnessPct: 98,
        respectPct: 100,
        selfControlPct: 95,
        totalPercentage: 98
      };
    }

    // Check evaluations in this week's date range
    const weekEvals = evaluations.filter(
      e => e.studentId === currentStudent.id && e.date >= selectedWeek.startDate && e.date <= selectedWeek.endDate
    );

    let quranPct = currentReport?.performanceScore ?? currentReport?.memorizationPercentage ?? 98;
    let homeworkPct = 96;
    let classParticipationPct = 95;
    let neatnessPct = 96;
    let respectPct = 98;
    let selfControlPct = 95;

    if (weekEvals.length > 0) {
      const qVals = weekEvals.map(e => e.quranMemorizationPct).filter((v): v is number => typeof v === 'number');
      if (qVals.length > 0) quranPct = Math.round(qVals.reduce((a, b) => a + b, 0) / qVals.length);

      const hVals = weekEvals.map(e => e.homeworkPct).filter((v): v is number => typeof v === 'number');
      if (hVals.length > 0) homeworkPct = Math.round(hVals.reduce((a, b) => a + b, 0) / hVals.length);

      const pVals = weekEvals.map(e => e.classParticipationPct).filter((v): v is number => typeof v === 'number');
      if (pVals.length > 0) classParticipationPct = Math.round(pVals.reduce((a, b) => a + b, 0) / pVals.length);

      const nVals = weekEvals.map(e => e.neatnessPct).filter((v): v is number => typeof v === 'number');
      if (nVals.length > 0) neatnessPct = Math.round(nVals.reduce((a, b) => a + b, 0) / nVals.length);

      const rVals = weekEvals.map(e => e.respectPct).filter((v): v is number => typeof v === 'number');
      if (rVals.length > 0) respectPct = Math.round(rVals.reduce((a, b) => a + b, 0) / rVals.length);

      const sVals = weekEvals.map(e => e.selfControlPct).filter((v): v is number => typeof v === 'number');
      if (sVals.length > 0) selfControlPct = Math.round(sVals.reduce((a, b) => a + b, 0) / sVals.length);
    } else if (currentReport) {
      quranPct = currentReport.performanceScore ?? currentReport.memorizationPercentage ?? 96;
      homeworkPct = currentReport.activitiesScorePct ?? 96;
      classParticipationPct = currentReport.activityPercentage ?? 95;
      neatnessPct = 96;
      respectPct = Math.min(100, Math.round((currentReport.averageAdabScore / 5) * 100));
      selfControlPct = 94;
    }

    const totalPercentage = currentReport?.compositeScore ?? currentReport?.overallPercentage ?? Math.round(
      (quranPct * 0.35) + (homeworkPct * 0.15) + (classParticipationPct * 0.15) + (neatnessPct * 0.10) + (respectPct * 0.15) + (selfControlPct * 0.10)
    );

    return {
      quranPct,
      homeworkPct,
      classParticipationPct,
      neatnessPct,
      respectPct,
      selfControlPct,
      totalPercentage
    };
  }, [currentStudent, selectedWeek, evaluations, currentReport]);

  // Editable scores for the 6 qualities
  const [quranScore, setQuranScore] = useState<number>(98);
  const [homeworkScore, setHomeworkScore] = useState<number>(100);
  const [participationScore, setParticipationScore] = useState<number>(96);
  const [neatnessScore, setNeatnessScore] = useState<number>(98);
  const [respectScore, setRespectScore] = useState<number>(100);
  const [selfControlScore, setSelfControlScore] = useState<number>(95);

  // Sync state when student or week changes
  useEffect(() => {
    setQuranScore(computedMetrics.quranPct);
    setHomeworkScore(computedMetrics.homeworkPct);
    setParticipationScore(computedMetrics.classParticipationPct);
    setNeatnessScore(computedMetrics.neatnessPct);
    setRespectScore(computedMetrics.respectPct);
    setSelfControlScore(computedMetrics.selfControlPct);
  }, [computedMetrics]);

  // Overall percentage (recomputed automatically from the 6 qualities)
  const totalWeeklyPercentage = useMemo(() => {
    const weighted = Math.round(
      (quranScore * 0.35) + 
      (homeworkScore * 0.15) + 
      (participationScore * 0.15) + 
      (neatnessScore * 0.10) + 
      (respectScore * 0.15) + 
      (selfControlScore * 0.10)
    );
    return Math.max(60, Math.min(100, weighted));
  }, [quranScore, homeworkScore, participationScore, neatnessScore, respectScore, selfControlScore]);

  // Auto-generated Reason for Award
  const defaultReasonForAward = useMemo(() => {
    return language === 'ar'
      ? 'أداء متميز في حفظ القرآن الكريم، والمشاركة الصفية الفعالة، وحسن الخلق والآداب الإسلامية الرفيعة.'
      : 'Excellent performance in Qur’an memorization, class participation and good behavior.';
  }, [language]);

  const [customReason, setCustomReason] = useState<string>('');

  useEffect(() => {
    setCustomReason('');
  }, [selectedStudentId, selectedWeek]);

  const activeReasonForAward = customReason.trim().length > 0 ? customReason : defaultReasonForAward;

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [flyerSize, setFlyerSize] = useState<'mini' | 'compact' | 'standard'>('compact');

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Star calculation helper
  const getStarRating = (pct: number) => {
    const full = pct >= 95 ? 5 : pct >= 85 ? 4 : pct >= 75 ? 3 : pct >= 65 ? 2 : 1;
    return full;
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى رفع ملف صورة صالح.' : 'Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
          setCustomPhotoUrl(dataUrl);
          showFeedback(language === 'ar' ? 'تم تحديث صورة الطالب بنجاح!' : 'Student photo updated successfully!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    setCustomPhotoUrl(null);
    showFeedback(language === 'ar' ? 'تم استرجاع الصورة الافتراضية.' : 'Default avatar restored.');
  };

  const safeFilename = currentStudent 
    ? `Al-Millah-Best-Student-Week${selectedWeek.weekNumber}-${currentStudent.fullName.replace(/[^a-zA-Z0-9]/g, '_')}`
    : `Al-Millah-Best-Student-Week${selectedWeek.weekNumber}`;

  // Download Handler (PNG)
  const handleDownloadPNG = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await generateReportImageBlob(certRef.current, { pixelRatio: 2.2, format: 'png' });
      downloadImageBlob(blob, `${safeFilename}.png`);
      showFeedback(language === 'ar' ? 'تم تنزيل بوستر التميز (PNG) بدقة فائقة!' : 'High-resolution award poster (PNG) downloaded!');
    } catch (err) {
      console.error(err);
      showFeedback(language === 'ar' ? 'حدث خطأ أثناء تنزيل الصورة.' : 'Failed to download image.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Handler (JPG)
  const handleDownloadJPG = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await generateReportImageBlob(certRef.current, { pixelRatio: 2.2, format: 'jpeg' });
      downloadImageBlob(blob, `${safeFilename}.jpg`);
      showFeedback(language === 'ar' ? 'تم تنزيل بوستر التميز (JPG) بنجاح!' : 'Award poster (JPG) downloaded successfully!');
    } catch (err) {
      console.error(err);
      showFeedback(language === 'ar' ? 'حدث خطأ أثناء تنزيل الصورة.' : 'Failed to download image.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await generateReportImageBlob(certRef.current, { pixelRatio: 2, format: 'png' });
      const success = await copyImageBlobToClipboard(blob);
      if (success) {
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 3000);
        showFeedback(language === 'ar' ? 'تم نسخ صورة الشهادة للحافظة (Ctrl+V)!' : 'Poster image copied to clipboard! Paste directly with Ctrl+V');
      } else {
        downloadImageBlob(blob, `${safeFilename}.png`);
        showFeedback(language === 'ar' ? 'تم تنزيل الصورة تلقائياً.' : 'Image downloaded automatically.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // WhatsApp Direct Share
  const handleSendWhatsApp = async () => {
    if (!certRef.current || !currentStudent) return;
    setIsGenerating(true);
    try {
      const blob = await generateReportImageBlob(certRef.current, { pixelRatio: 2, format: 'png' });
      const phone = currentStudent.parentPhone.replace(/[^0-9]/g, '');
      const weekLabel = language === 'ar' ? selectedWeek.labelAr : selectedWeek.labelEn;

      const messageText = language === 'ar'
        ? `🌟 *تَهْنِئَةٌ وَتَكْرِيمٌ خَاصٌّ مِنْ مَعهَدِ المِلَّةِ الإِسْلَامِي* 👑\n\nوَلِيَّ أَمْرِ الطَّالِبِ المُبَارَكِ: *${currentStudent.parentName}*\n\nيَسُرُّ إِدَارَةَ المَعْهَدِ أَنْ تُبَارِكَ لَكُمْ حُصُولَ نَجْلِكُمُ النَّجِيبِ: *${currentStudent.arabicName || currentStudent.fullName}* (رَقْمُ القَيْدِ: #${currentStudent.rollNumber}) عَلَى:\n\n🏆 *طَالِبِ ونَجْمِ الأُسْبُوعِ الأَوَّلِ — وسَامُ التَّمَيُّزِ والإِتْقَانِ* 🏆\n📅 *الفَتْرَةُ:* ${weekLabel}\n⭐ *المَجْمُوعُ الأُسْبُوعِيُّ الكُلِّيُّ:* ${totalWeeklyPercentage}%\n\n📜 *سَبَبُ التَّكْرِيمِ:* "${activeReasonForAward}"\n\n✨ *مَعَايِيرُ التَّأَلُّقِ:* \n• حِفْظُ القُرْآنِ الكَرِيمِ: ${quranScore}%\n• إِنْجَازُ الوَاجِبَاتِ: ${homeworkScore}%\n• المُشَارَكَةُ الصَّفِّيَّةُ: ${participationScore}%\n• النَّظَافَةُ والتَّرْتِيبُ: ${neatnessScore}%\n• الآدَابُ وَالاحْتِرَامُ: ${respectScore}%\n• ضَبْطُ النَّفْسِ وَالانْضِبَاطُ: ${selfControlScore}%\n\n💬 *"إِنَّ جُهْدَكَ وإِخْلَاصَكَ وَحُسْنَ خُلُقِكَ يَجْعَلُكَ قُدْوَةً لِزُمَلائِكَ. وَاصِلِ التَّأَلُّقَ!"*\n\nنُرْفِقُ لَكُمُ الشَّهَادَةَ الرَّسْمِيَّةَ المُعْتَمَدَةَ. بَارَكَ اللَّهُ فِيكُمْ وَفِي نَجْلِكُمْ.`
        : `🌟 *SPECIAL CONGRATULATIONS FROM AL-MILLAH ACADEMY* 👑\n\nRespected Guardian: *${currentStudent.parentName}*\n\nWe are delighted to announce that your child: *${currentStudent.fullName}* (Roll #${currentStudent.rollNumber}) has been awarded:\n\n🏆 *BEST STUDENT OF THE WEEK — EXCELLENCE IN ACTION* 🏆\n📅 *Period:* ${weekLabel}\n⭐ *Total Weekly Score:* ${totalWeeklyPercentage}%\n\n📜 *Reason for Award:* "${activeReasonForAward}"\n\n✨ *Qualities Shine Breakdown:*\n• Qur’an Memorization: ${quranScore}%\n• Homework Completion: ${homeworkScore}%\n• Class Participation: ${participationScore}%\n• Neatness: ${neatnessScore}%\n• Respect: ${respectScore}%\n• Self Control: ${selfControlScore}%\n\n💬 *"Your hard work, dedication and good character make you a role model for your classmates. Keep shining!"*\n\nAttached is the official high-resolution Award Flyer. Jazakumullahu Khairan!`;

      const shareResult = await shareImageBlob(blob, `Best Student Award - ${currentStudent.fullName}`, messageText, `${safeFilename}.png`);
      if (!shareResult.shared) {
        await copyImageBlobToClipboard(blob);
        downloadImageBlob(blob, `${safeFilename}.png`);
        const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}` : `https://wa.me/?text=${encodeURIComponent(messageText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      showFeedback(language === 'ar' ? 'تم تجهيز بوستر التميز ورسالة الواتساب للوالد!' : 'Award flyer & WhatsApp message prepared for parent!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !currentStudent) return null;

  return (
    <div 
      id="best-student-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
    >
      <div className="bg-[#1b110b] text-[#f7ede2] border border-[#5c3722] rounded-2xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* TOP CONTROLS & ACTIONS BAR */}
        <header className="bg-[#24150e] border-b border-[#4d2d1b] p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-[#df9b52] to-[#c88642] text-slate-950 font-black shadow-sm flex items-center justify-center">
              <Crown className="h-5 w-5 fill-slate-950" />
            </span>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'إنشاء بوستر وشهادة طالب الأسبوع' : 'Best Student of the Week Digital Flyer'}</span>
                <span className="text-[10px] uppercase font-black bg-[#df9b52]/20 text-[#f5c38b] border border-[#df9b52]/50 px-2.5 py-0.5 rounded-full">
                  ★ {totalWeeklyPercentage}% Distinction
                </span>
              </h2>
              <p className="text-[11px] text-[#cfb6a3] hidden sm:block">
                {language === 'ar' ? 'معتمد من أكاديمية المِلَّة لمشاركته عبر الواتساب مع ولي الأمر' : 'Al-Millah Academy official award poster for parents & WhatsApp sharing'}
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Flyer Height / Size Selector Toggle */}
            <div className="inline-flex items-center rounded-xl bg-[#1f120a] p-0.5 border border-[#522f1b]">
              <button
                type="button"
                id="flyer-size-mini-btn"
                onClick={() => setFlyerSize('mini')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  flyerSize === 'mini'
                    ? 'bg-[#df9b52] text-[#1b110b] shadow-xs'
                    : 'text-[#cfb6a3] hover:text-white'
                }`}
                title={language === 'ar' ? 'أصغر ارتفاع ممكن (يلائم الشاشة بدون تمرير إطلاقاً)' : 'Mini (Shortest height, fits without scrolling)'}
              >
                {language === 'ar' ? 'مُصغّر جداً' : 'Mini (Short)'}
              </button>
              <button
                type="button"
                id="flyer-size-compact-btn"
                onClick={() => setFlyerSize('compact')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  flyerSize === 'compact'
                    ? 'bg-[#df9b52] text-[#1b110b] shadow-xs'
                    : 'text-[#cfb6a3] hover:text-white'
                }`}
                title={language === 'ar' ? 'حجم مدمج متوازن ومُقلّص الارتفاع' : 'Compact (Reduced Height)'}
              >
                {language === 'ar' ? 'مُدمج' : 'Compact'}
              </button>
              <button
                type="button"
                id="flyer-size-standard-btn"
                onClick={() => setFlyerSize('standard')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  flyerSize === 'standard'
                    ? 'bg-[#df9b52] text-[#1b110b] shadow-xs'
                    : 'text-[#cfb6a3] hover:text-white'
                }`}
                title={language === 'ar' ? 'الحجم الكامل للشهادة' : 'Standard Full Size'}
              >
                {language === 'ar' ? 'كامل' : 'Standard'}
              </button>
            </div>

            {/* Customizer Toggle */}
            <button
              type="button"
              id="best-student-customizer-toggle"
              onClick={() => setIsCustomizing(prev => !prev)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                isCustomizing 
                  ? 'bg-[#df9b52] text-[#1b110b] border-[#df9b52]' 
                  : 'bg-[#382014] hover:bg-[#4d2d1b] text-[#faedd9] border-[#6b422a]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{isCustomizing ? (language === 'ar' ? 'إخفاء التعديل' : 'Hide Edit') : (language === 'ar' ? 'تعديل البيانات' : 'Customize')}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              id="best-student-whatsapp-btn"
              onClick={handleSendWhatsApp}
              disabled={isGenerating}
              className="bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
              <span>{language === 'ar' ? 'إرسال بالواتساب' : 'WhatsApp'}</span>
            </button>

            {/* Copy Image Button */}
            <button
              type="button"
              id="best-student-copy-btn"
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="bg-[#382014] hover:bg-[#4d2d1b] text-[#f7ede2] border border-[#6b422a] text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Copy image to clipboard (Ctrl+V)"
            >
              {copiedState ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#df9b52]" />}
              <span className="hidden sm:inline">{copiedState ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الصورة' : 'Copy Image')}</span>
            </button>

            {/* Download PNG Button */}
            <button
              type="button"
              id="best-student-download-png-btn"
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#df9b52] to-[#c88642] hover:brightness-110 text-[#1b110b] text-xs font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>PNG</span>
            </button>

            {/* Download JPG Button */}
            <button
              type="button"
              id="best-student-download-jpg-btn"
              onClick={handleDownloadJPG}
              disabled={isGenerating}
              className="bg-[#382014] hover:bg-[#4d2d1b] text-[#df9b52] border border-[#6b422a] text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <FileImage className="h-3.5 w-3.5" />
              <span>JPG</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              id="best-student-print-btn"
              onClick={handlePrint}
              className="p-1.5 rounded-xl bg-[#382014] text-[#cfb6a3] hover:text-white transition cursor-pointer"
              title="Print Flyer"
            >
              <Printer className="h-4 w-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              id="best-student-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#382014] text-[#cfb6a3] hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* FEEDBACK BANNER */}
        {feedbackMessage && (
          <div className="bg-[#193b22] text-[#86efac] border-b border-[#2d6639] px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* SYSTEM SELECTORS & CUSTOMIZER ACCORDION */}
        {isCustomizing && (
          <div className="bg-[#2a170f] border-b border-[#54311d] p-4 text-xs space-y-3 shrink-0 overflow-y-auto max-h-60 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* Select Student */}
              <div>
                <label className="text-[11px] font-bold text-[#f5c38b] block mb-1">
                  {language === 'ar' ? 'اختيار الطالب المكرم:' : 'Select Honored Student:'}
                </label>
                <select
                  id="best-student-select-student"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-[#1b110b] border border-[#6b422a] rounded-lg px-2.5 py-1.5 text-white font-semibold focus:ring-1 focus:ring-[#df9b52]"
                >
                  {students.map(s => {
                    const isTop = standings.bestStudent?.student.id === s.id;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.arabicName}) {isTop ? '★ [Rank #1]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Select Week */}
              <div>
                <label className="text-[11px] font-bold text-[#f5c38b] block mb-1">
                  {language === 'ar' ? 'فترة الأسبوع:' : 'Award Week Period:'}
                </label>
                <select
                  id="best-student-select-week"
                  value={selectedWeek.id}
                  onChange={(e) => {
                    const match = WEEKS_LIST.find(w => w.id === e.target.value);
                    if (match) setSelectedWeek(match);
                  }}
                  className="w-full bg-[#1b110b] border border-[#6b422a] rounded-lg px-2.5 py-1.5 text-white font-semibold focus:ring-1 focus:ring-[#df9b52]"
                >
                  {WEEKS_LIST.map(w => (
                    <option key={w.id} value={w.id}>
                      {language === 'ar' ? w.labelAr : w.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Student Photo */}
              <div>
                <label className="text-[11px] font-bold text-[#f5c38b] block mb-1">
                  {language === 'ar' ? 'صورة الطالب:' : 'Student Portrait Photo:'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-[#422516] hover:bg-[#57311d] text-white border border-[#7a4829] px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#df9b52]" />
                    <span>{customPhotoUrl ? (language === 'ar' ? 'تغيير الصورة' : 'Change Photo') : (language === 'ar' ? 'رفع صورة' : 'Upload Photo')}</span>
                  </button>
                  {customPhotoUrl && (
                    <button
                      type="button"
                      onClick={handleResetPhoto}
                      className="p-1.5 rounded-lg bg-[#422516] text-[#df9b52] hover:bg-[#57311d] transition cursor-pointer"
                      title="Reset to default avatar"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Total Calculated Percentage Badge */}
              <div className="bg-[#1b110b] p-2.5 rounded-lg border border-[#6b422a] flex flex-col justify-center">
                <span className="text-[10px] text-[#cfb6a3] uppercase font-bold">
                  {language === 'ar' ? 'الدرجة المحسوبة تلقائياً:' : 'Total Calculated Score:'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-black text-[#df9b52]">{totalWeeklyPercentage}%</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                    ★ #1 Mumtaz
                  </span>
                </div>
              </div>

            </div>

            {/* Custom Reason for Award Input */}
            <div>
              <label className="text-[11px] font-bold text-[#f5c38b] block mb-1">
                {language === 'ar' ? 'سبب التكريم (يظهر بشكل بارز على البوستر):' : 'Reason for Award (displayed on flyer):'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customReason}
                  placeholder={defaultReasonForAward}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="flex-1 bg-[#1b110b] border border-[#6b422a] rounded-lg px-3 py-1.5 text-white font-medium text-xs focus:ring-1 focus:ring-[#df9b52]"
                />
                {customReason && (
                  <button
                    type="button"
                    onClick={() => setCustomReason('')}
                    className="text-[11px] text-[#cfb6a3] hover:text-white px-2 py-1 underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* 6 Qualities Sliders/Adjusters */}
            <div>
              <label className="text-[11px] font-bold text-[#f5c38b] block mb-1.5">
                {language === 'ar' ? 'تعديل درجات الخصال الست للتميز (تحديث فوري على البوستر):' : 'Adjust 6 Qualities Marks (instantly reflects on flyer):'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                
                {/* 1. Qur'an */}
                <div className="bg-[#1b110b] p-2 rounded-lg border border-[#522f1b]">
                  <span className="text-[10px] text-[#faedd9] block font-bold truncate">1. Qur’an</span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={quranScore}
                      onChange={(e) => setQuranScore(Number(e.target.value))}
                      className="w-14 bg-[#2a170f] text-center font-bold text-white rounded border border-[#6b422a] py-0.5 text-xs"
                    />
                    <span className="text-[#df9b52] text-[11px] font-black">%</span>
                  </div>
                </div>

                {/* 2. Homework */}
                <div className="bg-[#1b110b] p-2 rounded-lg border border-[#522f1b]">
                  <span className="text-[10px] text-[#faedd9] block font-bold truncate">2. Homework</span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={homeworkScore}
                      onChange={(e) => setHomeworkScore(Number(e.target.value))}
                      className="w-14 bg-[#2a170f] text-center font-bold text-white rounded border border-[#6b422a] py-0.5 text-xs"
                    />
                    <span className="text-[#df9b52] text-[11px] font-black">%</span>
                  </div>
                </div>

                {/* 3. Class Participation */}
                <div className="bg-[#1b110b] p-2 rounded-lg border border-[#522f1b]">
                  <span className="text-[10px] text-[#faedd9] block font-bold truncate">3. Participation</span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={participationScore}
                      onChange={(e) => setParticipationScore(Number(e.target.value))}
                      className="w-14 bg-[#2a170f] text-center font-bold text-white rounded border border-[#6b422a] py-0.5 text-xs"
                    />
                    <span className="text-[#df9b52] text-[11px] font-black">%</span>
                  </div>
                </div>

                {/* 4. Neatness */}
                <div className="bg-[#1b110b] p-2 rounded-lg border border-[#522f1b]">
                  <span className="text-[10px] text-[#faedd9] block font-bold truncate">4. Neatness</span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={neatnessScore}
                      onChange={(e) => setNeatnessScore(Number(e.target.value))}
                      className="w-14 bg-[#2a170f] text-center font-bold text-white rounded border border-[#6b422a] py-0.5 text-xs"
                    />
                    <span className="text-[#df9b52] text-[11px] font-black">%</span>
                  </div>
                </div>

                {/* 5. Respect */}
                <div className="bg-[#1b110b] p-2 rounded-lg border border-[#522f1b]">
                  <span className="text-[10px] text-[#faedd9] block font-bold truncate">5. Respect</span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={respectScore}
                      onChange={(e) => setRespectScore(Number(e.target.value))}
                      className="w-14 bg-[#2a170f] text-center font-bold text-white rounded border border-[#6b422a] py-0.5 text-xs"
                    />
                    <span className="text-[#df9b52] text-[11px] font-black">%</span>
                  </div>
                </div>

                {/* 6. Self Control */}
                <div className="bg-[#1b110b] p-2 rounded-lg border border-[#522f1b]">
                  <span className="text-[10px] text-[#faedd9] block font-bold truncate">6. Self Control</span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={selfControlScore}
                      onChange={(e) => setSelfControlScore(Number(e.target.value))}
                      className="w-14 bg-[#2a170f] text-center font-bold text-white rounded border border-[#6b422a] py-0.5 text-xs"
                    />
                    <span className="text-[#df9b52] text-[11px] font-black">%</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* FLYER PREVIEW SCROLLABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-5 flex justify-center bg-[#140c07]">
          
          {/* =========================================================================
              THE LUXURY ISLAMIC DIGITAL AWARD FLYER (IMAGE CAPTURE TARGET)
              Color Theme: Coffee Brown (#2e170c), Dark Brown (#1b110b), 
              Cream/Beige background (#fdfbf7), Gold highlights (#d4af37, #df9b52)
          ========================================================================= */}
          <div
            ref={certRef}
            id="best-student-award-flyer"
            className={`w-full ${
              flyerSize === 'mini'
                ? 'max-w-[490px] p-2.5 sm:p-3 border-[4px]'
                : flyerSize === 'compact'
                ? 'max-w-[550px] p-3 sm:p-4 border-[5px]'
                : 'max-w-[680px] p-4 sm:p-6 border-[6px]'
            } bg-gradient-to-b from-[#fefdfb] via-[#fdfbf6] to-[#fbf7ee] text-[#24150e] rounded-2xl sm:rounded-3xl shadow-2xl border-[#c88642] relative select-none transition-all duration-200`}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {/* Outer Gilded Decorative Rim */}
            <div className={`absolute ${flyerSize === 'mini' ? 'inset-1 sm:inset-1.5 border' : flyerSize === 'compact' ? 'inset-1.5 sm:inset-2 border' : 'inset-2 sm:inset-3 border-2'} border-[#df9b52]/70 rounded-xl sm:rounded-2xl pointer-events-none`} />
            <div className={`absolute ${flyerSize === 'mini' ? 'inset-2 sm:inset-2.5 border' : flyerSize === 'compact' ? 'inset-2.5 sm:inset-3 border' : 'inset-3.5 sm:inset-4 border'} border-[#854d2b]/25 rounded-lg sm:rounded-xl pointer-events-none`} />

            {/* Corner Islamic Ornaments */}
            <div className={`absolute ${flyerSize === 'mini' ? 'top-1.5 left-1.5 text-xs sm:text-sm' : flyerSize === 'compact' ? 'top-2 left-2 text-sm sm:text-base' : 'top-3 left-3 text-lg sm:text-xl'} text-[#c88642] font-serif leading-none select-none`}>۞</div>
            <div className={`absolute ${flyerSize === 'mini' ? 'top-1.5 right-1.5 text-xs sm:text-sm' : flyerSize === 'compact' ? 'top-2 right-2 text-sm sm:text-base' : 'top-3 right-3 text-lg sm:text-xl'} text-[#c88642] font-serif leading-none select-none`}>۞</div>
            <div className={`absolute ${flyerSize === 'mini' ? 'bottom-1.5 left-1.5 text-xs sm:text-sm' : flyerSize === 'compact' ? 'bottom-2 left-2 text-sm sm:text-base' : 'bottom-3 left-3 text-lg sm:text-xl'} text-[#c88642] font-serif leading-none select-none`}>۞</div>
            <div className={`absolute ${flyerSize === 'mini' ? 'bottom-1.5 right-1.5 text-xs sm:text-sm' : flyerSize === 'compact' ? 'bottom-2 right-2 text-sm sm:text-base' : 'bottom-3 right-3 text-lg sm:text-xl'} text-[#c88642] font-serif leading-none select-none`}>۞</div>

            {/* Background Calligraphic Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-[#854d2b] select-none overflow-hidden">
              <span className={`font-arabic ${flyerSize === 'mini' ? 'text-[90px]' : flyerSize === 'compact' ? 'text-[120px]' : 'text-[160px]'} font-black`}>المِلَّة</span>
            </div>

            {/* =====================================================================
                1. HEADER & SCHOOL BRANDING SECTION
                School name: AL-MILLAH ACADEMY
                Subtitle: "ISLAMIC EDUCATION • CHARACTER • EXCELLENCE"
            ===================================================================== */}
            <div className={`text-center relative z-10 ${flyerSize === 'mini' ? 'space-y-0' : 'space-y-0.5'}`}>
              
              {/* Arabic Bismillah */}
              <div className={`font-arabic ${flyerSize === 'mini' ? 'text-xs sm:text-sm' : flyerSize === 'compact' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-[#854d2b] font-bold tracking-wide`}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              {/* School Logo & Academy Name */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <div className={`${flyerSize === 'mini' ? 'w-6 h-6' : flyerSize === 'compact' ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-10 sm:h-10'} rounded-full border border-[#c88642] bg-gradient-to-br from-[#fffdf9] to-[#faedd9] p-0.5 shadow-2xs flex items-center justify-center shrink-0`}>
                  <Award className={`${flyerSize === 'mini' ? 'w-3.5 h-3.5' : flyerSize === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} text-[#854d2b]`} />
                </div>
                <div className="text-left sm:text-center">
                  <h1 className={`${flyerSize === 'mini' ? 'text-xs sm:text-sm' : flyerSize === 'compact' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-black tracking-wider text-[#2e170c] font-serif uppercase leading-tight`}>
                    AL-MILLAH ACADEMY
                  </h1>
                  <p className={`${flyerSize === 'mini' ? 'text-[7px] tracking-[0.14em]' : flyerSize === 'compact' ? 'text-[7.5px] sm:text-[8px] tracking-[0.16em]' : 'text-[8.5px] sm:text-[9px] tracking-[0.18em]'} font-sans font-extrabold uppercase text-[#854d2b]`}>
                    ISLAMIC EDUCATION • CHARACTER • EXCELLENCE
                  </p>
                </div>
              </div>

              {/* Gold Filigree Divider */}
              <div className="flex items-center justify-center py-0.5">
                <div className={`h-[1px] ${flyerSize === 'mini' ? 'w-12 sm:w-16' : 'w-16 sm:w-24'} bg-gradient-to-r from-transparent via-[#c88642] to-[#854d2b]`} />
                <span className={`mx-1.5 text-[#df9b52] ${flyerSize === 'mini' ? 'text-[8px]' : 'text-[9px]'}`}>✦ ❖ ✦</span>
                <div className={`h-[1px] ${flyerSize === 'mini' ? 'w-12 sm:w-16' : 'w-16 sm:w-24'} bg-gradient-to-l from-transparent via-[#c88642] to-[#854d2b]`} />
              </div>
            </div>

            {/* =====================================================================
                2. MAIN AWARD TITLE BANNER
                "BEST STUDENT" of the Week
                "EXCELLENCE IN ACTION"
            ===================================================================== */}
            <div className={`text-center relative z-10 ${flyerSize === 'mini' ? 'my-0.5' : flyerSize === 'compact' ? 'my-1' : 'my-1.5 sm:my-2'}`}>
              <div className={`relative inline-block ${flyerSize === 'mini' ? 'px-3 sm:px-6 py-1 rounded-lg border' : flyerSize === 'compact' ? 'px-4 sm:px-8 py-1 rounded-xl border' : 'px-6 sm:px-10 py-1.5 rounded-xl border-2'} bg-gradient-to-r from-[#24130a] via-[#3b2013] to-[#24130a] text-[#faedd9] border-[#df9b52] shadow-md`}>
                
                {/* Decorative Crown */}
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Crown className={`${flyerSize === 'mini' ? 'h-3 w-3' : flyerSize === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#df9b52] fill-[#df9b52] drop-shadow-xs`} />
                </div>

                {/* Title */}
                <h2 className={`${flyerSize === 'mini' ? 'text-sm sm:text-base' : flyerSize === 'compact' ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'} font-black tracking-tight text-white font-serif uppercase leading-none`}>
                  BEST STUDENT
                </h2>
                <p className={`${flyerSize === 'mini' ? 'text-[10px]' : flyerSize === 'compact' ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'} font-serif italic text-[#df9b52] font-bold tracking-wide mt-0.5`}>
                  of the Week
                </p>

                {/* Subtitle Ribbon: EXCELLENCE IN ACTION */}
                <div className={`mt-0.5 inline-flex items-center gap-1 bg-[#df9b52] text-[#1b110b] ${flyerSize === 'mini' ? 'text-[7px] px-1.5 py-0' : flyerSize === 'compact' ? 'text-[7.5px] px-2 py-0.2' : 'text-[8.5px] px-2.5 py-0.5'} font-black uppercase tracking-widest rounded-full shadow-xs font-sans`}>
                  <Star className="h-2 w-2 fill-[#1b110b]" />
                  <span>EXCELLENCE IN ACTION</span>
                  <Star className="h-2 w-2 fill-[#1b110b]" />
                </div>
              </div>
            </div>

            {/* =====================================================================
                3. STUDENT PHOTO SECTION (LAUREL FRAME & MEDAL)
            ===================================================================== */}
            <div className={`relative z-10 flex flex-col items-center justify-center ${flyerSize === 'mini' ? 'my-0.5' : flyerSize === 'compact' ? 'my-1' : 'my-1.5 sm:my-2'}`}>
              
              <div className="relative flex items-center justify-center">
                
                {/* LEFT LAUREL LEAVES SVG */}
                <svg className={`${flyerSize === 'mini' ? 'w-5 h-10' : flyerSize === 'compact' ? 'w-6 sm:w-7 h-12 sm:h-14' : 'w-8 sm:w-10 h-16 sm:h-20'} text-[#c88642] shrink-0`} viewBox="0 0 60 120" fill="currentColor">
                  <path d="M50,110 C35,90 20,60 30,20 C32,25 35,32 30,38 C22,48 28,68 36,75 C28,82 32,96 50,110 Z" opacity="0.85"/>
                  <circle cx="28" cy="28" r="4.5" fill="#df9b52" />
                  <circle cx="22" cy="48" r="5" fill="#df9b52" />
                  <circle cx="25" cy="70" r="5.5" fill="#df9b52" />
                  <circle cx="34" cy="90" r="5.5" fill="#df9b52" />
                </svg>

                {/* CIRCULAR PHOTO FRAME */}
                <div className="relative group">
                  <div className={`${flyerSize === 'mini' ? 'w-14 h-14 sm:w-16 sm:h-16 border-2 ring-1' : flyerSize === 'compact' ? 'w-16 h-16 sm:w-20 sm:h-20 border-[2.5px] ring-2' : 'w-22 h-22 sm:w-26 sm:h-26 border-[3px] ring-2'} rounded-full border-[#df9b52] bg-gradient-to-b from-[#faf5ec] to-[#ebd8c5] p-0.5 shadow-md overflow-hidden flex items-center justify-center ring-[#854d2b]/20`}>
                    <img
                      src={activePhoto}
                      alt={currentStudent.fullName}
                      crossOrigin="anonymous"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* Teacher upload quick-button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="no-export absolute bottom-0 right-0 p-1 rounded-full bg-[#3b2013] text-[#df9b52] border border-[#df9b52] shadow-sm hover:scale-110 active:scale-95 transition cursor-pointer"
                    title="Upload student photo"
                  >
                    <Camera className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* RIGHT LAUREL LEAVES SVG */}
                <svg className={`${flyerSize === 'mini' ? 'w-5 h-10' : flyerSize === 'compact' ? 'w-6 sm:w-7 h-12 sm:h-14' : 'w-8 sm:w-10 h-16 sm:h-20'} text-[#c88642] shrink-0 scale-x-[-1]`} viewBox="0 0 60 120" fill="currentColor">
                  <path d="M50,110 C35,90 20,60 30,20 C32,25 35,32 30,38 C22,48 28,68 36,75 C28,82 32,96 50,110 Z" opacity="0.85"/>
                  <circle cx="28" cy="28" r="4.5" fill="#df9b52" />
                  <circle cx="22" cy="48" r="5" fill="#df9b52" />
                  <circle cx="25" cy="70" r="5.5" fill="#df9b52" />
                  <circle cx="34" cy="90" r="5.5" fill="#df9b52" />
                </svg>

              </div>

              {/* HANGING GOLD MEDAL / ROSETTE DECORATION */}
              <div className="-mt-1.5 relative z-20 flex flex-col items-center">
                <div className={`bg-gradient-to-r from-[#df9b52] via-[#f7cb8b] to-[#c88642] text-[#1b110b] font-black ${flyerSize === 'mini' ? 'text-[7.5px] px-2 py-0.2' : flyerSize === 'compact' ? 'text-[8.5px] px-2.5 py-0.5' : 'text-[9.5px] sm:text-[10px] px-3 py-0.5'} rounded-full shadow-sm border border-[#fffdf9] flex items-center gap-1 font-sans`}>
                  <Award className={`${flyerSize === 'mini' ? 'h-2.5 w-2.5' : 'h-3 w-3'} fill-[#1b110b]`} />
                  <span className="tracking-wider">★ RANK #1 HONOREE ★</span>
                </div>
              </div>

            </div>

            {/* =====================================================================
                4. STUDENT INFORMATION SECTION
            ===================================================================== */}
            <div className={`relative z-10 text-center ${flyerSize === 'mini' ? 'my-0.5 space-y-0' : flyerSize === 'compact' ? 'my-0.5 space-y-0.5' : 'my-1 space-y-0.5'}`}>
              
              {/* Presentation line */}
              <p className={`${flyerSize === 'mini' ? 'text-[8px]' : 'text-[8.5px] sm:text-[9.5px]'} text-[#6e5648] font-sans uppercase tracking-widest font-bold`}>
                This prestigious weekly award is conferred upon:
              </p>

              {/* Student Name Display */}
              <div className="space-y-0">
                <h3 className={`${flyerSize === 'mini' ? 'text-base sm:text-lg' : flyerSize === 'compact' ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-black text-[#2e170c] font-serif tracking-tight leading-tight`}>
                  {currentStudent.fullName}
                </h3>
                {currentStudent.arabicName && (
                  <p className={`font-arabic ${flyerSize === 'mini' ? 'text-xs sm:text-sm' : flyerSize === 'compact' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-[#854d2b] font-bold`}>
                    {currentStudent.arabicName}
                  </p>
                )}
              </div>

              {/* Info Badges Grid */}
              <div className={`flex flex-wrap items-center justify-center ${flyerSize === 'mini' ? 'gap-0.5 pt-0.5 text-[8.5px] max-w-md' : flyerSize === 'compact' ? 'gap-1 pt-0.5 text-[9px] max-w-lg' : 'gap-1.5 pt-1 text-[10px] max-w-xl'} mx-auto font-sans`}>
                <div className="bg-white/90 border border-[#e5dad0] px-1.5 py-0.2 rounded text-[#3b2317] font-semibold flex items-center gap-1 shadow-2xs">
                  <UserCheck className="h-2.5 w-2.5 text-[#854d2b]" />
                  <span>Class Five</span>
                </div>

                <div className="bg-white/90 border border-[#e5dad0] px-1.5 py-0.2 rounded text-[#3b2317] font-semibold flex items-center gap-1 shadow-2xs">
                  <span>Parent: {currentStudent.parentName}</span>
                </div>

                <div className="bg-white/90 border border-[#e5dad0] px-1.5 py-0.2 rounded text-[#3b2317] font-semibold flex items-center gap-1 shadow-2xs">
                  <Phone className="h-2.5 w-2.5 text-[#25D366]" />
                  <span>{currentStudent.parentPhone}</span>
                </div>

                <div className="bg-white/90 border border-[#e5dad0] px-1.5 py-0.2 rounded text-[#3b2317] font-semibold flex items-center gap-1 shadow-2xs">
                  <Calendar className="h-2.5 w-2.5 text-[#854d2b]" />
                  <span>Wk {selectedWeek.weekNumber}: {selectedWeek.startDate} to {selectedWeek.endDate}</span>
                </div>
              </div>

            </div>

            {/* =====================================================================
                5. REASON FOR AWARD / CITATION OF MERIT
            ===================================================================== */}
            <div className={`relative z-10 max-w-lg mx-auto ${flyerSize === 'mini' ? 'my-0.5 px-1' : 'my-1 px-2'}`}>
              <div className={`bg-gradient-to-r from-[#faedd9]/50 via-[#fffbf4] to-[#faedd9]/50 border border-[#df9b52]/40 ${flyerSize === 'mini' ? 'p-1 px-2' : 'p-1.5 px-2.5'} rounded-lg shadow-2xs text-center relative`}>
                <p className={`${flyerSize === 'mini' ? 'text-[9.5px] leading-tight' : 'text-[10.5px] sm:text-[11px] leading-snug'} text-[#453225] font-serif italic`}>
                  "{activeReasonForAward}"
                </p>
              </div>
            </div>

            {/* =====================================================================
                6. QUALITIES SHINE SECTION (COMPACT CRITERIA GRID)
            ===================================================================== */}
            <div className={`relative z-10 ${flyerSize === 'mini' ? 'my-0.5' : 'my-1'}`}>
              <div className="text-center mb-0.5">
                <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-sans font-black uppercase tracking-widest text-[#854d2b] flex items-center justify-center gap-1`}>
                  <Sparkles className="h-2.5 w-2.5 text-[#df9b52]" />
                  <span>QUALITIES THAT SHINE • رَكَائِزُ التَّمَيُّزِ</span>
                  <Sparkles className="h-2.5 w-2.5 text-[#df9b52]" />
                </span>
              </div>

              <div className={`grid grid-cols-2 sm:grid-cols-3 ${flyerSize === 'mini' ? 'gap-1 max-w-md' : 'gap-1 max-w-lg'} mx-auto font-sans`}>
                
                {/* 1. Qur’an Memorization */}
                <div className="bg-white/95 px-1.5 py-0.5 rounded border border-[#ebd8c8] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <BookOpen className="h-3 w-3 text-[#854d2b] shrink-0" />
                    <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-bold text-[#2e170c] truncate`}>Qur'an</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[#df9b52] text-[8.5px] leading-none">{'★'.repeat(getStarRating(quranScore))}</span>
                    <span className="text-[8.5px] font-black text-[#854d2b] bg-[#faedd9] px-1 py-0 rounded leading-none">{quranScore}%</span>
                  </div>
                </div>

                {/* 2. Homework Completion */}
                <div className="bg-white/95 px-1.5 py-0.5 rounded border border-[#ebd8c8] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <CheckSquare className="h-3 w-3 text-[#854d2b] shrink-0" />
                    <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-bold text-[#2e170c] truncate`}>Homework</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[#df9b52] text-[8.5px] leading-none">{'★'.repeat(getStarRating(homeworkScore))}</span>
                    <span className="text-[8.5px] font-black text-[#854d2b] bg-[#faedd9] px-1 py-0 rounded leading-none">{homeworkScore}%</span>
                  </div>
                </div>

                {/* 3. Class Participation */}
                <div className="bg-white/95 px-1.5 py-0.5 rounded border border-[#ebd8c8] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <Users className="h-3 w-3 text-[#854d2b] shrink-0" />
                    <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-bold text-[#2e170c] truncate`}>Participation</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[#df9b52] text-[8.5px] leading-none">{'★'.repeat(getStarRating(participationScore))}</span>
                    <span className="text-[8.5px] font-black text-[#854d2b] bg-[#faedd9] px-1 py-0 rounded leading-none">{participationScore}%</span>
                  </div>
                </div>

                {/* 4. Neatness */}
                <div className="bg-white/95 px-1.5 py-0.5 rounded border border-[#ebd8c8] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <Sparkles className="h-3 w-3 text-[#854d2b] shrink-0" />
                    <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-bold text-[#2e170c] truncate`}>Neatness</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[#df9b52] text-[8.5px] leading-none">{'★'.repeat(getStarRating(neatnessScore))}</span>
                    <span className="text-[8.5px] font-black text-[#854d2b] bg-[#faedd9] px-1 py-0 rounded leading-none">{neatnessScore}%</span>
                  </div>
                </div>

                {/* 5. Respect & Adab */}
                <div className="bg-white/95 px-1.5 py-0.5 rounded border border-[#ebd8c8] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <HeartHandshake className="h-3 w-3 text-[#854d2b] shrink-0" />
                    <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-bold text-[#2e170c] truncate`}>Respect & Adab</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[#df9b52] text-[8.5px] leading-none">{'★'.repeat(getStarRating(respectScore))}</span>
                    <span className="text-[8.5px] font-black text-[#854d2b] bg-[#faedd9] px-1 py-0 rounded leading-none">{respectScore}%</span>
                  </div>
                </div>

                {/* 6. Self Control */}
                <div className="bg-white/95 px-1.5 py-0.5 rounded border border-[#ebd8c8] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <Compass className="h-3 w-3 text-[#854d2b] shrink-0" />
                    <span className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-bold text-[#2e170c] truncate`}>Self Control</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[#df9b52] text-[8.5px] leading-none">{'★'.repeat(getStarRating(selfControlScore))}</span>
                    <span className="text-[8.5px] font-black text-[#854d2b] bg-[#faedd9] px-1 py-0 rounded leading-none">{selfControlScore}%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* =====================================================================
                7. MOTIVATIONAL MESSAGE
            ===================================================================== */}
            <div className={`relative z-10 max-w-md mx-auto ${flyerSize === 'mini' ? 'my-0.5' : 'my-1'} text-center`}>
              <div className={`bg-gradient-to-r from-[#2e170c] via-[#452312] to-[#2e170c] text-[#f7ede2] px-2.5 py-1 rounded-lg border border-[#df9b52] shadow-2xs flex items-center justify-center gap-1.5`}>
                <p className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} font-serif italic text-[#faedd9]`}>
                  "A true role model for classmates."
                </p>
                <span className="text-[#df9b52] text-[8.5px] font-black uppercase font-sans tracking-wide">
                  ✦ KEEP SHINING! ✦
                </span>
              </div>
            </div>

            {/* =====================================================================
                8. FOOTER DESIGN
            ===================================================================== */}
            <footer className={`relative z-10 ${flyerSize === 'mini' ? 'mt-1 pt-1' : 'mt-1.5 pt-1.5'} border-t border-[#df9b52]/40 font-sans`}>
              
              {/* Mosque Silhouette SVG */}
              <div className="flex items-center justify-center mb-0.5">
                <svg className={`${flyerSize === 'mini' ? 'w-24 h-3.5' : 'w-32 h-4'} text-[#854d2b]/60`} viewBox="0 0 200 32" fill="currentColor">
                  <path d="M100,6 C94,14 88,22 88,28 L112,28 C112,22 106,14 100,6 Z" />
                  <circle cx="100" cy="4" r="1.5" />
                  <rect x="74" y="10" width="3" height="18" rx="1" />
                  <polygon points="75.5,5 72,10 79,10" />
                  <rect x="123" y="10" width="3" height="18" rx="1" />
                  <polygon points="124.5,5 121,10 128,10" />
                  <path d="M60,16 C56,21 52,25 52,28 L68,28 C68,25 64,21 60,16 Z" />
                  <path d="M140,16 C136,21 132,25 132,28 L148,28 C148,25 144,21 140,16 Z" />
                  <line x1="20" y1="28" x2="180" y2="28" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

              {/* Holy Qur'an Ayah Quote */}
              <div className="text-center space-y-0 mb-1">
                <div className={`font-arabic ${flyerSize === 'mini' ? 'text-[11px]' : 'text-xs'} text-[#854d2b] font-bold leading-none`}>
                  وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ
                </div>
                <div className={`${flyerSize === 'mini' ? 'text-[8.5px]' : 'text-[9.5px]'} text-[#2e170c] font-serif italic font-semibold leading-tight mt-0.5`}>
                  "And Allah loves those who strive for excellence." — (2:195)
                </div>
              </div>

              {/* Signatures & Seal Row */}
              <div className="grid grid-cols-3 gap-1 items-end pt-0.5 border-t border-[#df9b52]/20 text-center">
                
                {/* Date & Registry */}
                <div className="text-left sm:text-center">
                  <p className="text-[7.5px] uppercase font-bold text-[#8c7464]">Award Date</p>
                  <p className="text-[9px] font-extrabold text-[#2e170c] leading-tight">
                    {selectedWeek.endDate}
                  </p>
                  <p className="text-[7px] text-[#854d2b] font-medium leading-none">
                    1447H / 2026
                  </p>
                </div>

                {/* Official Academy Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className={`${flyerSize === 'mini' ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border border-[#c88642] flex flex-col items-center justify-center bg-gradient-to-br from-[#faedd9] via-[#fffdf9] to-[#faedd9] shadow-2xs p-0.5`}>
                    <Award className={`${flyerSize === 'mini' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} text-[#854d2b]`} />
                    <span className="text-[5.5px] font-black uppercase text-[#854d2b] tracking-tighter leading-none">
                      SEAL
                    </span>
                  </div>
                </div>

                {/* Ustadh Signature */}
                <div className="text-right sm:text-center">
                  <div className="h-3 text-[9.5px] flex items-end justify-end sm:justify-center font-serif italic text-[#854d2b] font-bold leading-none">
                    Ustadh M. Shaya'u
                  </div>
                  <div className="h-[1px] w-16 sm:w-20 bg-[#854d2b]/40 ml-auto sm:mx-auto my-0.5" />
                  <p className="text-[8.5px] font-extrabold text-[#2e170c] leading-none">
                    Head of Halaqah
                  </p>
                </div>

              </div>

            </footer>

          </div>

        </div>

      </div>
    </div>
  );
};
