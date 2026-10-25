import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  // Brand & Header
  appTitle: string;
  classTag: string;
  subHeader: string;
  boysSection: string;
  attendanceBadge: string;
  sabaqsBadge: string;
  logQuranBtn: string;
  resetDataBtn: string;
  resetConfirm: string;
  
  // Navigation Tabs
  navOverview: string;
  navStudents: string;
  navQuran: string;
  navAttendance: string;
  navActivities: string;
  navEvaluations: string;
  navAnnouncements: string;
  navWeeklyReports: string;
  
  // Dashboard Overview
  morningHalaqahActive: string;
  greetingUstadh: string;
  heroDescription: string;
  markRollCallBtn: string;
  logRecitationBtn: string;
  weeklyReportCardsBtn: string;
  attendanceToday: string;
  studentsCount: string;
  sabaqNewLesson: string;
  recitedToday: string;
  waitingInQueue: string;
  classAdab: string;
  ratingOutOfFive: string;
  mannersPill: string;
  evaluationsRecorded: string;
  classFiveRoster: string;
  maleStudents: string;
  fullRollPill: string;
  juzRange: string;
  todayRecitationProgress: string;
  completedOfStudents: string;
  clickToHearSabaq: string;
  fullHifzLedger: string;
  reciteBtn: string;
  parentAnnouncements: string;
  manageBtn: string;
  broadcastNoticeBtn: string;
  
  // Student Records
  searchStudentsPlaceholder: string;
  filterJuz: string;
  allJuzLevels: string;
  filterGroup: string;
  allGroups: string;
  group: string;
  groupKhaleelulHussary: string;
  groupSeddeqMinshawy: string;
  groupAbdulbasit: string;
  addStudent: string;
  editStudent: string;
  studentProfile: string;
  rollNo: string;
  juz: string;
  parentName: string;
  parentPhone: string;
  address: string;
  attendanceRate: string;
  adabAvg: string;
  memorizedJuz: string;
  quickLogQuran: string;
  grid: string;
  table: string;
  fullName: string;
  arabicName: string;
  
  // Attendance & Calendar
  morningSession: string;
  afternoonSession: string;
  markAllPresent: string;
  attendanceCalendar: string;
  streak: string;
  days: string;
  
  // Quran Hifz Tracker
  newSabaq: string;
  sabqi: string;
  manzil: string;
  surah: string;
  ayahRange: string;
  mistakes: string;
  corrected: string;
  uncorrected: string;
  tajweedRating: string;
  teacherNotes: string;
  saveLog: string;
  
  // Evaluations & Weekly Reports
  homework: string;
  participation: string;
  neatness: string;
  respect: string;
  selfControl: string;
  overallAdabScore: string;
  generateWeeklySummary: string;
  printReportCard: string;
  sendToParent: string;
  
  // Common Statuses & Words
  present: string;
  late: string;
  absent: string;
  excused: string;
  students: string;
  date: string;
  all: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  close: string;
  search: string;
  filter: string;
  actions: string;
  status: string;
  notes: string;
  overallScore: string;
  
  // Behavior Notes (Private)
  behaviorNotes: string;
  privateNotesTag: string;
  addBehaviorNote: string;
  incidentType: string;
  incidentPraise: string;
  incidentObservation: string;
  incidentConcern: string;
  incidentActionNeeded: string;
  categoryTag: string;
  noteTimestamp: string;
  saveBehaviorNote: string;
  noBehaviorNotesYet: string;
  privateTeacherOnlyNotice: string;

  // Language Switcher
  language: string;
  english: string;
  arabic: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Al-Millah Class Management',
    classTag: 'Class Five',
    subHeader: 'مَعهَدُ المِلَّةِ الإِسْلَامِي — الصَّفُّ الخَامِسُ',
    boysSection: 'Boys Section (20 Students)',
    attendanceBadge: 'Attendance:',
    sabaqsBadge: 'Sabaqs:',
    logQuranBtn: 'Log Qur’an',
    resetDataBtn: 'Reset Sample Data',
    resetConfirm: 'Reset all sample records back to initial state?',
    
    navOverview: 'Dashboard',
    navStudents: 'Student Records',
    navQuran: 'Qur’an Hifz Tracker',
    navAttendance: 'Attendance',
    navActivities: 'Daily Activities Tracker',
    navEvaluations: 'Activity & Adab',
    navAnnouncements: 'Parent Notices',
    navWeeklyReports: 'Weekly Reports',
    
    morningHalaqahActive: 'Morning Halaqah Active',
    greetingUstadh: "Ahlan wa Sahlan, Ustadh Muhammad Shaya'u!",
    heroDescription: 'Class Five memorization and daily conduct center. Monitor Sabaq, Sabqi, and Manzil progress with daily evaluations.',
    markRollCallBtn: 'Mark Roll Call',
    logRecitationBtn: 'Log Student Recitation',
    weeklyReportCardsBtn: 'Weekly Report Cards',
    attendanceToday: 'Attendance Today',
    studentsCount: 'students',
    sabaqNewLesson: 'Sabaq (New Lesson)',
    recitedToday: 'recited today',
    waitingInQueue: 'Waiting in queue:',
    classAdab: 'Class Adab & Akhlaq',
    ratingOutOfFive: '/ 5.0 rating',
    mannersPill: 'Manners',
    evaluationsRecorded: 'Evaluations recorded:',
    classFiveRoster: 'Class Five Roster',
    maleStudents: 'male students',
    fullRollPill: 'Full Roll',
    juzRange: 'Range: Juz 2 to Juz 7',
    todayRecitationProgress: "Today's Halaqah Recitation Progress",
    completedOfStudents: 'completed',
    clickToHearSabaq: 'Click any student to quickly hear and log their Sabaq (New Lesson)',
    fullHifzLedger: 'Full Hifz Ledger',
    reciteBtn: 'Recite',
    parentAnnouncements: 'Parent Announcements',
    manageBtn: 'Manage',
    broadcastNoticeBtn: 'Broadcast Notice to WhatsApp',
    
    searchStudentsPlaceholder: 'Search by student name, roll #, Arabic...',
    filterJuz: 'Filter Juz:',
    allJuzLevels: 'All Juz Levels',
    filterGroup: 'Filter Group:',
    allGroups: 'All Groups',
    group: 'Group',
    groupKhaleelulHussary: 'Group Khaleelul Hussary',
    groupSeddeqMinshawy: 'Group Seddeq Minshawy',
    groupAbdulbasit: 'Group Abdulbasiɗ',
    addStudent: 'Add Student',
    editStudent: 'Edit Student',
    studentProfile: 'Student Profile',
    rollNo: 'Roll #',
    juz: 'Juz',
    parentName: 'Parent / Guardian',
    parentPhone: 'Parent Phone',
    address: 'Home Address',
    attendanceRate: 'Attendance Rate',
    adabAvg: 'Avg Adab',
    memorizedJuz: 'Memorized',
    quickLogQuran: 'Log Qur’an',
    grid: 'Grid',
    table: 'Table',
    fullName: 'Full Name',
    arabicName: 'Arabic Name',
    
    morningSession: 'Morning Session (Halaqah)',
    afternoonSession: 'Afternoon Session',
    markAllPresent: 'Mark All Present',
    attendanceCalendar: 'Monthly Attendance Streaks',
    streak: 'Streak',
    days: 'days',
    
    newSabaq: 'Sabaq (New Lesson)',
    sabqi: 'Sabqi (Recent Review)',
    manzil: 'Manzil (Old Revision)',
    surah: 'Surah',
    ayahRange: 'Ayah Range',
    mistakes: 'Mistakes',
    corrected: 'Corrected',
    uncorrected: 'Uncorrected',
    tajweedRating: 'Tajweed & Fluency',
    teacherNotes: 'Teacher Notes',
    saveLog: 'Save Recitation Log',
    
    homework: 'Homework',
    participation: 'Class Participation',
    neatness: 'Neatness & Uniform',
    respect: 'Respect for Teachers & Peers',
    selfControl: 'Self Control & Focus',
    overallAdabScore: 'Overall Conduct Score',
    generateWeeklySummary: 'Generate Weekly Summary',
    printReportCard: 'Print Report Card',
    sendToParent: 'Share with Parent via WhatsApp',
    
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    excused: 'Excused / Sick',
    students: 'Students',
    date: 'Date',
    all: 'All',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    search: 'Search...',
    filter: 'Filter',
    actions: 'Actions',
    status: 'Status',
    notes: 'Notes',
    overallScore: 'Overall Score',
    
    // Behavior Notes (Private)
    behaviorNotes: 'Behavior Notes (Private)',
    privateNotesTag: '🔒 Private Ustadh Log',
    addBehaviorNote: 'Add Behavior Note',
    incidentType: 'Incident / Note Type',
    incidentPraise: '🌟 Praise / Commendation',
    incidentObservation: '📝 Conduct Observation',
    incidentConcern: '⚠️ Mild Concern',
    incidentActionNeeded: '🚨 Follow-up Needed',
    categoryTag: 'Conduct Category',
    noteTimestamp: 'Timestamp',
    saveBehaviorNote: 'Save Note to Student Dossier',
    noBehaviorNotesYet: 'No behavior notes logged for this student yet.',
    privateTeacherOnlyNotice: 'Confidential: Visible only to teachers and administrators. Not printed on public report cards.',

    language: 'Language',
    english: 'English',
    arabic: 'العربية',
  },
  ar: {
    appTitle: 'نظام إدارة معهد المِلَّة',
    classTag: 'الصف الخامس',
    subHeader: 'مَعهَدُ المِلَّةِ الإِسْلَامِي — الصَّفُّ الخَامِسُ',
    boysSection: 'قسم البنين (٢٠ طالباً)',
    attendanceBadge: 'الحضور:',
    sabaqsBadge: 'التسميع:',
    logQuranBtn: 'تسميع القرآن',
    resetDataBtn: 'إعادة ضبط البيانات',
    resetConfirm: 'هل ترغب في إعادة ضبط البيانات التجريبية إلى حالتها الأصلية؟',
    
    navOverview: 'لوحة التحكم',
    navStudents: 'سجلات الطلاب',
    navQuran: 'متابعة حفظ القرآن',
    navAttendance: 'سجل الحضور',
    navActivities: 'متابعة الأنشطة اليومية',
    navEvaluations: 'الأنشطة والآداب',
    navAnnouncements: 'إشعارات أولياء الأمور',
    navWeeklyReports: 'التقارير الأسبوعية',
    
    morningHalaqahActive: 'حلقة الصباح نشطة',
    greetingUstadh: 'أهلاً وسهلاً، فضيلة الأستاذ محمد شايعو!',
    heroDescription: 'مركز متابعة الحفظ والآداب اليومية لطلاب الصف الخامس. متابعة السبق والسبقي والمنزل وتقييم الأنشطة اليومية.',
    markRollCallBtn: 'تسجيل الحضور',
    logRecitationBtn: 'تسجيل تسميع الطالب',
    weeklyReportCardsBtn: 'بطاقات التقرير الأسبوعي',
    attendanceToday: 'حضور اليوم',
    studentsCount: 'طلاب',
    sabaqNewLesson: 'السَّبَق (الدرس الجديد)',
    recitedToday: 'أتموا التسميع اليوم',
    waitingInQueue: 'في انتظار التسميع:',
    classAdab: 'الآداب والأخلاق',
    ratingOutOfFive: '/ ٥٫٠ التقييم',
    mannersPill: 'الأخلاق',
    evaluationsRecorded: 'التقييمات المرصودة:',
    classFiveRoster: 'قائمة طلاب الصف الخامس',
    maleStudents: 'طالباً بالصف',
    fullRollPill: 'القيد الكامل',
    juzRange: 'النطاق: من الجزء ٢ إلى ٧',
    todayRecitationProgress: 'مستوى التسميع في حلقة اليوم',
    completedOfStudents: 'أكملوا التسميع',
    clickToHearSabaq: 'اضغط على أي طالب للاستماع وتدوين الدرس الجديد (السَّبَق)',
    fullHifzLedger: 'سجل الحفظ الكامل',
    reciteBtn: 'تسميع',
    parentAnnouncements: 'إعلانات أولياء الأمور',
    manageBtn: 'إدارة',
    broadcastNoticeBtn: 'إرسال الإشعار عبر واتساب',
    
    searchStudentsPlaceholder: 'ابحث باسم الطالب، رقم القيد، الاسم بالعربية...',
    filterJuz: 'تصفية الأجزاء:',
    allJuzLevels: 'جميع مستويات الأجزاء',
    filterGroup: 'تصفية المجموعة:',
    allGroups: 'جميع المجموعات',
    group: 'المجموعة',
    groupKhaleelulHussary: 'مجموعة خليل الحصري',
    groupSeddeqMinshawy: 'مجموعة صدّيق المنشاوي',
    groupAbdulbasit: 'مجموعة عبد الباسط',
    addStudent: 'إضافة طالب',
    editStudent: 'تعديل بيانات الطالب',
    studentProfile: 'الملف التعريفي للطالب',
    rollNo: 'رقم القيد',
    juz: 'الجزء',
    parentName: 'ولي الأمر',
    parentPhone: 'هاتف ولي الأمر',
    address: 'عنوان السكن',
    attendanceRate: 'نسبة الحضور',
    adabAvg: 'معدل الآداب',
    memorizedJuz: 'المحفوظ',
    quickLogQuran: 'تسميع القرآن',
    grid: 'شبكة',
    table: 'جدول',
    fullName: 'الاسم الإنجليزي',
    arabicName: 'الاسم بالعربية',
    
    morningSession: 'الجلسة الصباحية (حلقة الحفظ)',
    afternoonSession: 'الجلسة المسائية',
    markAllPresent: 'رصد حضور الجميع',
    attendanceCalendar: 'سلسلة الحضور الشهرية',
    streak: 'سلسلة متواصلة',
    days: 'أيام',
    
    newSabaq: 'السَّبَق (الدرس الجديد)',
    sabqi: 'السَّبَقِي (المراجعة القريبة)',
    manzil: 'المَنْزِل (المراجعة القديمة)',
    surah: 'السورة',
    ayahRange: 'نطاق الآيات',
    mistakes: 'الأخطاء',
    corrected: 'تم تصحيحها',
    uncorrected: 'غير مصححة',
    tajweedRating: 'التجويد والإتقان',
    teacherNotes: 'ملاحظات المعلم',
    saveLog: 'حفظ سجل التسميع',
    
    homework: 'الواجب المنزلي',
    participation: 'المشاركة الصفية',
    neatness: 'النظافة والزي المدرسي',
    respect: 'احترام المعلمين والزملاء',
    selfControl: 'الانضباط والتركيز',
    overallAdabScore: 'درجة السلوك الإجمالية',
    generateWeeklySummary: 'إصدار التقرير الأسبوعي',
    printReportCard: 'طباعة بطاقة التقرير',
    sendToParent: 'إرسال لولي الأمر عبر واتساب',
    
    present: 'حاضر',
    late: 'متأخر',
    absent: 'غائب',
    excused: 'معذور / مريض',
    students: 'الطلاب',
    date: 'التاريخ',
    all: 'الكل',
    save: 'حفظ التعديلات',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    close: 'إغلاق',
    search: 'بحث...',
    filter: 'تصفية',
    actions: 'إجراءات',
    status: 'الحالة',
    notes: 'ملاحظات',
    overallScore: 'الدرجة الإجمالية',
    
    // Behavior Notes (Private)
    behaviorNotes: 'ملاحظات السلوك (خاصة بالمعلم)',
    privateNotesTag: '🔒 سجل الأستاذ السري',
    addBehaviorNote: 'إضافة ملاحظة سلوكية',
    incidentType: 'نوع الملاحظة / الواقعة',
    incidentPraise: '🌟 ثناء وإشادة خلقية',
    incidentObservation: '📝 ملاحظة سلوكية عامة',
    incidentConcern: '⚠️ تنبيه / لفت نظر',
    incidentActionNeeded: '🚨 يحتاج متابعة وتوجيه',
    categoryTag: 'تصنيف السلوك',
    noteTimestamp: 'التوقيت الزمني',
    saveBehaviorNote: 'حفظ الملاحظة في ملف الطالب',
    noBehaviorNotesYet: 'لا توجد ملاحظات سلوكية مسجلة لهذا الطالب حتى الآن.',
    privateTeacherOnlyNotice: 'سري وخاص: مخصص للمعلمين والإدارة فقط ولا يظهر في التقارير الأسبوعية للآباء.',

    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
  }
};

interface LanguageContextType {
  language: Language;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'al_millah_app_language_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  const direction: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Synchronize document dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
