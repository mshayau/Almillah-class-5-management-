/**
 * =====================================================================
 * Acceptance Test Suite for Phase 5: Daily Qur’an Memorization Recording
 * 
 * Verifies:
 * 1. Valid Qur'an range memorization creation with all 15 required fields.
 * 2. Invalid ranges validation (out of bounds, end < start, invalid surah).
 * 3. Review statuses: Only 'accepted' counts toward weekly target completion;
 *    'awaiting_review' and 'requires_correction' do not count.
 * 4. Late submissions: retains actual submission date and entry timestamp, flags isLateEntry.
 * 5. Multiple students: individual differentiated targets and independent entries.
 * 6. Duplicate prevention: prevents overlapping submissions from inflating progress.
 * 7. Authorized corrections: retains comprehensive audit trail with reason and timestamps.
 * 8. Connection to student and weekly target verified.
 * =====================================================================
 */

import { DatabaseService } from '../db/databaseService';
import { 
  DailyMemorizationEntry, 
  StudentWeeklyTarget, 
  Student 
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_WEEKLY_TARGETS 
} from '../data/initialData';
import { 
  getSurahByNumber, 
  getPageForAyah 
} from '../data/quranReferenceData';

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`✅ [PASS] ${testName}${detail ? ` - ${detail}` : ''}`);
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('\n======================================================');
console.log('Al-Millah Academy — Daily Memorization Acceptance Tests');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// Setup baseline data
// ---------------------------------------------------------------------
const student1: Student = INITIAL_STUDENTS[0]; // Abdullahi Ibrahim Rasheed
const student2: Student = INITIAL_STUDENTS[1]; // Maryam Al-Hassan

const target1: StudentWeeklyTarget = {
  id: 'target-std1-w2',
  studentId: student1.id,
  sessionId: 'session-2026-2027',
  sessionName: '2026/2027',
  termId: 'term-1-2026-2027',
  termType: 'term_1',
  termName: 'First Term (Autumn)',
  weekNumber: 2,
  weekStartDate: '2026-09-05',
  weekEndDate: '2026-09-09',
  ranges: [
    {
      id: 'range-1',
      surahNumber: 78, // An-Naba
      surahName: 'An-Naba',
      surahArabicName: 'النبأ',
      startPage: 582,
      startAyah: 1,
      endPage: 582,
      endAyah: 20,
      totalAyahs: 20,
      isCrossPage: false
    }
  ],
  totalTargetAyahs: 20,
  totalTargetPages: 1,
  assignmentDeadline: '2026-09-09',
  status: 'assigned',
  createdAt: '2026-09-05T08:00:00Z',
  updatedAt: '2026-09-05T08:00:00Z',
  createdBy: 'Ustadh Muhammad',
  auditTrail: []
};

const target2: StudentWeeklyTarget = {
  id: 'target-std2-w2',
  studentId: student2.id,
  sessionId: 'session-2026-2027',
  sessionName: '2026/2027',
  termId: 'term-1-2026-2027',
  termType: 'term_1',
  termName: 'First Term (Autumn)',
  weekNumber: 2,
  weekStartDate: '2026-09-05',
  weekEndDate: '2026-09-09',
  ranges: [
    {
      id: 'range-2',
      surahNumber: 79, // An-Nazi'at
      surahName: "An-Nazi'at",
      surahArabicName: 'النازعات',
      startPage: 583,
      startAyah: 1,
      endPage: 584,
      endAyah: 15,
      totalAyahs: 15,
      isCrossPage: true
    }
  ],
  totalTargetAyahs: 15,
  totalTargetPages: 2,
  assignmentDeadline: '2026-09-09',
  status: 'assigned',
  createdAt: '2026-09-05T08:00:00Z',
  updatedAt: '2026-09-05T08:00:00Z',
  createdBy: 'Ustadh Muhammad',
  auditTrail: []
};

const storeEntries: DailyMemorizationEntry[] = [];

// ---------------------------------------------------------------------
// Test 1: Valid creation with all 15 required fields
// ---------------------------------------------------------------------
const validEntryData: Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'entryTimestamp'> & { entryTimestamp?: string } = {
  studentId: student1.id,
  studentName: student1.fullName,
  studentArabicName: student1.arabicName,
  rollNumber: student1.rollNumber,
  group: student1.group,
  sessionId: 'session-2026-2027',
  sessionName: '2026/2027',
  termId: 'term-1-2026-2027',
  termName: 'First Term (Autumn)',
  weekNumber: 2,
  dayOfWeek: 'Saturday',
  dayOfWeekAr: 'السبت',
  surahNumber: 78,
  surahName: 'An-Naba',
  surahArabicName: 'النبأ',
  startPage: 582,
  startAyah: 1,
  endPage: 582,
  endAyah: 10,
  totalAyahs: 10,
  totalPages: 1,
  juzNumber: 30,
  actualSubmissionDate: '2026-09-05',
  entryTimestamp: '2026-09-05T10:15:30Z',
  isLateEntry: false,
  teacher: "Ustadh Muhammad Shaya'u",
  reviewStatus: 'accepted',
  teacherFeedback: "Masha'Allah, fluent recitation with clear articulation.",
  weeklyTargetId: target1.id,
  targetRangeId: 'range-1'
};

const valCheck1 = DatabaseService.validateDailyMemorizationEntry(validEntryData, storeEntries);
assert(valCheck1.valid, 'Test 1.1: Validation passes for valid entry with all required fields', valCheck1.errors.join('; '));

const createdEntry1 = DatabaseService.createDailyMemorizationEntry(validEntryData, "Ustadh Muhammad Shaya'u");
storeEntries.push(createdEntry1);

assert(
  Boolean(createdEntry1.id && createdEntry1.id.startsWith('daily-entry-')),
  'Test 1.2: Generated unique entry ID with proper prefix',
  createdEntry1.id
);
assert(
  createdEntry1.studentId === student1.id &&
  createdEntry1.sessionId === 'session-2026-2027' &&
  createdEntry1.termId === 'term-1-2026-2027' &&
  createdEntry1.weekNumber === 2 &&
  createdEntry1.dayOfWeek === 'Saturday' &&
  createdEntry1.surahNumber === 78 &&
  createdEntry1.startPage === 582 &&
  createdEntry1.startAyah === 1 &&
  createdEntry1.endPage === 582 &&
  createdEntry1.endAyah === 10 &&
  createdEntry1.actualSubmissionDate === '2026-09-05' &&
  Boolean(createdEntry1.entryTimestamp) &&
  createdEntry1.teacher === "Ustadh Muhammad Shaya'u" &&
  createdEntry1.reviewStatus === 'accepted' &&
  createdEntry1.teacherFeedback.includes('fluent'),
  'Test 1.3: All 15 required fields accurately populated and verified'
);
assert(
  createdEntry1.weeklyTargetId === target1.id,
  'Test 1.4: Connected directly to student weekly target ID'
);
assert(
  createdEntry1.auditTrail.length === 1 && createdEntry1.auditTrail[0].action === 'created',
  'Test 1.5: Initial creation audit record established with timestamp'
);

// ---------------------------------------------------------------------
// Test 2: Validation of invalid ranges and out-of-bounds ayahs
// ---------------------------------------------------------------------
// 2.1 Exceeds ayah count for Surah (An-Naba has 40 ayahs; passing ayah 45)
const invalidAyahData = {
  ...validEntryData,
  startAyah: 1,
  endAyah: 45
};
const valCheck2_1 = DatabaseService.validateDailyMemorizationEntry(invalidAyahData, storeEntries);
assert(
  !valCheck2_1.valid && valCheck2_1.errors.some(e => e.includes('exceeds')),
  'Test 2.1: Rejects ayah number exceeding Surah total ayah count (Ayah 45 > 40)',
  valCheck2_1.errors.join('; ')
);

// 2.2 End Ayah < Start Ayah
const invertedAyahData = {
  ...validEntryData,
  startAyah: 20,
  endAyah: 5
};
const valCheck2_2 = DatabaseService.validateDailyMemorizationEntry(invertedAyahData, storeEntries);
assert(
  !valCheck2_2.valid && valCheck2_2.errors.some(e => e.includes('cannot be less than')),
  'Test 2.2: Rejects inverted ayah range (endAyah 5 < startAyah 20)',
  valCheck2_2.errors.join('; ')
);

// 2.3 Invalid Surah number (Surah 115 does not exist)
const invalidSurahData = {
  ...validEntryData,
  surahNumber: 115
};
const valCheck2_3 = DatabaseService.validateDailyMemorizationEntry(invalidSurahData, storeEntries);
assert(
  !valCheck2_3.valid && valCheck2_3.errors.some(e => e.includes('Invalid Surah number')),
  'Test 2.3: Rejects invalid Surah number (Surah 115 > 114)',
  valCheck2_3.errors.join('; ')
);

// 2.4 Invalid Mushaf Page (< 1 or > 604)
const invalidPageData = {
  ...validEntryData,
  startPage: 0,
  endPage: 650
};
const valCheck2_4 = DatabaseService.validateDailyMemorizationEntry(invalidPageData, storeEntries);
assert(
  !valCheck2_4.valid && valCheck2_4.errors.some(e => e.includes('Page')),
  'Test 2.4: Rejects invalid page number outside 1-604 Madinah Mushaf bounds',
  valCheck2_4.errors.join('; ')
);

// ---------------------------------------------------------------------
// Test 3: Review statuses & target progress calculation
// ---------------------------------------------------------------------
// 3.1 Initial progress with entry 1 (Ayahs 1-10 accepted out of 20 target ayahs)
const prog1 = DatabaseService.calculateStudentWeeklyProgress(target1, storeEntries);
assert(
  prog1.completedAcceptedAyahs === 10 && prog1.completionPercentage === 50 && !prog1.isTargetComplete,
  'Test 3.1: Progress correctly computes 50% for 10 accepted ayahs out of 20'
);

// 3.2 Add submission with 'awaiting_review' for Ayahs 11-15: MUST NOT count toward completion
const pendingEntryData = {
  ...validEntryData,
  dayOfWeek: 'Sunday',
  actualSubmissionDate: '2026-09-06',
  startAyah: 11,
  endAyah: 15,
  totalAyahs: 5,
  reviewStatus: 'awaiting_review' as const,
  teacherFeedback: 'Pending review during halaqah inspection.'
};
const createdPending = DatabaseService.createDailyMemorizationEntry(pendingEntryData, "Ustadh Muhammad");
storeEntries.push(createdPending);

const prog2 = DatabaseService.calculateStudentWeeklyProgress(target1, storeEntries);
assert(
  prog2.completedAcceptedAyahs === 10 && 
  prog2.completionPercentage === 50 && 
  prog2.pendingReviewAyahs === 5,
  'Test 3.2: "Awaiting Review" submission does NOT increment completed ayahs or percentage'
);

// 3.3 Add submission with 'requires_correction' for Ayahs 16-20: MUST NOT count toward completion
const correctionEntryData = {
  ...validEntryData,
  dayOfWeek: 'Monday',
  actualSubmissionDate: '2026-09-07',
  startAyah: 16,
  endAyah: 20,
  totalAyahs: 5,
  reviewStatus: 'requires_correction' as const,
  teacherFeedback: 'Multiple stumbles on qalqalah rulings; student must re-recite.'
};
const createdCorrection = DatabaseService.createDailyMemorizationEntry(correctionEntryData, "Ustadh Muhammad");
storeEntries.push(createdCorrection);

const prog3 = DatabaseService.calculateStudentWeeklyProgress(target1, storeEntries);
assert(
  prog3.completedAcceptedAyahs === 10 && 
  prog3.completionPercentage === 50 && 
  prog3.requiresCorrectionAyahs === 5,
  'Test 3.3: "Requires Correction" submission does NOT increment completed ayahs'
);

// 3.4 Accept the pending and corrected ayahs -> target becomes 100% complete
const acceptedRemainingData = {
  ...validEntryData,
  dayOfWeek: 'Tuesday',
  actualSubmissionDate: '2026-09-08',
  startAyah: 11,
  endAyah: 20,
  totalAyahs: 10,
  reviewStatus: 'accepted' as const,
  teacherFeedback: "Masha'Allah, re-recited with excellent tajweed and fluency."
};
const createdAcceptedRemaining = DatabaseService.createDailyMemorizationEntry(acceptedRemainingData, "Ustadh Muhammad");
storeEntries.push(createdAcceptedRemaining);

const prog4 = DatabaseService.calculateStudentWeeklyProgress(target1, storeEntries);
assert(
  prog4.completedAcceptedAyahs === 20 && 
  prog4.completionPercentage === 100 && 
  prog4.isTargetComplete === true,
  'Test 3.4: Only accepted submissions count toward target completion; 100% complete when all 20 ayahs accepted'
);

// ---------------------------------------------------------------------
// Test 4: Late submission handling
// ---------------------------------------------------------------------
// Recited on 2026-08-30 (during previous week 1), but teacher records on 2026-09-10 (during week 2)
const lateSubmissionDate = '2026-08-30';
const currentRecordingTimestamp = '2026-09-10T14:30:00Z';
const lateEntryData = {
  ...validEntryData,
  sessionId: 'session-2026-2027',
  termId: 'term-1-2026-2027',
  weekNumber: 1, // submitted for week 1
  actualSubmissionDate: lateSubmissionDate,
  entryTimestamp: currentRecordingTimestamp,
  isLateEntry: true,
  teacherFeedback: 'Late recording of week 1 halaqah recitation.'
};

const createdLate = DatabaseService.createDailyMemorizationEntry(lateEntryData, "Ustadh Muhammad");
assert(
  createdLate.actualSubmissionDate === '2026-08-30' &&
  createdLate.entryTimestamp === currentRecordingTimestamp &&
  createdLate.isLateEntry === true,
  'Test 4: Late submission retains both actual recital date (2026-08-30) and recording timestamp (2026-09-10)'
);

// ---------------------------------------------------------------------
// Test 5: Multiple students with differentiated targets
// ---------------------------------------------------------------------
// Student 2 has target of An-Nazi'at (79:1-15)
const student2EntryData = {
  studentId: student2.id,
  studentName: student2.fullName,
  studentArabicName: student2.arabicName,
  rollNumber: student2.rollNumber,
  group: student2.group,
  sessionId: 'session-2026-2027',
  sessionName: '2026/2027',
  termId: 'term-1-2026-2027',
  termName: 'First Term (Autumn)',
  weekNumber: 2,
  dayOfWeek: 'Sunday',
  surahNumber: 79, // An-Nazi'at
  surahName: "An-Nazi'at",
  surahArabicName: 'النازعات',
  startPage: 583,
  startAyah: 1,
  endPage: 583,
  endAyah: 15,
  totalAyahs: 15,
  totalPages: 1,
  juzNumber: 30,
  actualSubmissionDate: '2026-09-06',
  isLateEntry: false,
  teacher: "Ustadh Muhammad",
  reviewStatus: 'accepted' as const,
  teacherFeedback: "Masha'Allah, completed Surah An-Nazi'at target portion.",
  weeklyTargetId: target2.id,
  targetRangeId: 'range-2'
};

const createdStudent2Entry = DatabaseService.createDailyMemorizationEntry(student2EntryData, "Ustadh Muhammad");
storeEntries.push(createdStudent2Entry);

const progStudent2 = DatabaseService.calculateStudentWeeklyProgress(target2, storeEntries);
assert(
  progStudent2.completedAcceptedAyahs === 15 && 
  progStudent2.completionPercentage === 100 && 
  progStudent2.isTargetComplete === true,
  'Test 5.1: Student 2 independently completes differentiated target (An-Nazi\'at 1-15)'
);

// Verify student 1's progress was untouched by Student 2's entry
const progStudent1After = DatabaseService.calculateStudentWeeklyProgress(target1, storeEntries);
assert(
  progStudent1After.completedAcceptedAyahs === 20 && progStudent1After.isTargetComplete,
  'Test 5.2: Student 1 progress remains isolated and unaffected by Student 2 entries'
);

// ---------------------------------------------------------------------
// Test 6: Duplicate submission prevention
// ---------------------------------------------------------------------
// Attempt to submit duplicate accepted entry for Student 2 with overlapping ayahs (Surah 79, Ayahs 5-10) on same date
const duplicateEntryData = {
  ...student2EntryData,
  startAyah: 5,
  endAyah: 10
};

const duplicateCheck = DatabaseService.validateDailyMemorizationEntry(duplicateEntryData, storeEntries);
assert(
  !duplicateCheck.valid && duplicateCheck.errors.some(e => e.includes('Duplicate record detected')),
  'Test 6.1: Prevents duplicate record from inflating progress for overlapping range on same date/week',
  duplicateCheck.errors.join('; ')
);

// Re-submission is allowed if previous entry had 'requires_correction'
const correctionResubmitData = {
  ...validEntryData,
  dayOfWeek: 'Monday',
  actualSubmissionDate: '2026-09-07',
  startAyah: 16,
  endAyah: 20
};
// Note: createdCorrection had requires_correction for 16-20
// The duplicate checker specifically permits re-submission when existing entry status is 'requires_correction'
const isCorrectionAllowed = DatabaseService.validateDailyMemorizationEntry(correctionResubmitData, [createdCorrection]);
assert(
  isCorrectionAllowed.valid,
  'Test 6.2: Re-submission is permitted when previous submission status was "requires_correction"'
);

// ---------------------------------------------------------------------
// Test 7: Authorized corrections with comprehensive audit history
// ---------------------------------------------------------------------
const entryToCorrect = createdEntry1;
const correctionReason = 'Adjusted end ayah to 15 after second recitation session';
const correctedResult = DatabaseService.correctDailyMemorizationEntry(
  entryToCorrect,
  {
    endAyah: 15,
    teacherFeedback: 'Updated: Recited ayahs 1-15 with mumtaz rating.'
  },
  correctionReason,
  'Ustadh Muhammad'
);

assert(
  correctedResult.endAyah === 15 && 
  correctedResult.totalAyahs === 15 &&
  correctedResult.teacherFeedback.includes('mumtaz'),
  'Test 7.1: Entry fields successfully updated by authorized correction'
);
assert(
  correctedResult.auditTrail.length === 2 &&
  correctedResult.auditTrail[0].action === 'corrected' &&
  correctedResult.auditTrail[0].reason === correctionReason &&
  correctedResult.auditTrail[1].action === 'created',
  'Test 7.2: Audit trail preserves original creation audit and prepends new correction entry with reason and timestamp'
);

console.log('\n======================================================');
console.log(`Phase 5 Acceptance Test Summary: ${passedCount} / ${totalCount} Passed`);
console.log('======================================================\n');

if (passedCount === totalCount) {
  console.log('🎉 ALL PHASE 5 ACCEPTANCE TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error(`❌ ${totalCount - passedCount} TESTS FAILED\n`);
  process.exit(1);
}
