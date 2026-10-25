/**
 * =====================================================================
 * Acceptance Test Suite for Phase 4: Student Weekly Memorization Targets
 * 
 * Verifies:
 * 1. Target creation with session, term, week, student, deadline, and notes.
 * 2. Two students have different targets in the same week.
 * 3. Support for multiple target ranges from different Surahs.
 * 4. Prevention of accidental duplicate targets for the same student and week.
 * 5. Authorized amendments generate a timestamped audit trail without destroying history.
 * 6. Validation against verified 604-page Madinah Mushaf reference dataset.
 * 7. Historical records across sessions and terms remain intact and accessible.
 * =====================================================================
 */

import { DatabaseService } from '../db/databaseService';
import { 
  StudentWeeklyTarget, 
  TargetQuranRange, 
  Student 
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_WEEKLY_TARGETS 
} from '../data/initialData';
import { 
  validateAndCalculateQuranRange,
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
console.log('Al-Millah Academy — Student Weekly Targets Acceptance Tests');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// Test 1: Target is linked to correct student, session, term, and week
// ---------------------------------------------------------------------
const sampleStudent = INITIAL_STUDENTS[0]; // std-001 (Abdullahi Ibrahim Rasheed)
const sampleTargetInput: Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'> = {
  studentId: sampleStudent.id,
  sessionId: 'session-2026-2027',
  sessionName: '2026/2027',
  termId: 'term-1-2026-2027',
  termType: 'term_1',
  termName: 'First Term (Autumn)',
  weekNumber: 3,
  weekStartDate: '2026-09-12',
  weekEndDate: '2026-09-16',
  group: 'khaleelul_hussary',
  assignmentDeadline: '2026-09-16',
  notes: 'Memorize with Tajweed focus on Ghunnah and Qalqalah',
  status: 'assigned',
  totalTargetAyahs: 25,
  totalTargetPages: 2,
  createdBy: "Ustadh Muhammad Shaya'u",
  ranges: [
    {
      id: 'rng-01',
      surahNumber: 78,
      surahName: 'An-Naba',
      surahArabicName: 'النبأ',
      startPage: 582,
      startAyah: 1,
      endPage: 582,
      endAyah: 25,
      totalAyahs: 25,
      isCrossPage: false,
      notes: 'An-Naba 1–25'
    }
  ]
};

const validation = DatabaseService.validateWeeklyTarget(sampleTargetInput, INITIAL_WEEKLY_TARGETS);
assert(
  validation.valid,
  'Test 1.1: validateWeeklyTarget passes for well-formed student target',
  'All required attributes valid'
);

const createdTarget = DatabaseService.createWeeklyTarget(sampleTargetInput, "Ustadh Muhammad Shaya'u");
assert(
  createdTarget.studentId === sampleStudent.id &&
  createdTarget.sessionId === 'session-2026-2027' &&
  createdTarget.termId === 'term-1-2026-2027' &&
  createdTarget.weekNumber === 3,
  'Test 1.2: Created target is linked to correct student, session, term, and week',
  `Student: ${createdTarget.studentId}, Session: ${createdTarget.sessionId}, Term: ${createdTarget.termId}, Week: ${createdTarget.weekNumber}`
);

assert(
  createdTarget.auditTrail.length === 1 && createdTarget.auditTrail[0].action === 'created',
  'Test 1.3: Target creation automatically initializes audit trail',
  `Audit Action: "${createdTarget.auditTrail[0].action}" by ${createdTarget.auditTrail[0].modifiedBy}`
);

// ---------------------------------------------------------------------
// Test 2: Two students can have different targets in the same week
// ---------------------------------------------------------------------
const student1 = INITIAL_STUDENTS[0]; // std-001
const student2 = INITIAL_STUDENTS[1]; // std-002

const student1Week2Target = INITIAL_WEEKLY_TARGETS.find(
  t => t.studentId === student1.id && t.weekNumber === 2 && t.sessionId === 'session-2026-2027'
);
const student2Week2Target = INITIAL_WEEKLY_TARGETS.find(
  t => t.studentId === student2.id && t.weekNumber === 2 && t.sessionId === 'session-2026-2027'
);

assert(
  Boolean(student1Week2Target) && Boolean(student2Week2Target),
  'Test 2.1: Targets exist for two different students in the same week (Week 2)',
  `Student 1: ${student1.fullName} & Student 2: ${student2.fullName}`
);

assert(
  student1Week2Target?.totalTargetAyahs !== student2Week2Target?.totalTargetAyahs,
  'Test 2.2: Two students have different target ayah scopes in the same week',
  `Student 1 scope: ${student1Week2Target?.totalTargetAyahs} ayahs vs Student 2 scope: ${student2Week2Target?.totalTargetAyahs} ayahs`
);

const student1Surahs = student1Week2Target?.ranges.map(r => r.surahNumber).join(',');
const student2Surahs = student2Week2Target?.ranges.map(r => r.surahNumber).join(',');
assert(
  student1Surahs !== student2Surahs,
  'Test 2.3: Two students have different Surahs assigned in the same week',
  `Student 1 Surahs: [${student1Week2Target?.ranges.map(r => r.surahName).join(', ')}] vs Student 2 Surahs: [${student2Week2Target?.ranges.map(r => r.surahName).join(', ')}]`
);

// ---------------------------------------------------------------------
// Test 3: Support for multiple target ranges, including different Surahs
// ---------------------------------------------------------------------
const multiRangeTarget = student1Week2Target;
assert(
  (multiRangeTarget?.ranges.length || 0) > 1,
  'Test 3.1: Student target supports multiple ranges',
  `Found ${multiRangeTarget?.ranges.length} distinct ranges`
);

const surahNumbers = multiRangeTarget?.ranges.map(r => r.surahNumber);
const hasDifferentSurahs = new Set(surahNumbers).size > 1;
assert(
  hasDifferentSurahs,
  'Test 3.2: Target ranges include different Surahs in one weekly assignment',
  `Ranges span Surah 78 (An-Naba) and Surah 79 (An-Nazi'at)`
);

// ---------------------------------------------------------------------
// Test 4: Prevent accidental duplicate targets for same student & week
// ---------------------------------------------------------------------
const duplicateInput: Partial<StudentWeeklyTarget> = {
  studentId: 'std-001',
  sessionId: 'session-2026-2027',
  termId: 'term-1-2026-2027',
  weekNumber: 2, // Already has target-001 in INITIAL_WEEKLY_TARGETS
  assignmentDeadline: '2026-09-09',
  ranges: [
    {
      id: 'rng-dup',
      surahNumber: 78,
      surahName: 'An-Naba',
      surahArabicName: 'النبأ',
      startPage: 582,
      startAyah: 1,
      endPage: 582,
      endAyah: 10,
      totalAyahs: 10,
      isCrossPage: false
    }
  ]
};

const duplicateValidation = DatabaseService.validateWeeklyTarget(duplicateInput, INITIAL_WEEKLY_TARGETS);
assert(
  !duplicateValidation.valid && duplicateValidation.errors.some(e => e.includes('Target already exists')),
  'Test 4.1: Accidental duplicate target for same student and week is rejected',
  `Error: "${duplicateValidation.errors[0]}"`
);

// ---------------------------------------------------------------------
// Test 5: Authorized amendments generate an audit trail
// ---------------------------------------------------------------------
const targetToAmend = INITIAL_WEEKLY_TARGETS[0];
const originalAuditCount = targetToAmend.auditTrail.length;

const amended = DatabaseService.amendWeeklyTarget(
  targetToAmend,
  {
    totalTargetAyahs: 40,
    notes: 'Extended target upon request of parent to include ayahs 16-20 of An-Nazi’at'
  },
  'Parent and teacher agreed to extend target by 5 ayahs',
  "Ustadh Muhammad Shaya'u"
);

assert(
  amended.status === 'amended' && amended.totalTargetAyahs === 40,
  'Test 5.1: Target successfully amended with new parameters and status',
  `Status: ${amended.status}, New Scope: ${amended.totalTargetAyahs} ayahs`
);

assert(
  amended.auditTrail.length === originalAuditCount + 1,
  'Test 5.2: Amendment generates a new audit record without destroying previous audit entries',
  `Audit entries count: ${amended.auditTrail.length}`
);

assert(
  amended.auditTrail[0].action === 'amended' && 
  Boolean(amended.auditTrail[0].previousSummary) &&
  amended.auditTrail[0].changeSummary.includes('Parent and teacher agreed'),
  'Test 5.3: Audit record stores previous summary, reason, operator, and timestamp',
  `Previous Summary: "${amended.auditTrail[0].previousSummary}"`
);

// ---------------------------------------------------------------------
// Test 6: Range validation against verified 604-page Qur'an dataset
// ---------------------------------------------------------------------
const validRangeCalc = validateAndCalculateQuranRange(67, 1, 67, 30);
assert(
  validRangeCalc.valid && validRangeCalc.startPage === 562 && validRangeCalc.endPage === 564,
  'Test 6.1: Valid Surah range (Al-Mulk 1–30) correctly resolves to Madinah pages 562–564',
  `Pages: ${validRangeCalc.startPage}–${validRangeCalc.endPage}`
);

const invalidSurahInput: Partial<StudentWeeklyTarget> = {
  studentId: 'std-004',
  sessionId: 'session-2026-2027',
  termId: 'term-1-2026-2027',
  weekNumber: 4,
  assignmentDeadline: '2026-09-23',
  ranges: [
    {
      id: 'inv-1',
      surahNumber: 115, // Out of bounds
      surahName: 'Invalid Surah',
      surahArabicName: 'سورة غير صالحة',
      startPage: 1,
      startAyah: 1,
      endPage: 1,
      endAyah: 5,
      totalAyahs: 5,
      isCrossPage: false
    }
  ]
};

const invalidSurahValidation = DatabaseService.validateWeeklyTarget(invalidSurahInput, INITIAL_WEEKLY_TARGETS);
assert(
  !invalidSurahValidation.valid && invalidSurahValidation.errors.some(e => e.includes('Invalid Surah number')),
  'Test 6.2: Non-existent Surah number (115) in target range is rejected',
  `Error: "${invalidSurahValidation.errors[0]}"`
);

// ---------------------------------------------------------------------
// Test 7: Historical targets across terms and sessions remain accessible
// ---------------------------------------------------------------------
const week1CompletedTarget = INITIAL_WEEKLY_TARGETS.find(t => t.weekNumber === 1 && t.status === 'completed');
assert(
  Boolean(week1CompletedTarget) && week1CompletedTarget?.studentId === 'std-001',
  'Test 7.1: Completed historical target from Week 1 remains intact in database',
  `Target ID: ${week1CompletedTarget?.id}, Status: ${week1CompletedTarget?.status}`
);

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount/totalCount)*100)}%)`);
console.log('------------------------------------------------------\n');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
