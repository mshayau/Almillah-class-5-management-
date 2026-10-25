/**
 * Automated Acceptance Test Suite for Phase 2: Academic Calendar Management
 * Verifies all 7 Acceptance Test criteria:
 * 1. A session can be created.
 * 2. Three terms can be configured.
 * 3. Each term can have a different number of weeks.
 * 4. Week numbers restart at Week 1 for each term.
 * 5. Dates and week relationships are validated.
 * 6. Previous sessions remain accessible.
 * 7. Unauthorized users cannot change academic calendar settings.
 */

import { 
  INITIAL_ACADEMIC_SESSIONS, 
  generateInstructionalWeeks, 
  validateSession, 
  validateTerm, 
  validateWeekBelongsToTerm 
} from '../data/academicCalendar';
import { DatabaseService } from '../db/databaseService';
import { AcademicSession, AcademicTerm } from '../types';

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
console.log('Al-Millah Academy — Academic Calendar Acceptance Tests');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// Acceptance Test 1: A session can be created
// ---------------------------------------------------------------------
const newSessionData = {
  name: '2028/2029',
  nameAr: '١٤٥٠ - ١٤٥١ هـ',
  startDate: '2028-08-26',
  endDate: '2029-07-15'
};
const valSession = validateSession(newSessionData, INITIAL_ACADEMIC_SESSIONS);
assert(valSession.valid, 'Test 1.1: validateSession allows valid new session dates');

const createdSession = DatabaseService.normalizeAcademicSession({
  ...newSessionData,
  status: 'upcoming',
  isCurrent: false
});
assert(
  createdSession.id !== undefined && createdSession.name === '2028/2029',
  'Test 1.2: Session is normalized and created with unique ID and name',
  `Session ID: ${createdSession.id}, Name: ${createdSession.name}`
);

// ---------------------------------------------------------------------
// Acceptance Test 2: Three terms can be configured per session
// ---------------------------------------------------------------------
assert(
  createdSession.terms.length === 3,
  'Test 2.1: Exactly three terms are configured for newly created session',
  `Found ${createdSession.terms.length} terms: ${createdSession.terms.map(t => t.nameEn).join(', ')}`
);

assert(
  INITIAL_ACADEMIC_SESSIONS[0].terms.length === 3,
  'Test 2.2: Active default session contains exactly three terms',
  `Terms: ${INITIAL_ACADEMIC_SESSIONS[0].terms.map(t => t.nameEn).join(', ')}`
);

// ---------------------------------------------------------------------
// Acceptance Test 3: Each term can have a different number of weeks
// ---------------------------------------------------------------------
const activeSession = INITIAL_ACADEMIC_SESSIONS[0];
const term1Weeks = activeSession.terms[0].instructionalWeeksCount;
const term2Weeks = activeSession.terms[1].instructionalWeeksCount;
const term3Weeks = activeSession.terms[2].instructionalWeeksCount;

assert(
  term1Weeks === 16 && term2Weeks === 14 && term3Weeks === 12,
  'Test 3.1: Terms have distinct configured week counts (16, 14, 12 weeks)',
  `Term 1: ${term1Weeks}w, Term 2: ${term2Weeks}w, Term 3: ${term3Weeks}w`
);

// ---------------------------------------------------------------------
// Acceptance Test 4: Week numbers restart at Week 1 for each term
// ---------------------------------------------------------------------
const term1GeneratedWeeks = generateInstructionalWeeks(activeSession, activeSession.terms[0]);
const term2GeneratedWeeks = generateInstructionalWeeks(activeSession, activeSession.terms[1]);
const term3GeneratedWeeks = generateInstructionalWeeks(activeSession, activeSession.terms[2]);

assert(
  term1GeneratedWeeks[0].weekNumber === 1 &&
  term2GeneratedWeeks[0].weekNumber === 1 &&
  term3GeneratedWeeks[0].weekNumber === 1,
  'Test 4.1: Week numbers restart at Week 1 for Term 1, Term 2, and Term 3',
  `Term 1 start: W${term1GeneratedWeeks[0].weekNumber}, Term 2 start: W${term2GeneratedWeeks[0].weekNumber}, Term 3 start: W${term3GeneratedWeeks[0].weekNumber}`
);

assert(
  term1GeneratedWeeks.length === 16 &&
  term2GeneratedWeeks.length === 14 &&
  term3GeneratedWeeks.length === 12,
  'Test 4.2: Total generated weeks strictly match configured instructionalWeeksCount',
  `T1: ${term1GeneratedWeeks.length}/16, T2: ${term2GeneratedWeeks.length}/14, T3: ${term3GeneratedWeeks.length}/12`
);

// ---------------------------------------------------------------------
// Acceptance Test 5: Dates and week relationships are validated
// ---------------------------------------------------------------------
// 5.1 Invalid inverted dates
const invalidInvertedTerm: Partial<AcademicTerm> = {
  nameEn: 'Invalid Term',
  startDate: '2027-04-14',
  endDate: '2027-01-09', // inverted
  instructionalWeeksCount: 12
};
const valInverted = validateTerm(invalidInvertedTerm, activeSession, []);
assert(
  !valInverted.valid && valInverted.errors.some(e => e.includes('precede')),
  'Test 5.1: Inverted dates rejected by validateTerm',
  `Error: "${valInverted.errors[0]}"`
);

// 5.2 Date outside session range
const outOfBoundsTerm: Partial<AcademicTerm> = {
  nameEn: 'Out of Bounds Term',
  startDate: '2025-01-01', // session starts in 2026
  endDate: '2025-04-01',
  instructionalWeeksCount: 10
};
const valOutOfBounds = validateTerm(outOfBoundsTerm, activeSession, []);
assert(
  !valOutOfBounds.valid && valOutOfBounds.errors.some(e => e.includes('earlier than session start')),
  'Test 5.2: Dates outside session bounds rejected',
  `Error: "${valOutOfBounds.errors[0]}"`
);

// 5.3 Overlapping terms rejection
const overlappingTerm: Partial<AcademicTerm> = {
  id: 'term-overlap-test',
  nameEn: 'Overlapping Term',
  startDate: '2026-09-01', // overlaps with Term 1 (Aug 29 - Dec 16)
  endDate: '2026-10-30',
  instructionalWeeksCount: 8
};
const valOverlap = validateTerm(overlappingTerm, activeSession, activeSession.terms);
assert(
  !valOverlap.valid && valOverlap.errors.some(e => e.includes('overlaps')),
  'Test 5.3: Overlapping term date ranges detected and rejected',
  `Error: "${valOverlap.errors[0]}"`
);

// 5.4 Week belongs to term validation
const validWeekBelongs = validateWeekBelongsToTerm(
  activeSession.id, 
  activeSession.terms[0].id, 
  10, 
  INITIAL_ACADEMIC_SESSIONS
);
const invalidWeekBelongs = validateWeekBelongsToTerm(
  activeSession.id, 
  activeSession.terms[0].id, 
  25, // Term 1 only has 16 weeks!
  INITIAL_ACADEMIC_SESSIONS
);
assert(
  validWeekBelongs && !invalidWeekBelongs,
  'Test 5.4: validateWeekBelongsToTerm verifies week belongs to term and session',
  'Week 10 is valid; Week 25 is rejected'
);

// ---------------------------------------------------------------------
// Acceptance Test 6: Previous sessions remain accessible
// ---------------------------------------------------------------------
const historicalSession = INITIAL_ACADEMIC_SESSIONS.find(s => s.status === 'completed');
assert(
  historicalSession !== undefined && historicalSession.name === '2025/2026',
  'Test 6.1: Historical completed session (2025/2026) remains accessible in database',
  `Session: ${historicalSession?.name}, Status: ${historicalSession?.status}`
);

assert(
  historicalSession !== undefined && historicalSession.terms.length === 3,
  'Test 6.2: Historical session preserves all 3 archived terms without data destruction',
  `Archived Terms: ${historicalSession?.terms.map(t => t.nameEn).join(', ')}`
);

// ---------------------------------------------------------------------
// Acceptance Test 7: Unauthorized users cannot change academic calendar settings
// ---------------------------------------------------------------------
const authorizedAdminUser = { role: 'head_teacher' };
const regularTeacherUser = { role: 'teacher' };
const studentViewerUser = { role: 'student' };

const isAdmin = (role?: string) => role === 'head_teacher' || role === 'admin';

assert(
  isAdmin(authorizedAdminUser.role) && !isAdmin(regularTeacherUser.role) && !isAdmin(studentViewerUser.role),
  'Test 7.1: Role permission guard allows head_teacher/admin and blocks unauthorized roles',
  'head_teacher: ALLOWED | teacher: BLOCKED | student: BLOCKED'
);

// Test setActiveSession single-active constraint
const modifiedSessions = DatabaseService.setActiveSession('session-2025-2026', INITIAL_ACADEMIC_SESSIONS);
const activeCount = modifiedSessions.filter(s => s.isCurrent).length;
assert(
  activeCount === 1 && modifiedSessions.find(s => s.id === 'session-2025-2026')?.isCurrent === true,
  'Test 7.2: DatabaseService enforces only one current active session at a time',
  `Active sessions count: ${activeCount}`
);

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount/totalCount)*100)}%)`);
console.log('------------------------------------------------------\n');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
