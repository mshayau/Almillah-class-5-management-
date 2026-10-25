import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, AUTHORIZED_EMAIL, AUTHORIZED_PASSWORD } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowRight, 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Star, 
  FileText, 
  Menu, 
  X, 
  Globe,
  Award,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ACADEMY_LOGO_URL, ACADEMY_LOGO_FALLBACK } from './AcademyLogo';
import { ThemeToggle } from './ThemeToggle';

// Real Students' Photography Assets (Provided by User)
import studentPhoto1 from '../assets/images/student_slide_1.png';
import studentPhoto2 from '../assets/images/student_slide_2.png';
import studentPhoto3 from '../assets/images/student_slide_3.png';

const STUDENT_PHOTO_URL_1 = 'https://i.ibb.co/svqxmNL6/file-0000000058b081f49444406d85803507.png';
const STUDENT_PHOTO_URL_2 = 'https://i.ibb.co/d07dkhWB/file-000000007730820c9016976f3bbc80b1.png';
const STUDENT_PHOTO_URL_3 = 'https://i.ibb.co/BVs34Gz1/file-00000000903081f481a96f9150712e23.png';

interface SlideData {
  id: number;
  image: string;
  fallbackImage: string;
  fallbackBg: string;
  taglineEn: string;
  taglineAr: string;
  headlineEn: string;
  headlineAr: string;
  descriptionEn: string;
  descriptionAr: string;
  objectPosition?: string;
}

const HERO_SLIDES: SlideData[] = [
  {
    id: 1,
    image: studentPhoto1,
    fallbackImage: STUDENT_PHOTO_URL_1,
    fallbackBg: 'from-[#1c120c] via-[#2a170d] to-[#120a06]',
    taglineEn: 'Al-Millah Islamic Academy • Real Students',
    taglineAr: 'أكاديمية المِلَّة الإسلامية • طلابنا المتميزون',
    headlineEn: 'Smarter School Management. Better Learning.',
    headlineAr: 'إدارة مدرسية أذكى. تعليمٌ قرآنيٌّ أرقى.',
    descriptionEn: 'The modern academic platform empowering schools to manage student profiles, halaqah groups, daily attendance, recitation results, and official records with complete precision.',
    descriptionAr: 'منصة أكاديمية متكاملة تُمكّن إدارة المدرسة والمعلمين من متابعة بيانات الطلاب، وتوزيع الحِلقات، ورصد الحضور اليومي، وتوثيق حفظ القرآن والتقارير الرسمية.',
    objectPosition: 'object-top sm:object-[center_20%]'
  },
  {
    id: 2,
    image: studentPhoto2,
    fallbackImage: STUDENT_PHOTO_URL_2,
    fallbackBg: 'from-[#151f28] via-[#0f171e] to-[#0a0f14]',
    taglineEn: 'Academic Achievement & Student Records',
    taglineAr: 'التحصيل الأكاديمي وسجلات الطلاب',
    headlineEn: 'Accurate Results, Term Reports & Student Profiles.',
    headlineAr: 'نتائج دقيقة، وتقارير فصلية، وملفات أكاديمية شاملة.',
    descriptionEn: 'Streamline grading, merit awards, behavioral rubrics, and automated term scorecards tailored for Class Five educators and parents.',
    descriptionAr: 'إدارة رصد الدرجات، وسجلات التميز الأكاديمي، وتقييم السلوك، وإصدار بطاقات النتائج المعتمدة للطلاب وأولياء الأمور بكل سهولة.',
    objectPosition: 'object-top sm:object-[center_20%]'
  },
  {
    id: 3,
    image: studentPhoto3,
    fallbackImage: STUDENT_PHOTO_URL_3,
    fallbackBg: 'from-[#122018] via-[#0d1711] to-[#070e0a]',
    taglineEn: 'Verified Qur’anic Curriculum & Excellence',
    taglineAr: 'منهج قرآني موثق وتميز أكاديمي',
    headlineEn: '604-Page Madinah Mushaf & Attendance Tracking.',
    headlineAr: 'متابعة الحفظ بمصحف المدينة ورصد الحضور اليومي.',
    descriptionEn: 'Structured roll call, punctuality tracking, standardized behavioral rubrics, and canonical Madinah Mushaf recitation targets.',
    descriptionAr: 'رصد فوري لدوام الطلاب، وتوثيق أهداف الحفظ الأسبوعية وفق مصحف مجمع الملك فهد، وتقارير أداء شاملة متوافقة مع متطلبات المدرسة.',
    objectPosition: 'object-top sm:object-[center_20%]'
  }
];

interface HomepageViewProps {
  onEnterDashboard?: () => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({ onEnterDashboard }) => {
  const { login, quickDemoLogin, isAuthenticated, user } = useAuth();
  const { language, toggleLanguage, isRTL } = useLanguage();
  const { isDark } = useTheme();

  // Slide state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Touch Swipe State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto transition every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const swipeThreshold = 45;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe left -> next slide (or prev in RTL)
        if (isRTL) {
          handlePrevSlide();
        } else {
          handleNextSlide();
        }
      } else {
        // Swipe right -> prev slide (or next in RTL)
        if (isRTL) {
          handleNextSlide();
        } else {
          handlePrevSlide();
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const handleQuickFill = () => {
    setEmail(AUTHORIZED_EMAIL);
    setPassword(AUTHORIZED_PASSWORD);
    setErrorMessage(null);
  };

  const handleQuickSupervisorLogin = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      quickDemoLogin();
      setIsLoading(false);
      setIsSuccess(true);
      if (onEnterDashboard) {
        setTimeout(onEnterDashboard, 500);
      }
    }, 350);
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuccess || isLoading) return;

    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني المعتمد وكلمة المرور للمتابعة.'
          : 'Please enter both your institutional email and password.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (cleanEmail === AUTHORIZED_EMAIL.toLowerCase() && cleanPass === AUTHORIZED_PASSWORD) {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          login(cleanEmail, cleanPass);
          setIsLoginModalOpen(false);
          if (onEnterDashboard) {
            onEnterDashboard();
          }
        }, 700);
      } else {
        setIsLoading(false);
        setErrorMessage(
          language === 'ar'
            ? 'بيانات الدخول غير صحيحة. يرجى مراجعة البريد الإلكتروني وكلمة المرور المعتمدة.'
            : 'Invalid institutional credentials. Please verify your email and password.'
        );
      }
    }, 450);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const activeSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#0e0906] text-[#faedd9]' : 'bg-[#faf7f3] text-[#1b110b]'
      } ${language === 'ar' ? 'font-arabic' : ''}`}
    >
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Clean, Lightweight & Responsive)
          ========================================================================= */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-[#120a06]/90 border-[#3d2516]/60 text-white' 
          : 'bg-white/90 border-[#ebdcd0] text-[#1b110b]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Brand Logo & Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#df9b52] via-[#f7cb8b] to-[#854d2b] shadow-md transition-transform group-hover:scale-105">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 overflow-hidden flex items-center justify-center ${
                    isDark ? 'bg-[#1b110b]' : 'bg-white'
                  }`}>
                    <img 
                      src={ACADEMY_LOGO_URL} 
                      alt="Al-Millah Academy"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = ACADEMY_LOGO_FALLBACK;
                      }}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base sm:text-lg tracking-tight font-serif text-current">
                      {language === 'ar' ? 'أكاديمية المِلَّة' : 'AL-MILLAH ACADEMY'}
                    </span>
                    <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#df9b52]/15 text-[#df9b52] border border-[#df9b52]/30">
                      Class Five
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8c7464] dark:text-[#c4a694] leading-none">
                    {language === 'ar' ? 'نظام إدارة الصفوف والحِلقات' : 'Class Management System'}
                  </p>
                </div>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 text-xs font-semibold">
              <button 
                onClick={() => scrollToSection('hero')} 
                className="hover:text-[#df9b52] transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </button>
              <button 
                onClick={() => scrollToSection('overview')} 
                className="hover:text-[#df9b52] transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="hover:text-[#df9b52] transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'القدرات الأكاديمية' : 'Capabilities'}
              </button>
              <button 
                onClick={() => scrollToSection('pillars')} 
                className="hover:text-[#df9b52] transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'منهج الصف الخامس' : 'Class Five Scope'}
              </button>
              <button 
                onClick={() => scrollToSection('portal')} 
                className="hover:text-[#df9b52] transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'بوابة المعلمين' : 'Faculty Portal'}
              </button>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Theme Toggle */}
              <ThemeToggle 
                variant="pill" 
                showLabel={false}
                className={isDark ? 'bg-[#22150e] border-[#442817]' : 'bg-[#faf7f3] border-[#ebdcd0]'}
              />

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  isDark 
                    ? 'bg-[#22150e] hover:bg-[#331f14] border-[#442817] text-[#faedd9]' 
                    : 'bg-[#faf7f3] hover:bg-[#ede5dc] border-[#ebdcd0] text-[#1b110b]'
                }`}
                title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
              >
                <Globe className="h-3.5 w-3.5 text-[#df9b52]" />
                <span className="text-[11px] font-bold">
                  {language === 'en' ? 'العربية' : 'English'}
                </span>
              </button>

              {/* Primary CTA Button */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    if (onEnterDashboard) onEnterDashboard();
                  }}
                  className="bg-[#854d2b] hover:bg-[#a05e35] text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Award className="h-3.5 w-3.5 text-[#f0ba78]" />
                  <span>{language === 'ar' ? 'لوحة التحكم ←' : 'Go to Dashboard →'}</span>
                </button>
              ) : (
                <button
                  onClick={() => scrollToSection('portal')}
                  className="bg-[#3b2317] hover:bg-[#523120] text-[#faedd9] text-xs font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer min-h-[40px] border border-[#df9b52]/40"
                >
                  <Lock className="h-3.5 w-3.5 text-[#df9b52]" />
                  <span>{language === 'ar' ? 'تسجيل الدخول' : 'Faculty Sign In'}</span>
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-[#ebdcd0] dark:border-[#3d2516] text-[#1b110b] dark:text-white cursor-pointer hover:bg-black/5"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden border-t px-4 py-4 space-y-2 backdrop-blur-lg ${
                isDark ? 'bg-[#140c07] border-[#3d2516]' : 'bg-white border-[#ebdcd0]'
              }`}
            >
              <button 
                onClick={() => scrollToSection('hero')} 
                className="block w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs font-bold hover:bg-black/5"
              >
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </button>
              <button 
                onClick={() => scrollToSection('overview')} 
                className="block w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs font-bold hover:bg-black/5"
              >
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="block w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs font-bold hover:bg-black/5"
              >
                {language === 'ar' ? 'القدرات الأكاديمية' : 'Capabilities'}
              </button>
              <button 
                onClick={() => scrollToSection('pillars')} 
                className="block w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs font-bold hover:bg-black/5"
              >
                {language === 'ar' ? 'منهج الصف الخامس' : 'Class Five Scope'}
              </button>
              <button 
                onClick={() => scrollToSection('portal')} 
                className="block w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs font-bold text-[#df9b52] hover:bg-black/5"
              >
                {language === 'ar' ? 'بوابة المعلمين' : 'Faculty Portal'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* =========================================================================
          2. HERO SECTION WITH FULL-WIDTH IMAGE SLIDER
          ========================================================================= */}
      <section 
        id="hero"
        className="relative min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slider Background Images */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Fallback gradient behind image in case of slow network */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.fallbackBg}`} />
                
                {/* High-res Hero Image with subtle Ken Burns zoom */}
                <img
                  src={slide.image}
                  alt={slide.headlineEn}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (slide.fallbackImage && target.src !== slide.fallbackImage) {
                      target.src = slide.fallbackImage;
                    }
                  }}
                  className={`w-full h-full object-cover ${slide.objectPosition || 'object-top sm:object-[center_20%]'} transition-transform duration-[6000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Dark Translucent Scrim Overlays ensuring WCAG AA contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />
                <div className="absolute inset-0 bg-black/25" />
              </div>
            );
          })}
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center text-white">
          
          {/* Subtle Tagline / Kicker with gentle animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tagline-${activeSlide.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#f7cb8b] text-xs font-bold tracking-wider uppercase"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#df9b52]" />
              <span>{language === 'ar' ? activeSlide.taglineAr : activeSlide.taglineEn}</span>
            </motion.div>
          </AnimatePresence>

          {/* Strong, Short Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`headline-${activeSlide.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-tight sm:leading-tight max-w-4xl mx-auto text-balance drop-shadow-md"
            >
              {language === 'ar' ? activeSlide.headlineAr : activeSlide.headlineEn}
            </motion.h1>
          </AnimatePresence>

          {/* One Concise Supporting Sentence */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${activeSlide.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal"
            >
              {language === 'ar' ? activeSlide.descriptionAr : activeSlide.descriptionEn}
            </motion.p>
          </AnimatePresence>

          {/* Action CTAs: Smaller Explore button on top, left-aligned */}
          <div className="mt-6 sm:mt-7 flex flex-col items-start justify-start gap-2 sm:gap-2.5 max-w-xs mr-auto rtl:mr-0 rtl:ml-auto">
            {/* Smaller secondary button on top */}
            <button
              onClick={() => scrollToSection('features')}
              className="inline-flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-medium text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all cursor-pointer active:scale-98 min-h-[34px]"
            >
              <span>{language === 'ar' ? 'المميزات' : 'Explore'}</span>
            </button>

            {/* Primary button below */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  if (onEnterDashboard) onEnterDashboard();
                }}
                className="inline-flex items-center justify-center gap-1.5 bg-[#df9b52] hover:bg-[#c9873d] text-[#1b110b] font-bold text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-md cursor-pointer active:scale-98 min-h-[34px]"
              >
                <span>{language === 'ar' ? 'لوحة الإدارة' : 'Dashboard'}</span>
                <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={() => scrollToSection('portal')}
                className="inline-flex items-center justify-center gap-1.5 bg-[#df9b52] hover:bg-[#c9873d] text-[#1b110b] font-bold text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-md hover:shadow-[0_0_15px_rgba(223,155,82,0.4)] cursor-pointer active:scale-98 min-h-[34px]"
              >
                <Lock className="h-3 w-3" />
                <span>{language === 'ar' ? 'ابدأ الآن' : 'Get Started'}</span>
              </button>
            )}
          </div>

          {/* School Motto Banner */}
          <div className="mt-8 text-xs font-arabic text-[#f7cb8b]/90 tracking-wide text-left rtl:text-right">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
          </div>
        </div>

        {/* Subtle Slide Indicators (Dots / Progress Bars) */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-8 sm:w-10 h-2 bg-[#df9b52] shadow-md'
                    : 'w-2 sm:w-2.5 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Minimalist Prev / Next Chevrons */}
        <button
          onClick={handlePrevSlide}
          className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white items-center justify-center backdrop-blur-xs transition cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={handleNextSlide}
          className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white items-center justify-center backdrop-blur-xs transition cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* =========================================================================
          3. PLATFORM OVERVIEW (Concise & Focused)
          ========================================================================= */}
      <section id="overview" className={`py-16 sm:py-24 border-b ${
        isDark ? 'bg-[#120a06] border-[#382114]' : 'bg-[#ffffff] border-[#ede0d4]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#df9b52]">
              {language === 'ar' ? 'الرؤية المؤسسية للمنصة' : 'Institutional Excellence'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-serif mt-2 tracking-tight">
              {language === 'ar' 
                ? 'منظومة أكاديمية متكاملة لتعليم القرآن والتربية'
                : 'Built for Islamic Educational & Qur’anic Precision'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#7c695d] dark:text-[#c4a694]">
              {language === 'ar'
                ? 'صُممت منصة المِلَّة لتجمع بين أصالة الحفظ والتلاوة وحداثة الإدارة والتقارير التنفيذية.'
                : 'Al-Millah unites authentic Qur’anic memorization tracking with modern attendance, behavioral rubrics, and automated reporting.'}
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Pillar 1 */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-[#180f0a] border-[#3d2516] hover:border-[#df9b52]/50' 
                : 'bg-[#fcfaf7] border-[#e8ded5] hover:border-[#df9b52]/60'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-[#df9b52]/15 text-[#df9b52] flex items-center justify-center mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2">
                {language === 'ar' ? '١. إدارة الطلاب والحِلقات' : '1. Student Rosters & Halaqahs'}
              </h3>
              <p className="text-xs sm:text-sm text-[#7c695d] dark:text-[#bda99a] leading-relaxed">
                {language === 'ar'
                  ? 'ملفات شاملة لـ ٢٥ طالباً مع صور شخصية، وتوزيع منظم في ٣ حِلقات نموذجية (الحصري، المنشاوي، عبد الباسط) وبيانات أولياء الأمور.'
                  : 'Complete dossiers for all 25 students, assigned to 3 structured halaqah cohorts (Al-Hussary, Al-Minshawy, Abdulbasit) with parent WhatsApp links.'}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-[#180f0a] border-[#3d2516] hover:border-[#df9b52]/50' 
                : 'bg-[#fcfaf7] border-[#e8ded5] hover:border-[#df9b52]/60'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-5">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2">
                {language === 'ar' ? '٢. متابعة القرآن بمصحف المدينة' : '2. 604-Page Madinah Mushaf'}
              </h3>
              <p className="text-xs sm:text-sm text-[#7c695d] dark:text-[#bda99a] leading-relaxed">
                {language === 'ar'
                  ? 'قاعدة بيانات موثقة تضم ١١٤ سورة و ٦,٢٣٦ آية و ٦٠٤ صفحات مع أهداف أسبوعية مخصصة وسجل مراجعة وتدقيق معتمد.'
                  : 'Canonical database spanning 114 Surahs, 6,236 ayahs, and 604 pages, verifying weekly targets and halaqah recitation logs.'}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-[#180f0a] border-[#3d2516] hover:border-[#df9b52]/50' 
                : 'bg-[#fcfaf7] border-[#e8ded5] hover:border-[#df9b52]/60'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-5">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2">
                {language === 'ar' ? '٣. تقارير Word وجداول الحضور' : '3. Attendance & Word Reports'}
              </h3>
              <p className="text-xs sm:text-sm text-[#7c695d] dark:text-[#bda99a] leading-relaxed">
                {language === 'ar'
                  ? 'رصد أسبوعي ۵ أيام (السبت - الأربعاء) مع تصدير جداول مايكروسوفت وورد الأسبوعية وملاحظات المعلم ومشاركة أولياء الأمور.'
                  : 'Automated 5-day school week roll call coupled with formal dual-table MS Word (.docx) report card exports and direct parent communication.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. KEY PLATFORM CAPABILITIES (Asymmetric Clean Bento Grid)
          ========================================================================= */}
      <section id="features" className={`py-16 sm:py-24 border-b ${
        isDark ? 'bg-[#0e0906] border-[#382114]' : 'bg-[#faf7f3] border-[#ede0d4]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#df9b52]">
                {language === 'ar' ? 'الوظائف الأساسية' : 'Core Capabilities'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-serif mt-1 tracking-tight">
                {language === 'ar' ? 'أدوات دقيقة للمعلم وإدارة الفصل' : 'Engineered for Classroom Accuracy'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7c695d] dark:text-[#c4a694] max-w-md">
              {language === 'ar'
                ? 'صُممت واجهات النظام لتكون سريعة وسهلة الاستخدام عبر الهواتف الذكية والأجهزة اللوحية داخل الحِلقات.'
                : 'Purpose-built for fast daily interaction during halaqah sessions on mobile and desktop without friction.'}
            </p>
          </div>

          {/* 4 Clean Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1: Attendance */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark ? 'bg-[#180f0a] border-[#3d2516]' : 'bg-white border-[#ebdcd0]'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {language === 'ar' ? 'سجل الحضور الأسبوعي (۵ أيام دوام)' : '5-Day School Attendance Ledger'}
                  </h3>
                  <span className="text-[11px] text-[#8c7464]">Saturday to Wednesday School Cycle</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#635043] dark:text-[#bda99a] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'رصد يومي بنقرة واحدة (حاضر، متأخر، غائب، معذور) مع حساب فوري لنسبة الحضور التراكمية لكل طالب واكتمال الدوام.'
                  : 'Fast one-tap roll call (Present, Late, Absent, Excused) with automatic rate calculations and monthly calendar review.'}
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#854d2b] dark:text-[#df9b52]">Class Rate: 96.0% Average</span>
                <span className="text-[#8c7464]">Saturday–Wednesday</span>
              </div>
            </div>

            {/* Feature 2: Quran Tracker */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark ? 'bg-[#180f0a] border-[#3d2516]' : 'bg-white border-[#ebdcd0]'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {language === 'ar' ? 'سجل الحفظ ومصحف المدينة النبوية' : 'Madinah Mushaf Recitation Ledger'}
                  </h3>
                  <span className="text-[11px] text-[#8c7464]">Canonical 604 Pages & 114 Surahs</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#635043] dark:text-[#bda99a] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'ربط مباشر بأهداف الحفظ الأسبوعية مع كشف تلقائي للنطاقات عبر الصفحات والسور وتقييم أحكام التجويد (ممتاز، جيد جداً).'
                  : 'Live target verification, auto-resolving ayah spans to page numbers, tracking mistakes, and recording tajweed grades.'}
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">114 Surahs Verified</span>
                <span className="text-[#8c7464]">Page-accurate mapping</span>
              </div>
            </div>

            {/* Feature 3: Daily Evaluation */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark ? 'bg-[#180f0a] border-[#3d2516]' : 'bg-white border-[#ebdcd0]'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {language === 'ar' ? 'معايير السلوك والأنشطة اليومية' : 'Daily Adab & Activities Evaluation'}
                  </h3>
                  <span className="text-[11px] text-[#8c7464]">6 Standardized Rubric Categories</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#635043] dark:text-[#bda99a] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'تقييم شامل يغطي الأدب وتوقير المجلس، والانتباه والتركيز، والنظافة والترتيب، وجودة الأداء، والتبكير، وحسن الخلق.'
                  : 'Holistic grading covering Adab, Attentiveness, Neatness, Performance, Punctuality, and Demeanor with score logs.'}
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400">10-Point Scale</span>
                <span className="text-[#8c7464]">Holistic Character Tracking</span>
              </div>
            </div>

            {/* Feature 4: MS Word & WhatsApp */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
              isDark ? 'bg-[#180f0a] border-[#3d2516]' : 'bg-white border-[#ebdcd0]'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {language === 'ar' ? 'تقارير Word (.docx) ومشاركة WhatsApp' : 'MS Word (.docx) Reports & WhatsApp'}
                  </h3>
                  <span className="text-[11px] text-[#8c7464]">Structured Tabular Exports</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#635043] dark:text-[#bda99a] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'إنشاء ملفات وورد رسمية متوافقة مع متطلبات الإدارة تتضمن كشوف الحفظ اليومية وجدول الأنشطة، مع إرسال فوري لأولياء الأمور.'
                  : 'One-click generation of formatted Word documents containing memorization tables, daily activity rubrics, and editable remarks.'}
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-600 dark:text-purple-400">Strict Dual Tables</span>
                <span className="text-[#8c7464]">No Unstated Clutter</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. CLASS FIVE SECTION & HALAQAH SUMMARY
          ========================================================================= */}
      <section id="pillars" className={`py-16 sm:py-20 border-b ${
        isDark ? 'bg-[#120a06] border-[#382114]' : 'bg-[#ffffff] border-[#ede0d4]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-r from-[#1c120c] via-[#2a170d] to-[#1a0f08] text-white rounded-3xl p-8 sm:p-12 border border-[#df9b52]/40 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#df9b52]">
                {language === 'ar' ? 'فصل الصف الخامس (بنين)' : 'Class Five (Boys Section)'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-serif mt-2 tracking-tight">
                {language === 'ar' ? '٢٥ طالباً موزعون في ٣ حِلقات قرآنية نموذجية' : '25 Students in 3 Premier Qur’anic Halaqahs'}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#faedd9]/90 leading-relaxed">
                {language === 'ar'
                  ? 'بإشراف الشيخ أ. محمد شايعو، يتبع طلاب الصف الخامس خطة دراسية تشمل الأجزاء ٢٨ و ٢٩ و ٣٠ مع مراجعة تراكمية منتظمة.'
                  : 'Supervised by Ustadh Muhammad Shaya’u, students focus on Juz 28, 29, and 30 with structured weekly assignments and revision.'}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <span className="text-xs text-[#f0ba78] font-bold block">Halaqah 1</span>
                  <h4 className="font-bold text-sm text-white mt-0.5">Khaleelul Hussary</h4>
                  <span className="text-[11px] text-white/70">8 Students • Advanced</span>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <span className="text-xs text-[#f0ba78] font-bold block">Halaqah 2</span>
                  <h4 className="font-bold text-sm text-white mt-0.5">Seddeq Minshawy</h4>
                  <span className="text-[11px] text-white/70">9 Students • Intermediate</span>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <span className="text-xs text-[#f0ba78] font-bold block">Halaqah 3</span>
                  <h4 className="font-bold text-sm text-white mt-0.5">Abdulbasit</h4>
                  <span className="text-[11px] text-white/70">8 Students • Foundations</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. CLEAR NEXT STEP: FACULTY PORTAL GATEWAY
          ========================================================================= */}
      <section id="portal" className={`py-16 sm:py-24 ${
        isDark ? 'bg-[#0e0906]' : 'bg-[#faf7f3]'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#df9b52]">
              {language === 'ar' ? 'بوابة المعلم والإدارة' : 'Faculty Access Portal'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-serif mt-2 tracking-tight">
              {language === 'ar' ? 'تسجيل الدخول إلى نظام الإدارة' : 'Sign In to Al-Millah Management'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#7c695d] dark:text-[#c4a694]">
              {language === 'ar'
                ? 'الوصول محصور على الكادر التعليمي والإشرافي المعتمد لأكاديمية المِلَّة.'
                : 'Authorized supervisor and teacher credentials required to access Class Five records.'}
            </p>
          </div>

          {/* Form Card */}
          <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
            isDark 
              ? 'bg-[#180f0a] border-[#3d2516]' 
              : 'bg-white border-[#ebdcd0]'
          }`}>
            
            {/* Quick Demo Supervisor Access Bar */}
            <div className={`p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border ${
              isDark 
                ? 'bg-[#24150e] border-[#df9b52]/30 text-[#faedd9]' 
                : 'bg-[#faf4ec] border-[#df9b52]/40 text-[#1b110b]'
            }`}>
              <div className="flex items-center gap-3 text-center sm:text-left rtl:sm:text-right">
                <div className="p-2 rounded-xl bg-[#df9b52]/20 text-[#df9b52] shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {language === 'ar' ? 'دخول سريع للمشرف المعتمد (Ustadh Mohd Shayau)' : 'One-Click Supervisor Access (Ustadh Mohd Shayau)'}
                  </h4>
                  <span className="text-[11px] text-[#8c7464] dark:text-[#c4a694]">
                    {AUTHORIZED_EMAIL}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="flex-1 sm:flex-initial text-xs font-bold px-3 py-2 rounded-lg border border-[#df9b52]/50 hover:bg-[#df9b52]/10 transition cursor-pointer min-h-[40px]"
                >
                  {language === 'ar' ? 'تعبئة الحقول' : 'Fill Form'}
                </button>
                <button
                  type="button"
                  onClick={handleQuickSupervisorLogin}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial bg-[#df9b52] hover:bg-[#c9873d] text-[#1b110b] text-xs font-black px-4 py-2 rounded-lg transition shadow-sm cursor-pointer min-h-[40px]"
                >
                  {language === 'ar' ? 'دخول فوري ←' : 'Instant Login →'}
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-red-800 dark:text-red-200 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{language === 'ar' ? 'تم تسجيل الدخول بنجاح! جاري تحويلك إلى لوحة الإدارة...' : 'Authenticated successfully! Redirecting to dashboard...'}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#635043] dark:text-[#c4a694]">
                  {language === 'ar' ? 'البريد الإلكتروني المعتمد للمعلّم' : 'Institutional Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c7464]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={AUTHORIZED_EMAIL}
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 rounded-xl border border-[#ebdcd0] dark:border-[#3d2516] bg-white dark:bg-[#120a06] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#df9b52]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#635043] dark:text-[#c4a694]">
                  {language === 'ar' ? 'كلمة المرور المعتمدة' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c7464]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-10 py-2.5 rounded-xl border border-[#ebdcd0] dark:border-[#3d2516] bg-white dark:bg-[#120a06] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#df9b52]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-[#8c7464] hover:text-current cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full bg-[#3b2317] hover:bg-[#523120] text-[#faedd9] font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  <Lock className="h-4 w-4 text-[#df9b52]" />
                  <span>
                    {isLoading 
                      ? (language === 'ar' ? 'جاري التحقق...' : 'Authenticating...')
                      : (language === 'ar' ? 'تسجيل الدخول إلى البوابة الأكاديمية' : 'Sign In to Faculty Portal')}
                  </span>
                </button>
              </div>
            </form>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. FOOTER (Clean & Quiet)
          ========================================================================= */}
      <footer className={`py-12 border-t text-xs ${
        isDark ? 'bg-[#120a06] border-[#382114] text-[#8c7464]' : 'bg-[#ffffff] border-[#ede0d4] text-[#7c695d]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <img 
                src={ACADEMY_LOGO_URL} 
                alt="Al-Millah Logo" 
                crossOrigin="anonymous"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = ACADEMY_LOGO_FALLBACK;
                }}
              />
              <div>
                <p className="font-bold text-current">
                  {language === 'ar' ? 'أكاديمية المِلَّة الإسلامية' : 'Al-Millah Islamic Academy'}
                </p>
                <p className="text-[11px] text-[#8c7464]">
                  {language === 'ar' ? 'الصف الخامس (بنين) • العام الدراسي ٢٠٢٦ / ٢٠٢٧' : 'Class Five (Boys) • Academic Session 2026/2027'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold">
              <button onClick={() => scrollToSection('hero')} className="hover:text-[#df9b52] cursor-pointer">
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </button>
              <button onClick={() => scrollToSection('overview')} className="hover:text-[#df9b52] cursor-pointer">
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </button>
              <button onClick={() => scrollToSection('features')} className="hover:text-[#df9b52] cursor-pointer">
                {language === 'ar' ? 'المميزات' : 'Features'}
              </button>
              <button onClick={() => scrollToSection('portal')} className="hover:text-[#df9b52] cursor-pointer">
                {language === 'ar' ? 'بوابة المعلمين' : 'Faculty Access'}
              </button>
            </div>

            <p className="text-[11px] text-center md:text-right rtl:md:text-left">
              © {new Date().getFullYear()} Al-Millah Islamic Academy. All rights reserved.
            </p>

          </div>
        </div>
      </footer>

    </div>
  );
};
