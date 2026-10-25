/**
 * =====================================================================
 * Al-Millah Class Management System — Database Service & ORM Repository
 * 
 * Provides relational data access, CRUD, validation, and analytics 
 * for the 6 core entities:
 *   1. Students
 *   2. Memorization Records
 *   3. Attendance
 *   4. Daily Activities
 *   5. Announcements
 *   6. Weekly Reports
 * =====================================================================
 */

import { 
  Student, 
  MemorizationRecord, 
  AttendanceRecord, 
  DailyActivity, 
  Announcement, 
  WeeklyReportRecord,
  WeeklyReportSummary,
  QuranLog,
  AcademicSession,
  AcademicTerm,
  StudentWeeklyTarget,
  TargetQuranRange,
  TargetAuditRecord,
  DailyMemorizationEntry,
  MemorizationReviewStatus,
  MemorizationAuditRecord
} from '../types';
import { getSurahByNumber, getPageForAyah, validateAndCalculateQuranRange } from '../data/quranReferenceData';
import { getDayOfWeekName } from '../data/academicCalendar';

export class DatabaseService {
  // -------------------------------------------------------------------
  // 1. STUDENTS REPOSITORY
  // -------------------------------------------------------------------
  static normalizeStudent(raw: Partial<Student>): Student {
    return {
      id: raw.id || crypto.randomUUID(),
      rollNumber: raw.rollNumber || 1,
      fullName: raw.fullName || raw.studentName || 'Student Name',
      studentName: raw.studentName || raw.fullName || 'Student Name',
      arabicName: raw.arabicName || '',
      className: raw.className || 'Class Five',
      parentName: raw.parentName || 'Parent Name',
      parentPhone: raw.parentPhone || raw.parentPhoneNumber || '+1 (555) 000-0000',
      parentPhoneNumber: raw.parentPhoneNumber || raw.parentPhone || '+1 (555) 000-0000',
      parentEmail: raw.parentEmail || '',
      address: raw.address || 'Class Five Campus, Al-Millah Academy',
      avatarUrl: raw.avatarUrl || raw.studentPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
      studentPhoto: raw.studentPhoto || raw.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
      currentJuz: raw.currentJuz || 1,
      group: raw.group || 'khaleelul_hussary',
      totalMemorizedJuz: raw.totalMemorizedJuz || 1,
      enrollmentStatus: raw.enrollmentStatus || 'active',
      notes: raw.notes || ''
    };
  }

  // -------------------------------------------------------------------
  // 2. MEMORIZATION RECORDS REPOSITORY
  // -------------------------------------------------------------------
  static createMemorizationRecord(record: Omit<MemorizationRecord, 'id'>): MemorizationRecord {
    // Validate mistake counts
    const mistakes = Math.max(0, record.mistakes);
    const correctedMistakes = Math.min(mistakes, Math.max(0, record.correctedMistakes));
    const uncorrectedMistakes = Math.max(0, mistakes - correctedMistakes);

    return {
      id: crypto.randomUUID(),
      studentId: record.studentId,
      date: record.date,
      surahName: record.surahName,
      surahNumber: record.surahNumber,
      ayahRange: record.ayahRange,
      ayahStart: record.ayahStart,
      ayahEnd: record.ayahEnd,
      newMemorization: Boolean(record.newMemorization),
      mistakes,
      correctedMistakes,
      uncorrectedMistakes,
      tajweedRating: record.tajweedRating || 'jayyid_jiddan',
      teacherNotes: record.teacherNotes || ''
    };
  }

  // -------------------------------------------------------------------
  // 3. ATTENDANCE REPOSITORY
  // -------------------------------------------------------------------
  static createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    return {
      id: crypto.randomUUID(),
      studentId: record.studentId,
      date: record.date,
      session: record.session || 'morning',
      status: record.status || 'present',
      arrivalTime: record.arrivalTime,
      notes: record.notes
    };
  }

  // -------------------------------------------------------------------
  // 4. DAILY ACTIVITIES REPOSITORY
  // -------------------------------------------------------------------
  static createDailyActivity(activity: Omit<DailyActivity, 'id'>): DailyActivity {
    // Clamp percentages between 0 and 100
    const clampPct = (val: number) => Math.min(100, Math.max(0, Number(val) || 0));

    return {
      id: crypto.randomUUID(),
      studentId: activity.studentId,
      date: activity.date,
      quranMemorizationPct: clampPct(activity.quranMemorizationPct),
      homeworkPct: clampPct(activity.homeworkPct),
      classParticipationPct: clampPct(activity.classParticipationPct),
      neatnessPct: clampPct(activity.neatnessPct),
      respectPct: clampPct(activity.respectPct),
      selfControlPct: clampPct(activity.selfControlPct),
      notes: activity.notes || ''
    };
  }

  // -------------------------------------------------------------------
  // 5. ANNOUNCEMENTS REPOSITORY
  // -------------------------------------------------------------------
  static createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
    const now = new Date().toISOString().split('T')[0];
    return {
      id: crypto.randomUUID(),
      title: announcement.title,
      message: announcement.message || announcement.content,
      content: announcement.content || announcement.message || '',
      category: announcement.category || 'general',
      targetClass: announcement.targetClass || 'Class Five',
      createdAt: now,
      date: now,
      pinned: Boolean(announcement.pinned),
      author: announcement.author || "Ustadh Muhammad Shaya'u",
      parents: announcement.parents || 'Class Five Parents'
    };
  }

  // -------------------------------------------------------------------
  // 6. WEEKLY REPORTS GENERATION & CALCULATION ENGINE
  // -------------------------------------------------------------------
  /**
   * Aggregates raw attendance, memorization logs, and daily activities
   * into the exact schema-required Weekly Report model.
   */
  static calculateWeeklyReport(params: {
    student: Student;
    attendanceRecords: AttendanceRecord[];
    memorizationRecords: MemorizationRecord[];
    dailyActivities: DailyActivity[];
    startDate: string;
    endDate: string;
    teacherComment?: string;
  }): WeeklyReportRecord {
    const { student, attendanceRecords, memorizationRecords, dailyActivities, startDate, endDate, teacherComment } = params;

    // Filter by student and date range
    const studentAttendance = attendanceRecords.filter(
      a => a.studentId === student.id && a.date >= startDate && a.date <= endDate
    );
    const studentMemorization = memorizationRecords.filter(
      m => m.studentId === student.id && m.date >= startDate && m.date <= endDate
    );
    const studentActivities = dailyActivities.filter(
      d => d.studentId === student.id && d.date >= startDate && d.date <= endDate
    );

    // 1. Attendance Percentage Calculation
    const totalSessions = studentAttendance.length;
    const presentCount = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    // 2. Memorization Percentage Calculation (Quality based on mistakes and completion)
    let memorizationPercentage = 95;
    if (studentMemorization.length > 0) {
      const avgMistakes = studentMemorization.reduce((acc, r) => acc + r.mistakes, 0) / studentMemorization.length;
      // 0 mistakes = 100%, 1 mistake = 95%, 2 mistakes = 90%, 3 = 85%, etc.
      memorizationPercentage = Math.max(60, Math.min(100, Math.round(100 - avgMistakes * 5)));
    }

    // 3. Activity Percentage Calculation (Average of homework, participation, neatness, respect, self-control)
    let activityPercentage = 96;
    if (studentActivities.length > 0) {
      const totalActivitiesScore = studentActivities.reduce((acc, a) => {
        const dayAvg = (
          a.homeworkPct + 
          a.classParticipationPct + 
          a.neatnessPct + 
          a.respectPct + 
          a.selfControlPct
        ) / 5;
        return acc + dayAvg;
      }, 0);
      activityPercentage = Math.round(totalActivitiesScore / studentActivities.length);
    }

    // 4. Overall Percentage Calculation
    // Weighted formula: 40% Memorization + 35% Daily Activities + 25% Attendance
    const overallPercentage = Math.round(
      memorizationPercentage * 0.40 + 
      activityPercentage * 0.35 + 
      attendancePercentage * 0.25
    );

    // Default Islamic praise comment if none provided
    const comment = teacherComment || (
      overallPercentage >= 90
        ? "Masha'Allah, exemplary dedication in both Sabaq and Adab. An inspiring member of the Halaqah circle."
        : overallPercentage >= 80
        ? "Very good progress this week. Continued evening Muraja'ah (revision) with parents will strengthen retention."
        : "Acceptable recitation; please ensure punctual arrival and dedicated daily revision at home."
    );

    return {
      id: crypto.randomUUID(),
      studentId: student.id,
      startDate,
      endDate,
      attendancePercentage,
      memorizationPercentage,
      activityPercentage,
      overallPercentage,
      teacherComment: comment
    };
  }

  // -------------------------------------------------------------------
  // 7. ACADEMIC SESSIONS & CALENDAR REPOSITORY (Phase 2)
  // -------------------------------------------------------------------
  static normalizeAcademicSession(raw: Partial<AcademicSession>): AcademicSession {
    const id = raw.id || `session-${Date.now()}`;
    const name = raw.name || '2026/2027';
    const startDate = raw.startDate || '2026-08-29';
    const endDate = raw.endDate || '2027-07-21';
    
    // Ensure 3 standard terms are always present
    const defaultTerms: AcademicTerm[] = [
      {
        id: `term-1-${id}`,
        termType: 'term_1',
        nameEn: 'First Term',
        nameAr: 'الفصل الدراسي الأول',
        startDate: startDate,
        endDate: '2026-12-16',
        instructionalWeeksCount: 16,
        weekStartDay: 6,
        status: raw.status === 'completed' ? 'completed' : 'active',
        isCurrent: raw.status !== 'completed',
        holidays: []
      },
      {
        id: `term-2-${id}`,
        termType: 'term_2',
        nameEn: 'Second Term',
        nameAr: 'الفصل الدراسي الثاني',
        startDate: '2027-01-09',
        endDate: '2027-04-14',
        instructionalWeeksCount: 14,
        weekStartDay: 6,
        status: raw.status === 'completed' ? 'completed' : 'upcoming',
        isCurrent: false,
        holidays: []
      },
      {
        id: `term-3-${id}`,
        termType: 'term_3',
        nameEn: 'Third Term',
        nameAr: 'الفصل الدراسي الثالث',
        startDate: '2027-05-01',
        endDate: endDate,
        instructionalWeeksCount: 12,
        weekStartDay: 6,
        status: raw.status === 'completed' ? 'completed' : 'upcoming',
        isCurrent: false,
        holidays: []
      }
    ];

    return {
      id,
      name,
      nameAr: raw.nameAr || `${name} م`,
      startDate,
      endDate,
      status: raw.status || 'upcoming',
      isCurrent: Boolean(raw.isCurrent),
      terms: Array.isArray(raw.terms) && raw.terms.length === 3 ? raw.terms : defaultTerms,
      createdAt: raw.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: raw.updatedAt,
      publishedAt: raw.publishedAt
    };
  }

  static setActiveSession(sessionId: string, sessions: AcademicSession[]): AcademicSession[] {
    return sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          isCurrent: true,
          status: s.status === 'upcoming' ? 'active' : s.status,
          updatedAt: new Date().toISOString()
        };
      }
      return {
        ...s,
        isCurrent: false
      };
    });
  }

  static completeSession(sessionId: string, sessions: AcademicSession[]): AcademicSession[] {
    return sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'completed',
          isCurrent: false,
          terms: s.terms.map(t => ({ ...t, status: 'completed', isCurrent: false })),
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
  }

  static checkRecordsInPeriod(
    startDate: string,
    endDate: string,
    records: { attendance: AttendanceRecord[]; quranLogs: QuranLog[] }
  ): { hasRecords: boolean; attendanceCount: number; quranLogsCount: number; message?: string } {
    const attendanceCount = records.attendance.filter(a => a.date >= startDate && a.date <= endDate).length;
    const quranLogsCount = records.quranLogs.filter(q => q.date >= startDate && q.date <= endDate).length;
    const hasRecords = attendanceCount > 0 || quranLogsCount > 0;

    let message: string | undefined;
    if (hasRecords) {
      message = `This period already contains ${attendanceCount} attendance logs and ${quranLogsCount} Qur’an recitations. Modifying dates may affect historical reporting.`;
    }

    return {
      hasRecords,
      attendanceCount,
      quranLogsCount,
      message
    };
  }

  // -------------------------------------------------------------------
  // 8. STUDENT WEEKLY TARGETS REPOSITORY (Phase 4)
  // -------------------------------------------------------------------
  static validateWeeklyTarget(
    data: Partial<StudentWeeklyTarget>,
    existingTargets: StudentWeeklyTarget[],
    editingTargetId?: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.studentId) {
      errors.push('A valid student must be selected.');
    }
    if (!data.sessionId) {
      errors.push('An academic session must be selected.');
    }
    if (!data.termId) {
      errors.push('An academic term must be selected.');
    }
    if (!data.weekNumber || data.weekNumber < 1) {
      errors.push('A valid week number (1 or greater) must be selected.');
    }
    if (!data.assignmentDeadline) {
      errors.push('An assignment deadline date is required.');
    }
    if (!data.ranges || data.ranges.length === 0) {
      errors.push('At least one Qur’an memorization target range must be specified.');
    } else {
      data.ranges.forEach((r, idx) => {
        if (!r.surahNumber || r.surahNumber < 1 || r.surahNumber > 114) {
          errors.push(`Range #${idx + 1}: Invalid Surah number (${r.surahNumber}).`);
        }
        if (!r.startAyah || r.startAyah < 1) {
          errors.push(`Range #${idx + 1}: Start Ayah must be 1 or greater.`);
        }
        if (!r.endAyah || r.endAyah < r.startAyah) {
          errors.push(`Range #${idx + 1}: End Ayah (${r.endAyah}) cannot be less than Start Ayah (${r.startAyah}).`);
        }
      });
    }

    // Anti-duplication check: A student can only have ONE target per (studentId, sessionId, termId, weekNumber)
    if (data.studentId && data.sessionId && data.termId && data.weekNumber) {
      const isDuplicate = existingTargets.some(t => 
        t.id !== editingTargetId &&
        t.studentId === data.studentId &&
        t.sessionId === data.sessionId &&
        t.termId === data.termId &&
        t.weekNumber === data.weekNumber
      );

      if (isDuplicate) {
        errors.push(
          `Target already exists for this student in Week ${data.weekNumber} of this term. Please amend the existing target rather than creating a duplicate.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static createWeeklyTarget(
    targetInput: Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>,
    operatorName = 'Authorized Teacher'
  ): StudentWeeklyTarget {
    const now = new Date().toISOString();
    const id = `target-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const initialAudit: TargetAuditRecord = {
      id: `audit-${Date.now()}-1`,
      timestamp: now,
      action: 'created',
      modifiedBy: operatorName,
      changeSummary: `Target created with ${targetInput.ranges.length} range(s) totaling ${targetInput.totalTargetAyahs} ayahs.`
    };

    return {
      ...targetInput,
      id,
      createdAt: now,
      updatedAt: now,
      auditTrail: [initialAudit]
    };
  }

  static amendWeeklyTarget(
    existingTarget: StudentWeeklyTarget,
    updates: Partial<Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'auditTrail'>>,
    amendmentReason: string,
    operatorName = 'Authorized Teacher'
  ): StudentWeeklyTarget {
    const now = new Date().toISOString();
    const previousSummary = `${existingTarget.ranges.map(r => `${r.surahName} (${r.startAyah}–${r.endAyah})`).join(', ')} [${existingTarget.totalTargetAyahs} ayahs]`;

    const auditEntry: TargetAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      action: 'amended',
      modifiedBy: operatorName,
      changeSummary: amendmentReason || 'Target ranges or parameters amended by teacher',
      previousSummary
    };

    return {
      ...existingTarget,
      ...updates,
      status: 'amended',
      updatedAt: now,
      auditTrail: [auditEntry, ...existingTarget.auditTrail]
    };
  }

  // -------------------------------------------------------------------
  // 9. DAILY MEMORIZATION RECORDING REPOSITORY (Phase 5)
  // -------------------------------------------------------------------
  static validateDailyMemorizationEntry(
    data: Partial<DailyMemorizationEntry>,
    existingEntries: DailyMemorizationEntry[],
    editingEntryId?: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.studentId) {
      errors.push('A valid student must be selected.');
    }
    if (!data.sessionId) {
      errors.push('An academic session must be selected.');
    }
    if (!data.termId) {
      errors.push('An academic term must be selected.');
    }
    if (!data.weekNumber || data.weekNumber < 1) {
      errors.push('A valid instructional week number must be provided.');
    }
    if (!data.actualSubmissionDate) {
      errors.push('The actual submission date is required.');
    }
    if (!data.reviewStatus || !['awaiting_review', 'accepted', 'requires_correction'].includes(data.reviewStatus)) {
      errors.push('A valid review status must be provided (Awaiting Review, Accepted, or Requires Correction).');
    }

    // Qur'an reference range validation
    if (!data.surahNumber || data.surahNumber < 1 || data.surahNumber > 114) {
      errors.push(`Invalid Surah number (${data.surahNumber}). Must be between 1 and 114.`);
    } else {
      const surah = getSurahByNumber(data.surahNumber);
      if (!surah) {
        errors.push(`Surah #${data.surahNumber} not found in reference database.`);
      } else {
        if (!data.startAyah || data.startAyah < 1) {
          errors.push('Starting Ayah must be 1 or greater.');
        } else if (data.startAyah > surah.ayahCount) {
          errors.push(`Starting Ayah (${data.startAyah}) exceeds Surah ${surah.name}'s total ayahs (${surah.ayahCount}).`);
        }

        if (!data.endAyah || data.endAyah < 1) {
          errors.push('Ending Ayah must be 1 or greater.');
        } else if (data.endAyah > surah.ayahCount) {
          errors.push(`Ending Ayah (${data.endAyah}) exceeds Surah ${surah.name}'s total ayahs (${surah.ayahCount}).`);
        } else if (data.startAyah && data.endAyah < data.startAyah) {
          errors.push(`Ending Ayah (${data.endAyah}) cannot be less than Starting Ayah (${data.startAyah}).`);
        }

        if (data.startPage && (data.startPage < 1 || data.startPage > 604)) {
          errors.push(`Starting Page (${data.startPage}) must be between 1 and 604.`);
        }
        if (data.endPage && (data.endPage < 1 || data.endPage > 604)) {
          errors.push(`Ending Page (${data.endPage}) must be between 1 and 604.`);
        } else if (data.startPage && data.endPage && data.endPage < data.startPage) {
          errors.push(`Ending Page (${data.endPage}) cannot be less than Starting Page (${data.startPage}).`);
        }
      }
    }

    // Duplicate record prevention
    // Prevent duplicate records from inflating progress for same student, same surah, and overlapping ayah range on the same submission date or week
    if (data.studentId && data.surahNumber && data.startAyah && data.endAyah && data.actualSubmissionDate) {
      const isDuplicate = existingEntries.some(existing => {
        if (existing.id === editingEntryId) return false;
        if (existing.studentId !== data.studentId) return false;
        if (existing.surahNumber !== data.surahNumber) return false;
        // If an existing entry was rejected with 'requires_correction', a re-submission is allowed
        if (existing.reviewStatus === 'requires_correction') return false;

        // Check date or week overlap
        const isSameDate = existing.actualSubmissionDate === data.actualSubmissionDate;
        const isSameWeek = existing.sessionId === data.sessionId && 
                           existing.termId === data.termId && 
                           existing.weekNumber === data.weekNumber;

        if (!isSameDate && !isSameWeek) return false;

        // Check ayah range overlap: [startA, endA] overlaps [startB, endB] iff startA <= endB && endA >= startB
        const rangesOverlap = (data.startAyah! <= existing.endAyah) && (data.endAyah! >= existing.startAyah);
        return rangesOverlap;
      });

      if (isDuplicate) {
        const surah = getSurahByNumber(data.surahNumber);
        const sName = surah ? surah.name : `Surah ${data.surahNumber}`;
        errors.push(
          `Duplicate record detected: A memorization submission for this student covering ${sName} (Ayahs ${data.startAyah}–${data.endAyah}) has already been recorded for this period. Please edit or correct the existing entry to prevent inflating progress.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static createDailyMemorizationEntry(
    input: Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'entryTimestamp'> & {
      entryTimestamp?: string;
    },
    operatorName = 'Authorized Teacher'
  ): DailyMemorizationEntry {
    const now = new Date().toISOString();
    const entryTimestamp = input.entryTimestamp || now;
    const id = `daily-entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const surah = getSurahByNumber(input.surahNumber);
    const surahName = surah?.name || input.surahName || `Surah ${input.surahNumber}`;
    const surahArabicName = surah?.arabicName || input.surahArabicName || '';
    const startPage = input.startPage || getPageForAyah(input.surahNumber, input.startAyah);
    const endPage = input.endPage || getPageForAyah(input.surahNumber, input.endAyah);
    const totalAyahs = Math.max(1, input.endAyah - input.startAyah + 1);
    const totalPages = Math.max(1, endPage - startPage + 1);
    const juzNumber = surah?.juzNumber || 1;

    // Day of the week derivation if not provided
    const dayInfo = getDayOfWeekName(input.actualSubmissionDate);
    const dayOfWeek = input.dayOfWeek || dayInfo.dayNameEn;
    const dayOfWeekAr = input.dayOfWeekAr || dayInfo.dayNameAr;

    const initialAudit: MemorizationAuditRecord = {
      id: `audit-entry-${Date.now()}-1`,
      timestamp: entryTimestamp,
      action: 'created',
      modifiedBy: operatorName,
      changeSummary: `Recorded daily memorization: ${surahName} (${input.startAyah}–${input.endAyah}) [${totalAyahs} ayahs], Status: ${input.reviewStatus}.`
    };

    return {
      ...input,
      id,
      surahName,
      surahArabicName,
      startPage,
      endPage,
      totalAyahs,
      totalPages,
      juzNumber,
      dayOfWeek,
      dayOfWeekAr,
      entryTimestamp,
      createdAt: now,
      updatedAt: now,
      auditTrail: [initialAudit]
    };
  }

  static correctDailyMemorizationEntry(
    existingEntry: DailyMemorizationEntry,
    updates: Partial<Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'auditTrail' | 'entryTimestamp'>>,
    correctionReason: string,
    operatorName = 'Authorized Teacher'
  ): DailyMemorizationEntry {
    const now = new Date().toISOString();
    const previousSummary = `${existingEntry.surahName} (${existingEntry.startAyah}–${existingEntry.endAyah}) [${existingEntry.totalAyahs} ayahs], Status: ${existingEntry.reviewStatus}`;

    const newSurahNumber = updates.surahNumber || existingEntry.surahNumber;
    const newStartAyah = updates.startAyah || existingEntry.startAyah;
    const newEndAyah = updates.endAyah || existingEntry.endAyah;
    const surah = getSurahByNumber(newSurahNumber);
    const surahName = surah?.name || updates.surahName || existingEntry.surahName;
    const surahArabicName = surah?.arabicName || updates.surahArabicName || existingEntry.surahArabicName;

    const startPage = updates.startPage || getPageForAyah(newSurahNumber, newStartAyah);
    const endPage = updates.endPage || getPageForAyah(newSurahNumber, newEndAyah);
    const totalAyahs = Math.max(1, newEndAyah - newStartAyah + 1);
    const totalPages = Math.max(1, endPage - startPage + 1);

    const auditEntry: MemorizationAuditRecord = {
      id: `audit-entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      action: 'corrected',
      modifiedBy: operatorName,
      changeSummary: `Corrected: ${surahName} (${newStartAyah}–${newEndAyah}) [${totalAyahs} ayahs], Status: ${updates.reviewStatus || existingEntry.reviewStatus}`,
      previousSummary,
      reason: correctionReason || 'Teacher made authorized correction to memorization record'
    };

    return {
      ...existingEntry,
      ...updates,
      surahNumber: newSurahNumber,
      surahName,
      surahArabicName,
      startAyah: newStartAyah,
      endAyah: newEndAyah,
      startPage,
      endPage,
      totalAyahs,
      totalPages,
      updatedAt: now,
      auditTrail: [auditEntry, ...existingEntry.auditTrail]
    };
  }

  /**
   * Calculates progress toward a weekly target based ONLY on 'accepted' daily submissions.
   * Submissions that are 'awaiting_review' or 'requires_correction' do NOT count.
   */
  static calculateStudentWeeklyProgress(
    target: StudentWeeklyTarget,
    entries: DailyMemorizationEntry[]
  ): {
    totalTargetAyahs: number;
    completedAcceptedAyahs: number;
    completionPercentage: number;
    isTargetComplete: boolean;
    pendingReviewAyahs: number;
    requiresCorrectionAyahs: number;
    acceptedEntriesCount: number;
    pendingEntriesCount: number;
  } {
    const totalTargetAyahs = target.totalTargetAyahs || 1;

    // Filter entries belonging to this student and academic period
    const studentPeriodEntries = entries.filter(e => 
      e.studentId === target.studentId &&
      e.sessionId === target.sessionId &&
      e.termId === target.termId &&
      e.weekNumber === target.weekNumber
    );

    // Track accepted unique ayahs by "surahNumber:ayah" to avoid overcounting
    const acceptedAyahsSet = new Set<string>();
    const pendingAyahsSet = new Set<string>();
    const correctionAyahsSet = new Set<string>();

    let acceptedEntriesCount = 0;
    let pendingEntriesCount = 0;

    studentPeriodEntries.forEach(entry => {
      // Check if entry belongs to one of target's ranges
      const matchesTargetSurah = target.ranges.some(r => r.surahNumber === entry.surahNumber);
      if (!matchesTargetSurah) return;

      for (let a = entry.startAyah; a <= entry.endAyah; a++) {
        // Must fall within one of target's assigned ayah ranges
        const fallsInTarget = target.ranges.some(r => 
          r.surahNumber === entry.surahNumber && a >= r.startAyah && a <= r.endAyah
        );
        if (!fallsInTarget) continue;

        const key = `${entry.surahNumber}:${a}`;
        if (entry.reviewStatus === 'accepted') {
          acceptedAyahsSet.add(key);
        } else if (entry.reviewStatus === 'awaiting_review') {
          pendingAyahsSet.add(key);
        } else if (entry.reviewStatus === 'requires_correction') {
          correctionAyahsSet.add(key);
        }
      }

      if (entry.reviewStatus === 'accepted') acceptedEntriesCount++;
      if (entry.reviewStatus === 'awaiting_review') pendingEntriesCount++;
    });

    const completedAcceptedAyahs = acceptedAyahsSet.size;
    const completionPercentage = Math.min(100, Math.round((completedAcceptedAyahs / totalTargetAyahs) * 100));
    const isTargetComplete = completedAcceptedAyahs >= totalTargetAyahs;

    return {
      totalTargetAyahs,
      completedAcceptedAyahs,
      completionPercentage,
      isTargetComplete,
      pendingReviewAyahs: pendingAyahsSet.size,
      requiresCorrectionAyahs: correctionAyahsSet.size,
      acceptedEntriesCount,
      pendingEntriesCount
    };
  }
}
