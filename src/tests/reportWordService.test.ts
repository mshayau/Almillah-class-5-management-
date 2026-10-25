import { generateStudentWeeklyReportWordBlob, generateClassWeeklyReportWordBlob } from '../utils/reportWordService';
import { Student, WeeklyReportSummary } from '../types';

async function runTests() {
  console.log('--- Running MS Word Tabular Weekly Report Tests ---');

  const mockStudent: Student = {
    id: 'student-1',
    fullName: 'Zaid bin Thabit',
    arabicName: 'زيد بن ثابت',
    rollNumber: 1,
    group: 'khaleelul_hussary',
    avatarUrl: '',
    parentEmail: 'abu.zaid@example.com',
    totalMemorizedJuz: 4,
    enrollmentStatus: 'active',
    parentName: 'Abu Zaid',
    parentPhone: '+966500112233'
  };

  const mockReport: WeeklyReportSummary = {
    studentId: 'student-1',
    student: mockStudent,
    weekNumber: 1,
    startDate: '2026-08-29',
    endDate: '2026-09-02',
    presentDays: 5,
    totalDays: 5,
    attendanceRate: 100,
    attendancePercentage: 100,
    averageAdabScore: 5.0,
    salahRate: 100,
    recentSabaq: [],
    recentSabqi: [],
    recentManzil: [],
    totalAyahsMemorized: 45,
    teacherRemarks: "Masha'Allah, exemplary memorization with precise tajweed rules.",
    gradeStatus: 'Mumtaz (Distinction)'
  };

  // Test 1: Single Student Weekly Report Word generation
  const studentBlob = await generateStudentWeeklyReportWordBlob(mockStudent, mockReport, 1);
  if (!studentBlob) {
    throw new Error('Expected student weekly report Word blob to be generated');
  }
  if (studentBlob.size < 1000) {
    throw new Error(`Generated Word blob size is suspiciously small: ${studentBlob.size} bytes`);
  }
  console.log(`✓ Single Student Word Report generated successfully (${studentBlob.size} bytes)`);

  // Test 2: Class Master Weekly Report Word generation
  const reportsMap = new Map<string, WeeklyReportSummary>();
  reportsMap.set(mockStudent.id, mockReport);

  const classBlob = await generateClassWeeklyReportWordBlob([mockStudent], reportsMap, 1);
  if (!classBlob) {
    throw new Error('Expected class weekly report Word blob to be generated');
  }
  if (classBlob.size < 1000) {
    throw new Error(`Generated Class Word blob size is suspiciously small: ${classBlob.size} bytes`);
  }
  console.log(`✓ Class Master Word Report generated successfully (${classBlob.size} bytes)`);

  console.log('All MS Word Tabular Report tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
