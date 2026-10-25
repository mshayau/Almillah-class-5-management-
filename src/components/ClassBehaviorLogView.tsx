import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { BehaviorNote, BehaviorIncidentType } from '../types';
import { getStudentGroupName } from '../data/studentGroups';
import { 
  Lock, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  X, 
  User, 
  FileText, 
  Calendar, 
  Printer, 
  Sliders
} from 'lucide-react';

interface ClassBehaviorLogViewProps {
  onSelectStudent: (studentId: string) => void;
}

const CATEGORY_PRESETS_EN = [
  'Etiquette & Adab',
  'Halaqah Focus & Recitation',
  'Dhuhr Prayer Discipline',
  'Peer Interaction & Brotherhood',
  'Classroom Distraction',
  'Respect for Qur’an & Rehal',
  'Punctuality & Attire',
  'Leadership & Assistance'
];

const CATEGORY_PRESETS_AR = [
  'آداب وأخلاق إسلامية',
  'تركيز وتسميع بالحلقة',
  'خشوع وانضباط في صلاة الظهر',
  'تعامل وأخوة مع الزملاء',
  'تشتت أو كلام جانبي',
  'احترام المصحف والرحال',
  'انضباط وحضور وزي شرعي',
  'مبادرة ومساعدة الآخرين'
];

export const ClassBehaviorLogView: React.FC<ClassBehaviorLogViewProps> = ({ onSelectStudent }) => {
  const { students, behaviorNotes, addBehaviorNote, deleteBehaviorNote, selectedDate } = useClass();
  const { language, isRTL, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStudentId, setModalStudentId] = useState(students[0]?.id || '');
  const [modalIncidentType, setModalIncidentType] = useState<BehaviorIncidentType>('observation');
  const [modalCategory, setModalCategory] = useState<string>(
    language === 'ar' ? CATEGORY_PRESETS_AR[0] : CATEGORY_PRESETS_EN[0]
  );
  const [modalNote, setModalNote] = useState('');
  
  const getNowFormatted = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${selectedDate} ${time}`;
  };

  const [modalTimestamp, setModalTimestamp] = useState<string>(getNowFormatted());
  const [toastMessage, setToastMessage] = useState('');

  // Filtering
  const filteredNotes = behaviorNotes.filter(note => {
    // Date filter
    if (dateFilterMode === 'today' && note.date !== selectedDate) return false;

    // Student filter
    if (selectedStudentFilter !== 'all' && note.studentId !== selectedStudentFilter) return false;

    // Type filter
    if (selectedTypeFilter !== 'all' && note.incidentType !== selectedTypeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const student = students.find(s => s.id === note.studentId);
      const matchesStudent = student && (
        student.fullName.toLowerCase().includes(q) ||
        (student.arabicName && student.arabicName.includes(q)) ||
        student.rollNumber.toString().includes(q)
      );
      const matchesText = note.note.toLowerCase().includes(q) || note.category.toLowerCase().includes(q);
      if (!matchesStudent && !matchesText) return false;
    }

    return true;
  });

  // KPI stats
  const totalNotesCount = behaviorNotes.length;
  const praiseCount = behaviorNotes.filter(n => n.incidentType === 'praise').length;
  const observationCount = behaviorNotes.filter(n => n.incidentType === 'observation').length;
  const concernsCount = behaviorNotes.filter(n => n.incidentType === 'concern' || n.incidentType === 'action_needed').length;

  const handleOpenAddModal = (studentId?: string) => {
    if (studentId) {
      setModalStudentId(studentId);
    }
    setModalTimestamp(getNowFormatted());
    setModalNote('');
    setShowAddModal(true);
  };

  const handleSaveModalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNote.trim() || !modalStudentId) return;

    addBehaviorNote({
      studentId: modalStudentId,
      date: selectedDate,
      timestamp: modalTimestamp || getNowFormatted(),
      note: modalNote.trim(),
      category: modalCategory,
      incidentType: modalIncidentType,
      isPrivate: true,
      authorName: "Ustadh Muhammad Shaya'u"
    });

    setShowAddModal(false);
    setToastMessage(language === 'ar' ? 'تمت إضافة الملاحظة السلوكية بنجاح' : 'Behavior note recorded successfully');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm(
      language === 'ar'
        ? 'هل ترغب في حذف هذه الملاحظة السلوكية؟'
        : 'Delete this behavior note permanently?'
    );
    if (ok) {
      deleteBehaviorNote(id);
    }
  };

  const getIncidentBadge = (type: BehaviorIncidentType) => {
    switch (type) {
      case 'praise':
        return {
          label: language === 'ar' ? '🌟 ثناء وإشادة' : '🌟 Praise / Commendation',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'observation':
        return {
          label: language === 'ar' ? '📝 ملاحظة سلوكية' : '📝 Observation',
          bg: 'bg-[#faf7f3] text-[#854d2b] border-[#e5dad0]',
          dot: 'bg-[#854d2b]'
        };
      case 'concern':
        return {
          label: language === 'ar' ? '⚠️ تنبيه ولفت نظر' : '⚠️ Mild Concern',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'action_needed':
        return {
          label: language === 'ar' ? '🚨 يحتاج متابعة' : '🚨 Action Needed',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5dad0] p-6 shadow-2xs space-y-6">
      
      {/* Header & Confidentiality Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f0e6dc]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3b2317] text-[#faedd9] flex items-center justify-center shadow-2xs">
              <Lock className="h-4.5 w-4.5 text-[#df9b52]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1b110b] flex items-center gap-2">
                <span>{language === 'ar' ? 'سجل ملاحظات السلوك والانضباط الطلابي' : 'Class Conduct & Behavior Notes Dossier'}</span>
                <span className="text-[10px] font-bold bg-[#faedd9] text-[#854d2b] border border-[#e8d7c8] px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'سري • هيئة التدريس' : 'Confidential • Teachers Only'}
                </span>
              </h3>
              <p className="text-xs text-[#7c695d] mt-0.5">
                {language === 'ar' 
                  ? 'سجل سري للمعلم لتدوين الملاحظات التربوية والسلوكية وحالات الثناء والتنبيه بدقة وتوقيت زمني.'
                  : 'Private repository for classroom decorum logs, personal commendations, and behavioral incidents.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-add-behavior-note-modal"
            type="button"
            onClick={() => handleOpenAddModal()}
            className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-4 w-4 text-[#df9b52]" />
            <span>{t('addBehaviorNote')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#faf7f3] p-3 rounded-xl border border-[#e5dad0]">
          <span className="text-[11px] font-semibold text-[#7c695d] block">
            {language === 'ar' ? 'إجمالي الملاحظات' : 'Total Notes on File'}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[#1b110b]">{totalNotesCount}</span>
            <span className="text-[10px] text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded-full font-bold">
              15 {language === 'ar' ? 'طالباً' : 'students'}
            </span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 block">
            {language === 'ar' ? 'إشادات وثناء 🌟' : 'Praises & Awards 🌟'}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-emerald-900">{praiseCount}</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              {Math.round((praiseCount / Math.max(1, totalNotesCount)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-[#faf7f3] p-3 rounded-xl border border-[#e5dad0]">
          <span className="text-[11px] font-semibold text-[#7c695d] block">
            {language === 'ar' ? 'ملاحظات عامة 📝' : 'General Observations 📝'}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[#1b110b]">{observationCount}</span>
            <span className="text-[10px] text-[#7c695d] font-bold">
              {language === 'ar' ? 'متابعة مستمرة' : 'In Progress'}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
          <span className="text-[11px] font-semibold text-amber-800 block">
            {language === 'ar' ? 'تنبيهات ومتابعة ⚠️' : 'Concerns & Follow-ups ⚠️'}
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-amber-900">{concernsCount}</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
              {concernsCount > 0 ? (language === 'ar' ? 'تحت الإشراف' : 'Supervised') : (language === 'ar' ? 'ممتاز' : 'Clear')}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-[#faf7f3] p-3 rounded-xl border border-[#e5dad0] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-[#8c7464] absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث بالاسم، الرقم، أو كلمات الملاحظة...' : 'Search student name, roll number, or note contents...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e5dad0] rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs text-[#1b110b] focus:outline-none focus:ring-1 focus:ring-[#854d2b]"
            />
          </div>

          {/* Student Filter Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full bg-white border border-[#e5dad0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1b110b] focus:outline-none focus:ring-1 focus:ring-[#854d2b]"
            >
              <option value="all">{language === 'ar' ? 'جميع الطلاب (١٥ طالباً)' : 'All Students (15)'}</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  #{s.rollNumber} - {language === 'ar' ? (s.arabicName || s.fullName) : s.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Mode Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#e5dad0] p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setDateFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-[#3b2317] text-[#faedd9]'
                  : 'text-[#635043] hover:text-[#1b110b]'
              }`}
            >
              {language === 'ar' ? 'جميع التواريخ' : 'All Time'}
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('today')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                dateFilterMode === 'today'
                  ? 'bg-[#3b2317] text-[#faedd9]'
                  : 'text-[#635043] hover:text-[#1b110b]'
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>{language === 'ar' ? 'اليوم فقط' : 'Today'}</span>
            </button>
          </div>
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#ede3d9]">
          <span className="text-[11px] font-bold text-[#7c695d] flex items-center gap-1">
            <Filter className="h-3 w-3 text-[#854d2b]" />
            <span>{language === 'ar' ? 'التصنيف:' : 'Type:'}</span>
          </span>

          {[
            { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
            { id: 'praise', label: language === 'ar' ? '🌟 ثناء وإشادة' : '🌟 Praise' },
            { id: 'observation', label: language === 'ar' ? '📝 ملاحظة' : '📝 Observation' },
            { id: 'concern', label: language === 'ar' ? '⚠️ لفت نظر' : '⚠️ Concern' },
            { id: 'action_needed', label: language === 'ar' ? '🚨 متابعة وتوجيه' : '🚨 Action Needed' }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedTypeFilter(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTypeFilter === opt.id
                  ? 'bg-[#3b2317] text-[#faedd9] shadow-2xs'
                  : 'bg-white text-[#635043] border border-[#e5dad0] hover:bg-[#ede5dc]'
              }`}
            >
              {opt.label}
            </button>
          ))}

          {(searchQuery || selectedStudentFilter !== 'all' || selectedTypeFilter !== 'all' || dateFilterMode !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStudentFilter('all');
                setSelectedTypeFilter('all');
                setDateFilterMode('all');
              }}
              className="text-[10px] text-[#854d2b] hover:underline ml-auto rtl:ml-0 rtl:mr-auto font-bold cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء التصفية' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Feed List */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-3">
          {filteredNotes.map(item => {
            const student = students.find(s => s.id === item.studentId);
            const badge = getIncidentBadge(item.incidentType);
            const isToday = item.date === selectedDate;

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-[#e5dad0] hover:border-[#df9b52]/60 hover:shadow-2xs transition space-y-2.5"
              >
                {/* Note Top Bar: Student info & Incident Type & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#f0e6dc]">
                  <div className="flex items-center gap-3">
                    {student && (
                      <img
                        src={student.avatarUrl}
                        alt={student.fullName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-[#e5dad0]"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-[#faedd9] text-[#854d2b] px-1.5 py-0.2 rounded">
                          #{student?.rollNumber}
                        </span>
                        <h4 className="text-xs font-bold text-[#1b110b]">
                          {language === 'ar' ? (student?.arabicName || student?.fullName) : student?.fullName}
                        </h4>
                        <span className="text-[10px] text-[#7c695d]">
                          ({language === 'ar' ? student?.fullName : student?.arabicName})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8c7464]">
                        <span className="font-semibold text-[#854d2b]">{getStudentGroupName(student?.group, language)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#854d2b]" />
                          <span>{item.timestamp}</span>
                        </span>
                        {isToday && (
                          <span className="font-extrabold text-[#854d2b] bg-[#faedd9] px-1.5 py-0.2 rounded text-[9px]">
                            {language === 'ar' ? 'اليوم' : 'Today'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-[10px] font-semibold bg-[#faf7f3] text-[#635043] border border-[#e5dad0] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectStudent(item.studentId)}
                      title={language === 'ar' ? 'فتح بطاقة تقييم الطالب' : 'Open Student Rubric'}
                      className="text-xs font-bold text-[#854d2b] hover:text-[#5c351f] bg-[#faedd9] hover:bg-[#f5e3cb] px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Sliders className="h-3 w-3" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'التقييم' : 'Rubric'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title={language === 'ar' ? 'حذف الملاحظة' : 'Delete note'}
                      className="text-[#a8988b] hover:text-rose-600 p-1 rounded transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <p className="text-xs text-[#1b110b] font-medium leading-relaxed bg-[#faf7f3] p-3 rounded-xl border border-[#ede3d9]">
                  {item.note}
                </p>

                {/* Note Footer */}
                <div className="flex items-center justify-between text-[10px] text-[#8c7464] pt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-[#854d2b]" />
                    <span>{item.authorName || "Ustadh Muhammad Shaya'u"}</span>
                  </span>
                  <span className="italic text-[9px] text-[#a8988b] flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    <span>{language === 'ar' ? 'سري • غير مصرح بنشره في التقرير الأسبوعي' : 'Confidential Dossier • Not visible to students or public'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#faf7f3] rounded-2xl border border-dashed border-[#e5dad0] p-6 space-y-2">
          <FileText className="h-8 w-8 mx-auto text-[#854d2b] opacity-40" />
          <h4 className="text-sm font-bold text-[#1b110b]">
            {language === 'ar' ? 'لا توجد ملاحظات سلوكية مطابقة للتصفية' : 'No behavior notes matching criteria'}
          </h4>
          <p className="text-xs text-[#7c695d] max-w-md mx-auto">
            {language === 'ar'
              ? 'يمكنك إضافة ملاحظة سلوكية خاصة جديدة لأي طالب في الحلقة باستخدام الزر أدناه.'
              : 'Record private conduct logs, praise outstanding halaqah adab, or track behavioral observations.'}
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="mt-2 inline-flex items-center gap-1.5 bg-[#3b2317] text-[#faedd9] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4f2f1e] transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#df9b52]" />
            <span>{t('addBehaviorNote')}</span>
          </button>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-[#e5dad0] max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e6dc]">
              <div className="flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-[#df9b52]" />
                <h4 className="font-bold text-[#1b110b] text-sm sm:text-base">
                  {language === 'ar' ? 'تدوين ملاحظة سلوكية خاصة' : 'Record Private Behavior Note'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8c7464] hover:text-[#1b110b] p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalNote} className="space-y-3.5">
              
              {/* Student Select */}
              <div>
                <label className="text-[11px] font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'اختر الطالب المعني:' : 'Target Student:'}
                </label>
                <select
                  value={modalStudentId}
                  onChange={(e) => setModalStudentId(e.target.value)}
                  className="w-full p-2 border border-[#e5dad0] rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-white text-[#1b110b]"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.rollNumber} - {language === 'ar' ? (s.arabicName || s.fullName) : s.fullName} ({s.fullName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Incident / Note Type */}
              <div>
                <label className="text-[11px] font-bold text-[#635043] block mb-1.5">
                  {t('incidentType')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'praise', label: language === 'ar' ? '🌟 ثناء وإشادة' : '🌟 Praise' },
                    { id: 'observation', label: language === 'ar' ? '📝 ملاحظة عامة' : '📝 Observation' },
                    { id: 'concern', label: language === 'ar' ? '⚠️ تنبيه' : '⚠️ Concern' },
                    { id: 'action_needed', label: language === 'ar' ? '🚨 متابعة' : '🚨 Follow-up' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setModalIncidentType(opt.id as BehaviorIncidentType)}
                      className={`py-1.5 px-2.5 rounded-lg border text-xs font-bold transition cursor-pointer text-center ${
                        modalIncidentType === opt.id
                          ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317] shadow-2xs'
                          : 'bg-white text-[#635043] border-[#e5dad0] hover:bg-[#ede5dc]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Timestamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#635043] block mb-1">
                    {t('categoryTag')}
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-white text-[#1b110b]"
                  >
                    {(language === 'ar' ? CATEGORY_PRESETS_AR : CATEGORY_PRESETS_EN).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#635043] block mb-1 flex items-center justify-between">
                    <span>{t('noteTimestamp')}</span>
                    <button
                      type="button"
                      onClick={() => setModalTimestamp(getNowFormatted())}
                      className="text-[10px] text-[#854d2b] hover:underline cursor-pointer"
                    >
                      {language === 'ar' ? 'الآن' : 'Set to Now'}
                    </button>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 h-3.5 w-3.5 text-[#8c7464]" />
                    <input
                      type="text"
                      value={modalTimestamp}
                      onChange={(e) => setModalTimestamp(e.target.value)}
                      placeholder="YYYY-MM-DD HH:MM AM/PM"
                      className="w-full pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-1.5 text-xs bg-white border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] text-[#1b110b]"
                    />
                  </div>
                </div>
              </div>

              {/* Note Textarea */}
              <div>
                <label className="text-[11px] font-bold text-[#635043] block mb-1">
                  {language === 'ar' ? 'تفاصيل الملاحظة السلوكية أو الواقعة:' : 'Observation / Incident Details:'}
                </label>
                <textarea
                  rows={3}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder={language === 'ar' ? 'سجل تفاصيل الملاحظة أو التصرف أو الثناء بدقة...' : 'Enter confidential observation details...'}
                  className="w-full p-2.5 border border-[#e5dad0] rounded-xl text-xs bg-[#faf7f3] text-[#1b110b] focus:ring-1 focus:ring-[#854d2b]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0e6dc]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#635043] hover:bg-[#ede5dc] rounded-xl transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!modalNote.trim()}
                  className="bg-[#3b2317] hover:bg-[#4f2f1e] disabled:opacity-50 text-[#faedd9] text-xs font-bold px-5 py-2 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#df9b52]" />
                  <span>{t('saveBehaviorNote')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
