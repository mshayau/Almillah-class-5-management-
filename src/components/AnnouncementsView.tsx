import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { useLanguage } from '../context/LanguageContext';
import { AnnouncementCategory, Announcement } from '../types';
import { 
  Megaphone, 
  Plus, 
  Pin, 
  Trash2, 
  MessageCircle, 
  Copy, 
  Check, 
  Calendar,
  X
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, togglePinAnnouncement } = useClass();
  const { language, isRTL, t } = useLanguage();

  const [categoryFilter, setCategoryFilter] = useState<AnnouncementCategory | 'all'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Announcement Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const [pinned, setPinned] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    addAnnouncement({
      title,
      content,
      category,
      targetClass: language === 'ar' ? 'الصف الخامس (بنين)' : 'Class Five (Boys)',
      pinned,
      author: language === 'ar' ? 'أستاذ محمد شايعو (معلم الفصل)' : "Ustadh Muhammad Shaya'u (Class Teacher)"
    });

    setTitle('');
    setContent('');
    setCategory('general');
    setPinned(false);
    setIsNewModalOpen(false);
  };

  // Helper to format announcement for WhatsApp message
  const getWhatsAppMessage = (ann: Announcement) => {
    if (language === 'ar') {
      return (
        `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n` +
        `السلام عليكم ورحمة الله وبركاته،\n` +
        `السادة أولياء أمور طلاب الصف الخامس الكرام،\n\n` +
        `📢 *${ann.title}*\n\n` +
        `${ann.content}\n\n` +
        `📅 التاريخ: ${ann.createdAt}\n` +
        `🏫 *أكاديمية المِلّة الإسلامية — الصف الخامس*\n` +
        `أستاذ محمد شايعو (معلم الفصل)`
      );
    }
    return (
      `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n` +
      `Assalamu Alaikum wa Rahmatullahi wa Barakatuh,\n` +
      `Dear Class Five Parents & Guardians,\n\n` +
      `📢 *${ann.title.toUpperCase()}*\n\n` +
      `${ann.content}\n\n` +
      `📅 Date: ${ann.createdAt}\n` +
      `🏫 *Al-Millah Islamic Academy — Class Five*\n` +
      `Ustadh Muhammad Shaya'u (Class Teacher)`
    );
  };

  const handleCopyText = (ann: Announcement) => {
    const text = getWhatsAppMessage(ann);
    navigator.clipboard.writeText(text);
    setCopiedId(ann.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredAnnouncements = announcements.filter(a => {
    return categoryFilter === 'all' || a.category === categoryFilter;
  });

  const categoriesList = [
    { id: 'all', labelEn: 'All Notices', labelAr: 'جميع الإعلانات' },
    { id: 'urgent', labelEn: 'Urgent Notices', labelAr: 'تنبيهات عاجلة' },
    { id: 'exam', labelEn: 'Exams & Oral Tests', labelAr: 'الاختبارات الشفوية' },
    { id: 'quran_event', labelEn: 'Qur’an Events', labelAr: 'مناشط وحلقات القرآن' },
    { id: 'holiday', labelEn: 'Holidays', labelAr: 'الإجازات والعطل' },
    { id: 'general', labelEn: 'General Info', labelAr: 'معلومات عامة' },
  ];

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#1b110b] text-base flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-[#854d2b]" />
            <span>{language === 'ar' ? 'لوحة إعلانات وتعاميم أولياء الأمور' : 'Parent Announcements Board'}</span>
          </h3>
          <p className="text-xs text-[#7c695d] mt-0.5">
            {language === 'ar'
              ? 'إرسال تعاميم الفصل، مواعيد الاختبارات، وملاحظات الأنشطة مباشرة إلى أولياء أمور الصف الخامس عبر واتساب'
              : 'Broadcast class announcements, exams, and event notices directly to Class Five parents via WhatsApp'}
          </p>
        </div>

        <button
          id="announcement-create-btn"
          onClick={() => setIsNewModalOpen(true)}
          className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#df9b52]" />
          <span>{language === 'ar' ? 'نشر إعلان جديد' : 'Post New Announcement'}</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-[#e5dad0] shadow-2xs">
        {categoriesList.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-[#3b2317] text-[#faedd9] shadow-2xs'
                : 'text-[#635043] hover:bg-[#faf7f3] hover:text-[#1b110b]'
            }`}
          >
            {language === 'ar' ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(ann => {
          const isCopied = copiedId === ann.id;
          const waEncoded = encodeURIComponent(getWhatsAppMessage(ann));

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-xl border bg-white shadow-2xs transition hover:shadow-xs space-y-3 ${
                ann.pinned ? 'border-[#c88642] bg-[#fefaf5]' : 'border-[#e5dad0]'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    ann.category === 'urgent'
                      ? 'bg-[#fee2e2] text-[#b91c1c]'
                      : ann.category === 'exam'
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : ann.category === 'quran_event'
                      ? 'bg-[#faedd9] text-[#854d2b]'
                      : 'bg-[#ede5dc] text-[#635043]'
                  }`}>
                    {ann.category.replace('_', ' ')}
                  </span>
                  
                  {ann.pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#854d2b] bg-[#faedd9] px-2 py-0.5 rounded">
                      <Pin className="h-3 w-3 fill-[#c88642] text-[#c88642]" />
                      {language === 'ar' ? 'مثبّت' : 'Pinned'}
                    </span>
                  )}

                  <span className="text-[11px] text-[#8c7464] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {ann.createdAt}
                  </span>
                </div>

                {/* Actions: Pin / Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePinAnnouncement(ann.id)}
                    title={ann.pinned ? (language === 'ar' ? 'إلغاء التثبيت' : 'Unpin') : (language === 'ar' ? 'تثبيت بالأعلى' : 'Pin to Top')}
                    className={`p-1.5 rounded-md transition cursor-pointer ${
                      ann.pinned ? 'text-[#854d2b] bg-[#faedd9]' : 'text-[#8c7464] hover:text-[#1b110b] hover:bg-[#faf7f3]'
                    }`}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    title={language === 'ar' ? 'حذف الإعلان' : 'Delete notice'}
                    className="p-1.5 text-[#8c7464] hover:text-[#b91c1c] hover:bg-[#faf7f3] rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h4 className="font-bold text-sm text-[#1b110b]">{ann.title}</h4>
                <p className="text-xs text-[#635043] mt-1.5 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {/* Author & WhatsApp Integration Bar */}
              <div className="pt-3 border-t border-[#f0e6dc] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-[#8c7464]">
                  {language === 'ar' ? 'المرسل:' : 'From:'} <span className="font-bold text-[#1b110b]">{ann.author}</span> • {ann.targetClass}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(ann)}
                    className="bg-[#faf7f3] hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0] text-[11px] font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="h-3 w-3 text-[#2d6639]" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الرسالة' : 'Copy Message')}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${waEncoded}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#2d6639] hover:bg-[#23532e] text-white text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#a7f3d0]" />
                    <span>{language === 'ar' ? 'إرسال عبر واتساب' : 'Share to WhatsApp'}</span>
                  </a>
                </div>
              </div>

            </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-[#e5dad0] text-xs text-[#8c7464]">
            {language === 'ar' ? 'لا توجد إعلانات مطابقة للتصفية المختارة.' : 'No announcements found in this category.'}
          </div>
        )}
      </div>

      {/* New Announcement Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1b110b]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#e5dad0] shadow-xl overflow-hidden">
            <form onSubmit={handleCreate}>
              
              <div className="bg-[#24140c] text-[#faedd9] p-5 flex items-center justify-between border-b border-[#3b2317]">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-[#df9b52]" />
                  <span>{language === 'ar' ? 'نشر إشعار لأولياء أمور الصف الخامس' : 'Publish Notice for Class Five Parents'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-[#d6c4b6] hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#635043] block mb-1">
                    {language === 'ar' ? 'عنوان التعميم / الإشعار*' : 'Notice Headline / Title*'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'مثال: جدول اختبار التسميع الشفوي للفصل' : 'e.g., Oral Qur’an Evaluation Schedule'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] text-xs font-semibold bg-[#faf7f3] text-[#1b110b]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#635043] block mb-1">{language === 'ar' ? 'الفئة' : 'Category'}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                      className="w-full p-2 border border-[#e5dad0] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#854d2b] bg-[#faf7f3] text-[#1b110b]"
                    >
                      <option value="general">{language === 'ar' ? 'إعلان عام' : 'General Notice'}</option>
                      <option value="urgent">{language === 'ar' ? 'تنبيه عاجل' : 'Urgent Reminder'}</option>
                      <option value="exam">{language === 'ar' ? 'اختبار شفوي / تحريري' : 'Oral Test / Exam'}</option>
                      <option value="quran_event">{language === 'ar' ? 'مناشط قرآنية' : 'Qur’an Recitation Event'}</option>
                      <option value="holiday">{language === 'ar' ? 'إجازة رسمية' : 'Holiday Notice'}</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[#635043]">
                      <input
                        type="checkbox"
                        checked={pinned}
                        onChange={(e) => setPinned(e.target.checked)}
                        className="rounded text-[#854d2b] focus:ring-[#854d2b] h-4 w-4"
                      />
                      <span>{language === 'ar' ? 'تثبيت بأعلى اللوحة' : 'Pin to Top of Board'}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#635043] block mb-1">
                    {language === 'ar' ? 'نص التعميم والتفاصيل*' : 'Message Content*'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={language === 'ar' ? 'اكتب التفاصيل الكاملة، الأوقات، والتعليمات لأولياء الأمور...' : 'Enter full details with timings, reminders, instructions...'}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2.5 border border-[#e5dad0] rounded-lg focus:ring-1 focus:ring-[#854d2b] text-xs leading-relaxed bg-[#faf7f3] text-[#1b110b]"
                  />
                </div>
              </div>

              <div className="bg-[#faf7f3] px-6 py-3 border-t border-[#e5dad0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-[#ede5dc] hover:bg-[#e0d6cb] text-[#635043] text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
                >
                  {language === 'ar' ? 'نشر الإشعار' : 'Publish Notice'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
