import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { Student, StudentGroup } from '../types';
import { 
  STUDENT_GROUPS_LIST, 
  STUDENT_GROUPS_MAP, 
  getStudentGroupName 
} from '../data/studentGroups';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  BookOpen, 
  CheckCircle2, 
  Star, 
  Edit, 
  X, 
  Eye, 
  MessageCircle, 
  Calendar,
  Camera,
  FileText,
  FileSpreadsheet,
  Activity,
  Users,
  ChevronRight,
  Target,
  Edit3,
  Clock,
  History,
  Plus
} from 'lucide-react';
import { StudentCameraModal } from './StudentCameraModal';
import { DailyActivitiesTrackerView } from './DailyActivitiesTrackerView';
import { WeeklyTargetsOverview } from './WeeklyTargetsOverview';
import { StudentWeeklyTargetModal } from './StudentWeeklyTargetModal';
import { StudentWeeklyTarget } from '../types';

interface StudentRecordsViewProps {
  onOpenQuranLog: (studentId: string) => void;
  onOpenEvaluation?: (studentId: string) => void;
  onOpenWeeklyReport?: (studentId: string) => void;
  initialSubTab?: 'roster' | 'activities' | 'targets';
  onSubTabChange?: (tab: 'roster' | 'activities' | 'targets') => void;
}

export const StudentRecordsView: React.FC<StudentRecordsViewProps> = ({ 
  onOpenQuranLog, 
  onOpenEvaluation,
  onOpenWeeklyReport,
  initialSubTab = 'roster',
  onSubTabChange
}) => {
  const { 
    students, 
    activities,
    selectedDate,
    addStudent, 
    updateStudent, 
    getStudentQuranLogs, 
    getStudentAttendanceStats, 
    getStudentAverageAdab,
    getStudentActivities,
    weeklyTargets,
    getStudentTargets
  } = useClass();
  const { language, isRTL, t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'activities' | 'targets'>(initialSubTab);
  const [activityStudentFilter, setActivityStudentFilter] = useState<string>('all');

  // Target modal state from inside student profile
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetModalStudentId, setTargetModalStudentId] = useState<string | undefined>();
  const [targetModalEditingTarget, setTargetModalEditingTarget] = useState<StudentWeeklyTarget | null>(null);
  const [expandedTargetAuditId, setExpandedTargetAuditId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const todayActivitiesCount = activities.filter(a => a.date === selectedDate).length;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<StudentGroup | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({});

  // Camera Capture Modal State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraTargetStudent, setCameraTargetStudent] = useState<{
    id?: string;
    name?: string;
    photo?: string;
    mode: 'form' | 'direct';
  } | null>(null);

  const getActivityCategoryName = (cat: string) => {
    switch (cat) {
      case 'adab': return language === 'ar' ? 'الأدب والسمت' : 'Adab';
      case 'attentiveness': return language === 'ar' ? 'الانتباه والتركيز' : 'Attentiveness';
      case 'neatness': return language === 'ar' ? 'النظافة والترتيب' : 'Neatness';
      case 'performance': return language === 'ar' ? 'الأداء والإتقان' : 'Performance';
      case 'coming_earlier': return language === 'ar' ? 'التبكير والحضور' : 'Coming earlier';
      case 'good_manner': return language === 'ar' ? 'حسن الخلق' : 'Good manner';
      default: return language === 'ar' ? 'نشاط' : 'Activity';
    }
  };

  const handleOpenFormCamera = () => {
    setCameraTargetStudent({
      name: editingStudent.fullName || editingStudent.arabicName || (language === 'ar' ? 'الطالب الجديد' : 'Student'),
      photo: editingStudent.avatarUrl,
      mode: 'form'
    });
    setIsCameraModalOpen(true);
  };

  const handleStartCameraCapture = (student: Student) => {
    setCameraTargetStudent({
      id: student.id,
      name: language === 'ar' ? (student.arabicName || student.fullName) : student.fullName,
      photo: student.avatarUrl,
      mode: 'direct'
    });
    setIsCameraModalOpen(true);
  };

  const handleCapturePhoto = (photoDataUrl: string) => {
    if (!cameraTargetStudent) return;

    if (cameraTargetStudent.mode === 'form') {
      setEditingStudent(prev => ({ ...prev, avatarUrl: photoDataUrl }));
    } else if (cameraTargetStudent.mode === 'direct' && cameraTargetStudent.id) {
      const targetId = cameraTargetStudent.id;
      const target = students.find(s => s.id === targetId);
      if (target) {
        const updated = { ...target, avatarUrl: photoDataUrl };
        updateStudent(updated);
        if (selectedStudent?.id === targetId) {
          setSelectedStudent(updated);
        }
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.arabicName.includes(searchQuery) ||
      student.rollNumber.toString().includes(searchQuery) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroupFilter === 'all' || student.group === selectedGroupFilter;

    return matchesSearch && matchesGroup;
  });

  const handleOpenAdd = () => {
    setEditingStudent({
      rollNumber: students.length + 1,
      fullName: '',
      arabicName: '',
      parentName: '',
      parentPhone: '+966 ',
      parentEmail: '',
      group: 'khaleelul_hussary',
      currentJuz: 1,
      totalMemorizedJuz: 0.5,
      enrollmentStatus: 'active',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent.fullName || !editingStudent.rollNumber) return;

    if (isAddModalOpen) {
      addStudent(editingStudent as Omit<Student, 'id'>);
      setIsAddModalOpen(false);
    } else if (isEditModalOpen && editingStudent.id) {
      updateStudent(editingStudent as Student);
      setIsEditModalOpen(false);
      if (selectedStudent?.id === editingStudent.id) {
        setSelectedStudent(editingStudent as Student);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Student Records & Daily Activities Sub-Tab Switcher */}
      <div className="bg-[#1b110b] text-white p-4 sm:p-5 rounded-xl border border-[#3b2518] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#faedd9]/15 text-[#f0ba78] border border-[#f0ba78]/30">
              {language === 'ar' ? 'سجل الطلاب والأنشطة' : 'Student Record & Activities'}
            </span>
            <span className="text-xs text-[#c4b3a4]">
              {language === 'ar' ? 'الصف الخامس (بنين)' : 'Class Five (Boys)'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {language === 'ar' ? 'سجلات الطلاب والأنشطة اليومية' : 'Student Records & Daily Activities'}
          </h1>
          <p className="text-xs text-[#c4b3a4] mt-0.5">
            {language === 'ar' 
              ? 'إدارة بيانات وملفات الطلاب، وسجل متابعة الأنشطة اليومية والسلوك'
              : 'Manage student profiles, halaqah groups, and daily behavioral and academic activities record'}
          </p>
        </div>

        {/* Segmented Sub-Tab Switcher */}
        <div className="flex flex-wrap sm:inline-flex p-1 bg-[#2c1a10] rounded-xl border border-[#4a2e1d] gap-1 self-stretch sm:self-auto">
          <button
            type="button"
            id="subtab-roster-btn"
            onClick={() => {
              setActiveSubTab('roster');
              if (onSubTabChange) onSubTabChange('roster');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[44px] sm:min-h-0 ${
              activeSubTab === 'roster'
                ? 'bg-[#854d2b] text-white shadow-xs'
                : 'text-[#d6c4b2] hover:text-white hover:bg-[#3d2719]'
            }`}
          >
            <Users className="w-4 h-4 text-[#f0ba78]" />
            <span>{language === 'ar' ? 'بيانات الطلاب' : 'Student Profiles'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
              activeSubTab === 'roster' ? 'bg-black/25 text-[#faedd9]' : 'bg-[#18100b] text-[#c4b3a4]'
            }`}>
              {students.length}
            </span>
          </button>

          <button
            type="button"
            id="subtab-activities-btn"
            onClick={() => {
              setActiveSubTab('activities');
              if (onSubTabChange) onSubTabChange('activities');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[44px] sm:min-h-0 ${
              activeSubTab === 'activities'
                ? 'bg-[#854d2b] text-white shadow-xs'
                : 'text-[#d6c4b2] hover:text-white hover:bg-[#3d2719]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#86efac]" />
            <span>{language === 'ar' ? 'سجل الأنشطة اليومية' : 'Daily Activities Record'}</span>
            {todayActivitiesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-[#2d6639] text-[#bbf7d0]">
                {todayActivitiesCount} {language === 'ar' ? 'اليوم' : 'today'}
              </span>
            )}
          </button>

          <button
            type="button"
            id="subtab-targets-btn"
            onClick={() => {
              setActiveSubTab('targets');
              if (onSubTabChange) onSubTabChange('targets');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition cursor-pointer min-h-[44px] sm:min-h-0 ${
              activeSubTab === 'targets'
                ? 'bg-[#854d2b] text-white shadow-xs'
                : 'text-[#d6c4b2] hover:text-white hover:bg-[#3d2719]'
            }`}
          >
            <Target className="w-4 h-4 text-[#fcd34d]" />
            <span>{language === 'ar' ? 'أهداف الحفظ الأسبوعية' : 'Weekly Targets'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
              activeSubTab === 'targets' ? 'bg-black/25 text-[#faedd9]' : 'bg-[#18100b] text-[#c4b3a4]'
            }`}>
              {weeklyTargets.length}
            </span>
          </button>
        </div>
      </div>

      {activeSubTab === 'targets' ? (
        <WeeklyTargetsOverview onOpenRecitation={onOpenQuranLog} />
      ) : activeSubTab === 'activities' ? (
        <DailyActivitiesTrackerView 
          initialStudentFilter={activityStudentFilter}
          onSwitchToRoster={() => {
            setActiveSubTab('roster');
            if (onSubTabChange) onSubTabChange('roster');
          }}
          isEmbedded={true}
        />
      ) : (
        <>
          {/* Search & Actions Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 h-4 w-4 text-[#8c7464]" />
          <input
            id="students-search-input"
            type="text"
            placeholder={t('searchStudentsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs bg-[#faf7f3] border border-[#e5dad0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#854d2b] focus:bg-white text-[#1b110b]"
          />
        </div>

        {/* Filters & View Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Group filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#635043]">
            <span>{t('filterGroup')}</span>
            <select
              id="students-group-filter"
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value as StudentGroup | 'all')}
              className="text-xs bg-[#faf7f3] border border-[#e5dad0] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#854d2b] text-[#1b110b] font-medium"
            >
              <option value="all">{t('allGroups')}</option>
              {STUDENT_GROUPS_LIST.map(grp => (
                <option key={grp.id} value={grp.id}>
                  {language === 'ar' ? grp.nameAr : grp.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Grid/Table */}
          <div className="flex rounded-lg border border-[#e5dad0] p-0.5 bg-[#faf7f3]">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-[#3b2317]' : 'text-[#8c7464]'
              }`}
            >
              {t('grid')}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-[#3b2317]' : 'text-[#8c7464]'
              }`}
            >
              {t('table')}
            </button>
          </div>

          {/* Add Student Button */}
          <button
            id="students-add-new-btn"
            onClick={handleOpenAdd}
            className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{t('addStudent')}</span>
          </button>

        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => {
            const attStats = getStudentAttendanceStats(student.id);
            const avgAdab = getStudentAverageAdab(student.id);

            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500/60 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Roll # & Group Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-900 text-amber-300 font-bold text-xs shadow-2xs">
                      #{student.rollNumber}
                    </span>
                    {(() => {
                      const grpInfo = student.group ? STUDENT_GROUPS_MAP[student.group] : null;
                      return grpInfo ? (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${grpInfo.badgeClass}`}>
                          {language === 'ar' ? grpInfo.nameAr : grpInfo.nameEn}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {language === 'ar' ? 'غير محدد' : 'Unassigned'}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Student Avatar & Names */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 group">
                      <img 
                        src={student.avatarUrl} 
                        alt={student.fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-[#e5dad0]"
                      />
                      <button
                        type="button"
                        onClick={() => handleStartCameraCapture(student)}
                        title={language === 'ar' ? 'التقاط صورة بالكاميرا' : 'Capture photo with camera'}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#854d2b] hover:bg-[#6c3e23] text-white flex items-center justify-center shadow-xs transition cursor-pointer"
                      >
                        <Camera className="h-2.5 w-2.5" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1b110b] truncate leading-tight">
                        {language === 'ar' ? (student.arabicName || student.fullName) : student.fullName}
                      </h4>
                      <p className="text-xs text-[#854d2b] font-semibold truncate mt-0.5">
                        {language === 'ar' ? student.fullName : student.arabicName}
                      </p>
                      <p className="text-[11px] text-[#7c695d] mt-0.5 truncate">
                        {t('parentName')}: {student.parentName}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats Metrics */}
                  <div className="grid grid-cols-3 gap-1.5 bg-[#faf7f3] rounded-lg p-2 mt-3.5 border border-[#ede3d9] text-center">
                    <div>
                      <span className="text-[10px] text-[#8c7464] block">{t('attendanceBadge')}</span>
                      <span className="text-xs font-bold text-[#854d2b]">{attStats.rate}%</span>
                    </div>
                    <div className="border-x border-[#e5dad0]">
                      <span className="text-[10px] text-[#8c7464] block">{t('memorizedJuz')}</span>
                      <span className="text-xs font-bold text-[#1b110b]">{student.totalMemorizedJuz} {t('juz')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8c7464] block">{t('mannersPill')}</span>
                      <span className="text-xs font-bold text-[#c88642] flex items-center justify-center gap-0.5">
                        <Star className="h-3 w-3 fill-[#c88642] text-[#c88642]" />
                        {avgAdab}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-[#f0e6dc] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="flex-1 py-1.5 bg-[#f5ede4] hover:bg-[#ede0d2] text-[#3b2317] text-[11px] font-semibold rounded-md transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3 text-[#854d2b]" />
                    <span>{t('studentProfile')}</span>
                  </button>
                  <button
                    onClick={() => onOpenQuranLog(student.id)}
                    className="flex-1 py-1.5 bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-[11px] font-semibold rounded-md transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="h-3 w-3 text-[#df9b52]" />
                    <span>{t('reciteBtn')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivityStudentFilter(student.id);
                      setActiveSubTab('activities');
                      if (onSubTabChange) onSubTabChange('activities');
                    }}
                    title={language === 'ar' ? 'سجل الأنشطة اليومية للطالب' : 'Daily Activities Record'}
                    className="p-1.5 text-[#2d6639] hover:text-[#1e4626] hover:bg-[#ecfdf5] rounded-md transition cursor-pointer"
                  >
                    <Activity className="h-3.5 w-3.5" />
                  </button>
                  {onOpenEvaluation && (
                    <button
                      onClick={() => onOpenEvaluation(student.id)}
                      title={language === 'ar' ? 'تقييم الأنشطة والآداب اليومية' : 'Daily Activity & Adab Evaluation'}
                      className="p-1.5 text-[#df9b52] hover:text-[#854d2b] hover:bg-[#faedd9] rounded-md transition cursor-pointer"
                    >
                      <Star className="h-3.5 w-3.5 fill-[#df9b52]" />
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(student)}
                    title={t('editStudent')}
                    className="p-1.5 text-[#8c7464] hover:text-[#1b110b] hover:bg-[#f5ede4] rounded-md transition cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-3.5 font-semibold w-12 text-center">Roll</th>
                  <th className="py-3 px-3.5 font-semibold">Student Name & Arabic</th>
                  <th className="py-3 px-3.5 font-semibold">{t('group')}</th>
                  <th className="py-3 px-3.5 font-semibold">Total Memorized</th>
                  <th className="py-3 px-3.5 font-semibold">Attendance</th>
                  <th className="py-3 px-3.5 font-semibold">Adab Rating</th>
                  <th className="py-3 px-3.5 font-semibold">Parent & Phone</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const att = getStudentAttendanceStats(student.id);
                  const adab = getStudentAverageAdab(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                        #{student.rollNumber}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex-shrink-0 group">
                            <img 
                              src={student.avatarUrl} 
                              alt="" 
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleStartCameraCapture(student)}
                              title={language === 'ar' ? 'التقاط صورة بالكاميرا' : 'Take photo with camera'}
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#854d2b] hover:bg-[#6c3e23] text-white flex items-center justify-center shadow-xs transition cursor-pointer"
                            >
                              <Camera className="h-2 w-2" />
                            </button>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.fullName}</p>
                            <p className="font-arabic text-xs text-emerald-800">{student.arabicName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-semibold">
                        {(() => {
                          const grpInfo = student.group ? STUDENT_GROUPS_MAP[student.group] : null;
                          return grpInfo ? (
                            <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md border ${grpInfo.badgeClass}`}>
                              {language === 'ar' ? grpInfo.nameAr : grpInfo.nameEn}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {student.totalMemorizedJuz} Juz
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-emerald-700">{att.rate}%</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {adab}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        <p className="font-medium text-slate-800">{student.parentName}</p>
                        <p className="text-[11px] text-slate-400">{student.parentPhone}</p>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition cursor-pointer"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => onOpenQuranLog(student.id)}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition cursor-pointer"
                          >
                            Log
                          </button>
                          <button
                            onClick={() => {
                              setActivityStudentFilter(student.id);
                              setActiveSubTab('activities');
                              if (onSubTabChange) onSubTabChange('activities');
                            }}
                            title={language === 'ar' ? 'سجل الأنشطة اليومية للطالب' : 'Daily Activities Record'}
                            className="px-2 py-1 bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#047857] border border-[#a7f3d0] rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Activity className="h-3 w-3 text-[#16a34a]" />
                            <span>{language === 'ar' ? 'الأنشطة' : 'Activities'}</span>
                          </button>
                          {onOpenEvaluation && (
                            <button
                              onClick={() => onOpenEvaluation(student.id)}
                              title={language === 'ar' ? 'تقييم الأنشطة والآداب' : 'Daily Evaluation'}
                              className="px-2 py-1 bg-[#faedd9] hover:bg-[#f5deb3] text-[#854d2b] rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <Star className="h-3 w-3 fill-[#df9b52] text-[#df9b52]" />
                              <span>{language === 'ar' ? 'تقييم' : 'Evaluate'}</span>
                            </button>
                          )}
                          {onOpenWeeklyReport && (
                            <button
                              onClick={() => onOpenWeeklyReport(student.id)}
                              title={language === 'ar' ? 'بطاقة التقرير الأسبوعي ٩:١٦' : 'Weekly Report 9:16'}
                              className="px-2 py-1 bg-[#2a170d] hover:bg-[#3d2315] text-[#df9b52] border border-[#df9b52]/40 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3 text-[#df9b52]" />
                              <span>9:16</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )}

  {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-auto sm:my-6 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0 group">
                  <img 
                    src={selectedStudent.avatarUrl} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300/40 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleStartCameraCapture(selectedStudent)}
                    title={language === 'ar' ? 'التقاط صورة بالكاميرا' : 'Take photo with camera'}
                    className="absolute -bottom-1.5 -right-1.5 bg-[#df9b52] hover:bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded">
                      Roll #{selectedStudent.rollNumber}
                    </span>
                    <span className="text-xs text-emerald-200">Class Five (Boys)</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-800/90 text-amber-200 border border-emerald-700">
                      {getStudentGroupName(selectedStudent.group, language)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedStudent.fullName}</h3>
                  <p className="font-arabic text-base text-amber-200 mt-0.5">{selectedStudent.arabicName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[calc(100dvh-14rem)] sm:max-h-[75vh] overflow-y-auto pb-10 sm:pb-6">
              
              {/* Key Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    {language === 'ar' ? 'المجموعة' : 'Halaqah Group'}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 block truncate mt-1">
                    {getStudentGroupName(selectedStudent.group, language)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Memorized</span>
                  <span className="text-base font-extrabold text-slate-900">{selectedStudent.totalMemorizedJuz} Juz</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Attendance</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {getStudentAttendanceStats(selectedStudent.id).rate}%
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    {language === 'ar' ? 'سجل الأنشطة' : 'Daily Activities'}
                  </span>
                  <span className="text-base font-extrabold text-[#2d6639] flex items-center justify-center gap-1">
                    <Activity className="h-4 w-4 text-[#16a34a]" />
                    {getStudentActivities(selectedStudent.id).length} {language === 'ar' ? 'نشاط' : 'logged'}
                  </span>
                </div>
              </div>

              {/* Bio & Contact Information */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {language === 'ar' ? 'بيانات ولي الأمر والاتصال' : 'Guardian & Contact Details'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">{language === 'ar' ? 'ولي الأمر:' : 'Father / Guardian:'}</span>
                    <p className="font-semibold text-slate-900">{selectedStudent.parentName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ar' ? 'هاتف ولي الأمر:' : 'Parent Phone:'}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-900">{selectedStudent.parentPhone}</span>
                      <a
                        href={`https://wa.me/${selectedStudent.parentPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">{language === 'ar' ? 'البريد الإلكتروني لولي الأمر:' : 'Guardian Email:'}</span>
                    <p className="font-semibold text-slate-900">{selectedStudent.parentEmail || (language === 'ar' ? 'غير محدد' : 'Not Specified')}</p>
                  </div>
                </div>

                {selectedStudent.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500">Teacher Notes:</span>
                    <p className="text-slate-700 italic mt-0.5">{selectedStudent.notes}</p>
                  </div>
                )}
              </div>

              {/* Daily Activities Record for this Student */}
              <div className="bg-[#faf7f3] rounded-xl p-4 border border-[#e8ded5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#faedd9] text-[#854d2b] rounded-lg">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3b2317] uppercase tracking-wider">
                        {language === 'ar' ? 'سجل الأنشطة اليومية والسلوك' : 'Daily Activities & Behavior Record'}
                      </h4>
                      <span className="text-[11px] text-[#7c695d]">
                        {language === 'ar' 
                          ? 'الأدب، الانتباه، النظافة، الأداء، التبكير، وحسن الخلق' 
                          : 'Adab, Attentiveness, Neatness, Performance, Punctuality & Good Manner'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sid = selectedStudent.id;
                      setSelectedStudent(null);
                      setActivityStudentFilter(sid);
                      setActiveSubTab('activities');
                      if (onSubTabChange) onSubTabChange('activities');
                    }}
                    className="text-xs font-bold text-[#854d2b] hover:text-[#5c351f] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{language === 'ar' ? 'فتح في سجل الأنشطة الكامل' : 'Open in Full Tracker'}</span>
                    <ChevronRight className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  {getStudentActivities(selectedStudent.id).slice(0, 5).map(act => (
                    <div 
                      key={act.id} 
                      className="p-2.5 rounded-lg border border-[#ebdcd0] bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#faedd9] text-[#854d2b] border border-[#eedbc8]">
                          {getActivityCategoryName(act.activityType)}
                        </span>
                        {act.description && (
                          <span className="text-[11px] text-[#6b584d] hidden sm:inline truncate max-w-xs">
                            {act.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 text-right">
                        <span className="font-extrabold text-[#2d6639] bg-[#ecfdf5] px-2 py-0.5 rounded text-[11px]">
                          {act.marks}/{act.maxMarks} {language === 'ar' ? 'درجة' : 'pts'}
                        </span>
                        <span className="text-[10px] text-[#8c7464]">{act.date}</span>
                      </div>
                    </div>
                  ))}

                  {getStudentActivities(selectedStudent.id).length === 0 && (
                    <p className="text-xs text-[#8c7464] italic py-2 text-center">
                      {language === 'ar' ? 'لم تُسجل أنشطة لهذا الطالب بعد.' : 'No daily activities recorded for this student yet.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Student Weekly Memorization Targets (Phase 4) */}
              <div className="bg-[#fcfaf7] rounded-xl p-4 border border-[#e8ded5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#faedd9] text-[#854d2b] rounded-lg">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3b2317] uppercase tracking-wider">
                        {language === 'ar' ? 'أهداف الحفظ الأسبوعية للطالب' : 'Weekly Memorization Targets'}
                      </h4>
                      <span className="text-[11px] text-[#7c695d]">
                        {language === 'ar' 
                          ? 'الخطط الأسبوعية المحددة والآيات المستهدفة بمصحف المدينة ٦٠٤ ص' 
                          : 'Weekly assigned recitation scopes mapped to 604-page Madinah Mushaf'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetModalEditingTarget(null);
                      setTargetModalStudentId(selectedStudent.id);
                      setIsTargetModalOpen(true);
                    }}
                    className="text-xs bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#df9b52]" />
                    <span>{language === 'ar' ? 'إسناد هدف جديد' : '+ Assign Target'}</span>
                  </button>
                </div>

                {/* Targets List */}
                <div className="space-y-2.5">
                  {getStudentTargets(selectedStudent.id).map(target => (
                    <div 
                      key={target.id}
                      className="p-3 rounded-xl border border-[#ebdcd0] bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#faedd9] text-[#854d2b] border border-[#eedbc8]">
                            Week {target.weekNumber} • {target.termName}
                          </span>
                          <span className="text-[10px] text-[#7c695d]">
                            ({target.sessionName})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            target.status === 'completed'
                              ? 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]'
                              : target.status === 'in_progress'
                              ? 'bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]'
                              : target.status === 'amended'
                              ? 'bg-[#faf5ff] text-[#6b21a8] border border-[#e9d5ff]'
                              : 'bg-[#fef9ee] text-[#a46312] border border-[#fbe4b4]'
                          }`}>
                            {target.status.toUpperCase()}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setTargetModalEditingTarget(target);
                              setTargetModalStudentId(selectedStudent.id);
                              setIsTargetModalOpen(true);
                            }}
                            className="text-[#854d2b] hover:text-[#5c351f] p-1 rounded hover:bg-[#faedd9] transition cursor-pointer"
                            title={language === 'ar' ? 'تعديل الهدف (مع سجل المراجعة)' : 'Amend target'}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Ranges Breakdown */}
                      <div className="space-y-1">
                        {target.ranges.map((range, rIdx) => (
                          <div key={rIdx} className="flex items-center justify-between text-xs bg-[#faf7f3] p-1.5 rounded-lg border border-[#f0e6dc]">
                            <div className="flex items-center gap-1.5 font-bold text-[#1b110b]">
                              <span>{range.surahName}</span>
                              <span className="text-[#7c695d]">({range.startAyah}–{range.endAyah})</span>
                              <span className="font-serif text-[#854d2b] text-[11px]">({range.surahArabicName})</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10px] text-[#635043]">
                              <span className="bg-white px-1.5 py-0.5 rounded border border-[#e5dad0]">
                                {range.startPage === range.endPage ? `p. ${range.startPage}` : `pp. ${range.startPage}–${range.endPage}`}
                              </span>
                              <span className="font-bold text-emerald-800">
                                {range.totalAyahs} ayahs
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Target Meta: Scope, Deadline, Notes */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7c695d] pt-1 border-t border-[#f0e6dc]">
                        <div className="flex items-center gap-2">
                          <span>
                            {language === 'ar' ? 'المجموع:' : 'Total:'}{' '}
                            <strong className="text-emerald-800">{target.totalTargetAyahs} {language === 'ar' ? 'آية' : 'Ayahs'}</strong> •{' '}
                            <strong>{target.totalTargetPages} {language === 'ar' ? 'صفحة' : 'Pages'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            {language === 'ar' ? 'الموعد:' : 'Deadline:'} <strong className="text-[#1b110b]">{target.assignmentDeadline}</strong>
                          </span>
                        </div>

                        {target.auditTrail && target.auditTrail.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setExpandedTargetAuditId(expandedTargetAuditId === target.id ? null : target.id)}
                            className="text-[#854d2b] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <History className="h-3 w-3" />
                            <span>{language === 'ar' ? 'سجل المراجعة' : 'Audit Trail'} ({target.auditTrail.length})</span>
                          </button>
                        )}
                      </div>

                      {/* Expandable Audit Trail */}
                      {expandedTargetAuditId === target.id && target.auditTrail && (
                        <div className="p-2 bg-[#fdfbf8] rounded-lg border border-amber-200 text-[10px] space-y-1">
                          <span className="font-bold text-[#854d2b] block">{language === 'ar' ? 'سجل التعديلات والاعتماد:' : 'Revision & Audit History:'}</span>
                          {target.auditTrail.map((audit) => (
                            <div key={audit.id} className="text-[#635043]">
                              <span className="font-semibold text-[#1b110b]">{new Date(audit.timestamp).toLocaleDateString()}:</span> {audit.changeSummary} ({audit.modifiedBy})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {getStudentTargets(selectedStudent.id).length === 0 && (
                    <div className="p-3 bg-white rounded-lg border border-[#ebdcd0] text-center space-y-1">
                      <p className="text-xs text-[#8c7464] italic">
                        {language === 'ar' ? 'لم يتم تحديد أي أهداف حفظ أسبوعية لهذا الطالب بعد.' : 'No weekly memorization targets configured for this student yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetModalEditingTarget(null);
                          setTargetModalStudentId(selectedStudent.id);
                          setIsTargetModalOpen(true);
                        }}
                        className="text-xs text-[#854d2b] hover:text-[#5c351f] font-bold underline cursor-pointer"
                      >
                        {language === 'ar' ? '+ إسناد الهدف الأسبوعي الأول الآن' : '+ Configure First Weekly Target Now'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Qur'an Logs for this student */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Qur’an Memorization History
                  </h4>
                  <button
                    onClick={() => {
                      const id = selectedStudent.id;
                      setSelectedStudent(null);
                      onOpenQuranLog(id);
                    }}
                    className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                  >
                    + Record Recitation
                  </button>
                </div>

                <div className="space-y-2">
                  {getStudentQuranLogs(selectedStudent.id).slice(0, 4).map(log => (
                    <div 
                      key={log.id} 
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                          <span className="font-bold text-slate-800">
                            {log.surahName} (Ayah {log.ayahStart} - {log.ayahEnd})
                          </span>
                          <span className="font-arabic text-emerald-900">{log.surahArabicName}</span>
                        </div>
                        {log.teacherFeedback && (
                          <p className="text-[11px] text-slate-500 italic mt-1">{log.teacherFeedback}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase block">{log.tajweedRating}</span>
                        <span className="text-[10px] text-slate-400">{log.date}</span>
                      </div>
                    </div>
                  ))}

                  {getStudentQuranLogs(selectedStudent.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2 text-center">No recitation logs entered yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-20 bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartCameraCapture(selectedStudent)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-white border border-[#854d2b] hover:bg-[#faf7f3] text-[#854d2b] text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px] sm:min-h-0"
                >
                  <Camera className="h-3.5 w-3.5 text-[#854d2b]" />
                  <span>{language === 'ar' ? 'التقاط صورة' : 'Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sid = selectedStudent.id;
                    setSelectedStudent(null);
                    setActivityStudentFilter(sid);
                    setActiveSubTab('activities');
                    if (onSubTabChange) onSubTabChange('activities');
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#047857] border border-[#a7f3d0] text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px] sm:min-h-0"
                >
                  <Activity className="h-3.5 w-3.5 text-[#16a34a]" />
                  <span>{language === 'ar' ? 'سجل الأنشطة' : 'Daily Activities'}</span>
                </button>
                {onOpenEvaluation && (
                  <button
                    type="button"
                    onClick={() => {
                      const sid = selectedStudent.id;
                      setSelectedStudent(null);
                      onOpenEvaluation(sid);
                    }}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-[#faedd9] hover:bg-[#f3dfbf] text-[#854d2b] text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs border border-[#e5dad0] min-h-[44px] sm:min-h-0"
                  >
                    <Star className="h-3.5 w-3.5 fill-[#df9b52] text-[#df9b52]" />
                    <span>{language === 'ar' ? 'تقييم الأنشطة' : 'Evaluation'}</span>
                  </button>
                )}
                {onOpenWeeklyReport && (
                  <button
                    type="button"
                    onClick={() => {
                      const sid = selectedStudent.id;
                      setSelectedStudent(null);
                      onOpenWeeklyReport(sid);
                    }}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-100 border border-emerald-500/50 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px] sm:min-h-0"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'التقرير الأسبوعي (Word)' : 'Weekly Report (Word)'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <button
                  onClick={() => {
                    const s = selectedStudent;
                    setSelectedStudent(null);
                    handleOpenEdit(s);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer min-h-[44px] sm:min-h-0"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Student Form Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden my-auto sm:my-6 flex flex-col">
            <form onSubmit={handleSaveStudent}>
              <div className="bg-emerald-900 text-white p-5 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-base">
                  {isAddModalOpen ? 'Enroll New Student in Class Five' : 'Edit Student Record'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="text-emerald-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 max-h-[calc(100dvh-14rem)] sm:max-h-[72vh] overflow-y-auto text-xs pb-10 sm:pb-6">
                
                {/* Student Photo Section with Live Camera Capture */}
                <div className="bg-[#faf7f3] border border-[#e5dad0] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <img
                        src={editingStudent.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt="Profile Preview"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-[#854d2b]/40 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={handleOpenFormCamera}
                        className="absolute -bottom-1 -right-1 bg-[#854d2b] hover:bg-[#6c3e23] text-white p-1 rounded-full shadow-xs cursor-pointer"
                        title={language === 'ar' ? 'التقاط صورة بالكاميرا' : 'Take photo with camera'}
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1b110b] block">
                        {language === 'ar' ? 'صورة الطالب الشخصية' : 'Student Profile Photo'}
                      </span>
                      <span className="text-[11px] text-[#7c695d]">
                        {editingStudent.avatarUrl && editingStudent.avatarUrl.startsWith('data:')
                          ? (language === 'ar' ? '✓ تم التقاط صورة جديدة بنجاح' : '✓ New camera photo captured')
                          : (language === 'ar' ? 'التقاط صورة مباشرة بكاميرا المتصفح أو الهاتف' : 'Capture instant photo with browser camera')}
                      </span>
                    </div>
                  </div>

                  <button
                    id="open-form-camera-btn"
                    type="button"
                    onClick={handleOpenFormCamera}
                    className="w-full sm:w-auto px-3.5 py-2 bg-white border border-[#854d2b] hover:bg-[#854d2b] text-[#854d2b] hover:text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'التقاط صورة بالكاميرا' : 'Snap Photo with Camera'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1b110b] block mb-1">
                      {language === 'ar' ? 'رقم القيد*' : 'Roll Number*'}
                    </label>
                    <input
                      id="edit-student-roll"
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={editingStudent.rollNumber || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: Number(e.target.value) })}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Enrollment Status</label>
                    <select
                      value={editingStudent.enrollmentStatus || 'active'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, enrollmentStatus: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="active">Active Student</option>
                      <option value="excused">Excused Leave</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name (English)*</label>
                  <input
                    id="edit-student-fullname"
                    type="text"
                    required
                    placeholder="e.g., Abdullah bin Tariq"
                    value={editingStudent.fullName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name in Arabic Script</label>
                  <input
                    id="edit-student-arabicname"
                    type="text"
                    dir="rtl"
                    placeholder="e.g., عبد الله بن طارق"
                    value={editingStudent.arabicName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, arabicName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-arabic text-sm focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'مجموعة التحفيظ' : 'Halaqah Group'}
                    </label>
                    <select
                      id="edit-student-group"
                      value={editingStudent.group || 'khaleelul_hussary'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, group: e.target.value as StudentGroup })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                    >
                      {STUDENT_GROUPS_LIST.map(grp => (
                        <option key={grp.id} value={grp.id}>
                          {language === 'ar' ? `${grp.nameAr} (${grp.reciterAr})` : `${grp.nameEn} (${grp.reciterEn})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Memorized Volume (Juz)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={30}
                      value={editingStudent.totalMemorizedJuz || 0}
                      onChange={(e) => setEditingStudent({ ...editingStudent, totalMemorizedJuz: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1b110b] block mb-1">Parent / Guardian Name*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ibrahim Rasheed"
                      value={editingStudent.parentName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#1b110b] block mb-1">Parent Phone / WhatsApp*</label>
                    <input
                      type="text"
                      required
                      placeholder="+234 803 123 4567"
                      value={editingStudent.parentPhone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teacher Notes / Focus Areas</label>
                  <textarea
                    rows={2}
                    placeholder="Observations on Tajweed, concentration, or attendance..."
                    value={editingStudent.notes || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

              </div>

              <div className="sticky bottom-0 z-20 bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4.5 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer select-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5.5 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs select-none"
                >
                  {isAddModalOpen ? 'Save Student' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Camera Capture Modal */}
      <StudentCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => {
          setIsCameraModalOpen(false);
          setCameraTargetStudent(null);
        }}
        onCapture={handleCapturePhoto}
        studentName={cameraTargetStudent?.name}
        currentPhoto={cameraTargetStudent?.photo}
      />

      {/* Student Weekly Target Modal (Phase 4) */}
      <StudentWeeklyTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => {
          setIsTargetModalOpen(false);
          setTargetModalEditingTarget(null);
        }}
        initialStudentId={targetModalStudentId}
        initialTarget={targetModalEditingTarget}
      />

    </div>
  );
};
