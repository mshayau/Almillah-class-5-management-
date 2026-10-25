export type TajweedRating = 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'maqbool' | 'daeef';

export type QuranLogCategory = 'sabaq' | 'sabqi' | 'manzil';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'sick' | 'excused';

export type AttendanceSession = 'morning' | 'dhuhr' | 'afternoon';

export type SalahStatus = 'with_jamaah' | 'individual' | 'missed' | 'excused';

export type HomeworkStatus = 'completed' | 'partial' | 'incomplete';

export type AnnouncementCategory = 'general' | 'urgent' | 'exam' | 'quran_event' | 'holiday';

// ---------------------------------------------------------------------
// 1. Students Model
// ---------------------------------------------------------------------
export type StudentGroup = 'khaleelul_hussary' | 'seddeq_minshawy' | 'abdulbasit';

export interface Student {
  id: string;
  rollNumber: number;
  fullName: string;
  studentName?: string; // Canonical alias
  arabicName: string;
  className?: string; // e.g. "Class Five"
  dateOfBirth?: string;
  parentName: string;
  parentPhone: string;
  parentPhoneNumber?: string; // Canonical alias
  parentEmail: string;
  address?: string;
  avatarUrl: string;
  studentPhoto?: string; // Canonical alias
  group?: StudentGroup; // 'khaleelul_hussary' | 'seddeq_minshawy' | 'abdulbasit'
  currentJuz?: number;
  totalMemorizedJuz: number;
  enrollmentStatus: 'active' | 'excused' | 'transferred';
  notes?: string;
}

export interface SurahInfo {
  number: number;
  name: string;
  arabicName: string;
  ayahCount: number;
  juzNumber: number;
}

// ---------------------------------------------------------------------
// 2. Memorization Records Model
// ---------------------------------------------------------------------
export interface MemorizationRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  surahName: string;
  surahNumber?: number;
  ayahRange: string; // e.g. "1-25"
  ayahStart?: number;
  ayahEnd?: number;
  newMemorization: boolean; // TRUE: Sabaq, FALSE: Revision
  mistakes: number;
  correctedMistakes: number;
  uncorrectedMistakes: number;
  tajweedRating?: TajweedRating;
  teacherNotes: string;
}

export interface QuranLog {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  category: QuranLogCategory;
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  ayahStart: number;
  ayahEnd: number;
  juzNumber: number;
  tajweedRating: TajweedRating;
  mistakeCount: number;
  status: 'passed' | 'repeat' | 'in_progress';
  teacherFeedback: string;
  correctedMistakes?: number;
  uncorrectedMistakes?: number;
  // Phase 3: Reference Dataset page & cross-surah extensions
  endSurahNumber?: number;
  endSurahName?: string;
  endSurahArabicName?: string;
  startPage?: number;
  endPage?: number;
  totalPagesCovered?: number;
  isCrossSurah?: boolean;
  isCrossPage?: boolean;
  // Phase 5: Daily Memorization recording & weekly target extensions
  reviewStatus?: MemorizationReviewStatus;
  sessionId?: string;
  termId?: string;
  weekNumber?: number;
  dayOfWeek?: string;
  actualSubmissionDate?: string;
  entryTimestamp?: string;
  isLateEntry?: boolean;
  teacher?: string;
  weeklyTargetId?: string;
}

// ---------------------------------------------------------------------
// 3. Attendance Model
// ---------------------------------------------------------------------
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  session: AttendanceSession;
  status: AttendanceStatus;
  arrivalTime?: string;
  notes?: string;
}

// ---------------------------------------------------------------------
// 4. Daily Activities Model
// ---------------------------------------------------------------------
export type ActivityCategory = 
  | 'adab'
  | 'attentiveness'
  | 'neatness'
  | 'performance'
  | 'coming_earlier'
  | 'good_manner'
  | 'quran_circle'
  | 'adhkar_dua'
  | 'salah_sunnah'
  | 'tajweed_drill'
  | 'islamic_studies'
  | 'wudu_taharah'
  | 'arabic_calligraphy'
  | 'adab_service'
  | 'peer_tutoring'
  | 'other'
  | (string & {});

export type ActivityStatus = 'completed' | 'in_progress' | 'needs_practice' | 'excused';

export interface StudentActivity {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  activityType: ActivityCategory;
  title: string;
  titleAr?: string;
  description?: string;
  marks: number; // e.g. 10.0 out of 10
  maxMarks: number; // e.g. 10
  status: ActivityStatus;
  durationMinutes: number; // e.g. 25
  notes?: string;
  recordedBy: string;
  timestamp?: string;
}

export interface DailyActivity {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  quranMemorizationPct: number; // 0-100%
  homeworkPct: number; // 0-100%
  classParticipationPct: number; // 0-100%
  neatnessPct: number; // 0-100%
  respectPct: number; // 0-100%
  selfControlPct: number; // 0-100%
  notes: string;
}

export interface DailyEvaluation {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  adabScore: number; // 1 to 5
  salahPerformance: SalahStatus;
  islamicStudiesPrep: number; // 1 to 5
  homeworkStatus: HomeworkStatus;
  conductNotes: string;
  awardedBadges: string[];
  // Linked activity metrics
  quranMemorizationPct?: number;
  homeworkPct?: number;
  classParticipationPct?: number;
  neatnessPct?: number;
  respectPct?: number;
  selfControlPct?: number;
}

// ---------------------------------------------------------------------
// 4b. Teacher Behavior Notes (Private Classroom Conduct Logs)
// ---------------------------------------------------------------------
export type BehaviorIncidentType = 'praise' | 'observation' | 'concern' | 'action_needed';

export interface BehaviorNote {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // e.g. "2026-09-03 10:15 AM" or formatted string
  note: string;
  category: string;
  incidentType: BehaviorIncidentType;
  isPrivate: boolean; // Private/confidential to Ustadh & Administration
  authorName: string;
}

// ---------------------------------------------------------------------
// 5. Announcements Model
// ---------------------------------------------------------------------
export interface Announcement {
  id: string;
  title: string;
  message?: string; // Canonical alias for content
  content: string;
  category: AnnouncementCategory;
  targetClass: string;
  createdAt: string;
  date?: string; // Canonical alias for createdAt
  pinned: boolean;
  author: string;
  parents?: string; // Target parents / guardians description
}

// ---------------------------------------------------------------------
// 6. Weekly Reports Model
// ---------------------------------------------------------------------
export interface WeeklyReportRecord {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  attendancePercentage: number;
  memorizationPercentage: number;
  activityPercentage: number;
  overallPercentage: number;
  teacherComment: string;
}

export interface TeacherDetails {
  name: string;
  arabicName: string;
  role: string;
  arabicRole: string;
  title: string;
  department: string;
  credentials: string;
  email: string;
  phone?: string;
  officeHours?: string;
  halaqahGroup?: string;
  halaqahGroupAr?: string;
  reciterPatron?: string;
}

export interface WeeklyAttendanceSummary {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  excusedDays: number;
  absentDays: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

export interface WeeklyReportSummary {
  studentId: string;
  student: Student;
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalAyahsMemorized: number;
  attendanceRate: number;
  attendancePercentage?: number; // Canonical alias
  memorizationPercentage?: number; // Canonical alias
  activityPercentage?: number; // Canonical alias
  overallPercentage?: number; // Canonical alias
  teacherComment?: string; // Canonical alias
  presentDays: number;
  totalDays: number;
  averageAdabScore: number;
  salahRate: number;
  recentSabaq: QuranLog[];
  recentSabqi: QuranLog[];
  recentManzil: QuranLog[];
  quranRecitations?: QuranLog[];
  overallScore?: number;
  rank?: number;
  weeklyRank?: number;
  isBestStudent?: boolean;
  teacherRemarks: string;
  gradeStatus: 'Mumtaz (Distinction)' | 'Jayyid Jiddan (Very Good)' | 'Jayyid (Good)' | 'Needs Improvement';
  // Detailed auto-calculated metrics
  activitiesCount?: number;
  activitiesMarksObtained?: number;
  activitiesMarksMax?: number;
  activitiesScorePct?: number;
  categoryBreakdown?: Partial<Record<ActivityCategory, { marks: number; maxMarks: number; count: number; percentage: number }>>;
  activitiesList?: StudentActivity[];
  teacherDetails?: TeacherDetails;
  attendanceSummary?: WeeklyAttendanceSummary;
  attendanceRecords?: AttendanceRecord[];
  performanceScore?: number;
  attendanceScore?: number;
  conductScore?: number;
  compositeScore?: number;
}

export type ActiveTab = 
  | 'overview'
  | 'students'
  | 'quran'
  | 'attendance'
  | 'activities'
  | 'evaluations'
  | 'announcements'
  | 'weekly_reports'
  | 'calendar';

// ---------------------------------------------------------------------
// 7. Authentication Model
// ---------------------------------------------------------------------
export interface AuthUser {
  email: string;
  name: string;
  arabicName: string;
  role: 'head_teacher' | 'teacher' | 'admin';
  title: string;
  loginTime: string;
}

// ---------------------------------------------------------------------
// 8. Academic Calendar & Session Models (Phase 2)
// ---------------------------------------------------------------------
export type AcademicSessionStatus = 'upcoming' | 'active' | 'completed';
export type TermStatus = 'upcoming' | 'active' | 'completed';
export type TermType = 'term_1' | 'term_2' | 'term_3';

export interface AcademicHoliday {
  id: string;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
  isHoliday: boolean;
}

export interface AcademicTerm {
  id: string;
  termType: TermType;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
  instructionalWeeksCount: number;
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 6 = Saturday (Al-Millah default)
  status: TermStatus;
  isCurrent: boolean;
  holidays: AcademicHoliday[];
  isPublished?: boolean;
}

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

export interface AcademicSession {
  id: string;
  name: string; // e.g. "2026/2027"
  nameAr?: string;
  startDate: string;
  endDate: string;
  status: AcademicSessionStatus;
  isCurrent: boolean;
  terms: AcademicTerm[];
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface AcademicCalendarSelection {
  sessionId: string;
  termId: string;
  weekNumber: number;
  date: string;
  dayNameEn?: string;
  dayNameAr?: string;
}

// ---------------------------------------------------------------------
// 12. Student Weekly Memorization Targets (Phase 4)
// ---------------------------------------------------------------------
export type TargetStatus = 'assigned' | 'in_progress' | 'completed' | 'amended';

export interface TargetQuranRange {
  id: string;
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  startPage: number;
  startAyah: number;
  endPage: number;
  endAyah: number;
  totalAyahs: number;
  isCrossPage: boolean;
  notes?: string;
}

export interface TargetAuditRecord {
  id: string;
  timestamp: string; // ISO string
  action: 'created' | 'amended' | 'status_changed' | 'deleted';
  modifiedBy: string; // Teacher or Admin identifier
  changeSummary: string;
  previousSummary?: string;
  notes?: string;
}

export interface StudentWeeklyTarget {
  id: string;
  studentId: string;
  sessionId: string;
  sessionName: string;
  termId: string;
  termType: TermType;
  termName: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  group?: StudentGroup;
  ranges: TargetQuranRange[];
  totalTargetAyahs: number;
  totalTargetPages: number;
  assignmentDeadline: string; // YYYY-MM-DD
  notes?: string;
  status: TargetStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  auditTrail: TargetAuditRecord[];
}

// ---------------------------------------------------------------------
// 13. Daily Qur’an Memorization Recording (Phase 5)
// ---------------------------------------------------------------------
export type MemorizationReviewStatus = 
  | 'awaiting_review'     // قيد المراجعة
  | 'accepted'            // معتمد ومقبول (counts toward target completion)
  | 'requires_correction'; // بحاجة إلى تصحيح

export interface MemorizationAuditRecord {
  id: string;
  timestamp: string; // ISO format
  action: 'created' | 'corrected' | 'status_changed' | 'deleted';
  modifiedBy: string; // Teacher or Admin identifier
  changeSummary: string;
  previousSummary?: string;
  reason?: string;
}

export interface DailyMemorizationEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentArabicName?: string;
  rollNumber?: number;
  group?: StudentGroup;

  // Academic Calendar linkage
  sessionId: string;
  sessionName: string;
  termId: string;
  termName: string;
  weekNumber: number;
  dayOfWeek: string; // Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
  dayOfWeekAr?: string;

  // Qur'an Reference Range
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  startPage: number;
  startAyah: number;
  endPage: number;
  endAyah: number;
  totalAyahs: number;
  totalPages: number;
  juzNumber: number;
  isCrossPage?: boolean;

  // Submission Timing & Late Entry Tracking
  actualSubmissionDate: string; // YYYY-MM-DD (when student actually recited)
  entryTimestamp: string;        // ISO string (when teacher recorded in app)
  isLateEntry: boolean;          // true if submitted for a previous week/date

  // Teacher, Review Status & Feedback
  teacher: string;
  reviewStatus: MemorizationReviewStatus;
  teacherFeedback: string;

  // Connection to Weekly Target
  weeklyTargetId?: string; // Links to StudentWeeklyTarget
  targetRangeId?: string;  // Links to specific TargetQuranRange

  // Evaluation & Tajweed Quality (Optional/Complementary)
  tajweedRating?: TajweedRating;
  mistakeCount?: number;

  // System Tracking & Audit History
  createdAt: string;
  updatedAt: string;
  auditTrail: MemorizationAuditRecord[];
}

