import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { Student, StudentGroup } from '../types';
import { STUDENT_GROUPS_LIST, getStudentGroupName } from '../data/studentGroups';
import { X, UserPlus, Sparkles, Camera, Check } from 'lucide-react';
import { StudentCameraModal } from './StudentCameraModal';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded?: (student: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentAdded
}) => {
  const { students, addStudent } = useClass();
  const { language, isRTL } = useLanguage();

  const nextRollNumber = students.length > 0 
    ? Math.max(...students.map(s => s.rollNumber || 0)) + 1 
    : 1;

  const [formData, setFormData] = useState({
    rollNumber: nextRollNumber,
    fullName: '',
    arabicName: '',
    className: 'Class Five',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    group: 'khaleelul_hussary' as StudentGroup,
    currentJuz: 1,
    totalMemorizedJuz: 0,
    avatarUrl: '',
    notes: ''
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const newStudentData: Omit<Student, 'id'> = {
      rollNumber: Number(formData.rollNumber) || nextRollNumber,
      fullName: formData.fullName.trim(),
      arabicName: formData.arabicName.trim() || formData.fullName.trim(),
      className: formData.className,
      parentName: formData.parentName.trim() || (language === 'ar' ? 'ولي الأمر' : 'Parent / Guardian'),
      parentPhone: formData.parentPhone.trim() || '+234 800 000 0000',
      parentEmail: formData.parentEmail.trim() || 'parent@almillah.edu',
      address: formData.address.trim(),
      avatarUrl: formData.avatarUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName.trim())}&backgroundColor=df9b52,c88642,854d2b&textColor=ffffff`,
      group: formData.group,
      currentJuz: Number(formData.currentJuz) || 1,
      totalMemorizedJuz: Number(formData.totalMemorizedJuz) || 0,
      enrollmentStatus: 'active',
      notes: formData.notes.trim()
    };

    addStudent(newStudentData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        dir={isRTL ? 'rtl' : 'ltr'}
        className="bg-[#1b110b] border border-[#df9b52]/40 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden relative my-8"
      >
        {/* Header with Gold Ribbon */}
        <div className="bg-gradient-to-r from-[#2a170d] via-[#3a2012] to-[#2a170d] px-6 py-4 border-b border-[#df9b52]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#df9b52] to-[#c88642] flex items-center justify-center text-[#18110c] shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-[#faedd9]">
                {language === 'ar' ? 'إضافة طالب جديد للمعهد' : 'Enroll New Student'}
              </h3>
              <p className="text-xs text-[#df9b52]">
                {language === 'ar' ? 'أكاديمية المِلَّة الإسلامية • الصف الخامس' : 'Al-Millah Islamic Academy • Class Roster'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#c4b3a4] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Avatar Preview & Camera button */}
          <div className="flex items-center gap-4 p-3.5 bg-[#251710] rounded-xl border border-[#482c1e]">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#df9b52] bg-[#18110c] shrink-0">
              {formData.avatarUrl ? (
                <img 
                  src={formData.avatarUrl} 
                  alt="Student preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#df9b52] font-black text-xl">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'صورة الطالب الرسمية' : 'Student Passport Photograph'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#df9b52]/20 hover:bg-[#df9b52]/30 text-[#f7cb8b] border border-[#df9b52]/40 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'التقاط بالكاميرا' : 'Take Photo'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'اسم الطالب بالإنجليزية *' : 'Full Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ibrahim Al-Hassan"
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] placeholder-[#7c695d] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.arabicName}
                onChange={e => setFormData({ ...formData, arabicName: e.target.value })}
                placeholder="مثال: إبراهيم الحسن"
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] placeholder-[#7c695d] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'رقم القيد (Roll No.)' : 'Roll Number'}
              </label>
              <input
                type="number"
                value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>

            {/* Halaqah Group */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'حلقة التحفيظ' : 'Halaqah Group'}
              </label>
              <select
                value={formData.group}
                onChange={e => setFormData({ ...formData, group: e.target.value as StudentGroup })}
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] text-xs focus:outline-none focus:border-[#df9b52]"
              >
                {STUDENT_GROUPS_LIST.map(g => (
                  <option key={g.id} value={g.id}>
                    {getStudentGroupName(g.id, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'اسم ولي الأمر' : 'Parent / Guardian Name'}
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="e.g. Alhaji Muhammad"
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'هاتف ولي الأمر' : 'Parent WhatsApp / Phone'}
              </label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+234 803 123 4567"
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>

            {/* Current Juz */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'الجزء الحالي (الحفظ)' : 'Current Juz (Memorization)'}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.currentJuz}
                onChange={e => setFormData({ ...formData, currentJuz: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>

            {/* Total Memorized Juz */}
            <div>
              <label className="block text-xs font-semibold text-[#f0ba78] mb-1">
                {language === 'ar' ? 'إجمالي الأجزاء المتقنة' : 'Total Mastered Juz'}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.totalMemorizedJuz}
                onChange={e => setFormData({ ...formData, totalMemorizedJuz: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#251710] border border-[#482c1e] text-[#f5eee8] text-xs focus:outline-none focus:border-[#df9b52]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#482c1e] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#c4b3a4] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitted}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#df9b52] via-[#f7cb8b] to-[#c88642] text-[#18110c] hover:brightness-105 active:scale-95 transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              {submitted ? (
                <>
                  <Check className="w-4 h-4 text-[#18110c]" />
                  <span>{language === 'ar' ? 'تم الحفظ بنجاح!' : 'Enrolled Successfully!'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#18110c]" />
                  <span>{language === 'ar' ? 'تسجيل الطالب رسمياً' : 'Enroll Student'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Camera Modal integration */}
        <StudentCameraModal
          isOpen={isCameraOpen}
          studentName={formData.fullName || 'New Student'}
          currentPhoto={formData.avatarUrl}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(dataUrl) => {
            setFormData({ ...formData, avatarUrl: dataUrl });
            setIsCameraOpen(false);
          }}
        />
      </div>
    </div>
  );
};
