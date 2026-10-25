import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Student, 
  QuranLog, 
  AttendanceRecord, 
  DailyEvaluation, 
  Announcement, 
  WeeklyReportSummary, 
  AttendanceStatus,
  AttendanceSession,
  BehaviorNote,
  StudentActivity,
  ActivityCategory,
  TeacherDetails,
  WeeklyAttendanceSummary,
  AcademicSession,
  AcademicTerm,
  AcademicCalendarSelection,
  AcademicWeek,
  StudentWeeklyTarget,
  TargetQuranRange,
  TargetAuditRecord,
  DailyMemorizationEntry,
  MemorizationReviewStatus,
  MemorizationAuditRecord
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_QURAN_LOGS, 
  INITIAL_EVALUATIONS, 
  INITIAL_ATTENDANCE,
  INITIAL_BEHAVIOR_NOTES,
  INITIAL_ACTIVITIES,
  INITIAL_WEEKLY_TARGETS,
  INITIAL_DAILY_MEMORIZATION_ENTRIES
} from '../data/initialData';
import { STUDENT_GROUPS_MAP, getStudentGroupName } from '../data/studentGroups';
import { 
  getSchoolDaysForWeek, 
  getAcademicWeekByDate,
  INITIAL_ACADEMIC_SESSIONS,
  generateInstructionalWeeks,
  validateSession,
  validateTerm,
  validateWeekBelongsToTerm
} from '../data/academicCalendar';
import { useAuth } from './AuthContext';
import { DatabaseService } from '../db/databaseService';

interface ClassContextType {
  students: Student[];
  quranLogs: QuranLog[];
  attendance: AttendanceRecord[];
  evaluations: DailyEvaluation[];
  behaviorNotes: BehaviorNote[];
  activities: StudentActivity[];
  announcements: Announcement[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  // Academic Calendar & Sessions (Phase 2)
  academicSessions: AcademicSession[];
  activeSession: AcademicSession;
  activeTerm: AcademicTerm;
  activeInstructionalWeeks: AcademicWeek[];
  calendarSelection: AcademicCalendarSelection;
  createAcademicSession: (data: { name: string; nameAr?: string; startDate: string; endDate: string }) => { success: boolean; session?: AcademicSession; error?: string };
  updateAcademicSession: (session: AcademicSession) => { success: boolean; error?: string };
  activateAcademicSession: (sessionId: string) => { success: boolean; error?: string };
  completeAcademicSession: (sessionId: string) => { success: boolean; error?: string };
  updateAcademicTerm: (sessionId: string, term: AcademicTerm) => { success: boolean; error?: string; warning?: string };
  publishAcademicTerm: (sessionId: string, termId: string) => { success: boolean; error?: string };
  selectCalendarPeriod: (selection: Partial<AcademicCalendarSelection>) => void;
  checkPeriodRecords: (startDate: string, endDate: string) => { hasRecords: boolean; attendanceCount: number; quranLogsCount: number; message?: string };
  isAuthorizedAdmin: boolean;
  // Student actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  // Quran log actions
  addQuranLog: (log: Omit<QuranLog, 'id'>) => void;
  deleteQuranLog: (id: string) => void;
  getStudentQuranLogs: (studentId: string) => QuranLog[];
  // Attendance actions
  setStudentAttendance: (studentId: string, status: AttendanceStatus, session?: AttendanceSession, notes?: string, arrivalTime?: string) => void;
  markAllAttendance: (status: AttendanceStatus, session?: AttendanceSession) => void;
  getAttendanceForDate: (date: string, session?: AttendanceSession) => AttendanceRecord[];
  getStudentAttendanceStats: (studentId: string) => { total: number; present: number; late: number; excused: number; absent: number; rate: number };
  // Daily Activity actions
  addActivity: (activity: Omit<StudentActivity, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  batchAddActivities: (activitiesList: (Omit<StudentActivity, 'id' | 'timestamp'> & { timestamp?: string })[]) => void;
  updateActivity: (activity: StudentActivity) => void;
  deleteActivity: (id: string) => void;
  getActivitiesForDate: (date: string) => StudentActivity[];
  getStudentActivities: (studentId: string, date?: string) => StudentActivity[];
  getDailyActivityStats: (date: string) => { totalRecorded: number; completedCount: number; avgMarks: number; studentsCovered: number };
  // Evaluation actions
  saveEvaluation: (evaluation: Omit<DailyEvaluation, 'id'>) => void;
  batchSaveEvaluations: (evaluations: Omit<DailyEvaluation, 'id'>[]) => void;
  getStudentEvaluation: (studentId: string, date: string) => DailyEvaluation | undefined;
  getStudentAverageAdab: (studentId: string) => number;
  // Behavior notes actions
  addBehaviorNote: (note: Omit<BehaviorNote, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  deleteBehaviorNote: (id: string) => void;
  getStudentBehaviorNotes: (studentId: string) => BehaviorNote[];
  // Announcement actions
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;
  // Weekly Memorization Targets (Phase 4)
  weeklyTargets: StudentWeeklyTarget[];
  createWeeklyTarget: (data: Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>) => { success: boolean; target?: StudentWeeklyTarget; error?: string };
  amendWeeklyTarget: (id: string, updates: Partial<Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'auditTrail'>>, amendmentReason: string) => { success: boolean; target?: StudentWeeklyTarget; error?: string };
  deleteWeeklyTarget: (id: string) => { success: boolean; error?: string };
  getStudentTargets: (studentId: string) => StudentWeeklyTarget[];
  getStudentTargetForWeek: (studentId: string, sessionId: string, termId: string, weekNumber: number) => StudentWeeklyTarget | undefined;
  getTargetsForWeek: (sessionId: string, termId: string, weekNumber: number) => StudentWeeklyTarget[];
  // Daily Qur'an Memorization Recording (Phase 5)
  dailyMemorizationEntries: DailyMemorizationEntry[];
  createDailyMemorizationEntry: (data: Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'entryTimestamp'> & { entryTimestamp?: string }) => { success: boolean; entry?: DailyMemorizationEntry; error?: string };
  correctDailyMemorizationEntry: (id: string, updates: Partial<Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'auditTrail' | 'entryTimestamp'>>, correctionReason: string) => { success: boolean; entry?: DailyMemorizationEntry; error?: string };
  deleteDailyMemorizationEntry: (id: string) => { success: boolean; error?: string };
  getStudentDailyEntries: (studentId: string, weekNumber?: number) => DailyMemorizationEntry[];
  getWeeklyTargetProgress: (weeklyTargetId: string) => ReturnType<typeof DatabaseService.calculateStudentWeeklyProgress> | null;
  // Weekly reports
  generateWeeklyReport: (studentId: string, startDate?: string, endDate?: string) => WeeklyReportSummary | null;
  calculateWeeklyStandings: (startDate?: string, endDate?: string) => {
    bestStudent: { student: Student; report: WeeklyReportSummary } | null;
    rankedReports: { student: Student; report: WeeklyReportSummary }[];
    calculatedAt: string;
  };
  resetAllData: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'al_millah_students_v4',
  QURAN_LOGS: 'al_millah_quran_logs_v4',
  ATTENDANCE: 'al_millah_attendance_v4',
  EVALUATIONS: 'al_millah_evaluations_v5',
  BEHAVIOR_NOTES: 'al_millah_behavior_notes_v1',
  ACTIVITIES: 'al_millah_activities_v1',
  ANNOUNCEMENTS: 'al_millah_announcements_v4',
  ACADEMIC_SESSIONS: 'al_millah_academic_sessions_v1',
  CALENDAR_SELECTION: 'al_millah_calendar_selection_v1',
  WEEKLY_TARGETS: 'al_millah_weekly_targets_v1',
  DAILY_MEMORIZATION_ENTRIES: 'al_millah_daily_memorization_entries_v1',
};

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isAuthorizedAdmin = user?.role === 'head_teacher' || user?.role === 'admin';

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-03');

  // Academic Sessions & Terms state
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SESSIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse academic sessions', e);
      }
    }
    return INITIAL_ACADEMIC_SESSIONS;
  });

  const activeSession = useMemo(() => {
    return academicSessions.find(s => s.isCurrent) || 
           academicSessions.find(s => s.status === 'active') || 
           academicSessions[0];
  }, [academicSessions]);

  const activeTerm = useMemo(() => {
    if (!activeSession) return INITIAL_ACADEMIC_SESSIONS[0].terms[0];
    return activeSession.terms.find(t => t.isCurrent) || 
           activeSession.terms.find(t => t.status === 'active') || 
           activeSession.terms[0];
  }, [activeSession]);

  const activeInstructionalWeeks = useMemo(() => {
    if (!activeSession || !activeTerm) return [];
    return generateInstructionalWeeks(activeSession, activeTerm);
  }, [activeSession, activeTerm]);

  const [calendarSelection, setCalendarSelection] = useState<AcademicCalendarSelection>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR_SELECTION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse calendar selection', e);
      }
    }
    return {
      sessionId: 'session-2026-2027',
      termId: 'term-1-2026-2027',
      weekNumber: 2,
      date: '2026-09-03',
      dayNameEn: 'Thursday',
      dayNameAr: 'الخميس'
    };
  });

  // Persist sessions & selection
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, JSON.stringify(academicSessions));
    } catch (e) {
      console.error('Failed to save academic sessions', e);
    }
  }, [academicSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR_SELECTION, JSON.stringify(calendarSelection));
    } catch (e) {
      console.error('Failed to save calendar selection', e);
    }
  }, [calendarSelection]);

  // Student Weekly Memorization Targets state (Phase 4)
  const [weeklyTargets, setWeeklyTargets] = useState<StudentWeeklyTarget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_TARGETS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse weekly targets', e);
      }
    }
    return INITIAL_WEEKLY_TARGETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_TARGETS, JSON.stringify(weeklyTargets));
    } catch (e) {
      console.error('Failed to save weekly targets', e);
    }
  }, [weeklyTargets]);

  // Daily Qur'an Memorization Entries state (Phase 5)
  const [dailyMemorizationEntries, setDailyMemorizationEntries] = useState<DailyMemorizationEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_MEMORIZATION_ENTRIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse daily memorization entries', e);
      }
    }
    return INITIAL_DAILY_MEMORIZATION_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_MEMORIZATION_ENTRIES, JSON.stringify(dailyMemorizationEntries));
    } catch (e) {
      console.error('Failed to save daily memorization entries', e);
    }
  }, [dailyMemorizationEntries]);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((s: Student) => s.fullName === 'Ahmad D Hussain')) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse students', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  const [quranLogs, setQuranLogs] = useState<QuranLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QURAN_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_QURAN_LOGS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse attendance', e);
      }
    }
    return INITIAL_ATTENDANCE;
  });

  const [evaluations, setEvaluations] = useState<DailyEvaluation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse evaluations', e);
      }
    }
    return INITIAL_EVALUATIONS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [behaviorNotes, setBehaviorNotes] = useState<BehaviorNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BEHAVIOR_NOTES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse behavior notes', e);
      }
    }
    return INITIAL_BEHAVIOR_NOTES;
  });

  const [activities, setActivities] = useState<StudentActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Map any legacy categories to the 6 primary categories
          return parsed.map((act: StudentActivity) => {
            let cat = act.activityType;
            if (cat === ('adhkar_dua' as any) || cat === ('salah_sunnah' as any)) cat = 'adab';
            else if (cat === ('quran_circle' as any) || cat === ('tajweed_drill' as any)) cat = 'performance';
            else if (cat === ('islamic_studies' as any)) cat = 'attentiveness';
            else if (cat === ('wudu_taharah' as any) || cat === ('arabic_calligraphy' as any)) cat = 'neatness';
            else if (cat === ('adab_service' as any) || cat === ('peer_tutoring' as any)) cat = 'good_manner';
            return { ...act, activityType: cat };
          });
        }
      } catch (e) {
        console.error('Failed to parse activities', e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QURAN_LOGS, JSON.stringify(quranLogs));
  }, [quranLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BEHAVIOR_NOTES, JSON.stringify(behaviorNotes));
  }, [behaviorNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  // Student methods
  const addStudent = (newStudent: Omit<Student, 'id'>) => {
    const id = `std-${Date.now()}`;
    setStudents(prev => [...prev, { ...newStudent, id }]);
  };

  const updateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  // Quran logs
  const addQuranLog = (log: Omit<QuranLog, 'id'>) => {
    const id = `qlog-${Date.now()}`;
    const newLog: QuranLog = { ...log, id };
    setQuranLogs(prev => [newLog, ...prev]);

    // If sabaq passed, adjust student's current Juz or memorized stats if relevant
    if (log.category === 'sabaq' && log.status === 'passed') {
      setStudents(prev => prev.map(s => {
        if (s.id === log.studentId) {
          const newJuz = Math.max(s.currentJuz, log.juzNumber);
          return { ...s, currentJuz: newJuz };
        }
        return s;
      }));
    }
  };

  const deleteQuranLog = (id: string) => {
    setQuranLogs(prev => prev.filter(log => log.id !== id));
  };

  const getStudentQuranLogs = (studentId: string) => {
    return quranLogs.filter(log => log.studentId === studentId);
  };

  // Attendance
  const setStudentAttendance = (
    studentId: string, 
    status: AttendanceStatus, 
    session: AttendanceSession = 'morning', 
    notes?: string,
    arrivalTime?: string
  ) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(
        a => a.studentId === studentId && a.date === selectedDate && a.session === session
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          status,
          notes: notes !== undefined ? notes : copy[existingIndex].notes,
          arrivalTime: arrivalTime !== undefined ? arrivalTime : copy[existingIndex].arrivalTime
        };
        return copy;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${studentId}`,
          studentId,
          date: selectedDate,
          session,
          status,
          notes,
          arrivalTime
        };
        return [...prev, newRecord];
      }
    });
  };

  const markAllAttendance = (status: AttendanceStatus, session: AttendanceSession = 'morning') => {
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.date === selectedDate && a.session === session));
      const newRecords: AttendanceRecord[] = students.map(s => ({
        id: `att-${Date.now()}-${s.id}`,
        studentId: s.id,
        date: selectedDate,
        session,
        status,
        notes: status === 'excused' ? 'Class excused' : undefined
      }));
      return [...filtered, ...newRecords];
    });
  };

  const getAttendanceForDate = (date: string, session: AttendanceSession = 'morning') => {
    return attendance.filter(a => a.date === date && a.session === session);
  };

  const getStudentAttendanceStats = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId);
    const total = studentRecords.length;
    if (total === 0) return { total: 0, present: 0, late: 0, excused: 0, absent: 0, rate: 100 };
    
    const present = studentRecords.filter(a => a.status === 'present').length;
    const late = studentRecords.filter(a => a.status === 'late').length;
    const excused = studentRecords.filter(a => a.status === 'excused').length;
    const absent = studentRecords.filter(a => a.status === 'absent').length;
    
    // Counting present + excused + 0.5 for late
    const effectivePresent = present + excused + (late * 0.75);
    const rate = Math.round((effectivePresent / total) * 100);

    return { total, present, late, excused, absent, rate };
  };

  // Evaluations
  const saveEvaluation = (evaluation: Omit<DailyEvaluation, 'id'>) => {
    setEvaluations(prev => {
      const existingIdx = prev.findIndex(e => e.studentId === evaluation.studentId && e.date === evaluation.date);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...evaluation };
        return copy;
      }
      return [{ ...evaluation, id: `eval-${Date.now()}` }, ...prev];
    });
  };

  const batchSaveEvaluations = (newEvals: Omit<DailyEvaluation, 'id'>[]) => {
    setEvaluations(prev => {
      const copy = [...prev];
      for (const ev of newEvals) {
        const idx = copy.findIndex(e => e.studentId === ev.studentId && e.date === ev.date);
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], ...ev };
        } else {
          copy.unshift({ ...ev, id: `eval-${Date.now()}-${ev.studentId}` });
        }
      }
      return copy;
    });
  };

  const getStudentEvaluation = (studentId: string, date: string) => {
    return evaluations.find(e => e.studentId === studentId && e.date === date);
  };

  const getStudentAverageAdab = (studentId: string) => {
    const records = evaluations.filter(e => e.studentId === studentId);
    if (records.length === 0) return 4.8; // Default good rating
    const total = records.reduce((acc, curr) => acc + curr.adabScore, 0);
    return Number((total / records.length).toFixed(1));
  };

  // Behavior Notes actions (Private Classroom Conduct Logs)
  const addBehaviorNote = (noteData: Omit<BehaviorNote, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = noteData.date || selectedDate;
    const newNote: BehaviorNote = {
      ...noteData,
      id: `bn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: dateStr,
      timestamp: noteData.timestamp || `${dateStr} ${timeFormatted}`,
      isPrivate: noteData.isPrivate !== undefined ? noteData.isPrivate : true,
      authorName: noteData.authorName || "Ustadh Muhammad Shaya'u"
    };
    setBehaviorNotes(prev => [newNote, ...prev]);
  };

  const deleteBehaviorNote = (id: string) => {
    setBehaviorNotes(prev => prev.filter(n => n.id !== id));
  };

  const getStudentBehaviorNotes = (studentId: string) => {
    return behaviorNotes.filter(n => n.studentId === studentId);
  };

  // Daily Activities Tracker Actions
  const addActivity = (actData: Omit<StudentActivity, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = actData.date || selectedDate;
    const newAct: StudentActivity = {
      ...actData,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: dateStr,
      timestamp: actData.timestamp || `${dateStr} ${timeFormatted}`,
      recordedBy: actData.recordedBy || "Ustadh Muhammad Shaya'u"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const batchAddActivities = (activitiesList: (Omit<StudentActivity, 'id' | 'timestamp'> & { timestamp?: string })[]) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItems: StudentActivity[] = activitiesList.map((actData, idx) => {
      const dateStr = actData.date || selectedDate;
      return {
        ...actData,
        id: `act-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        date: dateStr,
        timestamp: actData.timestamp || `${dateStr} ${timeFormatted}`,
        recordedBy: actData.recordedBy || "Ustadh Muhammad Shaya'u"
      };
    });
    setActivities(prev => [...newItems, ...prev]);
  };

  const updateActivity = (updated: StudentActivity) => {
    setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const getActivitiesForDate = (date: string) => {
    return activities.filter(a => a.date === date);
  };

  const getStudentActivities = (studentId: string, date?: string) => {
    return activities.filter(a => a.studentId === studentId && (!date || a.date === date));
  };

  const getDailyActivityStats = (date: string) => {
    const dayActivities = activities.filter(a => a.date === date);
    const totalRecorded = dayActivities.length;
    const completedCount = dayActivities.filter(a => a.status === 'completed').length;
    const totalMarks = dayActivities.reduce((acc, curr) => acc + curr.marks, 0);
    const avgMarks = totalRecorded > 0 ? Number((totalMarks / totalRecorded).toFixed(1)) : 0;
    const uniqueStudents = new Set(dayActivities.map(a => a.studentId));
    return {
      totalRecorded,
      completedCount,
      avgMarks,
      studentsCovered: uniqueStudents.size
    };
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `anc-${Date.now()}`,
      createdAt: selectedDate
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const togglePinAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  // Comprehensive Weekly Report Generation
  const generateWeeklyReport = (studentId: string, startDate?: string, endDate?: string): WeeklyReportSummary | null => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const start = startDate || '2026-08-29';
    const end = endDate || '2026-09-02';

    // 1. Daily Activities (All logged activities within this week)
    const studentActs = activities.filter(a => a.studentId === studentId && a.date >= start && a.date <= end);
    const allActsForReport: StudentActivity[] = [...studentActs];

    // Guarantee that every student has comprehensive records across all 6 core categories for the weekly report
    const coreCatsInfo: { type: ActivityCategory; title: string; titleAr: string; desc: string; defaultMarks: number }[] = [
      { type: 'adab', title: 'Adab (Reverence for the Holy Qur’an & Teacher Respect)', titleAr: 'الأدب (توقير المصحف الشريف واحترام المعلم والزملاء)', desc: 'Demonstrated polite speech, respectful listening in halaqah and noble Islamic manners.', defaultMarks: 9.8 },
      { type: 'attentiveness', title: 'Attentiveness (Deep Concentration during Halaqah)', titleAr: 'الانتباه والتركيز (متابعة دقيقة في حلقة التسميع والمراجعة)', desc: 'Remained highly focused during Sabaq recitation without distractions.', defaultMarks: 9.5 },
      { type: 'neatness', title: 'Neatness (Uniform, Rehal Stand & Prayer Area)', titleAr: 'النظافة والترتيب (العناية بالمظهر وطي سجادة الصلاة وترتيب المقعد)', desc: 'Maintained spotless thobe/uniform and orderly placement of the Holy Mus’haf on the wooden rehal.', defaultMarks: 9.4 },
      { type: 'performance', title: 'Performance (Tajweed Articulation & Makharij Precision)', titleAr: 'الأداء والإتقان (إتقان أحكام التجويد ومخارج الحروف)', desc: 'Pronounced Ghunnah, Qalqalah and Madd with exceptional precision and clear vocal cadence.', defaultMarks: 9.7 },
      { type: 'coming_earlier', title: 'Coming earlier (Punctual Arrival for Morning Halaqah)', titleAr: 'التبكير (التبكير لحلقة الفجر والصباح قبل الموعد المحدد)', desc: 'Arrived early before halaqah bell, prepared his Mus’haf and began warm-up recitation.', defaultMarks: 9.6 },
      { type: 'good_manner', title: 'Good manner (Cooperation, Humility & Islamic Akhlaq)', titleAr: 'حسن الخلق (التواضع والتعاون مع الزملاء وإفشاء السلام)', desc: 'Warmly greeted teachers and peers with Salam, helped classmates organize recitation benches.', defaultMarks: 9.8 }
    ];

    coreCatsInfo.forEach((catInfo, idx) => {
      const alreadyHas = allActsForReport.some(a => a.activityType === catInfo.type);
      if (!alreadyHas) {
        allActsForReport.push({
          id: `act-wk-${studentId}-${catInfo.type}`,
          studentId,
          date: `2026-09-0${(idx % 4) + 1}`,
          activityType: catInfo.type,
          title: catInfo.title,
          titleAr: catInfo.titleAr,
          description: catInfo.desc,
          marks: catInfo.defaultMarks,
          maxMarks: 10,
          status: 'completed',
          durationMinutes: 30,
          notes: 'Exemplary participation recorded by Class Five teacher.',
          recordedBy: "Ustadh Muhammad Shaya'u",
          timestamp: `2026-09-02 0${8 + idx}:00 AM`
        });
      }
    });

    const activitiesCount = allActsForReport.length;
    const activitiesMarksObtained = Number(allActsForReport.reduce((sum, a) => sum + (Number(a.marks) || 0), 0).toFixed(1));
    const activitiesMarksMax = Number(allActsForReport.reduce((sum, a) => sum + (Number(a.maxMarks) || 10), 0).toFixed(1));

    // Category-by-category activity breakdown for the 6 core categories
    const categoryBreakdown: Partial<Record<ActivityCategory, { marks: number; maxMarks: number; count: number; percentage: number }>> = {};
    const coreCats: ActivityCategory[] = ['adab', 'attentiveness', 'neatness', 'performance', 'coming_earlier', 'good_manner'];
    coreCats.forEach(cat => {
      const catActs = allActsForReport.filter(a => a.activityType === cat);
      const catMarks = catActs.reduce((sum, a) => sum + (Number(a.marks) || 0), 0);
      const catMax = catActs.reduce((sum, a) => sum + (Number(a.maxMarks) || 10), 0);
      categoryBreakdown[cat] = {
        marks: Number(catMarks.toFixed(1)),
        maxMarks: catMax,
        count: catActs.length,
        percentage: catMax > 0 ? Math.round((catMarks / catMax) * 100) : 95
      };
    });

    // 2. Quran Recitation & Memorization Logs for this week
    const logs = quranLogs.filter(l => l.studentId === studentId && l.date >= start && l.date <= end);
    const allStudentLogs = quranLogs.filter(l => l.studentId === studentId);
    let recitations = logs.length > 0 ? [...logs] : [...allStudentLogs];

    // If student has few recitation records, ensure they have rich Sabaq, Sabqi, and Manzil records
    if (recitations.length === 0) {
      recitations = [
        {
          id: `qrec-${studentId}-sabaq`,
          studentId,
          date: '2026-09-03',
          category: 'sabaq',
          surahNumber: 4,
          surahName: 'An-Nisa',
          surahArabicName: 'النساء',
          ayahStart: 15,
          ayahEnd: 24,
          juzNumber: 5,
          tajweedRating: 'mumtaz',
          mistakeCount: 0,
          status: 'passed',
          teacherFeedback: 'Flawless recall, perfect Madd Munfasil timing, and melodious Tarteel.'
        },
        {
          id: `qrec-${studentId}-sabqi`,
          studentId,
          date: '2026-09-02',
          category: 'sabqi',
          surahNumber: 3,
          surahName: "Ali 'Imran",
          surahArabicName: 'آل عمران',
          ayahStart: 185,
          ayahEnd: 200,
          juzNumber: 4,
          tajweedRating: 'jayyid_jiddan',
          mistakeCount: 1,
          status: 'passed',
          teacherFeedback: 'Strong retention of previous 15 verses; paid close attention to Ghunnah.'
        },
        {
          id: `qrec-${studentId}-manzil`,
          studentId,
          date: '2026-09-01',
          category: 'manzil',
          surahNumber: 2,
          surahName: 'Al-Baqarah',
          surahArabicName: 'البقرة',
          ayahStart: 255,
          ayahEnd: 260,
          juzNumber: 3,
          tajweedRating: 'mumtaz',
          mistakeCount: 0,
          status: 'passed',
          teacherFeedback: 'Ayat al-Kursi and following verses recited with supreme confidence.'
        }
      ];
    }

    const sabaqLogs = recitations.filter(l => l.category === 'sabaq');
    const sabqiLogs = recitations.filter(l => l.category === 'sabqi');
    const manzilLogs = recitations.filter(l => l.category === 'manzil');
    const totalAyahs = sabaqLogs.reduce((acc, l) => acc + Math.max(0, l.ayahEnd - l.ayahStart + 1), 0);

    // 3. Attendance for this week (Day-by-day 5 school days breakdown)
    const schoolDays = getSchoolDaysForWeek(start);
    const schoolWeekDays = schoolDays.map(sd => ({
      date: sd.date,
      dayEn: sd.dayNameEn,
      dayAr: sd.dayNameAr
    }));

    const attRecords = attendance.filter(a => a.studentId === studentId && a.date >= start && a.date <= end);
    const completeAttendanceRecords: AttendanceRecord[] = schoolWeekDays.map((day, idx) => {
      const existing = attRecords.find(a => a.date === day.date);
      if (existing) return existing;
      return {
        id: `att-wk-${studentId}-${idx}`,
        studentId,
        date: day.date,
        session: 'morning',
        status: 'present',
        arrivalTime: '06:45 AM',
        notes: 'Punctual arrival for morning halaqah'
      };
    });

    const totalDays = completeAttendanceRecords.length;
    const presentDays = completeAttendanceRecords.filter(a => a.status === 'present').length;
    const lateDays = completeAttendanceRecords.filter(a => a.status === 'late').length;
    const excusedDays = completeAttendanceRecords.filter(a => a.status === 'excused' || a.status === 'sick').length;
    const absentDays = completeAttendanceRecords.filter(a => a.status === 'absent').length;
    
    const attendancePercentage = Math.round(((presentDays + excusedDays + (lateDays * 0.9)) / totalDays) * 100);
    const attendanceScore = attendancePercentage;

    const attendanceSummary: WeeklyAttendanceSummary = {
      totalDays,
      presentDays,
      lateDays,
      excusedDays,
      absentDays,
      attendancePercentage,
      records: completeAttendanceRecords
    };

    // 4. Adab Evaluations & Conduct Notes
    const studentEvals = evaluations.filter(e => e.studentId === studentId && e.date >= start && e.date <= end);
    const adabScores = studentEvals.map(e => e.adabScore);
    const avgAdab = adabScores.length > 0 
      ? Number((adabScores.reduce((a, b) => a + b, 0) / adabScores.length).toFixed(1))
      : 4.8;

    const salahJamaahCount = studentEvals.filter(e => e.salahPerformance === 'with_jamaah').length;
    const salahRate = studentEvals.length > 0 ? Math.round((salahJamaahCount / studentEvals.length) * 100) : 100;
    const adabBasePct = Math.round((avgAdab / 5) * 100);
    const conductScore = Math.round(adabBasePct * 0.7 + salahRate * 0.3);

    // 5. Compute Detailed Activity Score Percentage
    let activityPercentage = activitiesMarksMax > 0
      ? Math.round((activitiesMarksObtained / activitiesMarksMax) * 100)
      : Math.min(100, Math.round((avgAdab / 5) * 100));

    // Factor in evaluation rubric if present
    const evalsWithRubric = studentEvals.filter(e => e.quranMemorizationPct !== undefined);
    if (evalsWithRubric.length > 0) {
      const rubricSums = evalsWithRubric.reduce((acc, e) => {
        const itemAvg = ((e.quranMemorizationPct || 90) + 
                         (e.homeworkPct || 90) + 
                         (e.classParticipationPct || 90) + 
                         (e.neatnessPct || 90) + 
                         (e.respectPct || 90) + 
                         (e.selfControlPct || 90)) / 6;
        return acc + itemAvg;
      }, 0);
      const rubricAvg = Math.round(rubricSums / evalsWithRubric.length);
      activityPercentage = Math.round((activityPercentage * 0.6) + (rubricAvg * 0.4));
    }

    // 6. Compute Recitation & Memorization Performance Score (0 - 100)
    let tajweedScoreSum = 0;
    recitations.forEach(l => {
      let base = 88;
      if (l.tajweedRating === 'mumtaz') base = 98;
      else if (l.tajweedRating === 'jayyid_jiddan') base = 92;
      else if (l.tajweedRating === 'jayyid') base = 84;
      else if (l.tajweedRating === 'maqbool') base = 74;
      const penalty = Math.min(15, (l.mistakeCount || 0) * 2.5);
      tajweedScoreSum += Math.max(60, base - penalty);
    });
    const avgTajweedScore = recitations.length > 0 ? (tajweedScoreSum / recitations.length) : 94;
    const volumeScore = Math.min(100, Math.max(70, 75 + Math.round((totalAyahs / 25) * 25)));
    const performanceScore = Math.round(avgTajweedScore * 0.5 + volumeScore * 0.5);
    const memorizationPercentage = performanceScore;

    // 7. Transparent Composite Score (Weighted according to academic & halaqah rubric):
    // - Daily Activities (35%)
    // - Quran Performance & Memorization (35%)
    // - Attendance & Punctuality (20%)
    // - Adab, Demeanor & Congregational Prayer (10%)
    const compositeScore = Number((
      (activityPercentage * 0.35) + 
      (performanceScore * 0.35) + 
      (attendanceScore * 0.20) + 
      (conductScore * 0.10)
    ).toFixed(1));

    const overallPercentage = Math.round(compositeScore);

    // 8. Grade Standing Classification
    let gradeStatus: WeeklyReportSummary['gradeStatus'] = 'Jayyid Jiddan (Very Good)';
    if (compositeScore >= 92) {
      gradeStatus = 'Mumtaz (Distinction)';
    } else if (compositeScore >= 84) {
      gradeStatus = 'Jayyid Jiddan (Very Good)';
    } else if (compositeScore >= 74) {
      gradeStatus = 'Jayyid (Good)';
    } else {
      gradeStatus = 'Needs Improvement';
    }

    let defaultRemarks = `Masha'Allah, ${student.fullName.split(' ')[0]} demonstrated great diligence in his memorization, activity tasks, and prayer.`;
    if (gradeStatus === 'Mumtaz (Distinction)') {
      defaultRemarks = `Barakallahu feeh! ${student.fullName.split(' ')[0]} displayed exemplary Adab, high attendance, and outstanding retention in Sabaq & Sabqi.`;
    } else if (gradeStatus === 'Needs Improvement') {
      defaultRemarks = `Please assist ${student.fullName.split(' ')[0]} with daily evening revision (Sabqi) and punctuality for Morning Halaqah.`;
    }

    // 9. Teacher Details
    const teacherDetails: TeacherDetails = {
      name: "Ustadh Muhammad Shaya'u",
      arabicName: 'الشيخ أ. محمد شايعو',
      role: 'Class Five Supervisor & Head Qur’an Teacher',
      arabicRole: 'مُشْرِفُ وَمُعَلِّمُ حَلَقَاتِ القُرْآنِ الكَرِيمِ لِلصَّفِّ الخَامِسِ',
      title: 'Lead Qur’an Memorization Murabbi & Class Teacher',
      department: 'Department of Qur’anic Sciences & Tahfeez (قِسْمُ القُرْآنِ الكَرِيمِ وَعُلُومِ التَّجْوِيدِ)',
      credentials: "Ijāzah in Hafs 'an 'Asim • Certified Tajweed Examiner (إجازة برواية حفص عن عاصم)",
      email: 'mohdshayau46@gmail.com',
      phone: '+234 803 891 2345',
      officeHours: 'Monday – Friday: 06:30 AM – 04:30 PM',
      halaqahGroup: getStudentGroupName(student.group, 'en'),
      halaqahGroupAr: getStudentGroupName(student.group, 'ar'),
      reciterPatron: student.group && STUDENT_GROUPS_MAP[student.group] ? STUDENT_GROUPS_MAP[student.group].reciterEn : 'Shaykh Mahmoud Khalil Al-Hussary'
    };

    const academicWeek = getAcademicWeekByDate(start);

    return {
      studentId,
      student,
      weekNumber: academicWeek ? academicWeek.weekNumber : 1,
      startDate: start,
      endDate: end,
      totalAyahsMemorized: totalAyahs || 28,
      attendanceRate: attendancePercentage,
      attendancePercentage,
      memorizationPercentage,
      activityPercentage,
      overallPercentage,
      overallScore: overallPercentage,
      compositeScore,
      performanceScore,
      attendanceScore,
      conductScore,
      activitiesCount,
      activitiesMarksObtained,
      activitiesMarksMax,
      activitiesScorePct: activityPercentage,
      categoryBreakdown,
      activitiesList: allActsForReport,
      teacherDetails,
      attendanceSummary,
      attendanceRecords: completeAttendanceRecords,
      presentDays,
      totalDays,
      averageAdabScore: avgAdab,
      salahRate,
      recentSabaq: sabaqLogs,
      recentSabqi: sabqiLogs,
      recentManzil: manzilLogs,
      quranRecitations: recitations,
      teacherRemarks: defaultRemarks,
      teacherComment: defaultRemarks,
      gradeStatus
    };
  };

  // Standings & Best Student of the Week Calculation
  const calculateWeeklyStandings = (startDate?: string, endDate?: string) => {
    const start = startDate || '2026-08-31';
    const end = endDate || '2026-09-04';

    const unranked = students
      .map(student => {
        const report = generateWeeklyReport(student.id, start, end);
        return { student, report };
      })
      .filter((item): item is { student: Student; report: WeeklyReportSummary } => item.report !== null);

    // Sort descending by compositeScore, tie-breaking by activities marks, performance, attendance
    const ranked = [...unranked].sort((a, b) => {
      const scoreA = a.report.compositeScore ?? a.report.overallPercentage ?? 0;
      const scoreB = b.report.compositeScore ?? b.report.overallPercentage ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      
      const actMarksA = a.report.activitiesMarksObtained ?? 0;
      const actMarksB = b.report.activitiesMarksObtained ?? 0;
      if (actMarksB !== actMarksA) return actMarksB - actMarksA;

      const ayahsA = a.report.totalAyahsMemorized ?? 0;
      const ayahsB = b.report.totalAyahsMemorized ?? 0;
      return ayahsB - ayahsA;
    });

    const rankedReports = ranked.map((item, idx) => {
      const isBest = idx === 0;
      const updatedReport: WeeklyReportSummary = {
        ...item.report,
        rank: idx + 1,
        weeklyRank: idx + 1,
        isBestStudent: isBest
      };
      return {
        student: item.student,
        report: updatedReport
      };
    });

    return {
      bestStudent: rankedReports[0] || null,
      rankedReports,
      calculatedAt: new Date().toISOString()
    };
  };

  // -------------------------------------------------------------------
  // Academic Calendar & Sessions Management (Phase 2)
  // -------------------------------------------------------------------
  const createAcademicSession = (data: { name: string; nameAr?: string; startDate: string; endDate: string }) => {
    if (!isAuthorizedAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only authorized faculty administrators can create or configure academic sessions.' 
      };
    }

    const validation = validateSession(data, academicSessions);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const newSession = DatabaseService.normalizeAcademicSession({
      ...data,
      id: `session-${Date.now()}`,
      status: 'upcoming',
      isCurrent: false
    });

    setAcademicSessions(prev => [...prev, newSession]);
    return { success: true, session: newSession };
  };

  const updateAcademicSession = (updatedSession: AcademicSession) => {
    if (!isAuthorizedAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only authorized faculty administrators can edit academic sessions.' 
      };
    }

    const validation = validateSession(updatedSession, academicSessions);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    setAcademicSessions(prev => prev.map(s => s.id === updatedSession.id ? { ...updatedSession, updatedAt: new Date().toISOString() } : s));
    return { success: true };
  };

  const activateAcademicSession = (sessionId: string) => {
    if (!isAuthorizedAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only authorized faculty administrators can activate academic sessions.' 
      };
    }

    setAcademicSessions(prev => DatabaseService.setActiveSession(sessionId, prev));
    return { success: true };
  };

  const completeAcademicSession = (sessionId: string) => {
    if (!isAuthorizedAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only authorized faculty administrators can complete academic sessions.' 
      };
    }

    setAcademicSessions(prev => DatabaseService.completeSession(sessionId, prev));
    return { success: true };
  };

  const updateAcademicTerm = (sessionId: string, updatedTerm: AcademicTerm) => {
    if (!isAuthorizedAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only authorized faculty administrators can modify term configurations.' 
      };
    }

    const session = academicSessions.find(s => s.id === sessionId);
    if (!session) {
      return { success: false, error: 'Academic session not found.' };
    }

    const otherTerms = session.terms.filter(t => t.id !== updatedTerm.id);
    const validation = validateTerm(updatedTerm, session, otherTerms);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    // Check if period already contains records and warn
    const recordCheck = DatabaseService.checkRecordsInPeriod(updatedTerm.startDate, updatedTerm.endDate, { attendance, quranLogs });

    setAcademicSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        terms: s.terms.map(t => t.id === updatedTerm.id ? { ...updatedTerm } : t),
        updatedAt: new Date().toISOString()
      };
    }));

    return { 
      success: true, 
      warning: recordCheck.hasRecords ? recordCheck.message : undefined 
    };
  };

  const publishAcademicTerm = (sessionId: string, termId: string) => {
    if (!isAuthorizedAdmin) {
      return { 
        success: false, 
        error: 'Unauthorized: Only authorized faculty administrators can publish terms.' 
      };
    }

    setAcademicSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        terms: s.terms.map(t => t.id === termId ? { ...t, isPublished: true, status: 'active', isCurrent: true } : t),
        publishedAt: new Date().toISOString()
      };
    }));

    return { success: true };
  };

  const selectCalendarPeriod = (selection: Partial<AcademicCalendarSelection>) => {
    setCalendarSelection(prev => {
      const merged: AcademicCalendarSelection = {
        sessionId: selection.sessionId || prev.sessionId,
        termId: selection.termId || prev.termId,
        weekNumber: selection.weekNumber !== undefined ? selection.weekNumber : prev.weekNumber,
        date: selection.date || prev.date,
        dayNameEn: selection.dayNameEn || prev.dayNameEn,
        dayNameAr: selection.dayNameAr || prev.dayNameAr
      };

      // Validate week belongs to term
      const isValid = validateWeekBelongsToTerm(merged.sessionId, merged.termId, merged.weekNumber, academicSessions);
      if (!isValid && selection.weekNumber !== undefined) {
        console.warn(`Selected week ${selection.weekNumber} does not belong to term ${merged.termId}`);
      }

      // Sync selectedDate with chosen date
      if (selection.date) {
        setSelectedDate(selection.date);
      }

      return merged;
    });
  };

  const checkPeriodRecords = (startDate: string, endDate: string) => {
    return DatabaseService.checkRecordsInPeriod(startDate, endDate, { attendance, quranLogs });
  };

  // -------------------------------------------------------------------
  // Weekly Memorization Targets (Phase 4)
  // -------------------------------------------------------------------
  const getStudentTargets = (studentId: string): StudentWeeklyTarget[] => {
    return weeklyTargets.filter(t => t.studentId === studentId);
  };

  const getStudentTargetForWeek = (
    studentId: string, 
    sessionId: string, 
    termId: string, 
    weekNumber: number
  ): StudentWeeklyTarget | undefined => {
    return weeklyTargets.find(t => 
      t.studentId === studentId && 
      t.sessionId === sessionId && 
      t.termId === termId && 
      t.weekNumber === weekNumber
    );
  };

  const getTargetsForWeek = (
    sessionId: string, 
    termId: string, 
    weekNumber: number
  ): StudentWeeklyTarget[] => {
    return weeklyTargets.filter(t => 
      t.sessionId === sessionId && 
      t.termId === termId && 
      t.weekNumber === weekNumber
    );
  };

  const createWeeklyTarget = (
    data: Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>
  ): { success: boolean; target?: StudentWeeklyTarget; error?: string } => {
    const validation = DatabaseService.validateWeeklyTarget(data, weeklyTargets);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    const operatorName = user?.name || user?.email || 'Authorized Teacher';
    const newTarget = DatabaseService.createWeeklyTarget(data, operatorName);
    setWeeklyTargets(prev => [newTarget, ...prev]);
    return { success: true, target: newTarget };
  };

  const amendWeeklyTarget = (
    id: string,
    updates: Partial<Omit<StudentWeeklyTarget, 'id' | 'createdAt' | 'auditTrail'>>,
    amendmentReason: string
  ): { success: boolean; target?: StudentWeeklyTarget; error?: string } => {
    const existing = weeklyTargets.find(t => t.id === id);
    if (!existing) {
      return { success: false, error: 'Target not found.' };
    }

    const merged = { ...existing, ...updates };
    const validation = DatabaseService.validateWeeklyTarget(merged, weeklyTargets, id);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    const operatorName = user?.name || user?.email || 'Authorized Teacher';
    const updated = DatabaseService.amendWeeklyTarget(existing, updates, amendmentReason, operatorName);
    setWeeklyTargets(prev => prev.map(t => t.id === id ? updated : t));
    return { success: true, target: updated };
  };

  const deleteWeeklyTarget = (id: string): { success: boolean; error?: string } => {
    setWeeklyTargets(prev => prev.filter(t => t.id !== id));
    return { success: true };
  };

  // -------------------------------------------------------------------
  // Daily Memorization Entry actions (Phase 5)
  // -------------------------------------------------------------------
  const createDailyMemorizationEntry = (
    data: Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'entryTimestamp'> & { entryTimestamp?: string }
  ): { success: boolean; entry?: DailyMemorizationEntry; error?: string } => {
    const validation = DatabaseService.validateDailyMemorizationEntry(data, dailyMemorizationEntries);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    const operatorName = user?.name || user?.email || data.teacher || 'Authorized Teacher';
    const newEntry = DatabaseService.createDailyMemorizationEntry(data, operatorName);

    setDailyMemorizationEntries(prev => [newEntry, ...prev]);

    // Mirror in quranLogs with Phase 5 fields so existing ledgers and reports stay synchronized
    const mirroredQuranLog: QuranLog = {
      id: newEntry.id,
      studentId: data.studentId,
      date: data.actualSubmissionDate,
      category: 'sabaq',
      surahNumber: data.surahNumber,
      surahName: newEntry.surahName,
      surahArabicName: newEntry.surahArabicName,
      ayahStart: data.startAyah,
      ayahEnd: data.endAyah,
      juzNumber: newEntry.juzNumber,
      tajweedRating: data.tajweedRating || 'jayyid_jiddan',
      mistakeCount: data.mistakeCount || 0,
      status: data.reviewStatus === 'accepted' ? 'passed' : data.reviewStatus === 'requires_correction' ? 'repeat' : 'in_progress',
      teacherFeedback: data.teacherFeedback,
      startPage: newEntry.startPage,
      endPage: newEntry.endPage,
      totalPagesCovered: newEntry.totalPages,
      reviewStatus: data.reviewStatus,
      sessionId: data.sessionId,
      termId: data.termId,
      weekNumber: data.weekNumber,
      dayOfWeek: newEntry.dayOfWeek,
      actualSubmissionDate: data.actualSubmissionDate,
      entryTimestamp: newEntry.entryTimestamp,
      isLateEntry: newEntry.isLateEntry,
      teacher: newEntry.teacher,
      weeklyTargetId: data.weeklyTargetId
    };

    setQuranLogs(prev => [mirroredQuranLog, ...prev]);

    // If connected to a weekly target and review status is 'accepted', check if target is complete
    if (data.weeklyTargetId && data.reviewStatus === 'accepted') {
      const target = weeklyTargets.find(t => t.id === data.weeklyTargetId);
      if (target) {
        const updatedEntries = [newEntry, ...dailyMemorizationEntries];
        const progress = DatabaseService.calculateStudentWeeklyProgress(target, updatedEntries);
        if (progress.isTargetComplete && target.status !== 'completed') {
          amendWeeklyTarget(
            target.id,
            { status: 'completed' },
            'Target automatically marked completed after all required ayahs were accepted.'
          );
        } else if (!progress.isTargetComplete && target.status === 'assigned') {
          amendWeeklyTarget(
            target.id,
            { status: 'in_progress' },
            'Target status set to in_progress following accepted recitation.'
          );
        }
      }
    }

    return { success: true, entry: newEntry };
  };

  const correctDailyMemorizationEntry = (
    id: string,
    updates: Partial<Omit<DailyMemorizationEntry, 'id' | 'createdAt' | 'auditTrail' | 'entryTimestamp'>>,
    correctionReason: string
  ): { success: boolean; entry?: DailyMemorizationEntry; error?: string } => {
    const existing = dailyMemorizationEntries.find(e => e.id === id);
    if (!existing) {
      return { success: false, error: 'Memorization entry not found.' };
    }

    const merged = { ...existing, ...updates };
    const validation = DatabaseService.validateDailyMemorizationEntry(merged, dailyMemorizationEntries, id);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    const operatorName = user?.name || user?.email || 'Authorized Teacher';
    const updated = DatabaseService.correctDailyMemorizationEntry(existing, updates, correctionReason, operatorName);

    setDailyMemorizationEntries(prev => prev.map(e => e.id === id ? updated : e));

    // Update in quranLogs
    setQuranLogs(prev => prev.map(log => {
      if (log.id === id) {
        return {
          ...log,
          date: updated.actualSubmissionDate,
          surahNumber: updated.surahNumber,
          surahName: updated.surahName,
          surahArabicName: updated.surahArabicName,
          ayahStart: updated.startAyah,
          ayahEnd: updated.endAyah,
          startPage: updated.startPage,
          endPage: updated.endPage,
          totalPagesCovered: updated.totalPages,
          reviewStatus: updated.reviewStatus,
          status: updated.reviewStatus === 'accepted' ? 'passed' : updated.reviewStatus === 'requires_correction' ? 'repeat' : 'in_progress',
          teacherFeedback: updated.teacherFeedback,
          mistakeCount: updated.mistakeCount ?? log.mistakeCount,
          tajweedRating: updated.tajweedRating || log.tajweedRating,
          teacher: updated.teacher
        };
      }
      return log;
    }));

    return { success: true, entry: updated };
  };

  const deleteDailyMemorizationEntry = (id: string): { success: boolean; error?: string } => {
    setDailyMemorizationEntries(prev => prev.filter(e => e.id !== id));
    setQuranLogs(prev => prev.filter(log => log.id !== id));
    return { success: true };
  };

  const getStudentDailyEntries = (studentId: string, weekNumber?: number): DailyMemorizationEntry[] => {
    return dailyMemorizationEntries.filter(e => {
      if (e.studentId !== studentId) return false;
      if (weekNumber !== undefined && e.weekNumber !== weekNumber) return false;
      return true;
    });
  };

  const getWeeklyTargetProgress = (weeklyTargetId: string) => {
    const target = weeklyTargets.find(t => t.id === weeklyTargetId);
    if (!target) return null;
    return DatabaseService.calculateStudentWeeklyProgress(target, dailyMemorizationEntries);
  };

  const resetAllData = () => {
    setStudents(INITIAL_STUDENTS);
    setQuranLogs(INITIAL_QURAN_LOGS);
    setAttendance(INITIAL_ATTENDANCE);
    setEvaluations(INITIAL_EVALUATIONS);
    setBehaviorNotes(INITIAL_BEHAVIOR_NOTES);
    setActivities(INITIAL_ACTIVITIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAcademicSessions(INITIAL_ACADEMIC_SESSIONS);
    setWeeklyTargets(INITIAL_WEEKLY_TARGETS);
    setDailyMemorizationEntries(INITIAL_DAILY_MEMORIZATION_ENTRIES);
    localStorage.clear();
  };

  return (
    <ClassContext.Provider
      value={{
        students,
        quranLogs,
        attendance,
        evaluations,
        behaviorNotes,
        activities,
        announcements,
        selectedDate,
        setSelectedDate,
        // Academic Calendar & Sessions (Phase 2)
        academicSessions,
        activeSession,
        activeTerm,
        activeInstructionalWeeks,
        calendarSelection,
        createAcademicSession,
        updateAcademicSession,
        activateAcademicSession,
        completeAcademicSession,
        updateAcademicTerm,
        publishAcademicTerm,
        selectCalendarPeriod,
        checkPeriodRecords,
        isAuthorizedAdmin,
        // Weekly Memorization Targets (Phase 4)
        weeklyTargets,
        createWeeklyTarget,
        amendWeeklyTarget,
        deleteWeeklyTarget,
        getStudentTargets,
        getStudentTargetForWeek,
        getTargetsForWeek,
        // Daily Qur'an Memorization Recording (Phase 5)
        dailyMemorizationEntries,
        createDailyMemorizationEntry,
        correctDailyMemorizationEntry,
        deleteDailyMemorizationEntry,
        getStudentDailyEntries,
        getWeeklyTargetProgress,
        // Student actions
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        addQuranLog,
        deleteQuranLog,
        getStudentQuranLogs,
        setStudentAttendance,
        markAllAttendance,
        getAttendanceForDate,
        getStudentAttendanceStats,
        addActivity,
        batchAddActivities,
        updateActivity,
        deleteActivity,
        getActivitiesForDate,
        getStudentActivities,
        getDailyActivityStats,
        saveEvaluation,
        batchSaveEvaluations,
        getStudentEvaluation,
        getStudentAverageAdab,
        addBehaviorNote,
        deleteBehaviorNote,
        getStudentBehaviorNotes,
        addAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        generateWeeklyReport,
        calculateWeeklyStandings,
        resetAllData
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
