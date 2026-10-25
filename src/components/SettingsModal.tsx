import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { ThemeToggle } from './ThemeToggle';
import { 
  X, 
  Settings as SettingsIcon, 
  Globe, 
  Moon, 
  Sun, 
  ShieldCheck, 
  RotateCcw, 
  LogOut, 
  BookOpen, 
  Layers, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { AcademyLogo } from './AcademyLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  onSelectClass: (className: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  onSelectClass
}) => {
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const { resetAllData, students } = useClass();

  if (!isOpen) return null;

  const classOptions = [
    { id: 'Class Five (Boys)', labelEn: 'Class Five (Boys) — Primary Halaqah', labelAr: 'الصف الخامس (بنين) — الحلقة الأساسية' },
    { id: 'Class 7A', labelEn: 'Class 7A — Advanced Memorization', labelAr: 'الصف السابع (أ) — التحفيظ المتقدم' },
    { id: 'Class 6B', labelEn: 'Class 6B — Intermediate Halaqah', labelAr: 'الصف السادس (ب) — الحلقة المتوسطة' },
    { id: 'Class 5B', labelEn: 'Class 5B — Tajweed & Tilawah', labelAr: 'الصف الخامس (ب) — التجويد والتلاوة' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        dir={isRTL ? 'rtl' : 'ltr'}
        className="bg-[#18110c] border border-[#df9b52]/40 rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden relative my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2a170d] via-[#3a2012] to-[#2a170d] px-6 py-4 border-b border-[#df9b52]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#df9b52] to-[#c88642] flex items-center justify-center text-[#18110c] shadow-md">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-[#faedd9]">
                {language === 'ar' ? 'إعدادات النظام والبوابة' : 'System & Portal Settings'}
              </h3>
              <p className="text-xs text-[#df9b52]">
                AL-MILLAH ACADEMY • Class Management System
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

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Active Supervisor Profile Box */}
          <div className="p-4 rounded-xl bg-[#23150d] border border-[#482c1e] flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#df9b52] to-[#c88642] shrink-0">
              <AcademyLogo size="md" variant="circle" showBorder={false} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#faedd9]">
                {language === 'ar' ? user?.arabicName || 'الأستاذ محمد شايعو' : user?.name || 'Ustadh Muhammad Shaya\'u'}
              </h4>
              <p className="text-xs text-[#df9b52] truncate">
                {user?.title || 'Class Five Supervisor & Qur’an Teacher'}
              </p>
              <p className="text-[11px] text-[#a89282] truncate">
                {user?.email || 'mohdshayau46@gmail.com'}
              </p>
            </div>
          </div>

          {/* Active Class Selector */}
          <div>
            <label className="block text-xs font-bold text-[#f0ba78] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#df9b52]" />
              <span>{language === 'ar' ? 'اختيار الفصل / الحلقة النشطة' : 'Active Class / Cohort Selector'}</span>
            </label>
            <div className="space-y-1.5">
              {classOptions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectClass(c.id)}
                  className={`w-full p-3 rounded-xl text-left rtl:text-right text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                    selectedClass === c.id
                      ? 'bg-[#3b2317] border-[#df9b52] text-[#faedd9] shadow-sm'
                      : 'bg-[#23150d] border-[#382317] text-[#c4b3a4] hover:bg-[#2c1b11] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className={`w-4 h-4 ${selectedClass === c.id ? 'text-[#df9b52]' : 'text-[#7c695d]'}`} />
                    <span>{language === 'ar' ? c.labelAr : c.labelEn}</span>
                  </div>
                  {selectedClass === c.id && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#df9b52] text-[#18110c]">
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Appearance & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Language Switch */}
            <div className="p-3.5 rounded-xl bg-[#23150d] border border-[#382317] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#f0ba78] block mb-1">
                  {language === 'ar' ? 'لغة النظام' : 'System Language'}
                </span>
                <p className="text-[11px] text-[#a89282]">
                  {language === 'ar' ? 'التبديل بين العربية والإنجليزية' : 'Arabic / English UI'}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#382317] hover:bg-[#4a2e1e] text-[#faedd9] text-xs font-bold border border-[#df9b52]/40 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#df9b52]" />
                <span>{language === 'en' ? 'العربية (Arabic)' : 'English (الإنجليزية)'}</span>
              </button>
            </div>

            {/* Dark Mode Theme */}
            <div className="p-3.5 rounded-xl bg-[#23150d] border border-[#382317] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#f0ba78] block mb-1">
                  {language === 'ar' ? 'المظهر والسمة' : 'Theme Mode'}
                </span>
                <p className="text-[11px] text-[#a89282]">
                  {language === 'ar' ? 'السمة الفاخرة للقهوة والذهب' : 'Luxury Coffee & Gold Theme'}
                </p>
              </div>
              <div className="mt-3">
                <ThemeToggle variant="pill" showLabel={true} className="w-full justify-center" />
              </div>
            </div>
          </div>

          {/* Reset System Data */}
          <div className="pt-3 border-t border-[#382317] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('resetConfirm'))) {
                  resetAllData();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#d67b7b] hover:text-[#f87171] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إعادة تعيين بيانات العرض' : 'Reset Demo Sample Data'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
