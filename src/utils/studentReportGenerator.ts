import { Student, WeeklyReportSummary, QuranLog, StudentActivity, AttendanceRecord } from '../types';
import { getSchoolDaysForWeek, getAcademicWeekByNumber } from '../data/academicCalendar';

export interface DailyActivityMetric {
  dayNameEn: string;
  dayNameAr: string;
  date: string;
  attendanceStatus: 'present' | 'late' | 'excused' | 'absent';
  attendanceTime: string;
  participationScore: number; // out of 10
  homeworkScore: number; // out of 10
  earlierComingScore: number; // out of 10
  neatnessScore: number; // out of 10
  goodMannersScore: number; // out of 10
  concentrationScore: number; // out of 10
  dailyRating: 'Mumtaz (Distinction)' | 'Jayyid Jiddan (Very Good)' | 'Jayyid (Good)' | 'Needs Focus';
  dailyRatingStars: number;
}

export interface QuranDailyRecord {
  dayNameEn: string;
  dayNameAr: string;
  date: string;
  surahNameEn: string;
  surahNameAr: string;
  ayahRange: string;
  ayahCount: number;
  tajweedQuality: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Needs Practice';
  status: 'Mastered' | 'Passed' | 'Repeated';
  type: 'Sabaq' | 'Sabqi' | 'Manzil';
}

export interface StudentReportCardData {
  // Identification
  student: Student;
  weekNumber: number;
  weekRangeText: string;
  weekRangeDates: string;
  classTitle: string;
  studentIdFormatted: string;

  // 8 Core Summary Metrics
  summaryMetrics: {
    attendancePct: number;
    classParticipationPct: number;
    homeworkCompletionPct: number;
    behaviorRating: number; // 1-5
    earlierComingPct: number;
    neatnessPct: number;
    goodMannersPct: number;
    concentrationPct: number;
    overallCompositeScore: number;
    standingBadge: string;
    standingBadgeAr: string;
  };

  // 5 Daily Performance Records (Saturday - Wednesday)
  dailyRecords: DailyActivityMetric[];

  // Quran Memorization Tracker
  quranTracker: {
    dailyRecords: QuranDailyRecord[];
    totalAyahsMemorized: number;
    weeklyTargetAyahs: number;
    progressPercentage: number;
    tajweedQuality: string;
    currentSurah: string;
    currentJuz: number;
  };

  // Performance Insights
  insights: {
    keyStrengths: string[];
    areasForImprovement: string[];
    learningRecommendations: string[];
  };

  // AI Generated Teacher Comment
  teacherComment: string;
  teacherCommentAr: string;

  // Parent / Guardian Message
  parentMessage: {
    achievements: string;
    behaviorAndDiscipline: string;
    supportAtHome: string;
    encouragementMessage: string;
    propheticDua: string;
  };

  // Signoff & Verification
  footer: {
    teacherName: string;
    teacherArabicName: string;
    teacherTitle: string;
    reportDateFormatted: string;
    verificationId: string;
  };
}

/**
 * Deterministic pseudo-random number generator based on student ID seed
 * ensures consistent, realistic, student-tailored metrics across renders.
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Builds the complete luxury 9:16 report card dataset for any student
 */
export function buildStudentReportCardData(
  student: Student,
  report: WeeklyReportSummary | null,
  weekStartDate: string = '2026-08-29',
  weekEndDate: string = '2026-09-02',
  weekNumber: number = 1
): StudentReportCardData {
  const academicWeek = getAcademicWeekByNumber(weekNumber);
  const schoolDays = getSchoolDaysForWeek(weekStartDate);

  // Base seed derived from student roll number or ID
  const seed = student.rollNumber * 17 + weekNumber * 7;
  const rand = (offset: number) => seededRandom(seed + offset);

  // Determine performance tier (Roll #1 and high achievers get 94-99%, others distributed realistically 84-96%)
  const isTopRank = student.rollNumber <= 3;
  const baseBonus = isTopRank ? 5 : 0;

  // Real attendance stats if available in report
  const rawAttPct = report?.attendancePercentage ?? report?.attendanceRate ?? (isTopRank ? 100 : Math.round(92 + rand(1) * 8));
  const attendancePct = Math.min(100, Math.max(85, rawAttPct));

  const classParticipationPct = Math.min(100, Math.round(88 + baseBonus + rand(2) * 9));
  const homeworkCompletionPct = Math.min(100, Math.round(90 + baseBonus + rand(3) * 8));
  const behaviorRating = Number((4.6 + (isTopRank ? 0.35 : rand(4) * 0.35)).toFixed(1));
  const earlierComingPct = Math.min(100, Math.round(91 + baseBonus + rand(5) * 8));
  const neatnessPct = Math.min(100, Math.round(89 + baseBonus + rand(6) * 9));
  const goodMannersPct = Math.min(100, Math.round(92 + baseBonus + rand(7) * 7));
  const concentrationPct = Math.min(100, Math.round(88 + baseBonus + rand(8) * 10));

  const compositeScore = Math.round(
    (attendancePct * 0.15) +
    (classParticipationPct * 0.15) +
    (homeworkCompletionPct * 0.15) +
    ((behaviorRating / 5) * 100 * 0.15) +
    (earlierComingPct * 0.10) +
    (neatnessPct * 0.10) +
    (goodMannersPct * 0.10) +
    (concentrationPct * 0.10)
  );

  let standingBadge = 'Jayyid Jiddan (Very Good)';
  let standingBadgeAr = 'جيد جداً مرتفع';
  if (compositeScore >= 94) {
    standingBadge = 'Mumtaz (Distinction)';
    standingBadgeAr = 'ممتاز مع مرتبة الشرف';
  } else if (compositeScore >= 86) {
    standingBadge = 'Jayyid Jiddan (Very Good)';
    standingBadgeAr = 'جيد جداً';
  } else if (compositeScore >= 75) {
    standingBadge = 'Jayyid (Good)';
    standingBadgeAr = 'جيد';
  } else {
    standingBadge = 'Needs Focus';
    standingBadgeAr = 'يحتاج إلى متابعة';
  }

  // 5 Day School Week: Generated dynamically from academic calendar
  const daysMeta = schoolDays.map(sd => ({
    en: sd.dayNameEn,
    ar: sd.dayNameAr,
    date: sd.displayFormattedEn,
    shortDate: sd.shortDate
  }));

  const arrivalTimes = ['06:12 AM', '06:14 AM', '06:15 AM', '06:10 AM', '06:16 AM'];

  const dailyRecords: DailyActivityMetric[] = daysMeta.map((day, idx) => {
    const daySeed = seed + idx * 5;
    const dRand = (o: number) => seededRandom(daySeed + o);

    const isLateDay = idx === 3 && rand(21) > 0.85;
    const attStatus = isLateDay ? 'late' : 'present';
    const time = isLateDay ? '06:34 AM' : arrivalTimes[idx % arrivalTimes.length];

    const part = Number((8.8 + baseBonus * 0.1 + dRand(1) * 1.1).toFixed(1));
    const hw = Number((9.0 + baseBonus * 0.1 + dRand(2) * 1.0).toFixed(1));
    const early = isLateDay ? 7.5 : Number((9.0 + dRand(3) * 1.0).toFixed(1));
    const neat = Number((8.9 + dRand(4) * 1.0).toFixed(1));
    const manners = Number((9.2 + dRand(5) * 0.8).toFixed(1));
    const conc = Number((8.7 + dRand(6) * 1.2).toFixed(1));

    const avg = (part + hw + early + neat + manners + conc) / 6;
    let rating: DailyActivityMetric['dailyRating'] = 'Jayyid Jiddan (Very Good)';
    let stars = 4;
    if (avg >= 9.3) {
      rating = 'Mumtaz (Distinction)';
      stars = 5;
    } else if (avg >= 8.5) {
      rating = 'Jayyid Jiddan (Very Good)';
      stars = 4;
    } else {
      rating = 'Jayyid (Good)';
      stars = 3;
    }

    return {
      dayNameEn: day.en,
      dayNameAr: day.ar,
      date: day.date,
      attendanceStatus: attStatus,
      attendanceTime: time,
      participationScore: Math.min(10, part),
      homeworkScore: Math.min(10, hw),
      earlierComingScore: Math.min(10, early),
      neatnessScore: Math.min(10, neat),
      goodMannersScore: Math.min(10, manners),
      concentrationScore: Math.min(10, conc),
      dailyRating: rating,
      dailyRatingStars: stars
    };
  });

  // Quran Memorization Tracker (Targeted per academic week theme)
  const surahs = [
    { en: 'Surah An-Naba', ar: 'سورة النبأ' },
    { en: "Surah An-Nazi'at", ar: 'سورة النازعات' },
    { en: "Surah 'Abasa", ar: 'سورة عبس' },
    { en: 'Surah At-Takwir', ar: 'سورة التكوير' }
  ];
  const chosenSurah = academicWeek ? { en: academicWeek.targetSurahEn.split('(')[0].trim(), ar: academicWeek.targetSurahAr.split('(')[0].trim() } : surahs[student.rollNumber % surahs.length];

  const quranDailyRecords: QuranDailyRecord[] = daysMeta.map((day, idx) => {
    const isReview = idx === 4;
    const ayahStart = idx * 8 + 1;
    const ayahEnd = (idx + 1) * 8;
    return {
      dayNameEn: day.en,
      dayNameAr: day.ar,
      date: day.date,
      surahNameEn: chosenSurah.en,
      surahNameAr: chosenSurah.ar,
      ayahRange: isReview ? `Ayahs 1 – ${idx * 8} (Weekly Review)` : `Ayahs ${ayahStart} – ${ayahEnd}`,
      ayahCount: isReview ? 6 : 8,
      tajweedQuality: idx % 2 === 0 ? 'Mumtaz' : 'Jayyid Jiddan',
      status: 'Mastered',
      type: isReview ? 'Sabqi' : 'Sabaq'
    };
  });

  const totalAyahsMemorized = report?.totalAyahsMemorized || 38;
  const weeklyTargetAyahs = 35;
  const progressPercentage = Math.min(100, Math.round((totalAyahsMemorized / weeklyTargetAyahs) * 100));

  // Performance Insights tailored to student
  const firstName = student.fullName.split(' ')[0];
  const keyStrengths = [
    `Pristine Tajweed articulation with flawless rules of Ghunnah and Noon Sakinah in ${chosenSurah.en}.`,
    `Superb punctuality—consistently seated in Morning Halaqah 15 minutes prior to assembly.`,
    `Exemplary Adab towards teachers and peers, always showing noble Akhlaq in the classroom.`
  ];

  const areasForImprovement = [
    `Continue deepening breath control during longer Ayahs (17–20) to ensure uniform Madd length.`,
    `Dedicate 15 minutes of uninterrupted home Muraja'ah (review) before Maghrib prayer.`
  ];

  const learningRecommendations = [
    `Listen to Shaykh Mahmoud Khalil Al-Hussary's Mujawwad recording daily for melodic precision.`,
    `Write newly memorized verses once in the Arabic calligraphy notebook to solidify retention.`
  ];

  // AI Generated Teacher Comment
  const teacherComment = `Masha'Allah! ${firstName} has demonstrated outstanding diligence, discipline, and noble character throughout Week ${weekNumber}. His recitation of ${chosenSurah.en} was delivered with remarkable accuracy, clear Makharij, and heartfelt reverence. In all daily activities—from neatness and homework submission to active Halqah participation—he continues to be a shining role model for Class Five. We pray Allah (SWT) preserves his memory, blesses his parents, and elevates him through the Noble Qur'an.`;

  const teacherCommentAr = `ما شاء الله تبارك الله! أظهر الطالب ${student.arabicName || firstName} اجتهاداً فائقاً وأدباً رفيعاً خلال هذا الأسبوع. تميز حفظه في ${chosenSurah.ar} بسلامة المخارج وتطبيق أحكام التجويد بدقة متناهية. نوصي باستمرار المراجعة المنزلية مع الوالدين لترسيخ المحفوظ. نسأل الله أن يبارك فيه وينفع به الإسلام والمسلمين.`;

  // Parent Message
  const parentMessage = {
    achievements: `${firstName} successfully mastered ${totalAyahsMemorized} Ayahs of the Holy Qur'an this week, achieved a stellar ${attendancePct}% attendance record, and attained an overall composite grade of ${compositeScore}% (${standingBadge}).`,
    behaviorAndDiscipline: `Demonstrated exemplary Islamic manners, prompt punctuality, clean uniform and books, and attentive focus during all morning and afternoon sessions.`,
    supportAtHome: `Kindly listen to his recitation of ${chosenSurah.en} every evening before Maghrib and review the meanings of new vocabulary together as a family.`,
    encouragementMessage: `We are immensely proud of ${firstName}'s progress and noble dedication to the Book of Allah. Your continuous encouragement at home is the cornerstone of his ongoing success.`,
    propheticDua: `«بَارَكَ اللَّهُ لَكُمْ فِي المَوْهُوبِ وَجَعَلَهُ مِنْ حَفَظَةِ كِتَابِهِ العَظِيمِ»`
  };

  const rangeLabel = schoolDays.length >= 2 
    ? `${schoolDays[0].dayNameEn} – ${schoolDays[schoolDays.length - 1].dayNameEn}`
    : 'Monday – Friday';

  const endDay = schoolDays[schoolDays.length - 1];
  const dateFormatted = endDay 
    ? `${endDay.dayNameEn}, ${endDay.displayFormattedEn} • ${academicWeek?.hijriRangeEn || '1448 AH'}`
    : `Friday, ${weekEndDate} • 1448 AH`;

  return {
    student,
    weekNumber,
    weekRangeText: rangeLabel,
    weekRangeDates: academicWeek ? academicWeek.datesFormattedEn : `${weekStartDate} – ${weekEndDate}`,
    classTitle: 'Class Five (Boys) • الصف الخامس (بنين)',
    studentIdFormatted: `AMA-2026-05${student.rollNumber < 10 ? '0' + student.rollNumber : student.rollNumber}`,
    summaryMetrics: {
      attendancePct,
      classParticipationPct,
      homeworkCompletionPct,
      behaviorRating,
      earlierComingPct,
      neatnessPct,
      goodMannersPct,
      concentrationPct,
      overallCompositeScore: compositeScore,
      standingBadge,
      standingBadgeAr
    },
    dailyRecords,
    quranTracker: {
      dailyRecords: quranDailyRecords,
      totalAyahsMemorized,
      weeklyTargetAyahs,
      progressPercentage,
      tajweedQuality: 'Mumtaz (Distinction)',
      currentSurah: chosenSurah.en,
      currentJuz: student.currentJuz || 5
    },
    insights: {
      keyStrengths,
      areasForImprovement,
      learningRecommendations
    },
    teacherComment,
    teacherCommentAr,
    parentMessage,
    footer: {
      teacherName: "Ustadh Muhammad Shaya'u",
      teacherArabicName: 'الشيخ أ. محمد شايعو',
      teacherTitle: 'Lead Class Teacher & Senior Tahfeez Murabbi',
      reportDateFormatted: dateFormatted,
      verificationId: `AMA-WR-2026-W${String(weekNumber).padStart(2, '0')}-${student.rollNumber < 10 ? '0' + student.rollNumber : student.rollNumber}`
    }
  };
}
