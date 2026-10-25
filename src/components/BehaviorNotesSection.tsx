import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { BehaviorNote, BehaviorIncidentType, Student } from '../types';
import { 
  Lock, 
  Plus, 
  Clock, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  FileText, 
  Filter, 
  User, 
  X,
  Calendar
} from 'lucide-react';

interface BehaviorNotesSectionProps {
  student: Student;
  currentDate: string;
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

const NOTE_PRESETS_EN = [
  'Exemplary stillness and focus during recitation.',
  'Assisted classmates with Tajweed Makharij with commendable patience.',
  'Whispered repeatedly during classmate’s Sabaq recitation; reminded gently.',
  'Volunteered to arrange Mushafs and Rehal after Dhuhr prayer.',
  'Arrived late for morning opening Adhkar; addressed gently.',
  'Showed admirable humility and composure when corrected on Tajweed.',
  'Restless during long revision round; took a 2-minute water break.'
];

const NOTE_PRESETS_AR = [
  'هدوء وتركيز استثنائي وأدب رفيع أثناء جلسة التسميع.',
  'ساعد زملاءه في تحسين مخارج الحروف بصبر وأدب مشهود.',
  'همس وتحدث جانبياً أثناء تسميع زميله؛ تم تذكيره وتوجيهه برفق.',
  'بادر طواعية بترتيب المصاحف والرحال بعد صلاة الظهر.',
  'تأخر عن أذكار الصباح الافتتاحية؛ تم توجيهه لأهمية البكور.',
  'أظهر تواضعاً كبيراً وروحاً طيبة عند تصحيح أحكام التجويد.',
  'فقد تركيزه أثناء جولة المراجعة الطويلة؛ أخذ استراحة شرب ماء.'
];

export const BehaviorNotesSection: React.FC<BehaviorNotesSectionProps> = ({
  student,
  currentDate
}) => {
  const { behaviorNotes, addBehaviorNote, deleteBehaviorNote } = useClass();
  const { language, isRTL, t } = useLanguage();

  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  // Form State
  const [incidentType, setIncidentType] = useState<BehaviorIncidentType>('observation');
  const [category, setCategory] = useState<string>(
    language === 'ar' ? CATEGORY_PRESETS_AR[0] : CATEGORY_PRESETS_EN[0]
  );
  const [noteText, setNoteText] = useState('');
  
  // Initialize timestamp with current date and time
  const getNowFormatted = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${currentDate} ${time}`;
  };

  const [customTimestamp, setCustomTimestamp] = useState<string>(getNowFormatted());
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all notes for this student
  const studentNotes = behaviorNotes.filter(n => n.studentId === student.id);

  // Apply filters
  const filteredNotes = studentNotes.filter(n => {
    if (showTodayOnly && n.date !== currentDate) return false;
    if (filterType !== 'all' && n.incidentType !== filterType) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setCustomTimestamp(getNowFormatted());
    setIsAdding(true);
    setSuccessMsg('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addBehaviorNote({
      studentId: student.id,
      date: currentDate,
      timestamp: customTimestamp || getNowFormatted(),
      note: noteText.trim(),
      category: category,
      incidentType: incidentType,
      isPrivate: true,
      authorName: "Ustadh Muhammad Shaya'u"
    });

    setNoteText('');
    setIsAdding(false);
    setSuccessMsg(language === 'ar' ? 'تم تسجيل الملاحظة السلوكية بنجاح!' : 'Behavior note saved securely to student dossier.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذه الملاحظة السلوكية؟'
        : 'Are you sure you want to remove this private behavior note?'
    );
    if (confirmDelete) {
      deleteBehaviorNote(id);
    }
  };

  const getIncidentBadge = (type: BehaviorIncidentType) => {
    switch (type) {
      case 'praise':
        return {
          label: language === 'ar' ? '🌟 إشادة وثناء' : '🌟 Praise / Exemplary',
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
          label: language === 'ar' ? '⚠️ لفت نظر' : '⚠️ Mild Concern',
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
    <div className="bg-white rounded-2xl border border-[#e5dad0] p-5 shadow-2xs space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e6dc]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#faedd9] text-[#854d2b] flex items-center justify-center border border-[#eedecf]">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-[#1b110b] tracking-tight">
                {t('behaviorNotes')}
              </h3>
              <span className="text-[10px] font-bold bg-[#3b2317] text-[#faedd9] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-[#df9b52]" />
                <span>{t('privateNotesTag')}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#7c695d] mt-0.5">
              {t('privateTeacherOnlyNotice')}
            </p>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="flex items-center gap-2">
          {!isAdding && (
            <button
              id="add-behavior-note-btn"
              type="button"
              onClick={handleOpenAdd}
              className="bg-[#854d2b] hover:bg-[#6e3f22] text-[#faedd9] text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('addBehaviorNote')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Add Note Drawer / Form */}
      {isAdding && (
        <form onSubmit={handleSaveNote} className="bg-[#faf7f3] p-4 rounded-xl border border-[#e5dad0] space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#e8ded5] pb-2">
            <span className="text-xs font-bold text-[#1b110b] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#df9b52]" />
              <span>{language === 'ar' ? `تسجيل ملاحظة سلوكية لـ ${student.arabicName || student.fullName}` : `Record Behavior Observation for ${student.fullName}`}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#8c7464] hover:text-[#1b110b] p-1 rounded-md transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Incident / Note Type Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#635043] block mb-1.5">
              {t('incidentType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'praise', label: language === 'ar' ? '🌟 ثناء وإشادة' : '🌟 Praise' },
                { id: 'observation', label: language === 'ar' ? '📝 ملاحظة عامة' : '📝 Observation' },
                { id: 'concern', label: language === 'ar' ? '⚠️ لفت نظر' : '⚠️ Concern' },
                { id: 'action_needed', label: language === 'ar' ? '🚨 يحتاج متابعة' : '🚨 Follow-up' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIncidentType(opt.id as BehaviorIncidentType)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-bold transition cursor-pointer text-center ${
                    incidentType === opt.id
                      ? 'bg-[#3b2317] text-[#faedd9] border-[#3b2317] shadow-2xs'
                      : 'bg-white text-[#635043] border-[#e5dad0] hover:bg-[#ede5dc]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector & Timestamp Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#635043] block mb-1">
                {t('categoryTag')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                  onClick={() => setCustomTimestamp(getNowFormatted())}
                  className="text-[10px] text-[#854d2b] hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'الآن' : 'Set to Now'}
                </button>
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 h-3.5 w-3.5 text-[#8c7464]" />
                <input
                  type="text"
                  value={customTimestamp}
                  onChange={(e) => setCustomTimestamp(e.target.value)}
                  placeholder="YYYY-MM-DD HH:MM AM/PM"
                  className="w-full pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-1.5 text-xs bg-white border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] text-[#1b110b]"
                />
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] text-[#8c7464] block mb-1">
              {language === 'ar' ? 'عبارات سريعة بنقرة واحدة:' : 'Quick conduct presets:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(language === 'ar' ? NOTE_PRESETS_AR : NOTE_PRESETS_EN).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNoteText(prev => prev ? `${prev} ${preset}` : preset)}
                  className="text-[10px] bg-white hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] px-2 py-0.5 rounded-md transition cursor-pointer text-left rtl:text-right truncate max-w-[280px]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Note Textarea */}
          <div>
            <textarea
              id="behavior-note-textarea"
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={language === 'ar' ? 'سجل تفاصيل الملاحظة السلوكية أو الواقعة...' : 'Enter confidential observation details, triggers, or positive conduct...'}
              className="w-full p-2.5 border border-[#e5dad0] rounded-lg text-xs bg-white text-[#1b110b] focus:ring-1 focus:ring-[#854d2b]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#635043] hover:bg-[#ede5dc] rounded-lg transition cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              id="save-behavior-note-btn"
              type="submit"
              disabled={!noteText.trim()}
              className="bg-[#3b2317] hover:bg-[#4f2f1e] disabled:opacity-50 text-[#faedd9] text-xs font-bold px-4 py-1.5 rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#df9b52]" />
              <span>{t('saveBehaviorNote')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs bg-[#faf7f3] p-2.5 rounded-xl border border-[#ede3d9]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-[#7c695d] flex items-center gap-1">
            <Filter className="h-3 w-3 text-[#854d2b]" />
            <span>{language === 'ar' ? 'تصفية:' : 'Filter:'}</span>
          </span>

          {['all', 'praise', 'observation', 'concern', 'action_needed'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer capitalize ${
                filterType === f
                  ? 'bg-[#3b2317] text-[#faedd9]'
                  : 'bg-white text-[#635043] border border-[#e5dad0] hover:bg-[#ede5dc]'
              }`}
            >
              {f === 'all' && (language === 'ar' ? 'الكل' : 'All Types')}
              {f === 'praise' && (language === 'ar' ? '🌟 ثناء' : '🌟 Praise')}
              {f === 'observation' && (language === 'ar' ? '📝 ملاحظة' : '📝 Observation')}
              {f === 'concern' && (language === 'ar' ? '⚠️ تنبيه' : '⚠️ Concern')}
              {f === 'action_needed' && (language === 'ar' ? '🚨 متابعة' : '🚨 Action Needed')}
            </button>
          ))}
        </div>

        {/* Date Filter & Counter */}
        <div className="flex items-center gap-2 ml-auto rtl:ml-0 rtl:mr-auto">
          <button
            type="button"
            onClick={() => setShowTodayOnly(!showTodayOnly)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer border flex items-center gap-1 ${
              showTodayOnly
                ? 'bg-[#faedd9] text-[#854d2b] border-[#c88642]'
                : 'bg-white text-[#635043] border-[#e5dad0]'
            }`}
          >
            <Calendar className="h-2.5 w-2.5" />
            <span>{language === 'ar' ? 'اليوم فقط' : 'Today Only'}</span>
          </button>
          <span className="text-[10px] font-bold text-[#854d2b] bg-white border border-[#e5dad0] px-2 py-0.5 rounded-md">
            {filteredNotes.length} {language === 'ar' ? 'ملاحظة' : 'notes'}
          </span>
        </div>
      </div>

      {/* Notes Timeline Feed */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredNotes.map(item => {
            const badge = getIncidentBadge(item.incidentType);
            const isToday = item.date === currentDate;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition hover:shadow-2xs ${
                  isToday 
                    ? 'bg-[#fefdfb] border-[#e5dad0]' 
                    : 'bg-white border-[#f0e6dc]'
                }`}
              >
                {/* Note Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-[10px] font-semibold bg-[#faf7f3] text-[#635043] border border-[#e5dad0] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>

                    {isToday && (
                      <span className="text-[9px] font-extrabold text-[#854d2b] bg-[#faedd9] border border-[#e8d7c8] px-1.5 py-0.2 rounded">
                        {language === 'ar' ? 'اليوم' : 'Today'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#8c7464]">
                      <Clock className="h-3 w-3 text-[#854d2b]" />
                      <span>{item.timestamp}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title={language === 'ar' ? 'حذف الملاحظة' : 'Delete note'}
                      className="text-[#a8988b] hover:text-rose-600 p-1 rounded transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Note Body */}
                <p className="text-xs text-[#1b110b] font-medium leading-relaxed bg-[#fbf9f6] p-2.5 rounded-lg border border-[#f0e6dc]">
                  {item.note}
                </p>

                {/* Note Footer */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#8c7464]">
                  <span className="flex items-center gap-1">
                    <User className="h-2.5 w-2.5 text-[#854d2b]" />
                    <span>{item.authorName || "Ustadh Muhammad Shaya'u"}</span>
                  </span>
                  <span className="italic text-[9px] text-[#a8988b]">
                    {language === 'ar' ? 'سري للمعلم • غير معلن' : 'Private record • Not public'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-[#8c7464] bg-[#faf7f3] rounded-xl border border-dashed border-[#e5dad0]">
          <FileText className="h-6 w-6 mx-auto mb-1.5 opacity-40 text-[#854d2b]" />
          <p className="text-xs font-semibold">{t('noBehaviorNotesYet')}</p>
          <p className="text-[11px] text-[#a8988b] mt-0.5">
            {language === 'ar' 
              ? 'انقر على "إضافة ملاحظة سلوكية" لتدوين أي واقعة أو ثناء للطالب مع ختم زمني خاص.'
              : 'Click "Add Behavior Note" to record private observations, praises, or conduct flags.'}
          </p>
          {!isAdding && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1 bg-[#faedd9] hover:bg-[#f5deb3] text-[#854d2b] text-[11px] font-bold px-3 py-1 rounded-lg transition cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>{t('addBehaviorNote')}</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};
