import React, { useState, useMemo } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  StudentActivity, 
  ActivityCategory, 
  ActivityStatus, 
  Student 
} from '../types';
import { 
  Activity, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Award, 
  BookOpen, 
  Heart, 
  Users, 
  Layers, 
  Printer, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  X,
  AlertCircle,
  Settings2,
  Percent,
  Sliders,
  RotateCcw,
  Save,
  CheckSquare
} from 'lucide-react';

export interface ActivityTemplate {
  id: string;
  category: ActivityCategory;
  titleEn: string;
  titleAr: string;
  defaultMarks: number;
  maxMarks: number;
  percentageMark: number;
  durationMinutes: number;
  descriptionEn: string;
  descriptionAr: string;
  isCustom?: boolean;
}

export const DEFAULT_ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'tpl-adab',
    category: 'adab',
    titleEn: 'Adab (Respect & Halaqah Etiquette)',
    titleAr: 'الأدب (توقير مجلس القرآن وإجلال المعلم والزملاء)',
    defaultMarks: 10,
    maxMarks: 10,
    percentageMark: 100,
    durationMinutes: 30,
    descriptionEn: 'Exemplary sitting posture, humble listening without interrupting, and reverence for the Qur’an, teacher, and classmates.',
    descriptionAr: 'التزام تام بأدب مجلس العلم والقرآن، والجلوس بوقار وحسن الإنصات والتأدب مع المعلم والزملاء.'
  },
  {
    id: 'tpl-attentiveness',
    category: 'attentiveness',
    titleEn: 'Attentiveness (Sharp Concentration & Focus)',
    titleAr: 'الانتباه والتركيز (متابعة دقيقة في المصحف دون تشتت)',
    defaultMarks: 10,
    maxMarks: 10,
    percentageMark: 100,
    durationMinutes: 35,
    descriptionEn: 'Maintained sharp mental focus, tracked verses on the Mushaf intently, and participated actively throughout the session.',
    descriptionAr: 'يقظة وحضور ذهني تام، ومتابعة القراءة في المصحف بتركيز، والمشاركة الإيجابية السريعة.'
  },
  {
    id: 'tpl-neatness',
    category: 'neatness',
    titleEn: 'Neatness (Personal Hygiene & Halaqah Order)',
    titleAr: 'النظافة والترتيب (طهارة المظهر ونظام المصحف والرحل)',
    defaultMarks: 10,
    maxMarks: 10,
    percentageMark: 100,
    durationMinutes: 15,
    descriptionEn: 'Immaculate clean thobe, tidy wooden stand (Rehal), orderly placement of Qur’an bag, and clean seating space.',
    descriptionAr: 'مظهر لائق ونظافة الملبس والجسد، وترتيب حامل المصحف (الرحل) ووضع الحقيبة بنظام ونظافة المكان.'
  },
  {
    id: 'tpl-performance',
    category: 'performance',
    titleEn: 'Performance (Quranic Recitation & Tajweed Mastery)',
    titleAr: 'الأداء والإتقان (جودة التسميع وإتقان أحكام التلاوة)',
    defaultMarks: 10,
    maxMarks: 10,
    percentageMark: 100,
    durationMinutes: 40,
    descriptionEn: 'Outstanding recitation performance with fluent recall, exact articulation (Makharij), and confident delivery.',
    descriptionAr: 'أداء متميز في التسميع والحفظ المتقن مع إخراج الحروف من مخارجها الصحيحة وتطبيق أحكام التجويد.'
  },
  {
    id: 'tpl-coming_earlier',
    category: 'coming_earlier',
    titleEn: 'Coming Earlier (Punctuality & Early Preparation)',
    titleAr: 'التبكير والحضور مبكراً (الوصول المبكر والتهيئة)',
    defaultMarks: 10,
    maxMarks: 10,
    percentageMark: 100,
    durationMinutes: 20,
    descriptionEn: 'Arrived well before the scheduled halaqah start, performed Tahiyyat al-Masjid, and engaged in quiet review.',
    descriptionAr: 'التبكير بالحضور إلى المسجد قبل الموعد، وصلاة تحية المسجد، والبدء بالمراجعة الفردية بهدوء.'
  },
  {
    id: 'tpl-good_manner',
    category: 'good_manner',
    titleEn: 'Good Manner (Kind Demeanor & Polite Speech)',
    titleAr: 'حسن الخلق (بشاشة الوجه وطيب الكلام والتعاون)',
    defaultMarks: 10,
    maxMarks: 10,
    percentageMark: 100,
    durationMinutes: 25,
    descriptionEn: 'Exhibited courteous greeting with a smile, gentle tone, helping peers with kindness, and cheerful brotherhood.',
    descriptionAr: 'إفشاء السلام بابتسامة وطلاقة وجه، ولين الجانب وطيب الكلام، ومساعدة الزملاء بروح الأخوة الإيمانية.'
  }
];

export const TEMPLATES_STORAGE_KEY = 'al_millah_activity_templates_v2';

export interface DailyActivitiesTrackerViewProps {
  initialStudentFilter?: string;
  onSwitchToRoster?: () => void;
  isEmbedded?: boolean;
}

export const DailyActivitiesTrackerView: React.FC<DailyActivitiesTrackerViewProps> = ({
  initialStudentFilter,
  onSwitchToRoster,
  isEmbedded = false
}) => {
  const { 
    students, 
    activities, 
    selectedDate, 
    setSelectedDate, 
    addActivity, 
    batchAddActivities, 
    updateActivity, 
    deleteActivity 
  } = useClass();
  const { language } = useLanguage();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(initialStudentFilter || 'all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'timeline' | 'matrix'>('timeline');

  // Sync initialStudentFilter if changed
  React.useEffect(() => {
    if (initialStudentFilter) {
      setSelectedStudentFilter(initialStudentFilter);
    }
  }, [initialStudentFilter]);

  // Activity Templates State with localStorage persistence
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse activity templates', e);
    }
    return DEFAULT_ACTIVITY_TEMPLATES;
  });

  // Sync templates to localStorage
  React.useEffect(() => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(activityTemplates));
  }, [activityTemplates]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<StudentActivity | null>(null);

  // Single Add Form state
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('adab');
  const [formTitle, setFormTitle] = useState('Adab (Respect & Halaqah Etiquette)');
  const [formTitleAr, setFormTitleAr] = useState('الأدب (توقير مجلس القرآن وإجلال المعلم والزملاء)');
  const [formDescription, setFormDescription] = useState('Exemplary sitting posture, humble listening without interrupting, and reverence for the Qur’an.');
  const [formMarks, setFormMarks] = useState<number>(10);
  const [formMaxMarks, setFormMaxMarks] = useState<number>(10);
  const [formPercentage, setFormPercentage] = useState<number>(100);
  const [formStatus, setFormStatus] = useState<ActivityStatus>('completed');
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formNotes, setFormNotes] = useState('');

  // Batch Form state
  const [batchSelectedStudentIds, setBatchSelectedStudentIds] = useState<string[]>(students.map(s => s.id));
  const [batchTemplateIndex, setBatchTemplateIndex] = useState<number>(0);
  const [batchMarks, setBatchMarks] = useState<number>(10);
  const [batchMaxMarks, setBatchMaxMarks] = useState<number>(10);
  const [batchPercentage, setBatchPercentage] = useState<number>(100);
  const [batchStatus, setBatchStatus] = useState<ActivityStatus>('completed');
  const [batchDuration, setBatchDuration] = useState<number>(30);
  const [batchNotes, setBatchNotes] = useState('');

  // Manage Criteria Form State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false);
  const [templateFormTitleEn, setTemplateFormTitleEn] = useState('');
  const [templateFormTitleAr, setTemplateFormTitleAr] = useState('');
  const [templateFormCategory, setTemplateFormCategory] = useState('');
  const [templateFormDescriptionEn, setTemplateFormDescriptionEn] = useState('');
  const [templateFormDescriptionAr, setTemplateFormDescriptionAr] = useState('');
  const [templateFormDefaultMarks, setTemplateFormDefaultMarks] = useState<number>(10);
  const [templateFormMaxMarks, setTemplateFormMaxMarks] = useState<number>(10);
  const [templateFormPercentage, setTemplateFormPercentage] = useState<number>(100);
  const [templateFormDuration, setTemplateFormDuration] = useState<number>(30);

  // Category labels helper - searches active templates first
  const getCategoryLabel = (cat: ActivityCategory, lang: 'en' | 'ar' = language) => {
    const matching = activityTemplates.find(t => t.category === cat);
    if (matching) {
      return lang === 'ar' ? matching.titleAr : matching.titleEn;
    }
    switch (cat) {
      case 'adab':
        return lang === 'ar' ? 'الأدب والسمت' : 'Adab';
      case 'attentiveness':
        return lang === 'ar' ? 'الانتباه والتركيز' : 'Attentiveness';
      case 'neatness':
        return lang === 'ar' ? 'النظافة والترتيب' : 'Neatness';
      case 'performance':
        return lang === 'ar' ? 'الأداء والإتقان' : 'Performance';
      case 'coming_earlier':
        return lang === 'ar' ? 'التبكير والحضور مبكراً' : 'Coming earlier';
      case 'good_manner':
        return lang === 'ar' ? 'حسن الخلق' : 'Good manner';
      case 'adhkar_dua':
        return lang === 'ar' ? 'أذكار ودعاء' : 'Adhkar & Dua';
      case 'quran_circle':
        return lang === 'ar' ? 'حلقة القرآن' : 'Quran Circle';
      case 'tajweed_drill':
        return lang === 'ar' ? 'تجويد ومخارج' : 'Tajweed Drill';
      case 'salah_sunnah':
        return lang === 'ar' ? 'صلاة الظهر' : 'Salah & Sunnah';
      case 'islamic_studies':
        return lang === 'ar' ? 'دراسة إسلامية' : 'Islamic Studies';
      case 'wudu_taharah':
        return lang === 'ar' ? 'الوضوء والطهارة' : 'Wudu & Taharah';
      case 'arabic_calligraphy':
        return lang === 'ar' ? 'خط الآيات' : 'Arabic Script';
      case 'peer_tutoring':
        return lang === 'ar' ? 'مراجعة ثنائية' : 'Peer Tutoring';
      case 'adab_service':
        return lang === 'ar' ? 'خدمة المسجد' : 'Mosque Service';
      default:
        return String(cat).replace(/_/g, ' ');
    }
  };

  const getCategoryBadgeClass = (cat: ActivityCategory) => {
    switch (cat) {
      case 'adab':
        return 'text-[#854d2b] bg-[#faedd9] border-[#eedbc8]';
      case 'attentiveness':
        return 'text-[#1d4ed8] bg-[#eff6ff] border-[#bfdbfe]';
      case 'neatness':
        return 'text-[#047857] bg-[#ecfdf5] border-[#a7f3d0]';
      case 'performance':
        return 'text-[#7e22ce] bg-[#faf5ff] border-[#e9d5ff]';
      case 'coming_earlier':
        return 'text-[#15803d] bg-[#f0fdf4] border-[#bbf7d0]';
      case 'good_manner':
        return 'text-[#be123c] bg-[#fff1f2] border-[#fecdd3]';
      default:
        return 'text-[#854d2b] bg-[#fbf4eb] border-[#eedbc8]';
    }
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2d6639] bg-[#f0f9f1] border border-[#c4e6c9] px-2 py-0.5 rounded-none">
            <CheckCircle2 className="w-3 h-3" />
            {language === 'ar' ? 'مكتمل بنجاح' : 'Completed'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#854d2b] bg-[#faedd9] border border-[#edd5be] px-2 py-0.5 rounded-none">
            <Clock className="w-3 h-3" />
            {language === 'ar' ? 'قيد الإنجاز' : 'In Progress'}
          </span>
        );
      case 'needs_practice':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a14022] bg-[#fdf2ee] border border-[#f5cbbe] px-2 py-0.5 rounded-none">
            <AlertCircle className="w-3 h-3" />
            {language === 'ar' ? 'يحتاج تدريب' : 'Needs Practice'}
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#635043] bg-[#ede5dc] border border-[#ded1c4] px-2 py-0.5 rounded-none">
            {language === 'ar' ? 'معذور' : 'Excused'}
          </span>
        );
    }
  };

  // Date controls
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate('2026-09-03');
  };

  // Activities for selected date
  const dayActivities = useMemo(() => {
    return activities.filter(a => a.date === selectedDate);
  }, [activities, selectedDate]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return dayActivities.filter(a => {
      // Student filter
      if (selectedStudentFilter !== 'all' && a.studentId !== selectedStudentFilter) {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter !== 'all' && a.activityType !== selectedCategoryFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'all' && a.status !== selectedStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const student = students.find(s => s.id === a.studentId);
        const matchTitle = a.title.toLowerCase().includes(query) || (a.titleAr && a.titleAr.includes(query));
        const matchStudent = student && (student.fullName.toLowerCase().includes(query) || student.arabicName.includes(query));
        const matchNotes = a.notes && a.notes.toLowerCase().includes(query);
        if (!matchTitle && !matchStudent && !matchNotes) return false;
      }
      return true;
    });
  }, [dayActivities, selectedStudentFilter, selectedCategoryFilter, selectedStatusFilter, searchQuery, students]);

  // KPIs
  const totalRecordedToday = dayActivities.length;
  const completedToday = dayActivities.filter(a => a.status === 'completed').length;
  const totalMarksSum = dayActivities.reduce((acc, curr) => acc + curr.marks, 0);
  const avgMarksToday = totalRecordedToday > 0 ? (totalMarksSum / totalRecordedToday).toFixed(1) : '0.0';
  const uniqueStudentsCovered = new Set(dayActivities.map(a => a.studentId)).size;
  const classCoverageRate = students.length > 0 ? Math.round((uniqueStudentsCovered / students.length) * 100) : 0;

  // Apply template to single form
  const applyPresetToForm = (template: ActivityTemplate) => {
    setFormCategory(template.category);
    setFormTitle(template.titleEn);
    setFormTitleAr(template.titleAr);
    setFormDescription(language === 'ar' ? template.descriptionAr : template.descriptionEn);
    setFormMarks(template.defaultMarks);
    const max = template.maxMarks || 10;
    setFormMaxMarks(max);
    setFormPercentage(max > 0 ? Math.round((template.defaultMarks / max) * 100) : 100);
    setFormDuration(template.durationMinutes);
    setFormNotes(language === 'ar' ? template.descriptionAr : template.descriptionEn);
  };

  // Open single add modal
  const handleOpenAddModal = (initialStudentId?: string) => {
    if (initialStudentId) {
      setFormStudentId(initialStudentId);
    } else if (!formStudentId && students.length > 0) {
      setFormStudentId(students[0].id);
    }
    const defaultTemplate = activityTemplates[0] || DEFAULT_ACTIVITY_TEMPLATES[0];
    applyPresetToForm(defaultTemplate);
    setEditingActivity(null);
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (activity: StudentActivity) => {
    setEditingActivity(activity);
    setFormStudentId(activity.studentId);
    setFormCategory(activity.activityType);
    setFormTitle(activity.title);
    setFormTitleAr(activity.titleAr || '');
    setFormDescription(activity.description || '');
    setFormMarks(activity.marks);
    const max = activity.maxMarks || 10;
    setFormMaxMarks(max);
    setFormPercentage(max > 0 ? Math.round((activity.marks / max) * 100) : 100);
    setFormStatus(activity.status);
    setFormDuration(activity.durationMinutes);
    setFormNotes(activity.notes || '');
    setIsAddModalOpen(true);
  };

  // Submit Single Form
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) return;

    const defaultTitleEn = getCategoryLabel(formCategory, 'en');
    const defaultTitleAr = getCategoryLabel(formCategory, 'ar');

    if (editingActivity) {
      updateActivity({
        ...editingActivity,
        studentId: formStudentId,
        activityType: formCategory,
        title: formTitle || defaultTitleEn,
        titleAr: formTitleAr || defaultTitleAr,
        description: formDescription,
        marks: Number(formMarks),
        maxMarks: Number(formMaxMarks) || 10,
        status: formStatus,
        durationMinutes: Number(formDuration),
        notes: formNotes,
      });
    } else {
      addActivity({
        studentId: formStudentId,
        date: selectedDate,
        activityType: formCategory,
        title: formTitle || defaultTitleEn,
        titleAr: formTitleAr || defaultTitleAr,
        description: formDescription,
        marks: Number(formMarks),
        maxMarks: Number(formMaxMarks) || 10,
        status: formStatus,
        durationMinutes: Number(formDuration),
        notes: formNotes,
        recordedBy: "Ustadh Muhammad Shaya'u"
      });
    }

    setIsAddModalOpen(false);
    setEditingActivity(null);
  };

  // Batch Submit
  const handleSaveBatchActivities = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchSelectedStudentIds.length === 0) return;

    const template = activityTemplates[batchTemplateIndex] || activityTemplates[0] || DEFAULT_ACTIVITY_TEMPLATES[0];
    const maxM = Number(batchMaxMarks) || template.maxMarks || 10;
    const itemsToAdd = batchSelectedStudentIds.map(stId => ({
      studentId: stId,
      date: selectedDate,
      activityType: template.category,
      title: template.titleEn,
      titleAr: template.titleAr,
      description: template.descriptionEn,
      marks: Number(batchMarks),
      maxMarks: maxM,
      status: batchStatus,
      durationMinutes: Number(batchDuration),
      notes: batchNotes || template.descriptionEn,
      recordedBy: "Ustadh Muhammad Shaya'u"
    }));

    batchAddActivities(itemsToAdd);
    setIsBatchModalOpen(false);
    setBatchNotes('');
  };

  // Template Management Functions
  const resetTemplateForm = () => {
    setTemplateFormTitleEn('');
    setTemplateFormTitleAr('');
    setTemplateFormCategory('');
    setTemplateFormDescriptionEn('');
    setTemplateFormDescriptionAr('');
    setTemplateFormDefaultMarks(10);
    setTemplateFormMaxMarks(10);
    setTemplateFormPercentage(100);
    setTemplateFormDuration(30);
    setEditingTemplateId(null);
    setIsCreatingNewTemplate(false);
  };

  const handleStartCreateTemplate = () => {
    resetTemplateForm();
    setIsCreatingNewTemplate(true);
  };

  const handleStartEditTemplate = (tpl: ActivityTemplate) => {
    setEditingTemplateId(tpl.id);
    setIsCreatingNewTemplate(false);
    setTemplateFormTitleEn(tpl.titleEn);
    setTemplateFormTitleAr(tpl.titleAr);
    setTemplateFormCategory(tpl.category);
    setTemplateFormDescriptionEn(tpl.descriptionEn);
    setTemplateFormDescriptionAr(tpl.descriptionAr);
    setTemplateFormDefaultMarks(tpl.defaultMarks);
    setTemplateFormMaxMarks(tpl.maxMarks || 10);
    const pct = tpl.maxMarks > 0 ? Math.round((tpl.defaultMarks / tpl.maxMarks) * 100) : 100;
    setTemplateFormPercentage(pct);
    setTemplateFormDuration(tpl.durationMinutes);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormTitleEn.trim()) return;

    const catKey = templateFormCategory.trim()
      ? templateFormCategory.toLowerCase().replace(/\s+/g, '_')
      : templateFormTitleEn.toLowerCase().replace(/[^a-z0-9]/gi, '_');

    const max = Number(templateFormMaxMarks) || 10;
    const defMarks = Number(templateFormDefaultMarks);
    const pct = max > 0 ? Math.round((defMarks / max) * 100) : 100;

    if (editingTemplateId) {
      setActivityTemplates(prev => prev.map(t => {
        if (t.id === editingTemplateId) {
          return {
            ...t,
            titleEn: templateFormTitleEn.trim(),
            titleAr: templateFormTitleAr.trim() || templateFormTitleEn.trim(),
            category: catKey as ActivityCategory,
            descriptionEn: templateFormDescriptionEn.trim(),
            descriptionAr: templateFormDescriptionAr.trim() || templateFormTitleAr.trim(),
            defaultMarks: defMarks,
            maxMarks: max,
            percentageMark: pct,
            durationMinutes: Number(templateFormDuration) || 30
          };
        }
        return t;
      }));
    } else {
      const newTpl: ActivityTemplate = {
        id: `tpl-${Date.now()}`,
        category: catKey as ActivityCategory,
        titleEn: templateFormTitleEn.trim(),
        titleAr: templateFormTitleAr.trim() || templateFormTitleEn.trim(),
        descriptionEn: templateFormDescriptionEn.trim(),
        descriptionAr: templateFormDescriptionAr.trim() || templateFormTitleAr.trim(),
        defaultMarks: defMarks,
        maxMarks: max,
        percentageMark: pct,
        durationMinutes: Number(templateFormDuration) || 30,
        isCustom: true
      };
      setActivityTemplates(prev => [...prev, newTpl]);
    }

    resetTemplateForm();
  };

  const handleDeleteTemplate = (id: string) => {
    if (activityTemplates.length <= 1) {
      alert(language === 'ar' ? 'يجب الإبقاء على نشاط واحد على الأقل في النظام.' : 'You must keep at least one activity in the system.');
      return;
    }
    const targetTpl = activityTemplates.find(t => t.id === id);
    const confirmMsg = language === 'ar'
      ? `هل أنت متأكد من حذف نشاط "${targetTpl?.titleAr || targetTpl?.titleEn}"؟`
      : `Are you sure you want to remove activity "${targetTpl?.titleEn}"?`;
    if (window.confirm(confirmMsg)) {
      setActivityTemplates(prev => prev.filter(t => t.id !== id));
      if (editingTemplateId === id) resetTemplateForm();
    }
  };

  const handleResetTemplates = () => {
    const confirmMsg = language === 'ar'
      ? 'هل ترغب في استعادة الأنشطة الافتراضية الستة للأكاديمية وتصفية التعديلات؟'
      : 'Reset to standard Al-Millah default activities and criteria?';
    if (window.confirm(confirmMsg)) {
      setActivityTemplates(DEFAULT_ACTIVITY_TEMPLATES);
      localStorage.removeItem(TEMPLATES_STORAGE_KEY);
      resetTemplateForm();
    }
  };

  const handleToggleSelectAllBatch = () => {
    if (batchSelectedStudentIds.length === students.length) {
      setBatchSelectedStudentIds([]);
    } else {
      setBatchSelectedStudentIds(students.map(s => s.id));
    }
  };

  const handleToggleBatchStudent = (id: string) => {
    setBatchSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Day Navigation Bar */}
      <div className="bg-[#1e130c] border border-[#3b2518] text-[#f5eee8] p-5 rounded-none shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#854d2b] text-[#faedd9] rounded-none">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#f5eee8]">
                    {language === 'ar' ? 'سجل متابعة الأنشطة اليومية للطلاب' : 'Daily Student Activities Tracker'}
                  </h1>
                  {isEmbedded && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#faedd9]/20 text-[#f0ba78] border border-[#f0ba78]/30">
                      {language === 'ar' ? 'ضمن سجلات الطلاب' : 'In Student Records'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#d6c4b2] mt-0.5">
                  {language === 'ar' 
                    ? 'تسجيل ومتابعة الأنشطة اليومية: الأدب، الانتباه، النظافة، الأداء، التبكير، وحسن الخلق' 
                    : 'Record and track daily spiritual, academic, and behavioral student activities every day'}
                </p>
              </div>
            </div>

            {/* Filtered Student Pill / Back to Roster */}
            {(selectedStudentFilter !== 'all' || onSwitchToRoster) && (
              <div className="flex items-center gap-2 mt-2.5">
                {selectedStudentFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-[#faedd9] text-[#854d2b] px-2.5 py-1 rounded-none font-bold border border-[#df9b52]">
                    <span>
                      {language === 'ar' ? 'تصفية حسب الطالب:' : 'Filtered for:'}{' '}
                      {students.find(s => s.id === selectedStudentFilter)?.fullName || selectedStudentFilter}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentFilter('all')}
                      className="text-[#854d2b] hover:text-red-700 ml-1 cursor-pointer"
                      title={language === 'ar' ? 'إلغاء التصفية' : 'Clear filter'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {onSwitchToRoster && (
                  <button
                    type="button"
                    onClick={onSwitchToRoster}
                    className="inline-flex items-center gap-1.5 text-xs bg-[#2b1b11] hover:bg-[#3d2719] text-[#faedd9] border border-[#4a2e1d] px-2.5 py-1 rounded-none font-semibold transition cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#f0ba78]" />
                    <span>{language === 'ar' ? 'العودة لبيانات الطلاب' : 'View Student Roster'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date Selector and Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            {/* Date Controller */}
            <div className="flex items-center bg-[#2b1b11] border border-[#4a2e1d] p-1 rounded-none">
              <button
                type="button"
                id="activities-prev-day-btn"
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-[#3d2719] text-[#d6c4b2] hover:text-white rounded-none transition-colors cursor-pointer"
                title={language === 'ar' ? 'اليوم السابق' : 'Previous Day'}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>

              <div className="flex items-center gap-1.5 px-2.5">
                <Calendar className="w-3.5 h-3.5 text-[#df9b52]" />
                <input
                  type="date"
                  id="activities-date-input"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#faedd9] focus:outline-hidden cursor-pointer"
                />
              </div>

              <button
                type="button"
                id="activities-next-day-btn"
                onClick={handleNextDay}
                className="p-1.5 hover:bg-[#3d2719] text-[#d6c4b2] hover:text-white rounded-none transition-colors cursor-pointer"
                title={language === 'ar' ? 'اليوم التالي' : 'Next Day'}
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                type="button"
                id="activities-today-btn"
                onClick={handleSetToday}
                className="ml-1 text-[11px] font-bold px-2 py-1 bg-[#854d2b] hover:bg-[#a15f36] text-[#faedd9] rounded-none transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'اليوم' : 'Today'}
              </button>
            </div>

            {/* Batch Log Button */}
            <button
              type="button"
              id="activities-batch-log-btn"
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-2 bg-[#2d6639] hover:bg-[#397d47] text-white px-3.5 py-2 text-xs font-bold rounded-none transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#86efac]" />
              <span>{language === 'ar' ? '⚡ تسجيل نشاط جماعي للحلقة' : '⚡ Batch Log for Class'}</span>
            </button>

            {/* Manage Activities & Percentage Marks Button */}
            <button
              type="button"
              id="activities-manage-criteria-btn"
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#3b2317] hover:bg-[#523120] text-[#faedd9] border border-[#df9b52]/50 px-3.5 py-2 text-xs font-bold rounded-none transition-all shadow-xs cursor-pointer"
              title={language === 'ar' ? 'تعديل الأنشطة وإضافة وحذف الأنشطة والنسب المئوية' : 'Edit, Add, Remove Activities and Percentage Marks'}
            >
              <Settings2 className="w-3.5 h-3.5 text-[#f7cb8b]" />
              <span>{language === 'ar' ? '⚙️ تعديل الأنشطة والنسب' : '⚙️ Manage Activities & Marks'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#df9b52]/30 text-[#f7cb8b] font-mono font-bold">
                {activityTemplates.length}
              </span>
            </button>

            {/* Add Activity Button */}
            <button
              type="button"
              id="activities-add-activity-btn"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 bg-[#df9b52] hover:bg-[#e8aa66] text-[#1b110b] px-4 py-2 text-xs font-black rounded-none transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#1b110b]" />
              <span>{language === 'ar' ? '+ تسجيل نشاط جديد' : '+ Add Daily Activity'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-none border border-[#e5dad0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7c695d]">
              {language === 'ar' ? 'إجمالي أنشطة اليوم' : 'Total Activities Today'}
            </span>
            <Activity className="w-4 h-4 text-[#854d2b]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#1b110b]">{totalRecordedToday}</span>
            <span className="text-[11px] font-bold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded-none">
              {language === 'ar' ? 'نشاط مسجل' : 'Logged'}
            </span>
          </div>
          <p className="text-[10px] text-[#8c7464] mt-1.5">
            {language === 'ar' ? `بتاريخ: ${selectedDate}` : `Recorded on ${selectedDate}`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-none border border-[#e5dad0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7c695d]">
              {language === 'ar' ? 'نسبة مشاركة الحلقة' : 'Student Coverage'}
            </span>
            <Users className="w-4 h-4 text-[#2d6639]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1b110b]">{uniqueStudentsCovered}</span>
              <span className="text-xs text-[#7c695d]">/ {students.length}</span>
            </div>
            <span className="text-[11px] font-bold text-[#2d6639] bg-[#f0f9f1] px-2 py-0.5 rounded-none border border-[#c4e6c9]">
              {classCoverageRate}%
            </span>
          </div>
          <div className="w-full bg-[#ede5dc] h-1.5 rounded-none mt-2 overflow-hidden">
            <div 
              className="bg-[#2d6639] h-full rounded-none transition-all duration-300"
              style={{ width: `${classCoverageRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-[#e5dad0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7c695d]">
              {language === 'ar' ? 'متوسط الدرجات اليومية' : 'Average Daily Marks'}
            </span>
            <Award className="w-4 h-4 text-[#df9b52]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#854d2b]">{avgMarksToday}</span>
              <span className="text-xs text-[#7c695d]">/ 10.0</span>
            </div>
            <span className="text-[11px] font-bold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded-none">
              {Number(avgMarksToday) >= 9 ? (language === 'ar' ? 'ممتاز' : 'Excellent') : (language === 'ar' ? 'جيد جداً' : 'Good')}
            </span>
          </div>
          <p className="text-[10px] text-[#8c7464] mt-1.5">
            {language === 'ar' ? 'معدل علامات الأنشطة المسجلة' : 'Average score across all tasks'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-none border border-[#e5dad0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7c695d]">
              {language === 'ar' ? 'المكتمل بنجاح' : 'Completed Successfully'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#2d6639]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1b110b]">{completedToday}</span>
              <span className="text-xs text-[#7c695d]">/ {totalRecordedToday}</span>
            </div>
            <span className="text-[11px] font-bold text-[#2d6639] bg-[#f0f9f1] px-2 py-0.5 rounded-none border border-[#c4e6c9]">
              {totalRecordedToday > 0 ? Math.round((completedToday / totalRecordedToday) * 100) : 0}%
            </span>
          </div>
          <p className="text-[10px] text-[#8c7464] mt-1.5">
            {language === 'ar' ? 'إتقان تام للواجبات والمهام' : 'Fully accomplished activities'}
          </p>
        </div>
      </div>

      {/* Filter and View Layout Controls */}
      <div className="bg-white p-4 rounded-none border border-[#e5dad0] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8c7464] absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="activities-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث باسم الطالب، عنوان النشاط أو الملاحظة...' : 'Search student name, activity title or note...'}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-xs bg-[#fbf9f6] border border-[#d8c8ba] rounded-none focus:outline-hidden focus:border-[#854d2b]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-[#8c7464] hover:text-[#1b110b]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Student Filter */}
          <select
            id="activities-student-filter"
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="bg-[#fbf9f6] border border-[#d8c8ba] text-xs font-medium text-[#1b110b] px-3 py-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
          >
            <option value="all">{language === 'ar' ? 'جميع الطلاب' : 'All Students'}</option>
            {students.map(st => (
              <option key={st.id} value={st.id}>
                {language === 'ar' ? `${st.rollNumber}. ${st.arabicName}` : `${st.rollNumber}. ${st.fullName}`}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            id="activities-category-filter"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-[#fbf9f6] border border-[#d8c8ba] text-xs font-medium text-[#1b110b] px-3 py-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
          >
            <option value="all">
              {language === 'ar' ? `جميع الأنشطة (${activityTemplates.length})` : `All Activities (${activityTemplates.length})`}
            </option>
            {activityTemplates.map(tpl => (
              <option key={tpl.id} value={tpl.category}>
                {language === 'ar' ? tpl.titleAr : tpl.titleEn} ({tpl.percentageMark || Math.round((tpl.defaultMarks / (tpl.maxMarks || 10)) * 100)}%)
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="activities-status-filter"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[#fbf9f6] border border-[#d8c8ba] text-xs font-medium text-[#1b110b] px-3 py-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
          >
            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
            <option value="in_progress">{language === 'ar' ? 'قيد الإنجاز' : 'In Progress'}</option>
            <option value="needs_practice">{language === 'ar' ? 'يحتاج تدريب' : 'Needs Practice'}</option>
            <option value="excused">{language === 'ar' ? 'معذور' : 'Excused'}</option>
          </select>

          {/* Layout Toggle */}
          <div className="flex border border-[#d8c8ba] bg-[#fbf9f6] rounded-none">
            <button
              type="button"
              id="activities-view-timeline-btn"
              onClick={() => setViewLayout('timeline')}
              className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none ${
                viewLayout === 'timeline'
                  ? 'bg-[#3b2317] text-[#faedd9]'
                  : 'text-[#635043] hover:text-[#1b110b]'
              }`}
            >
              {language === 'ar' ? 'قائمة الأنشطة' : 'Timeline'}
            </button>
            <button
              type="button"
              id="activities-view-matrix-btn"
              onClick={() => setViewLayout('matrix')}
              className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer rounded-none ${
                viewLayout === 'matrix'
                  ? 'bg-[#3b2317] text-[#faedd9]'
                  : 'text-[#635043] hover:text-[#1b110b]'
              }`}
            >
              {language === 'ar' ? 'جدول الطلاب' : 'Class Matrix'}
            </button>
          </div>
        </div>

        {/* Dynamic Activity Category Quick Filter Tabs & Management Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ede3da]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8c7464] uppercase tracking-wider me-1">
              {language === 'ar' ? 'الأنشطة المعتمدة:' : 'Active Activities:'}
            </span>

            {/* All chip */}
            <button
              type="button"
              id="cat-chip-all"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`text-xs px-2.5 py-1 font-bold border transition-colors cursor-pointer rounded-none flex items-center gap-1.5 ${
                selectedCategoryFilter === 'all'
                  ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317]'
                  : 'bg-white text-[#635043] border-[#d8c8ba] hover:bg-[#faedd9]/50'
              }`}
            >
              <span>{language === 'ar' ? 'الكل' : 'All'}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded-none font-extrabold ${
                selectedCategoryFilter === 'all' ? 'bg-[#faedd9]/25 text-[#faedd9]' : 'bg-[#ede5dc] text-[#635043]'
              }`}>
                {dayActivities.length}
              </span>
            </button>

            {/* Dynamic Activity Chips */}
            {activityTemplates.map(tpl => {
              const count = dayActivities.filter(a => a.activityType === tpl.category).length;
              const isSelected = selectedCategoryFilter === tpl.category;
              const pct = tpl.percentageMark || (tpl.maxMarks > 0 ? Math.round((tpl.defaultMarks / tpl.maxMarks) * 100) : 100);

              return (
                <button
                  key={tpl.id}
                  type="button"
                  id={`cat-chip-${tpl.category}`}
                  onClick={() => setSelectedCategoryFilter(tpl.category)}
                  className={`text-xs px-2 py-1 font-bold border transition-colors cursor-pointer rounded-none flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317]'
                      : 'bg-white text-[#635043] border-[#d8c8ba] hover:bg-[#faedd9]/50'
                  }`}
                  title={`${tpl.titleEn} (${pct}%)`}
                >
                  <span>{language === 'ar' ? tpl.titleAr : tpl.titleEn}</span>
                  <span className={`text-[9.5px] px-1 py-0.1 font-bold rounded-none ${
                    isSelected ? 'bg-[#faedd9]/30 text-[#f7cb8b]' : 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]'
                  }`}>
                    {pct}%
                  </span>
                  <span className={`text-[10px] px-1 py-0.2 rounded-none font-extrabold ${
                    isSelected ? 'bg-[#faedd9]/25 text-[#faedd9]' : 'bg-[#ede5dc] text-[#635043]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick link to manage/edit activities & percentage marks */}
          <button
            type="button"
            id="quick-manage-activities-btn"
            onClick={() => setIsManageModalOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#854d2b] hover:text-[#523120] hover:underline cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-[#df9b52]" />
            <span>{language === 'ar' ? 'تعديل قائمة الأنشطة والنسب' : 'Edit activities & percentages'}</span>
          </button>
        </div>
      </div>

      {/* Main Activity Content Area */}
      {viewLayout === 'timeline' ? (
        /* TIMELINE / CARD LIST VIEW */
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white border border-[#e5dad0] p-12 text-center rounded-none shadow-2xs">
              <Activity className="w-12 h-12 text-[#cbb8a7] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#1b110b]">
                {language === 'ar' ? 'لا توجد أنشطة مسجلة لهذا التاريخ' : 'No Activities Recorded for this Day'}
              </h3>
              <p className="text-xs text-[#7c695d] mt-1 max-w-md mx-auto">
                {language === 'ar' 
                  ? 'اضغط على زر "تسجيل نشاط جديد" أو "تسجيل نشاط جماعي" لإضافة أذكار أو صلوات أو واجبات اليوم للطلاب.' 
                  : 'Click "+ Add Daily Activity" or "⚡ Batch Log for Class" to record today’s spiritual and academic activities.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  id="activities-empty-add-btn"
                  onClick={() => handleOpenAddModal()}
                  className="inline-flex items-center gap-2 bg-[#854d2b] hover:bg-[#a15f36] text-white px-4 py-2 text-xs font-bold rounded-none shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تسجيل نشاط لطالب' : 'Add Student Activity'}</span>
                </button>
                <button
                  type="button"
                  id="activities-empty-batch-btn"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#2d6639] hover:bg-[#397d47] text-white px-4 py-2 text-xs font-bold rounded-none shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#86efac]" />
                  <span>{language === 'ar' ? 'تسجيل نشاط جماعي للحلقة' : 'Batch Log for Class'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredActivities.map(act => {
                const student = students.find(s => s.id === act.studentId);
                return (
                  <div 
                    key={act.id} 
                    id={`activity-card-${act.id}`}
                    className="bg-white border border-[#e5dad0] hover:border-[#caa688] p-4 rounded-none shadow-2xs transition-all space-y-3"
                  >
                    {/* Header: Student and Category */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#f0e7df] pb-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={student?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'} 
                          alt={student?.fullName || 'Student'} 
                          className="w-9 h-9 rounded-none object-cover border border-[#d8c8ba]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-[#854d2b] bg-[#faedd9] px-1.5 py-0.2 rounded-none">
                              #{student?.rollNumber || '0'}
                            </span>
                            <h4 className="text-xs font-extrabold text-[#1b110b]">
                              {language === 'ar' ? student?.arabicName : student?.fullName}
                            </h4>
                          </div>
                          <span className="text-[10px] text-[#7c695d] block">
                            {language === 'ar' ? student?.fullName : student?.arabicName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right rtl:text-left flex flex-col items-end rtl:items-start">
                        {getStatusBadge(act.status)}
                        <span className="text-[10px] text-[#8c7464] mt-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {act.durationMinutes} {language === 'ar' ? 'دقيقة' : 'min'}
                        </span>
                      </div>
                    </div>

                    {/* Activity Category & Timestamp */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold border px-2.5 py-0.5 rounded-none ${getCategoryBadgeClass(act.activityType)}`}>
                          {getCategoryLabel(act.activityType)}
                        </span>
                        <span className="text-[10px] text-[#8c7464]">
                          {act.timestamp || act.date}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-xs text-[#635043] leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>

                    {/* Score Bar & Notes */}
                    <div className="bg-[#fbf9f6] border border-[#ede3da] p-2.5 rounded-none space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#635043]">
                          {language === 'ar' ? 'الدرجة والنسبة المئوية:' : 'Marks & Percentage:'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#2d6639] bg-[#f0f9f1] border border-[#c4e6c9] px-2 py-0.5 rounded-none inline-flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5 text-[#2d6639]" />
                            {Math.round((act.marks / (act.maxMarks || 10)) * 100)}%
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-[#854d2b]">{act.marks}</span>
                            <span className="text-xs text-[#7c695d]">/ {act.maxMarks || 10}</span>
                          </div>
                        </div>
                      </div>

                      {/* Marks Progress Bar */}
                      <div className="w-full bg-[#e3d7cb] h-1.5 rounded-none overflow-hidden">
                        <div 
                          className="bg-[#854d2b] h-full rounded-none transition-all duration-300"
                          style={{ width: `${Math.min(100, (act.marks / (act.maxMarks || 10)) * 100)}%` }}
                        />
                      </div>

                      {act.notes && (
                        <p className="text-[11px] text-[#544135] italic border-t border-[#ede3da] pt-1.5">
                          "{act.notes}"
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#f0e7df] text-[11px] text-[#8c7464]">
                      <span>
                        {language === 'ar' ? `المشرف: ${act.recordedBy}` : `Logged by: ${act.recordedBy}`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          id={`activity-edit-btn-${act.id}`}
                          onClick={() => handleOpenEditModal(act)}
                          className="p-1.5 text-[#635043] hover:text-[#854d2b] hover:bg-[#faedd9] rounded-none transition-colors cursor-pointer"
                          title={language === 'ar' ? 'تعديل النشاط' : 'Edit Activity'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`activity-delete-btn-${act.id}`}
                          onClick={() => {
                            if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا النشاط؟' : 'Delete this recorded activity?')) {
                              deleteActivity(act.id);
                            }
                          }}
                          className="p-1.5 text-[#635043] hover:text-[#b91c1c] hover:bg-[#fef2f2] rounded-none transition-colors cursor-pointer"
                          title={language === 'ar' ? 'حذف النشاط' : 'Delete Activity'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* CLASS MATRIX TABLE VIEW */
        <div className="bg-white border border-[#e5dad0] rounded-none shadow-2xs overflow-hidden">
          <div className="p-4 bg-[#fbf9f6] border-b border-[#e5dad0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1b110b]">
                {language === 'ar' ? 'مصفوفة متابعة أنشطة طلاب الصف الخامس' : 'Class Five Student Daily Activities Matrix'}
              </h3>
              <p className="text-xs text-[#7c695d]">
                {language === 'ar' ? `بيانات يوم: ${selectedDate}` : `Activity overview for ${selectedDate}`}
              </p>
            </div>
            <span className="text-xs font-bold text-[#854d2b] bg-[#faedd9] px-2.5 py-1 rounded-none">
              {dayActivities.length} {language === 'ar' ? 'نشاط مرصود اليوم' : 'Activities Logged'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-[#f5eee8] border-b border-[#e5dad0] text-[#635043] font-bold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'الطالب' : 'Student'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'عدد الأنشطة' : 'Total Activities'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'مجموع الدرجات' : 'Total Marks'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'متوسط الدرجات' : 'Average (out of 10)'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'الأنشطة المنجزة اليوم' : 'Activities Completed Today'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e7df]">
                {students.map(st => {
                  const studentActivities = dayActivities.filter(a => a.studentId === st.id);
                  const count = studentActivities.length;
                  const totalMarks = studentActivities.reduce((acc, curr) => acc + curr.marks, 0);
                  const avg = count > 0 ? (totalMarks / count).toFixed(1) : '-';

                  return (
                    <tr key={st.id} className="hover:bg-[#fcfaf7] transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-[#854d2b]">
                        {st.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={st.avatarUrl} 
                            alt={st.fullName} 
                            className="w-7 h-7 rounded-none object-cover border border-[#d8c8ba]"
                          />
                          <div>
                            <span className="font-bold text-[#1b110b] block">
                              {language === 'ar' ? st.arabicName : st.fullName}
                            </span>
                            <span className="text-[10px] text-[#7c695d]">
                              {language === 'ar' ? st.fullName : st.arabicName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 font-bold rounded-none ${
                          count > 0 ? 'bg-[#f0f9f1] text-[#2d6639] border border-[#c4e6c9]' : 'bg-[#ede5dc] text-[#7c695d]'
                        }`}>
                          {count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-black text-[#1b110b]">
                        {count > 0 ? totalMarks.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {count > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-extrabold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded-none">
                              {avg} / 10
                            </span>
                            <span className="text-[10px] font-bold text-[#2d6639] bg-[#f0f9f1] px-1.5 py-0.2 rounded-none border border-[#c4e6c9]">
                              {Math.round((Number(avg) / 10) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8c7464]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {studentActivities.length > 0 ? (
                            studentActivities.map(act => (
                              <span 
                                key={act.id} 
                                className={`inline-flex items-center gap-1.5 text-[10px] border px-2 py-0.5 rounded-none ${getCategoryBadgeClass(act.activityType)}`}
                                title={act.description || getCategoryLabel(act.activityType)}
                              >
                                <span className="font-bold">{getCategoryLabel(act.activityType)}</span>
                                <span className="font-black text-[#854d2b]">{act.marks}</span>
                                <span className="text-[9px] font-bold text-[#2d6639] bg-white/70 px-1 py-0.1 border border-[#c4e6c9]/60">
                                  {Math.round((act.marks / (act.maxMarks || 10)) * 100)}%
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#8c7464] italic">
                              {language === 'ar' ? 'لم يسجل نشاط اليوم' : 'No activities recorded today'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          id={`matrix-add-act-btn-${st.id}`}
                          onClick={() => handleOpenAddModal(st.id)}
                          className="inline-flex items-center gap-1 bg-[#854d2b] hover:bg-[#a15f36] text-[#faedd9] px-2.5 py-1 text-[11px] font-bold rounded-none cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{language === 'ar' ? 'إضافة' : '+ Add'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE ACTIVITY ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#3b2317] w-full max-w-2xl rounded-none shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1e130c] text-[#f5eee8] px-5 py-4 flex items-center justify-between border-b border-[#3b2518]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#854d2b] text-[#faedd9] rounded-none">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#f5eee8]">
                  {editingActivity 
                    ? (language === 'ar' ? 'تعديل النشاط اليومي' : 'Edit Daily Student Activity')
                    : (language === 'ar' ? 'تسجيل نشاط يومي جديد للطالب' : 'Record Daily Student Activity')}
                </h3>
              </div>
              <button
                type="button"
                id="modal-close-add-activity"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#d6c4b2] hover:text-white p-1 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Picker (Only for new activities) */}
            {!editingActivity && (
              <div className="bg-[#fbf9f6] p-3 border-b border-[#e5dad0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#854d2b] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#df9b52]" />
                    {language === 'ar' ? 'نماذج الأنشطة المعتمدة (تعبئة سريعة بنقرة واحدة):' : 'Active Activity Presets (One-click fill):'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="text-[10px] font-bold text-[#854d2b] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Settings2 className="w-3 h-3" />
                    {language === 'ar' ? 'إدارة الأنشطة والنسب' : 'Manage Activities'}
                  </button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {activityTemplates.map((tpl) => {
                    const pct = tpl.percentageMark || (tpl.maxMarks > 0 ? Math.round((tpl.defaultMarks / tpl.maxMarks) * 100) : 100);
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyPresetToForm(tpl)}
                        className="text-[10px] font-bold whitespace-nowrap bg-white hover:bg-[#faedd9] text-[#635043] hover:text-[#854d2b] border border-[#d8c8ba] px-2.5 py-1 rounded-none transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? tpl.titleAr : tpl.titleEn}</span>
                        <span className="text-[9px] font-black text-[#2d6639] bg-[#f0f9f1] px-1 py-0.1 border border-[#c4e6c9]">
                          {pct}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSaveActivity} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#1b110b] mb-1">
                    {language === 'ar' ? 'الطالب المستهدف:' : 'Student:'}
                  </label>
                  <select
                    id="form-student-select"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    required
                    className="w-full bg-[#fbf9f6] border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
                  >
                    {students.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.rollNumber}. {language === 'ar' ? st.arabicName : st.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1b110b]">
                      {language === 'ar' ? 'نوع ونشاط الحلقة:' : 'Activity Type / Category:'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsManageModalOpen(true)}
                      className="text-[10px] text-[#854d2b] hover:underline font-bold"
                    >
                      {language === 'ar' ? '+ نشاط جديد' : '+ Add/Edit'}
                    </button>
                  </div>
                  <select
                    id="form-category-select"
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value as ActivityCategory;
                      setFormCategory(newCat);
                      const matching = activityTemplates.find(t => t.category === newCat);
                      if (matching) {
                        setFormTitle(matching.titleEn);
                        setFormTitleAr(matching.titleAr);
                        setFormDescription(language === 'ar' ? matching.descriptionAr : matching.descriptionEn);
                        setFormDuration(matching.durationMinutes);
                        setFormMarks(matching.defaultMarks);
                        setFormMaxMarks(matching.maxMarks || 10);
                        const pct = matching.percentageMark || (matching.maxMarks > 0 ? Math.round((matching.defaultMarks / matching.maxMarks) * 100) : 100);
                        setFormPercentage(pct);
                      }
                    }}
                    className="w-full bg-[#fbf9f6] border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
                  >
                    {activityTemplates.map(tpl => (
                      <option key={tpl.id} value={tpl.category}>
                        {language === 'ar' ? tpl.titleAr : tpl.titleEn} ({tpl.percentageMark || Math.round((tpl.defaultMarks / (tpl.maxMarks || 10)) * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Selected Summary */}
              <div className="bg-[#fcfaf7] border border-[#ede3da] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold border px-2.5 py-1 rounded-none ${getCategoryBadgeClass(formCategory)}`}>
                    {getCategoryLabel(formCategory)}
                  </span>
                  <span className="text-[11px] text-[#7c695d]">
                    {language === 'ar' ? 'الدرجة والنسبة متزامنتان تلقائياً' : 'Marks and percentage synchronized'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#2d6639] bg-[#f0f9f1] px-2 py-0.5 border border-[#c4e6c9]">
                    {formPercentage}%
                  </span>
                  <span className="text-xs font-black text-[#854d2b] bg-[#faedd9] px-2 py-0.5">
                    {formMarks} / {formMaxMarks}
                  </span>
                </div>
              </div>

              {/* Marks & Percentage Real-Time Editable Row */}
              <div className="bg-[#fbf9f6] p-3.5 border border-[#e5dad0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#ede3da] pb-1.5">
                  <span className="text-xs font-bold text-[#1b110b] flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#2d6639]" />
                    {language === 'ar' ? 'تعديل الدرجات والنسبة المئوية للنشاط:' : 'Activity Marks & Percentage Scoring:'}
                  </span>
                  <span className="text-[11px] text-[#8c7464]">
                    {language === 'ar' ? 'تعديل الدرجة يحدّث النسبة وتعديل النسبة يحدّث الدرجة' : 'Two-way synchronized'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Numerical Marks Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#635043] mb-1">
                      {language === 'ar' ? `الدرجة المستحقة (من ${formMaxMarks}):` : `Marks Awarded (out of ${formMaxMarks}):`}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        id="form-marks-input"
                        step="0.1"
                        min="0"
                        max={formMaxMarks}
                        value={formMarks}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormMarks(val);
                          const maxM = formMaxMarks > 0 ? formMaxMarks : 10;
                          setFormPercentage(Math.round((val / maxM) * 100));
                        }}
                        required
                        className="w-24 bg-white border border-[#d8c8ba] text-sm font-black text-[#854d2b] p-2 rounded-none text-center focus:border-[#854d2b]"
                      />
                      <span className="text-xs text-[#8c7464] font-bold">/</span>
                      <input
                        type="number"
                        id="form-max-marks-input"
                        step="1"
                        min="1"
                        value={formMaxMarks}
                        onChange={(e) => {
                          const maxVal = Math.max(1, Number(e.target.value));
                          setFormMaxMarks(maxVal);
                          setFormPercentage(Math.round((formMarks / maxVal) * 100));
                        }}
                        title={language === 'ar' ? 'الدرجة العظمى' : 'Max Marks'}
                        className="w-16 bg-white border border-[#d8c8ba] text-xs font-bold text-[#635043] p-2 rounded-none text-center"
                      />
                    </div>
                  </div>

                  {/* Percentage Marks Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#635043] mb-1">
                      {language === 'ar' ? 'النسبة المئوية (%):' : 'Percentage Mark (%):'}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-28">
                        <input
                          type="number"
                          id="form-percentage-input"
                          min="0"
                          max="100"
                          value={formPercentage}
                          onChange={(e) => {
                            const pctVal = Math.min(100, Math.max(0, Number(e.target.value)));
                            setFormPercentage(pctVal);
                            const calculatedMarks = Number(((pctVal / 100) * formMaxMarks).toFixed(1));
                            setFormMarks(calculatedMarks);
                          }}
                          className="w-full bg-white border border-[#d8c8ba] text-sm font-black text-[#2d6639] p-2 pr-7 rtl:pr-2 rtl:pl-7 rounded-none text-center focus:border-[#2d6639]"
                        />
                        <span className="absolute right-2 rtl:left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2d6639]">
                          %
                        </span>
                      </div>

                      {/* Quick Percentage Presets */}
                      <div className="flex flex-wrap gap-1">
                        {[100, 95, 90, 85, 80].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setFormPercentage(pct);
                              const calculatedMarks = Number(((pct / 100) * formMaxMarks).toFixed(1));
                              setFormMarks(calculatedMarks);
                            }}
                            className={`text-[10px] px-1.5 py-1 font-bold rounded-none border cursor-pointer ${
                              formPercentage === pct
                                ? 'bg-[#2d6639] text-white border-[#2d6639]'
                                : 'bg-white text-[#2d6639] border-[#c4e6c9] hover:bg-[#f0f9f1]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fbf9f6] p-3 border border-[#e5dad0]">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#1b110b] mb-1">
                    {language === 'ar' ? 'حالة الإنجاز:' : 'Status:'}
                  </label>
                  <select
                    id="form-status-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ActivityStatus)}
                    className="w-full bg-white border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none"
                  >
                    <option value="completed">{language === 'ar' ? 'مكتمل بنجاح' : 'Completed'}</option>
                    <option value="in_progress">{language === 'ar' ? 'قيد الإنجاز' : 'In Progress'}</option>
                    <option value="needs_practice">{language === 'ar' ? 'يحتاج تدريب' : 'Needs Practice'}</option>
                    <option value="excused">{language === 'ar' ? 'معذور' : 'Excused'}</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-[#1b110b] mb-1">
                    {language === 'ar' ? 'المدة (بالدقائق):' : 'Duration (mins):'}
                  </label>
                  <input
                    type="number"
                    id="form-duration-input"
                    min="5"
                    step="5"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-white border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none"
                  />
                </div>
              </div>

              {/* Description & Notes */}
              <div>
                <label className="block text-xs font-bold text-[#1b110b] mb-1">
                  {language === 'ar' ? 'ملاحظات الأستاذ وتوجيهاته:' : 'Teacher Remarks / Notes:'}
                </label>
                <textarea
                  id="form-notes-textarea"
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل ملاحظات حول مستوى إتقان الطالب وسلوكه...' : 'Enter feedback regarding performance, tajweed precision, or manners...'}
                  className="w-full bg-[#fbf9f6] border border-[#d8c8ba] text-xs text-[#1b110b] p-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5dad0]">
                <button
                  type="button"
                  id="modal-cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#635043] hover:text-[#1b110b] border border-[#d8c8ba] bg-white rounded-none cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  id="modal-submit-activity-btn"
                  className="px-5 py-2 text-xs font-bold text-[#faedd9] bg-[#854d2b] hover:bg-[#a15f36] rounded-none shadow-xs cursor-pointer"
                >
                  {editingActivity 
                    ? (language === 'ar' ? 'تحديث النشاط' : 'Update Activity')
                    : (language === 'ar' ? 'حفظ وتسجيل النشاط' : 'Save & Record Activity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH ACTIVITY MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#3b2317] w-full max-w-2xl rounded-none shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1e130c] text-[#f5eee8] px-5 py-4 flex items-center justify-between border-b border-[#3b2518]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#2d6639] text-[#faedd9] rounded-none">
                  <Sparkles className="w-4 h-4 text-[#86efac]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f5eee8]">
                    {language === 'ar' ? 'تسجيل نشاط يومي جماعي للحلقة' : 'Batch Record Daily Activity for Class'}
                  </h3>
                  <span className="text-[11px] text-[#d6c4b2]">
                    {language === 'ar' ? 'رصد نشاط واحد لكافة الطلاب أو لمجموعة منهم بضغطة واحدة' : 'Log a shared activity for all or selected students in one click'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                id="modal-close-batch-activity"
                onClick={() => setIsBatchModalOpen(false)}
                className="text-[#d6c4b2] hover:text-white p-1 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchActivities} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Select Activity Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1b110b]">
                    {language === 'ar' ? 'اختر نوع النشاط الجماعي من الأنشطة المعتمدة:' : 'Select Shared Activity Template:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBatchModalOpen(false);
                      setIsManageModalOpen(true);
                    }}
                    className="text-[10px] text-[#854d2b] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Settings2 className="w-3 h-3" />
                    {language === 'ar' ? 'تعديل الأنشطة والنسب' : 'Edit Activities & %'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activityTemplates.map((tpl, idx) => {
                    const pct = tpl.percentageMark || (tpl.maxMarks > 0 ? Math.round((tpl.defaultMarks / tpl.maxMarks) * 100) : 100);
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setBatchTemplateIndex(idx);
                          setBatchMarks(tpl.defaultMarks);
                          setBatchMaxMarks(tpl.maxMarks || 10);
                          setBatchPercentage(pct);
                          setBatchDuration(tpl.durationMinutes);
                          setBatchNotes(language === 'ar' ? tpl.descriptionAr : tpl.descriptionEn);
                        }}
                        className={`text-left rtl:text-right p-2.5 border text-xs rounded-none transition-all cursor-pointer ${
                          batchTemplateIndex === idx
                            ? 'border-[#854d2b] bg-[#faedd9] text-[#1b110b] font-bold ring-1 ring-[#854d2b]'
                            : 'border-[#e5dad0] bg-[#fbf9f6] text-[#635043] hover:border-[#caa688]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{language === 'ar' ? tpl.titleAr : tpl.titleEn}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[#2d6639] bg-[#f0f9f1] px-1 py-0.2 border border-[#c4e6c9]">
                              {pct}%
                            </span>
                            {batchTemplateIndex === idx && <Check className="w-3.5 h-3.5 text-[#854d2b]" />}
                          </div>
                        </div>
                        <span className="text-[10px] text-[#7c695d] block mt-1">
                          {tpl.durationMinutes} min • {tpl.defaultMarks} / {tpl.maxMarks || 10} marks
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Marks & Percentage Scoring */}
              <div className="bg-[#fbf9f6] p-3 border border-[#e5dad0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1b110b] flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#2d6639]" />
                    {language === 'ar' ? 'درجة ونسبة النشاط الجماعي:' : 'Batch Marks & Percentage:'}
                  </span>
                  <span className="text-[11px] text-[#8c7464]">
                    {language === 'ar' ? 'تطبق الدرجة والنسبة لكافة الطلاب المحددين' : 'Applies to all selected students'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#635043] mb-1">
                      {language === 'ar' ? `الدرجة (من ${batchMaxMarks}):` : `Marks Awarded (out of ${batchMaxMarks}):`}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={batchMaxMarks}
                      value={batchMarks}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBatchMarks(val);
                        setBatchPercentage(Math.round((val / (batchMaxMarks || 10)) * 100));
                      }}
                      required
                      className="w-full bg-white border border-[#d8c8ba] text-xs font-black text-[#854d2b] p-2 rounded-none text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#635043] mb-1">
                      {language === 'ar' ? 'النسبة المئوية (%):' : 'Percentage Mark (%):'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={batchPercentage}
                          onChange={(e) => {
                            const pct = Math.min(100, Math.max(0, Number(e.target.value)));
                            setBatchPercentage(pct);
                            setBatchMarks(Number(((pct / 100) * (batchMaxMarks || 10)).toFixed(1)));
                          }}
                          className="w-full bg-white border border-[#d8c8ba] text-xs font-black text-[#2d6639] p-2 pr-6 rtl:pr-2 rtl:pl-6 rounded-none text-center"
                        />
                        <span className="absolute right-2 rtl:left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2d6639]">%</span>
                      </div>
                      <div className="flex gap-1">
                        {[100, 95, 90, 80].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setBatchPercentage(pct);
                              setBatchMarks(Number(((pct / 100) * (batchMaxMarks || 10)).toFixed(1)));
                            }}
                            className={`text-[9.5px] px-1 py-1 font-bold border rounded-none ${
                              batchPercentage === pct ? 'bg-[#2d6639] text-white border-[#2d6639]' : 'bg-white text-[#2d6639] border-[#c4e6c9]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Duration */}
              <div className="grid grid-cols-2 gap-3 bg-[#fbf9f6] p-3 border border-[#e5dad0]">
                <div>
                  <label className="block text-xs font-bold text-[#1b110b] mb-1">
                    {language === 'ar' ? 'الحالة:' : 'Status:'}
                  </label>
                  <select
                    value={batchStatus}
                    onChange={(e) => setBatchStatus(e.target.value as ActivityStatus)}
                    className="w-full bg-white border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none"
                  >
                    <option value="completed">{language === 'ar' ? 'مكتمل بنجاح' : 'Completed'}</option>
                    <option value="in_progress">{language === 'ar' ? 'قيد الإنجاز' : 'In Progress'}</option>
                    <option value="needs_practice">{language === 'ar' ? 'يحتاج تدريب' : 'Needs Practice'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b110b] mb-1">
                    {language === 'ar' ? 'المدة (دقيقة):' : 'Duration (min):'}
                  </label>
                  <input
                    type="number"
                    value={batchDuration}
                    onChange={(e) => setBatchDuration(Number(e.target.value))}
                    className="w-full bg-white border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none text-center"
                  />
                </div>
              </div>

              {/* Student Selector Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1b110b]">
                    {language === 'ar' ? 'الطلاب المشمولون بالنشاط:' : 'Students Included in this Activity:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleSelectAllBatch}
                    className="text-xs font-bold text-[#854d2b] hover:underline cursor-pointer"
                  >
                    {batchSelectedStudentIds.length === students.length 
                      ? (language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All')
                      : (language === 'ar' ? 'تحديد كافة طلاب الحلقة' : 'Select All Students')}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2.5 bg-[#fbf9f6] border border-[#d8c8ba]">
                  {students.map(st => {
                    const isSelected = batchSelectedStudentIds.includes(st.id);
                    return (
                      <label 
                        key={st.id}
                        className={`flex items-center gap-2 p-1.5 border text-xs cursor-pointer rounded-none transition-colors ${
                          isSelected ? 'bg-[#faedd9] border-[#854d2b] font-bold text-[#1b110b]' : 'bg-white border-[#e5dad0] text-[#635043]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleBatchStudent(st.id)}
                          className="w-3.5 h-3.5 text-[#854d2b] rounded-none focus:ring-0"
                        />
                        <span className="truncate">
                          #{st.rollNumber} {language === 'ar' ? st.arabicName : st.fullName}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[10px] text-[#7c695d] mt-1 block">
                  {language === 'ar' 
                    ? `تم تحديد ${batchSelectedStudentIds.length} من أصل ${students.length} طالب.` 
                    : `Selected ${batchSelectedStudentIds.length} of ${students.length} students.`}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5dad0]">
                <button
                  type="button"
                  id="batch-modal-cancel-btn"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#635043] hover:text-[#1b110b] border border-[#d8c8ba] bg-white rounded-none cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  id="batch-modal-submit-btn"
                  disabled={batchSelectedStudentIds.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2d6639] hover:bg-[#397d47] disabled:opacity-50 rounded-none shadow-xs cursor-pointer"
                >
                  {language === 'ar' 
                    ? `رصد النشاط لـ (${batchSelectedStudentIds.length}) طلاب` 
                    : `Record for (${batchSelectedStudentIds.length}) Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE ACTIVITIES & PERCENTAGE MARKS MODAL (Add, Remove, Edit Activities & Criteria) */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#3b2317] w-full max-w-3xl rounded-none shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1e130c] text-[#f5eee8] px-5 py-4 flex items-center justify-between border-b border-[#3b2518]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#df9b52] text-[#1b110b] rounded-none">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f5eee8] flex items-center gap-2">
                    <span>{language === 'ar' ? 'إدارة الأنشطة اليومية وتعديل النسب المئوية والدرجات' : 'Manage Daily Activities & Percentage Marks'}</span>
                    <span className="text-[11px] bg-[#df9b52]/20 text-[#f7cb8b] px-2 py-0.5 border border-[#df9b52]/40">
                      {activityTemplates.length} {language === 'ar' ? 'نشاط' : 'Activities'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#d6c4b2] mt-0.5">
                    {language === 'ar' 
                      ? 'يمكنك إضافة أنشطة جديدة، حذف أي نشاط، وتعديل الدرجات والنسب المئوية لكل معيار ونشاط.' 
                      : 'Add new activities, delete any activity, and customize percentage marks & scoring criteria.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="modal-close-manage-activities"
                onClick={() => {
                  setIsManageModalOpen(false);
                  resetTemplateForm();
                }}
                className="text-[#d6c4b2] hover:text-white p-1 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Top Controls: Add Button & Reset */}
              <div className="flex items-center justify-between bg-[#fbf9f6] p-3 border border-[#e5dad0]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="manage-add-new-activity-btn"
                    onClick={handleStartCreateTemplate}
                    className="flex items-center gap-1.5 bg-[#854d2b] hover:bg-[#a15f36] text-[#faedd9] px-3.5 py-1.5 text-xs font-bold rounded-none shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar' ? '+ إضافة نشاط يومي جديد' : '+ Add New Activity'}</span>
                  </button>

                  <button
                    type="button"
                    id="manage-reset-defaults-btn"
                    onClick={handleResetTemplates}
                    className="flex items-center gap-1 text-[#7c695d] hover:text-[#1b110b] border border-[#d8c8ba] bg-white px-2.5 py-1.5 text-xs font-medium rounded-none transition-colors cursor-pointer"
                    title={language === 'ar' ? 'استعادة الأنشطة الستة الافتراضية' : 'Reset to default 6 activities'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-[#854d2b]">
                  {language === 'ar' ? 'يتم حفظ التغييرات تلقائياً' : 'Auto-saved locally'}
                </span>
              </div>

              {/* Add / Edit Activity Template Form */}
              {(isCreatingNewTemplate || editingTemplateId) && (
                <form onSubmit={handleSaveTemplate} className="bg-[#fcfaf7] border-2 border-[#df9b52] p-4 rounded-none space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e5dad0] pb-2">
                    <h4 className="text-xs font-black text-[#1b110b] flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#df9b52]" />
                      {editingTemplateId 
                        ? (language === 'ar' ? 'تعديل بيانات النشاط والنسبة المئوية' : 'Edit Activity & Percentage Marks')
                        : (language === 'ar' ? 'إضافة نشاط يومي جديد للحلقة' : 'Create New Daily Halaqah Activity')}
                    </h4>
                    <button
                      type="button"
                      onClick={resetTemplateForm}
                      className="text-xs text-[#7c695d] hover:text-[#1b110b] font-bold"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                        {language === 'ar' ? 'اسم النشاط (باللغة الإنجليزية):' : 'Activity Title (English):'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={templateFormTitleEn}
                        onChange={(e) => setTemplateFormTitleEn(e.target.value)}
                        placeholder="e.g. Daily Athkar & Duas"
                        className="w-full bg-white border border-[#d8c8ba] text-xs p-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                        {language === 'ar' ? 'اسم النشاط (باللغة العربية):' : 'Activity Title (Arabic):'}
                      </label>
                      <input
                        type="text"
                        value={templateFormTitleAr}
                        onChange={(e) => setTemplateFormTitleAr(e.target.value)}
                        placeholder="مثال: أذكار الصباح والمساء والأدعية"
                        className="w-full bg-white border border-[#d8c8ba] text-xs p-2 rounded-none focus:outline-hidden focus:border-[#854d2b]"
                      />
                    </div>
                  </div>

                  {/* Percentage Marks and Numerical Marks Editable Section */}
                  <div className="bg-[#f0f9f1] border border-[#c4e6c9] p-3 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#c4e6c9]/70 pb-1">
                      <span className="text-xs font-black text-[#2d6639] flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'ضبط الدرجة القصوى والنسبة المئوية الافتراضية للنشاط:' : 'Set Max Marks & Percentage Weight:'}
                      </span>
                      <span className="text-[10px] text-[#2d6639] font-bold">
                        {templateFormPercentage}% = ({templateFormDefaultMarks} / {templateFormMaxMarks})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                          {language === 'ar' ? 'الدرجة العظمى (Max Marks):' : 'Max Marks:'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={templateFormMaxMarks}
                          onChange={(e) => {
                            const maxVal = Math.max(1, Number(e.target.value));
                            setTemplateFormMaxMarks(maxVal);
                            setTemplateFormPercentage(Math.round((templateFormDefaultMarks / maxVal) * 100));
                          }}
                          className="w-full bg-white border border-[#d8c8ba] text-xs font-bold text-[#1b110b] p-2 rounded-none text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                          {language === 'ar' ? 'الدرجة الافتراضية (Default Marks):' : 'Default Marks:'}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={templateFormMaxMarks}
                          value={templateFormDefaultMarks}
                          onChange={(e) => {
                            const defVal = Number(e.target.value);
                            setTemplateFormDefaultMarks(defVal);
                            setTemplateFormPercentage(Math.round((defVal / (templateFormMaxMarks || 10)) * 100));
                          }}
                          className="w-full bg-white border border-[#d8c8ba] text-xs font-bold text-[#854d2b] p-2 rounded-none text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                          {language === 'ar' ? 'النسبة المئوية المستهدفة (%):' : 'Percentage Mark (%):'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={templateFormPercentage}
                            onChange={(e) => {
                              const pct = Math.min(100, Math.max(0, Number(e.target.value)));
                              setTemplateFormPercentage(pct);
                              const calculated = Number(((pct / 100) * (templateFormMaxMarks || 10)).toFixed(1));
                              setTemplateFormDefaultMarks(calculated);
                            }}
                            className="w-full bg-white border border-[#d8c8ba] text-xs font-black text-[#2d6639] p-2 pr-7 rtl:pr-2 rtl:pl-7 rounded-none text-center"
                          />
                          <span className="absolute right-2 rtl:left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2d6639]">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Percentage Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-[#2d6639]">
                        {language === 'ar' ? 'اختيار نسبة سريعة:' : 'Quick %:'}
                      </span>
                      {[100, 95, 90, 85, 80, 75].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setTemplateFormPercentage(pct);
                            const calculated = Number(((pct / 100) * (templateFormMaxMarks || 10)).toFixed(1));
                            setTemplateFormDefaultMarks(calculated);
                          }}
                          className={`text-[10px] px-2 py-0.5 font-bold border rounded-none cursor-pointer ${
                            templateFormPercentage === pct ? 'bg-[#2d6639] text-white border-[#2d6639]' : 'bg-white text-[#2d6639] border-[#c4e6c9]'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                        {language === 'ar' ? 'الوصف بالإنجليزية:' : 'Description (English):'}
                      </label>
                      <input
                        type="text"
                        value={templateFormDescriptionEn}
                        onChange={(e) => setTemplateFormDescriptionEn(e.target.value)}
                        placeholder="Criteria and guidelines..."
                        className="w-full bg-white border border-[#d8c8ba] text-xs p-2 rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#1b110b] mb-1">
                        {language === 'ar' ? 'الوصف بالعربية:' : 'Description (Arabic):'}
                      </label>
                      <input
                        type="text"
                        value={templateFormDescriptionAr}
                        onChange={(e) => setTemplateFormDescriptionAr(e.target.value)}
                        placeholder="معايير وضوابط النشاط..."
                        className="w-full bg-white border border-[#d8c8ba] text-xs p-2 rounded-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5dad0]">
                    <button
                      type="button"
                      onClick={resetTemplateForm}
                      className="px-3 py-1.5 text-xs text-[#635043] border border-[#d8c8ba] bg-white hover:bg-[#f5eee8] rounded-none cursor-pointer"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      id="save-activity-template-btn"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-[#faedd9] bg-[#854d2b] hover:bg-[#a15f36] rounded-none shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingTemplateId ? (language === 'ar' ? 'حفظ التعديلات' : 'Update Activity') : (language === 'ar' ? 'إضافة النشاط' : 'Save New Activity')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* List of Active Daily Activities with Live Percentage Marks and Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold text-[#1b110b]">
                    {language === 'ar' ? 'قائمة الأنشطة المعتمدة في النظام:' : 'Active Activities List & Scoring Weights:'}
                  </h4>
                  <span className="text-[11px] text-[#7c695d]">
                    {language === 'ar' ? 'انقر على "تعديل" لتغيير النسبة أو "حذف" لإزالة النشاط' : 'Click "Edit" to modify percentage or "Delete" to remove'}
                  </span>
                </div>

                <div className="border border-[#e5dad0] divide-y divide-[#ede3da] bg-white">
                  {activityTemplates.map((tpl, index) => {
                    const pct = tpl.percentageMark || (tpl.maxMarks > 0 ? Math.round((tpl.defaultMarks / tpl.maxMarks) * 100) : 100);
                    return (
                      <div 
                        key={tpl.id} 
                        id={`template-row-${tpl.id}`}
                        className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#fcfaf7] transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xs font-black text-[#854d2b] bg-[#faedd9] w-6 h-6 flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs font-bold text-[#1b110b]">
                                {language === 'ar' ? tpl.titleAr : tpl.titleEn}
                              </h5>
                              <span className="text-[10px] text-[#7c695d]">
                                ({language === 'ar' ? tpl.titleEn : tpl.titleAr})
                              </span>
                              {tpl.isCustom && (
                                <span className="text-[9px] font-bold text-[#7e22ce] bg-[#faf5ff] border border-[#e9d5ff] px-1 py-0.2">
                                  {language === 'ar' ? 'مخصص' : 'Custom'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#635043] mt-0.5 truncate max-w-md">
                              {language === 'ar' ? tpl.descriptionAr : tpl.descriptionEn}
                            </p>
                          </div>
                        </div>

                        {/* Marks & Percentage Indicators + Actions */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {/* Percentage Badge */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#2d6639] bg-[#f0f9f1] px-2 py-1 border border-[#c4e6c9] flex items-center gap-1">
                              <Percent className="w-3 h-3 text-[#2d6639]" />
                              <span>{pct}%</span>
                            </span>
                            <span className="text-xs font-bold text-[#854d2b] bg-[#faedd9] px-2 py-1">
                              {tpl.defaultMarks} / {tpl.maxMarks || 10}
                            </span>
                          </div>

                          {/* Edit / Remove Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              id={`edit-template-btn-${tpl.id}`}
                              onClick={() => handleStartEditTemplate(tpl)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#635043] hover:text-[#854d2b] border border-[#d8c8ba] bg-white hover:bg-[#faedd9] transition-colors cursor-pointer"
                              title={language === 'ar' ? 'تعديل هذا النشاط والنسبة' : 'Edit activity & percentage'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              id={`delete-template-btn-${tpl.id}`}
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#b91c1c] hover:bg-[#fef2f2] border border-[#fecdd3] bg-white transition-colors cursor-pointer"
                              title={language === 'ar' ? 'حذف هذا النشاط' : 'Remove activity'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'حذف' : 'Remove'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#fbf9f6] px-5 py-3 border-t border-[#e5dad0] flex items-center justify-between">
              <span className="text-xs text-[#7c695d]">
                {language === 'ar' 
                  ? `إجمالي الأنشطة الحالية: ${activityTemplates.length} نشاط` 
                  : `Total active activities: ${activityTemplates.length}`}
              </span>
              <button
                type="button"
                id="manage-modal-done-btn"
                onClick={() => {
                  setIsManageModalOpen(false);
                  resetTemplateForm();
                }}
                className="px-5 py-2 text-xs font-bold text-[#faedd9] bg-[#854d2b] hover:bg-[#a15f36] rounded-none shadow-xs cursor-pointer"
              >
                {language === 'ar' ? 'حفظ وإغلاق' : 'Done & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
