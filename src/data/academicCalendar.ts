import { 
  AcademicSession, 
  AcademicTerm, 
  AcademicSessionStatus, 
  TermStatus, 
  TermType, 
  AcademicHoliday, 
  AcademicCalendarSelection 
} from '../types';

export interface AcademicWeek {
  id: string;
  weekNumber: number;
  sessionId?: string;
  termId?: string;
  termType?: TermType;
  startDate: string; // YYYY-MM-DD (Saturday)
  endDate: string;   // YYYY-MM-DD (Wednesday)
  labelEn: string;
  labelAr: string;
  datesFormattedEn: string;
  datesFormattedAr: string;
  status: 'completed' | 'current' | 'upcoming';
  statusLabelEn: string;
  statusLabelAr: string;
  hijriRangeEn: string;
  hijriRangeAr: string;
  themeEn: string;
  themeAr: string;
  targetSurahEn: string;
  targetSurahAr: string;
}

export const ACADEMIC_TERM_START = '2026-08-29';

// ---------------------------------------------------------------------
// Curated Canonical Weeks for Term 1 (2026/2027)
// Preserving existing 16-week curriculum foundation
// ---------------------------------------------------------------------
const TERM_1_CANONICAL_WEEKS: AcademicWeek[] = [
  {
    id: 'week-1',
    weekNumber: 1,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-08-29',
    endDate: '2026-09-02',
    labelEn: 'Week 1 (Aug 29 – Sep 02, 2026)',
    labelAr: 'الأسبوع ١ (٢٩ أغسطس – ٢ سبتمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 29 Aug – Wednesday 02 Sep 2026',
    datesFormattedAr: 'السبت ٢٩ أغسطس – الأربعاء ٠٢ سبتمبر ٢٠٢٦',
    status: 'completed',
    statusLabelEn: 'Completed',
    statusLabelAr: 'مكتمل',
    hijriRangeEn: '16 Safar – 20 Safar 1448 AH',
    hijriRangeAr: '١٦ صفر – ٢٠ صفر ١٤٤٨ هـ',
    themeEn: 'Orientation, Halqah Formation & Adab Foundations',
    themeAr: 'التهيئة وتأسيس حلقات التلاوة والآداب',
    targetSurahEn: 'Surah An-Naba (Ayahs 1 – 16)',
    targetSurahAr: 'سورة النبأ (الآيات ١ – ١٦)'
  },
  {
    id: 'week-2',
    weekNumber: 2,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-09-05',
    endDate: '2026-09-09',
    labelEn: 'Week 2 (Sep 05 – Sep 09, 2026) — Current',
    labelAr: 'الأسبوع ٢ (٥ سبتمبر – ٩ سبتمبر ٢٠٢٦) — الحالي',
    datesFormattedEn: 'Saturday 05 Sep – Wednesday 09 Sep 2026',
    datesFormattedAr: 'السبت ٠٥ سبتمبر – الأربعاء ٠٩ سبتمبر ٢٠٢٦',
    status: 'current',
    statusLabelEn: 'Current Week',
    statusLabelAr: 'الأسبوع الحالي',
    hijriRangeEn: '23 Safar – 27 Safar 1448 AH',
    hijriRangeAr: '٢٣ صفر – ٢٧ صفر ١٤٤٨ هـ',
    themeEn: 'Surah An-Naba Recitation & Makharij Precision',
    themeAr: 'تجويد سورة النبأ وإتقان مخارج الحروف',
    targetSurahEn: 'Surah An-Naba (Ayahs 17 – 40)',
    targetSurahAr: 'سورة النبأ (الآيات ١٧ – ٤٠)'
  },
  {
    id: 'week-3',
    weekNumber: 3,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-09-12',
    endDate: '2026-09-16',
    labelEn: 'Week 3 (Sep 12 – Sep 16, 2026)',
    labelAr: 'الأسبوع ٣ (١٢ سبتمبر – ١٦ سبتمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 12 Sep – Wednesday 16 Sep 2026',
    datesFormattedAr: 'السبت ١٢ سبتمبر – الأربعاء ١٦ سبتمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '30 Safar – 04 Rabi al-Awwal 1448 AH',
    hijriRangeAr: '٣٠ صفر – ٠٤ ربيع الأول ١٤٤٨ هـ',
    themeEn: "Surah An-Nazi'at & Punctuality Discipline",
    themeAr: 'حفظ سورة النازعات والانضباط في الحضور',
    targetSurahEn: "Surah An-Nazi'at (Ayahs 1 – 26)",
    targetSurahAr: 'سورة النازعات (الآيات ١ – ٢٦)'
  },
  {
    id: 'week-4',
    weekNumber: 4,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-09-19',
    endDate: '2026-09-23',
    labelEn: 'Week 4 (Sep 19 – Sep 23, 2026)',
    labelAr: 'الأسبوع ٤ (١٩ سبتمبر – ٢٣ سبتمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 19 Sep – Wednesday 23 Sep 2026',
    datesFormattedAr: 'السبت ١٩ سبتمبر – الأربعاء ٢٣ سبتمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '07 Rabi al-Awwal – 11 Rabi al-Awwal 1448 AH',
    hijriRangeAr: '٠٧ ربيع الأول – ١١ ربيع الأول ١٤٤٨ هـ',
    themeEn: 'Manzil Revision Cycle 1 & Daily Adhkar',
    themeAr: 'دورة مراجعة المنزيل الأولى وأذكار اليوم والليلة',
    targetSurahEn: "Surah An-Nazi'at (Ayahs 27 – 46)",
    targetSurahAr: 'سورة النازعات (الآيات ٢٧ – ٤٦)'
  },
  {
    id: 'week-5',
    weekNumber: 5,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-09-26',
    endDate: '2026-09-30',
    labelEn: 'Week 5 (Sep 26 – Sep 30, 2026)',
    labelAr: 'الأسبوع ٥ (٢٦ سبتمبر – ٣٠ سبتمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 26 Sep – Wednesday 30 Sep 2026',
    datesFormattedAr: 'السبت ٢٦ سبتمبر – الأربعاء ٣٠ سبتمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '14 Rabi al-Awwal – 18 Rabi al-Awwal 1448 AH',
    hijriRangeAr: '١٤ ربيع الأول – ١٨ ربيع الأول ١٤٤٨ هـ',
    themeEn: "Surah 'Abasa & Tajweed Rules of Noon Sakinah",
    themeAr: 'حفظ سورة عبس وأحكام النون الساكنة والتنوين',
    targetSurahEn: "Surah 'Abasa (Ayahs 1 – 23)",
    targetSurahAr: 'سورة عبس (الآيات ١ – ٢٣)'
  },
  {
    id: 'week-6',
    weekNumber: 6,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-10-03',
    endDate: '2026-10-07',
    labelEn: 'Week 6 (Oct 03 – Oct 07, 2026)',
    labelAr: 'الأسبوع ٦ (٣ أكتوبر – ٧ أكتوبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 03 Oct – Wednesday 07 Oct 2026',
    datesFormattedAr: 'السبت ٠٣ أكتوبر – الأربعاء ٠٧ أكتوبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '21 Rabi al-Awwal – 25 Rabi al-Awwal 1448 AH',
    hijriRangeAr: '٢١ ربيع الأول – ٢٥ ربيع الأول ١٤٤٨ هـ',
    themeEn: 'Surah At-Takwir & Congregational Salah Etiquette',
    themeAr: 'حفظ سورة التكوير وآداب صلاة الجماعة',
    targetSurahEn: "Surah 'Abasa (Ayahs 24 – 42) & At-Takwir",
    targetSurahAr: 'سورة عبس (٢٤-٤٢) والتكوير'
  },
  {
    id: 'week-7',
    weekNumber: 7,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-10-10',
    endDate: '2026-10-14',
    labelEn: 'Week 7 (Oct 10 – Oct 14, 2026)',
    labelAr: 'الأسبوع ٧ (١٠ أكتوبر – ١٤ أكتوبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 10 Oct – Wednesday 14 Oct 2026',
    datesFormattedAr: 'السبت ١٠ أكتوبر – الأربعاء ١٤ أكتوبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '28 Rabi al-Awwal – 02 Rabi al-Thani 1448 AH',
    hijriRangeAr: '٢٨ ربيع الأول – ٠٢ ربيع الثاني ١٤٤٨ هـ',
    themeEn: 'Surah Al-Infitar & Mutual Brotherhood',
    themeAr: 'حفظ سورة الانفطار وحسن المعاملة والأخوة',
    targetSurahEn: 'Surah Al-Infitar (Full)',
    targetSurahAr: 'سورة الانفطار (كاملة)'
  },
  {
    id: 'week-8',
    weekNumber: 8,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-10-17',
    endDate: '2026-10-21',
    labelEn: 'Week 8 (Oct 17 – Oct 21, 2026) — Mid-Term',
    labelAr: 'الأسبوع ٨ (١٧ أكتوبر – ٢١ أكتوبر ٢٠٢٦) — منتصف الفصل',
    datesFormattedEn: 'Saturday 17 Oct – Wednesday 21 Oct 2026',
    datesFormattedAr: 'السبت ١٧ أكتوبر – الأربعاء ٢١ أكتوبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Mid-Term Assessment',
    statusLabelAr: 'تقييمات منتصف الفصل',
    hijriRangeEn: '05 Rabi al-Thani – 09 Rabi al-Thani 1448 AH',
    hijriRangeAr: '٠٥ ربيع الثاني – ٠٩ ربيع الثاني ١٤٤٨ هـ',
    themeEn: 'Mid-Term Tahfeez Assessments & Academic Review',
    themeAr: 'تقييمات منتصف الفصل لحفظ القرآن ومراجعة الأنشطة',
    targetSurahEn: 'Mid-Term Recitation Exam (Surahs An-Naba to Al-Infitar)',
    targetSurahAr: 'اختبار نصف الفصل (من النبأ إلى الانفطار)'
  },
  {
    id: 'week-9',
    weekNumber: 9,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-10-24',
    endDate: '2026-10-28',
    labelEn: 'Week 9 (Oct 24 – Oct 28, 2026)',
    labelAr: 'الأسبوع ٩ (٢٤ أكتوبر – ٢٨ أكتوبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 24 Oct – Wednesday 28 Oct 2026',
    datesFormattedAr: 'السبت ٢٤ أكتوبر – الأربعاء ٢٨ أكتوبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '12 Rabi al-Thani – 16 Rabi al-Thani 1448 AH',
    hijriRangeAr: '١٢ ربيع الثاني – ١٦ ربيع الثاني ١٤٤٨ هـ',
    themeEn: 'Surah Al-Mutaffifin & Honesty in Conduct',
    themeAr: 'حفظ سورة المطففين وقيمة الأمانة والصدق',
    targetSurahEn: 'Surah Al-Mutaffifin (Ayahs 1 – 18)',
    targetSurahAr: 'سورة المطففين (الآيات ١ – ١٨)'
  },
  {
    id: 'week-10',
    weekNumber: 10,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-10-31',
    endDate: '2026-11-04',
    labelEn: 'Week 10 (Oct 31 – Nov 04, 2026)',
    labelAr: 'الأسبوع ١٠ (٣١ أكتوبر – ٤ نوفمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 31 Oct – Wednesday 04 Nov 2026',
    datesFormattedAr: 'السبت ٣١ أكتوبر – الأربعاء ٠٤ نوفمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '19 Rabi al-Thani – 23 Rabi al-Thani 1448 AH',
    hijriRangeAr: '١٩ ربيع الثاني – ٢٣ ربيع الثاني ١٤٤٨ هـ',
    themeEn: 'Surah Al-Inshiqaq & Fastidious Homework Completion',
    themeAr: 'حفظ سورة الانشقاق والالتزام بالواجبات المنزلية',
    targetSurahEn: 'Surah Al-Inshiqaq (Full)',
    targetSurahAr: 'سورة الانشقاق (كاملة)'
  },
  {
    id: 'week-11',
    weekNumber: 11,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-11-07',
    endDate: '2026-11-11',
    labelEn: 'Week 11 (Nov 07 – Nov 11, 2026)',
    labelAr: 'الأسبوع ١١ (٧ نوفمبر – ١١ نوفمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 07 Nov – Wednesday 11 Nov 2026',
    datesFormattedAr: 'السبت ٠٧ نوفمبر – الأربعاء ١١ نوفمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '26 Rabi al-Thani – 01 Jumada al-Awwal 1448 AH',
    hijriRangeAr: '٢٦ ربيع الثاني – ٠١ جمادى الأولى ١٤٤٨ هـ',
    themeEn: 'Surah Al-Buruj & Patience in Memorization',
    themeAr: 'حفظ سورة البروج ومداومة الصبر في الحفظ',
    targetSurahEn: 'Surah Al-Buruj (Full)',
    targetSurahAr: 'سورة البروج (كاملة)'
  },
  {
    id: 'week-12',
    weekNumber: 12,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-11-14',
    endDate: '2026-11-18',
    labelEn: 'Week 12 (Nov 14 – Nov 18, 2026)',
    labelAr: 'الأسبوع ١٢ (١٤ نوفمبر – ١٨ نوفمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 14 Nov – Wednesday 18 Nov 2026',
    datesFormattedAr: 'السبت ١٤ نوفمبر – الأربعاء ١٨ نوفمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '04 Jumada al-Awwal – 08 Jumada al-Awwal 1448 AH',
    hijriRangeAr: '٠٤ جمادى الأولى – ٠٨ جمادى الأولى ١٤٤٨ هـ',
    themeEn: 'Surah At-Tariq & Halqah Peer Mentorship',
    themeAr: 'حفظ سورة الطارق والتسميع التبادلي بين الطلاب',
    targetSurahEn: 'Surah At-Tariq & Al-A’la',
    targetSurahAr: 'سورتا الطارق والأعلى'
  },
  {
    id: 'week-13',
    weekNumber: 13,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-11-21',
    endDate: '2026-11-25',
    labelEn: 'Week 13 (Nov 21 – Nov 25, 2026)',
    labelAr: 'الأسبوع ١٣ (٢١ نوفمبر – ٢٥ نوفمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 21 Nov – Wednesday 25 Nov 2026',
    datesFormattedAr: 'السبت ٢١ نوفمبر – الأربعاء ٢٥ نوفمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '11 Jumada al-Awwal – 15 Jumada al-Awwal 1448 AH',
    hijriRangeAr: '١١ جمادى الأولى – ١٥ جمادى الأولى ١٤٤٨ هـ',
    themeEn: 'Surah Al-Ghashiyah & Daily Salah Verification',
    themeAr: 'حفظ سورة الغاشية والتحقق من صلوات اليوم',
    targetSurahEn: 'Surah Al-Ghashiyah & Al-Fajr',
    targetSurahAr: 'سورتا الغاشية والفجر'
  },
  {
    id: 'week-14',
    weekNumber: 14,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-11-28',
    endDate: '2026-12-02',
    labelEn: 'Week 14 (Nov 28 – Dec 02, 2026)',
    labelAr: 'الأسبوع ١٤ (٢٨ نوفمبر – ٢ ديسمبر ٢٠٢٦)',
    datesFormattedEn: 'Saturday 28 Nov – Wednesday 02 Dec 2026',
    datesFormattedAr: 'السبت ٢٨ نوفمبر – الأربعاء ٠٢ ديسمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Upcoming',
    statusLabelAr: 'قادم',
    hijriRangeEn: '18 Jumada al-Awwal – 22 Jumada al-Awwal 1448 AH',
    hijriRangeAr: '١٨ جمادى الأولى – ٢٢ جمادى الأولى ١٤٤٨ هـ',
    themeEn: 'Surah Al-Balad to An-Nas Intensive Retention',
    themeAr: 'تثبيت قصار السور من البلد إلى الناس',
    targetSurahEn: 'Surahs Al-Balad to An-Nas',
    targetSurahAr: 'قصار السور (البلد – الناس)'
  },
  {
    id: 'week-15',
    weekNumber: 15,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-12-05',
    endDate: '2026-12-09',
    labelEn: 'Week 15 (Dec 05 – Dec 09, 2026) — Revision',
    labelAr: 'الأسبوع ١٥ (٥ ديسمبر – ٩ ديسمبر ٢٠٢٦) — المراجعة',
    datesFormattedEn: 'Saturday 05 Dec – Wednesday 09 Dec 2026',
    datesFormattedAr: 'السبت ٠٥ ديسمبر – الأربعاء ٠٩ ديسمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Revision Intensive',
    statusLabelAr: 'المراجعة الشاملة',
    hijriRangeEn: '25 Jumada al-Awwal – 29 Jumada al-Awwal 1448 AH',
    hijriRangeAr: '٢٥ جمادى الأولى – ٢٩ جمادى الأولى ١٤٤٨ هـ',
    themeEn: 'Comprehensive Juz 30 Manzil Recitation Intensive',
    themeAr: 'دورة مكثفة لمراجعة جزء عم كاملاً',
    targetSurahEn: 'Juz 30 Complete Review (Amma Juz)',
    targetSurahAr: 'مراجعة جزء عم كاملاً'
  },
  {
    id: 'week-16',
    weekNumber: 16,
    sessionId: 'session-2026-2027',
    termId: 'term-1-2026-2027',
    termType: 'term_1',
    startDate: '2026-12-12',
    endDate: '2026-12-16',
    labelEn: 'Week 16 (Dec 12 – Dec 16, 2026) — Finals',
    labelAr: 'الأسبوع ١٦ (١٢ ديسمبر – ١٦ ديسمبر ٢٠٢٦) — الامتحانات',
    datesFormattedEn: 'Saturday 12 Dec – Wednesday 16 Dec 2026',
    datesFormattedAr: 'السبت ١٢ ديسمبر – الأربعاء ١٦ ديسمبر ٢٠٢٦',
    status: 'upcoming',
    statusLabelEn: 'Final Examinations & Awards',
    statusLabelAr: 'الامتحانات النهائية وتكريم الطلاب',
    hijriRangeEn: '02 Jumada al-Thani – 06 Jumada al-Thani 1448 AH',
    hijriRangeAr: '٠٢ جمادى الثاني – ٠٦ جمادى الثاني ١٤٤٨ هـ',
    themeEn: 'Term Final Examinations, Honors & Grand Assembly',
    themeAr: 'الامتحانات النهائية وتكريم أوائل الطلاب وختام الفصل',
    targetSurahEn: 'Final Board Examination (Oral & Written)',
    targetSurahAr: 'الامتحان النهائي الشامل'
  }
];

export const ACADEMIC_WEEKS: AcademicWeek[] = TERM_1_CANONICAL_WEEKS;

// ---------------------------------------------------------------------
// Default Initial Sessions Seed
// Supporting Session 2026/2027 (Active) and 2025/2026 (Completed historical)
// ---------------------------------------------------------------------
export const INITIAL_ACADEMIC_SESSIONS: AcademicSession[] = [
  {
    id: 'session-2026-2027',
    name: '2026/2027',
    nameAr: '١٤٤٨ - ١٤٤٩ هـ (٢٠٢٦ / ٢٠٢٧ م)',
    startDate: '2026-08-29',
    endDate: '2027-07-21',
    status: 'active',
    isCurrent: true,
    publishedAt: '2026-08-20',
    createdAt: '2026-08-15',
    terms: [
      {
        id: 'term-1-2026-2027',
        termType: 'term_1',
        nameEn: 'First Term (Autumn)',
        nameAr: 'الفصل الدراسي الأول (الخريف)',
        startDate: '2026-08-29',
        endDate: '2026-12-16',
        instructionalWeeksCount: 16,
        weekStartDay: 6, // Saturday
        status: 'active',
        isCurrent: true,
        isPublished: true,
        holidays: [
          {
            id: 'hol-1',
            nameEn: 'Mid-Term Assessment Break',
            nameAr: 'عطلة منتصف الفصل الأول',
            startDate: '2026-10-22',
            endDate: '2026-10-23',
            isHoliday: true
          }
        ]
      },
      {
        id: 'term-2-2026-2027',
        termType: 'term_2',
        nameEn: 'Second Term (Spring)',
        nameAr: 'الفصل الدراسي الثاني (الربيع)',
        startDate: '2027-01-09',
        endDate: '2027-04-14',
        instructionalWeeksCount: 14,
        weekStartDay: 6, // Saturday
        status: 'upcoming',
        isCurrent: false,
        isPublished: true,
        holidays: [
          {
            id: 'hol-2',
            nameEn: 'Ramadan & Eid al-Fitr Recess',
            nameAr: 'إجازة عيد الفطر المبارك',
            startDate: '2027-03-24',
            endDate: '2027-04-02',
            isHoliday: true
          }
        ]
      },
      {
        id: 'term-3-2026-2027',
        termType: 'term_3',
        nameEn: 'Third Term (Summer)',
        nameAr: 'الفصل الدراسي الثالث (الصيف)',
        startDate: '2027-05-01',
        endDate: '2027-07-21',
        instructionalWeeksCount: 12,
        weekStartDay: 6, // Saturday
        status: 'upcoming',
        isCurrent: false,
        isPublished: true,
        holidays: [
          {
            id: 'hol-3',
            nameEn: 'Eid al-Adha Break',
            nameAr: 'إجازة عيد الأضحى المبارك',
            startDate: '2027-06-15',
            endDate: '2027-06-20',
            isHoliday: true
          }
        ]
      }
    ]
  },
  {
    id: 'session-2025-2026',
    name: '2025/2026',
    nameAr: '١٤٤٧ - ١٤٤٨ هـ (٢٠٢٥ / ٢٠٢٦ م)',
    startDate: '2025-08-30',
    endDate: '2026-07-22',
    status: 'completed',
    isCurrent: false,
    publishedAt: '2025-08-20',
    createdAt: '2025-08-10',
    terms: [
      {
        id: 'term-1-2025-2026',
        termType: 'term_1',
        nameEn: 'First Term (Completed Archive)',
        nameAr: 'الفصل الدراسي الأول (أرشيف مكتمل)',
        startDate: '2025-08-30',
        endDate: '2025-12-17',
        instructionalWeeksCount: 16,
        weekStartDay: 6,
        status: 'completed',
        isCurrent: false,
        isPublished: true,
        holidays: []
      },
      {
        id: 'term-2-2025-2026',
        termType: 'term_2',
        nameEn: 'Second Term (Completed Archive)',
        nameAr: 'الفصل الدراسي الثاني (أرشيف مكتمل)',
        startDate: '2026-01-10',
        endDate: '2026-04-15',
        instructionalWeeksCount: 14,
        weekStartDay: 6,
        status: 'completed',
        isCurrent: false,
        isPublished: true,
        holidays: []
      },
      {
        id: 'term-3-2025-2026',
        termType: 'term_3',
        nameEn: 'Third Term (Completed Archive)',
        nameAr: 'الفصل الدراسي الثالث (أرشيف مكتمل)',
        startDate: '2026-05-02',
        endDate: '2026-07-22',
        instructionalWeeksCount: 12,
        weekStartDay: 6,
        status: 'completed',
        isCurrent: false,
        isPublished: true,
        holidays: []
      }
    ]
  }
];

// Helper to format Arabic numerals
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, d => arabicDigits[Number(d)]);
}

// ---------------------------------------------------------------------
// Week Generator: Generates accurate instructional weeks for any term
// Guarantees: Week numbers restart at Week 1 for each term!
// ---------------------------------------------------------------------
export function generateInstructionalWeeks(session: AcademicSession, term: AcademicTerm): AcademicWeek[] {
  // If this is the canonical Term 1 of 2026/2027, return the verified weeks (or slice to count)
  if (term.id === 'term-1-2026-2027' && term.instructionalWeeksCount === 16) {
    return TERM_1_CANONICAL_WEEKS;
  }

  const weeks: AcademicWeek[] = [];
  const weekCount = Math.max(1, term.instructionalWeeksCount || 12);
  const [startY, startM, startD] = term.startDate.split('-').map(Number);
  const baseDate = new Date(startY, (startM || 1) - 1, startD || 1);

  const termSurahPresets: Record<TermType, { en: string; ar: string }[]> = {
    term_1: [
      { en: 'Surah An-Naba (Ayahs 1 – 16)', ar: 'سورة النبأ (الآيات ١ – ١٦)' },
      { en: 'Surah An-Naba (Ayahs 17 – 40)', ar: 'سورة النبأ (الآيات ١٧ – ٤٠)' },
      { en: "Surah An-Nazi'at (Ayahs 1 – 26)", ar: 'سورة النازعات (الآيات ١ – ٢٦)' },
      { en: "Surah An-Nazi'at (Ayahs 27 – 46)", ar: 'سورة النازعات (الآيات ٢٧ – ٤٦)' },
      { en: "Surah 'Abasa (Ayahs 1 – 23)", ar: 'سورة عبس (الآيات ١ – ٢٣)' },
      { en: "Surah 'Abasa (Ayahs 24 – 42) & At-Takwir", ar: 'سورة عبس (٢٤-٤٢) والتكوير' },
      { en: 'Surah Al-Infitar (Full)', ar: 'سورة الانفطار (كاملة)' },
      { en: 'Mid-Term Exam (An-Naba to Al-Infitar)', ar: 'اختبار نصف الفصل' },
      { en: 'Surah Al-Mutaffifin (Ayahs 1 – 18)', ar: 'سورة المطففين (الآيات ١ – ١٨)' },
      { en: 'Surah Al-Inshiqaq (Full)', ar: 'سورة الانشقاق (كاملة)' },
      { en: 'Surah Al-Buruj (Full)', ar: 'سورة البروج (كاملة)' },
      { en: 'Surah At-Tariq & Al-A’la', ar: 'سورتا الطارق والأعلى' },
      { en: 'Surah Al-Ghashiyah & Al-Fajr', ar: 'سورتا الغاشية والفجر' },
      { en: 'Surahs Al-Balad to An-Nas', ar: 'قصار السور (البلد – الناس)' },
      { en: 'Juz 30 Complete Review (Amma Juz)', ar: 'مراجعة جزء عم كاملاً' },
      { en: 'Final Board Examination', ar: 'الامتحان النهائي الشامل' }
    ],
    term_2: [
      { en: 'Surah Al-Mulk (Ayahs 1 – 15)', ar: 'سورة الملك (الآيات ١ – ١٥)' },
      { en: 'Surah Al-Mulk (Ayahs 16 – 30)', ar: 'سورة الملك (الآيات ١٦ – ٣٠)' },
      { en: 'Surah Al-Qalam (Ayahs 1 – 28)', ar: 'سورة القلم (الآيات ١ – ٢٨)' },
      { en: 'Surah Al-Qalam (Ayahs 29 – 52)', ar: 'سورة القلم (الآيات ٢٩ – ٥٢)' },
      { en: 'Surah Al-Haqqah (Ayahs 1 – 25)', ar: 'سورة الحاقة (الآيات ١ – ٢٥)' },
      { en: 'Surah Al-Haqqah (Ayahs 26 – 52)', ar: 'سورة الحاقة (الآيات ٢٦ – ٥٢)' },
      { en: "Surah Al-Ma'arij (Full)", ar: 'سورة المعارج (كاملة)' },
      { en: 'Term 2 Mid-Term Review (Juz Tabarak)', ar: 'مراجعة منتصف الفصل الثاني' },
      { en: 'Surah Nuh (Full)', ar: 'سورة نوح (كاملة)' },
      { en: 'Surah Al-Jinn (Ayahs 1 – 15)', ar: 'سورة الجن (الآيات ١ – ١٥)' },
      { en: 'Surah Al-Muzzammil (Full)', ar: 'سورة المزمل (كاملة)' },
      { en: 'Surah Al-Muddaththir (Full)', ar: 'سورة المدثر (كاملة)' },
      { en: 'Surah Al-Qiyamah & Al-Insan', ar: 'سورتا القيامة والإنسان' },
      { en: 'Term 2 Comprehensive Examination', ar: 'امتحان الفصل الثاني الشامل' }
    ],
    term_3: [
      { en: 'Surah Al-Waqi’ah (Ayahs 1 – 40)', ar: 'سورة الواقعة (الآيات ١ – ٤٠)' },
      { en: 'Surah Al-Waqi’ah (Ayahs 41 – 96)', ar: 'سورة الواقعة (الآيات ٤١ – ٩٦)' },
      { en: 'Surah Ar-Rahman (Ayahs 1 – 35)', ar: 'سورة الرحمن (الآيات ١ – ٣٥)' },
      { en: 'Surah Ar-Rahman (Ayahs 36 – 78)', ar: 'سورة الرحمن (الآيات ٣٦ – ٧٨)' },
      { en: 'Surah Al-Qamar (Full)', ar: 'سورة القمر (كاملة)' },
      { en: 'Surah An-Najm (Full)', ar: 'سورة النجم (كاملة)' },
      { en: 'Term 3 Mid-Term Revision', ar: 'مراجعة منتصف الفصل الثالث' },
      { en: 'Surah Qaf (Full)', ar: 'سورة ق (كاملة)' },
      { en: 'Surah Al-Hujurat (Full)', ar: 'سورة الحجرات (كاملة)' },
      { en: 'Surah Al-Fath (Full)', ar: 'سورة الفتح (كاملة)' },
      { en: 'Annual Khatmul Qur’an & Muraja’ah', ar: 'ختم ومراجعة المصحف السنوية' },
      { en: 'Grand Tahfeez Convocation & Honors', ar: 'الحفل الختامي والتكريم السنوي' }
    ]
  };

  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const pad = (n: number) => String(n).padStart(2, '0');

  for (let w = 1; w <= weekCount; w++) {
    const curStart = new Date(baseDate);
    curStart.setDate(baseDate.getDate() + (w - 1) * 7);

    const curEnd = new Date(curStart);
    curEnd.setDate(curStart.getDate() + 4); // Saturday to Wednesday

    const startStr = `${curStart.getFullYear()}-${pad(curStart.getMonth() + 1)}-${pad(curStart.getDate())}`;
    const endStr = `${curEnd.getFullYear()}-${pad(curEnd.getMonth() + 1)}-${pad(curEnd.getDate())}`;

    const startDNum = curStart.getDate();
    const endDNum = curEnd.getDate();
    const startMNameEn = monthNamesEn[curStart.getMonth()];
    const endMNameEn = monthNamesEn[curEnd.getMonth()];
    const startMNameAr = monthNamesAr[curStart.getMonth()];
    const endMNameAr = monthNamesAr[curEnd.getMonth()];

    const datesEn = `${startMNameEn} ${startDNum} – ${endMNameEn} ${endDNum}, ${curEnd.getFullYear()}`;
    const datesAr = `${startDNum} ${startMNameAr} – ${endDNum} ${endMNameAr} ${curEnd.getFullYear()}`;

    // Determine week status based on today or term status
    const today = new Date().toISOString().split('T')[0];
    let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
    let statusLabelEn = 'Upcoming';
    let statusLabelAr = 'قادم';

    if (term.status === 'completed' || endStr < today) {
      status = 'completed';
      statusLabelEn = 'Completed';
      statusLabelAr = 'مكتمل';
    } else if (today >= startStr && today <= endStr) {
      status = 'current';
      statusLabelEn = 'Current Week';
      statusLabelAr = 'الأسبوع الحالي';
    }

    const presets = termSurahPresets[term.termType] || termSurahPresets.term_1;
    const preset = presets[(w - 1) % presets.length];

    weeks.push({
      id: `week-${term.id}-${w}`,
      weekNumber: w,
      sessionId: session.id,
      termId: term.id,
      termType: term.termType,
      startDate: startStr,
      endDate: endStr,
      labelEn: `Week ${w} (${datesEn})${status === 'current' ? ' — Current' : ''}`,
      labelAr: `الأسبوع ${toArabicNumerals(w)} (${datesAr})${status === 'current' ? ' — الحالي' : ''}`,
      datesFormattedEn: `Saturday ${startDNum} ${startMNameEn} – Wednesday ${endDNum} ${endMNameEn} ${curEnd.getFullYear()}`,
      datesFormattedAr: `السبت ${startDNum} ${startMNameAr} – الأربعاء ${endDNum} ${endMNameAr} ${curEnd.getFullYear()}`,
      status,
      statusLabelEn,
      statusLabelAr,
      hijriRangeEn: `Week ${w} • Safar/Rabi 1448 AH`,
      hijriRangeAr: `الأسبوع ${toArabicNumerals(w)} • ١٤٤٨ هـ`,
      themeEn: `Instructional Week ${w}: Tajweed Excellence & Adab Discipline`,
      themeAr: `الأسبوع ${toArabicNumerals(w)}: إتقان التجويد والانضباط في الحلقة`,
      targetSurahEn: preset.en,
      targetSurahAr: preset.ar
    });
  }

  return weeks;
}

// ---------------------------------------------------------------------
// Validation Engine
// ---------------------------------------------------------------------
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSession(session: Partial<AcademicSession>, existingSessions: AcademicSession[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!session.name || session.name.trim().length === 0) {
    errors.push('Session name is required (e.g. 2026/2027).');
  }

  // Duplicate name check
  const duplicate = existingSessions.find(
    s => s.id !== session.id && s.name.trim().toLowerCase() === (session.name || '').trim().toLowerCase()
  );
  if (duplicate) {
    errors.push(`An academic session named "${session.name}" already exists.`);
  }

  if (!session.startDate || !session.endDate) {
    errors.push('Session start and end dates are required.');
  } else if (session.startDate >= session.endDate) {
    errors.push('Session start date must precede the end date.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateTerm(
  term: Partial<AcademicTerm>,
  session: AcademicSession,
  otherTermsInSession: AcademicTerm[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!term.nameEn || term.nameEn.trim().length === 0) {
    errors.push('Term title in English is required.');
  }

  if (!term.startDate || !term.endDate) {
    errors.push('Term start and end dates are required.');
  } else {
    if (term.startDate >= term.endDate) {
      errors.push('Term start date must precede the term end date.');
    }
    if (session.startDate && term.startDate < session.startDate) {
      errors.push(`Term start date (${term.startDate}) cannot be earlier than session start (${session.startDate}).`);
    }
    if (session.endDate && term.endDate > session.endDate) {
      errors.push(`Term end date (${term.endDate}) cannot be later than session end (${session.endDate}).`);
    }
  }

  if (!term.instructionalWeeksCount || term.instructionalWeeksCount < 1) {
    errors.push('Number of instructional weeks must be at least 1.');
  } else if (term.instructionalWeeksCount > 24) {
    errors.push('Number of instructional weeks cannot exceed 24.');
  }

  // Overlap check with other terms in the same session
  if (term.startDate && term.endDate) {
    for (const other of otherTermsInSession) {
      if (other.id === term.id) continue;
      if (!other.startDate || !other.endDate) continue;

      const hasOverlap = (
        (term.startDate >= other.startDate && term.startDate <= other.endDate) ||
        (term.endDate >= other.startDate && term.endDate <= other.endDate) ||
        (term.startDate <= other.startDate && term.endDate >= other.endDate)
      );

      if (hasOverlap) {
        errors.push(`Term date range (${term.startDate} to ${term.endDate}) overlaps with ${other.nameEn} (${other.startDate} to ${other.endDate}).`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateWeekBelongsToTerm(
  sessionId: string, 
  termId: string, 
  weekNumber: number, 
  sessions: AcademicSession[]
): boolean {
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return false;
  const term = session.terms.find(t => t.id === termId);
  if (!term) return false;
  return weekNumber >= 1 && weekNumber <= term.instructionalWeeksCount;
}

// ---------------------------------------------------------------------
// Backward Compatibility Functions for Existing Views
// ---------------------------------------------------------------------
export function getCurrentAcademicWeek(): AcademicWeek {
  return ACADEMIC_WEEKS.find(w => w.status === 'current') || ACADEMIC_WEEKS[1] || ACADEMIC_WEEKS[0];
}

export function getAcademicWeekByNumber(weekNumber: number): AcademicWeek | undefined {
  return ACADEMIC_WEEKS.find(w => w.weekNumber === weekNumber);
}

export function getAcademicWeekByDate(dateStr: string): AcademicWeek {
  const match = ACADEMIC_WEEKS.find(w => dateStr >= w.startDate && dateStr <= w.endDate);
  if (match) return match;
  if (dateStr < ACADEMIC_TERM_START) return ACADEMIC_WEEKS[0];
  return getCurrentAcademicWeek();
}

export interface SchoolDay {
  date: string;
  dayNameEn: string;
  dayNameAr: string;
  shortDate: string;
  displayFormattedEn: string;
  displayFormattedAr: string;
}

/**
 * Generates the 5 school days for a given academic week starting on Saturday:
 * Day 0: Saturday (السبت)
 * Day 1: Sunday (الأحد)
 * Day 2: Monday (الإثنين)
 * Day 3: Tuesday (الثلاثاء)
 * Day 4: Wednesday (الأربعاء)
 */
export function getSchoolDaysForWeek(startDate: string): SchoolDay[] {
  const [y, m, d] = startDate.split('-').map(Number);
  const base = new Date(y, (m || 1) - 1, d || 1);

  const dayNames = [
    { en: 'Saturday', ar: 'السبت' },
    { en: 'Sunday', ar: 'الأحد' },
    { en: 'Monday', ar: 'الإثنين' },
    { en: 'Tuesday', ar: 'الثلاثاء' },
    { en: 'Wednesday', ar: 'الأربعاء' }
  ];

  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  return dayNames.map((name, index) => {
    const cur = new Date(base);
    cur.setDate(base.getDate() + index);

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
    const dayNum = cur.getDate();
    const mIdx = cur.getMonth();
    const shortDate = `${pad(cur.getMonth() + 1)}/${pad(dayNum)}`;

    return {
      date: dateStr,
      dayNameEn: name.en,
      dayNameAr: name.ar,
      shortDate,
      displayFormattedEn: `${dayNum} ${monthNamesEn[mIdx]} ${cur.getFullYear()}`,
      displayFormattedAr: `${dayNum} ${monthNamesAr[mIdx]} ${cur.getFullYear()}`
    };
  });
}

/**
 * Returns the English and Arabic day names for any date string (YYYY-MM-DD)
 */
export function getDayOfWeekName(dateStr: string): { dayNameEn: string; dayNameAr: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const dayIndex = dt.getDay(); // 0 is Sunday, 6 is Saturday
  const days: Record<number, { en: string; ar: string }> = {
    6: { en: 'Saturday', ar: 'السبت' },
    0: { en: 'Sunday', ar: 'الأحد' },
    1: { en: 'Monday', ar: 'الإثنين' },
    2: { en: 'Tuesday', ar: 'الثلاثاء' },
    3: { en: 'Wednesday', ar: 'الأربعاء' },
    4: { en: 'Thursday', ar: 'الخميس' },
    5: { en: 'Friday', ar: 'الجمعة' }
  };
  return {
    dayNameEn: days[dayIndex]?.en || 'Saturday',
    dayNameAr: days[dayIndex]?.ar || 'السبت'
  };
}
