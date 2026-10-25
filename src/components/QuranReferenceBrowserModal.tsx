import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  BookOpen, 
  Search, 
  FileText, 
  Layers, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  ArrowRightLeft,
  Calculator
} from 'lucide-react';
import { 
  QURAN_DATASET_METADATA, 
  VERIFIED_SURAHS, 
  getPageDetails,
  getAyahsOnPage,
  validateAndCalculateQuranRange,
  getSurahByNumber,
  VerifiedSurah
} from '../data/quranReferenceData';

interface QuranReferenceBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurahRange?: (startSurah: number, startAyah: number, endSurah: number, endAyah: number) => void;
}

export const QuranReferenceBrowserModal: React.FC<QuranReferenceBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectSurahRange
}) => {
  const { language, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'surahs' | 'pages' | 'calculator' | 'attribution'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Page browser state
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);

  // Range calculator state
  const [calcStartSurah, setCalcStartSurah] = useState<number>(2);
  const [calcStartAyah, setCalcStartAyah] = useState<number>(1);
  const [calcEndSurah, setCalcEndSurah] = useState<number>(2);
  const [calcEndAyah, setCalcEndAyah] = useState<number>(25);

  const rangeCalculation = useMemo(() => {
    return validateAndCalculateQuranRange(calcStartSurah, calcStartAyah, calcEndSurah, calcEndAyah);
  }, [calcStartSurah, calcStartAyah, calcEndSurah, calcEndAyah]);

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return VERIFIED_SURAHS;
    return VERIFIED_SURAHS.filter(s => 
      s.number.toString() === q ||
      s.name.toLowerCase().includes(q) ||
      s.arabicName.includes(q)
    );
  }, [searchQuery]);

  // Page details for selected page
  const pageDetails = useMemo(() => {
    return getPageDetails(selectedPageNum);
  }, [selectedPageNum]);

  const pageAyahSegments = useMemo(() => {
    return getAyahsOnPage(selectedPageNum);
  }, [selectedPageNum]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1b110b]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        dir={isRTL ? 'rtl' : 'ltr'}
        className="bg-white rounded-2xl max-w-3xl w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1c120c] via-[#2a170d] to-[#1c120c] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#3b2317] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#df9b52]/20 border border-[#df9b52]/40 flex items-center justify-center text-[#df9b52] shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#faedd9] font-serif">
                  {language === 'ar' ? 'قاعدة بيانات القرآن الكريم المعتمدة (مصحف المدينة ٦٠٤ صفحات)' : 'Verified Qur’an Reference Database (Madinah 604 Pages)'}
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                  v{QURAN_DATASET_METADATA.version} Verified
                </span>
              </div>
              <p className="text-[11px] text-[#c4b3a4] mt-0.5">
                {language === 'ar'
                  ? '١١٤ سورة • ٦,٢٣٦ آية • ٦٠٤ صفحات • ٣٠ جزءاً • مصحف مجمع الملك فهد'
                  : '114 Surahs • 6,236 Ayahs • 604 Pages • 30 Juz • King Fahd Complex Standard'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#d6c4b6] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="bg-[#faf7f3] border-b border-[#e5dad0] px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          {[
            { id: 'surahs', labelEn: '114 Surahs Directory', labelAr: 'فهرس السور (١١٤)', icon: BookOpen },
            { id: 'pages', labelEn: '604 Pages Explorer', labelAr: 'مستكشف الصفحات (٦٠٤)', icon: FileText },
            { id: 'calculator', labelEn: 'Ayah & Range Calculator', labelAr: 'حاسبة الآيات والصفحات', icon: Calculator },
            { id: 'attribution', labelEn: 'Dataset & Attribution', labelAr: 'المصدر والترخيص', icon: Info }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#3b2317] text-[#faedd9] shadow-xs'
                    : 'bg-white hover:bg-[#ede5dc] text-[#635043] border border-[#e5dad0]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#df9b52]' : 'text-[#8c7464]'}`} />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Surahs Directory */}
        {activeTab === 'surahs' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 h-4 w-4 text-[#8c7464]" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث برقم السورة، اسمها بالإنجليزية أو بالعربية...' : 'Search by Surah number, English name, or Arabic name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs bg-[#faf7f3] border border-[#e5dad0] rounded-xl focus:ring-1 focus:ring-[#854d2b] focus:outline-none"
              />
            </div>

            <div className="text-[11px] text-[#7c695d] flex items-center justify-between">
              <span>{language === 'ar' ? `عرض ${filteredSurahs.length} من أصل ١١٤ سورة` : `Showing ${filteredSurahs.length} of 114 Surahs`}</span>
              <span className="text-[#854d2b] font-semibold">{language === 'ar' ? 'البيانات للقراءة فقط وغير قابلة للتعديل' : 'Data is read-only and immutable'}</span>
            </div>

            {/* Surahs Table */}
            <div className="border border-[#e5dad0] rounded-xl overflow-hidden shadow-2xs">
              <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#f5ede4] text-[#635043] border-b border-[#e5dad0] z-10 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">{language === 'ar' ? 'السورة' : 'Surah Name'}</th>
                      <th className="py-2.5 px-3">{language === 'ar' ? 'عدد الآيات' : 'Ayahs'}</th>
                      <th className="py-2.5 px-3">{language === 'ar' ? 'الجزء' : 'Juz'}</th>
                      <th className="py-2.5 px-3">{language === 'ar' ? 'الصفحات (المصحف)' : 'Pages'}</th>
                      <th className="py-2.5 px-3">{language === 'ar' ? 'النزول' : 'Type'}</th>
                      {onSelectSurahRange && <th className="py-2.5 px-3 text-right rtl:text-left">{language === 'ar' ? 'اختيار' : 'Select'}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e6dc]">
                    {filteredSurahs.map(s => (
                      <tr key={s.number} className="hover:bg-[#faf7f3] transition">
                        <td className="py-2.5 px-3 font-bold text-[#854d2b]">{s.number}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#1b110b]">{s.name}</span>{' '}
                          <span className="font-serif text-[#854d2b] font-bold">({s.arabicName})</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1b110b]">{s.ayahCount}</td>
                        <td className="py-2.5 px-3 text-[#635043]">{s.juzNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#7c695d]">
                          {s.startPage === s.endPage ? `p. ${s.startPage}` : `pp. ${s.startPage}–${s.endPage}`}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            s.revelationType === 'Meccan' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {s.revelationType}
                          </span>
                        </td>
                        {onSelectSurahRange && (
                          <td className="py-2.5 px-3 text-right rtl:text-left">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectSurahRange(s.number, 1, s.number, s.ayahCount);
                                onClose();
                              }}
                              className="text-[10px] bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              {language === 'ar' ? 'استخدام' : 'Use'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 604 Pages Explorer */}
        {activeTab === 'pages' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="bg-[#faf7f3] p-3.5 rounded-xl border border-[#e5dad0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#635043]">
                  {language === 'ar' ? 'رقم الصفحة في مصحف المدينة (١ - ٦٠٤):' : 'Select Madinah Mushaf Page (1 – 604):'}
                </span>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={selectedPageNum}
                  onChange={(e) => setSelectedPageNum(Math.max(1, Math.min(604, Number(e.target.value) || 1)))}
                  className="w-20 p-1.5 text-center font-bold bg-white border border-[#e5dad0] rounded-lg text-sm text-[#1b110b]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedPageNum(Math.max(1, selectedPageNum - 1))}
                  disabled={selectedPageNum <= 1}
                  className="px-2.5 py-1 bg-white hover:bg-[#ede5dc] border border-[#e5dad0] rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPageNum(Math.min(604, selectedPageNum + 1))}
                  disabled={selectedPageNum >= 604}
                  className="px-2.5 py-1 bg-white hover:bg-[#ede5dc] border border-[#e5dad0] rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>

            {pageDetails && (
              <div className="bg-white rounded-xl border border-[#e5dad0] p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#f0e6dc] pb-2">
                  <h4 className="font-bold text-sm text-[#1b110b]">
                    {language === 'ar' ? `الصفحة رقم ${pageDetails.page} (الجزء ${pageDetails.juz})` : `Page ${pageDetails.page} (Juz ${pageDetails.juz})`}
                  </h4>
                  <span className="text-[10px] bg-[#faedd9] text-[#854d2b] font-bold px-2 py-0.5 rounded-full">
                    {language === 'ar' ? 'مصحف المدينة النبوية ١٥ سطراً' : '15-Line Madinah Mushaf'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#635043] block mb-1">
                    {language === 'ar' ? 'الآيات والسور المتضمنة في هذه الصفحة:' : 'Ayahs & Surahs on this Page:'}
                  </span>
                  <div className="space-y-1.5">
                    {pageAyahSegments.map((seg, idx) => (
                      <div key={idx} className="p-2.5 bg-[#faf7f3] rounded-lg border border-[#e5dad0] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#1b110b]">Surah {seg.surahNumber}. {seg.surahName}</span>{' '}
                          <span className="font-serif text-[#854d2b] font-bold">({seg.surahArabicName})</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#635043]">
                          Ayahs {seg.startAyah} – {seg.endAyah}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ayah & Range Calculator (Supports cross-page & cross-Surah) */}
        {activeTab === 'calculator' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="bg-[#faf7f3] p-3 rounded-xl border border-[#e5dad0] text-[11px] text-[#635043]">
              <p className="font-bold text-[#854d2b] mb-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>{language === 'ar' ? 'حاسبة النطاقات المتوافقة مع الحدود المتعددة (Cross-Surah & Cross-Page):' : 'Cross-Surah & Cross-Page Boundary Calculator:'}</span>
              </p>
              <p>
                {language === 'ar'
                  ? 'يمكنك اختبار أي نطاق تسميع حتى لو امتد عبر عدة صفحات أو عدة سور، وستقوم الحاسبة بالتحقق الدقيق من صحة الآيات وحساب عددها والصفحات التي تغطيها.'
                  : 'Test any recitation range across multiple pages or surahs. The engine validates bounds, counts exact ayahs, and resolves Madinah page coverage.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#e5dad0] shadow-2xs">
              {/* Start Boundary */}
              <div className="space-y-2">
                <span className="font-bold text-[#854d2b] block border-b border-[#f0e6dc] pb-1">
                  {language === 'ar' ? 'بداية النطاق (من):' : 'Range Start (From):'}
                </span>
                <div>
                  <label className="block text-[11px] text-[#635043] mb-0.5">Surah</label>
                  <select
                    value={calcStartSurah}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setCalcStartSurah(num);
                      setCalcStartAyah(1);
                    }}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] font-semibold"
                  >
                    {VERIFIED_SURAHS.map(s => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.name} ({s.arabicName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#635043] mb-0.5">Start Ayah</label>
                  <input
                    type="number"
                    min={1}
                    max={getSurahByNumber(calcStartSurah)?.ayahCount || 1}
                    value={calcStartAyah}
                    onChange={(e) => setCalcStartAyah(Number(e.target.value))}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] font-bold"
                  />
                </div>
              </div>

              {/* End Boundary */}
              <div className="space-y-2">
                <span className="font-bold text-[#854d2b] block border-b border-[#f0e6dc] pb-1">
                  {language === 'ar' ? 'نهاية النطاق (إلى):' : 'Range End (To):'}
                </span>
                <div>
                  <label className="block text-[11px] text-[#635043] mb-0.5">Surah</label>
                  <select
                    value={calcEndSurah}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setCalcEndSurah(num);
                      const s = getSurahByNumber(num);
                      setCalcEndAyah(s ? Math.min(10, s.ayahCount) : 1);
                    }}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] font-semibold"
                  >
                    {VERIFIED_SURAHS.map(s => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.name} ({s.arabicName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#635043] mb-0.5">End Ayah</label>
                  <input
                    type="number"
                    min={1}
                    max={getSurahByNumber(calcEndSurah)?.ayahCount || 1}
                    value={calcEndAyah}
                    onChange={(e) => setCalcEndAyah(Number(e.target.value))}
                    className="w-full p-2 border border-[#e5dad0] rounded-lg bg-[#faf7f3] font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Calculation Output Card */}
            {rangeCalculation.valid ? (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-sm">
                      {language === 'ar' ? rangeCalculation.summaryAr : rangeCalculation.summaryEn}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full">
                    VALID RANGE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-center">
                  <div className="bg-white/80 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-800 block">Total Ayahs</span>
                    <span className="font-black text-sm text-emerald-900">{rangeCalculation.totalAyahs}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-800 block">Start Page</span>
                    <span className="font-black text-sm text-emerald-900">p. {rangeCalculation.startPage}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-800 block">End Page</span>
                    <span className="font-black text-sm text-emerald-900">p. {rangeCalculation.endPage}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-800 block">Cross Boundaries</span>
                    <span className="font-bold text-[11px] text-emerald-900">
                      {rangeCalculation.isCrossSurah ? 'Cross-Surah' : rangeCalculation.isCrossPage ? 'Cross-Page' : 'Within Page'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 space-y-1">
                <span className="font-bold text-xs block">Invalid Selection:</span>
                <ul className="list-disc list-inside text-[11px]">
                  {rangeCalculation.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Dataset & Attribution */}
        {activeTab === 'attribution' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="bg-white rounded-xl border border-[#e5dad0] p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-[#854d2b] font-bold">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">Official Qur’an Dataset Attribution & License</span>
              </div>

              <div className="divide-y divide-[#f0e6dc] text-[11px]">
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#635043]">Mushaf Edition:</span>
                  <span className="font-bold text-[#1b110b]">{QURAN_DATASET_METADATA.editionName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#635043]">Script & Lines:</span>
                  <span className="font-bold text-[#1b110b]">{QURAN_DATASET_METADATA.scriptType}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#635043]">Dataset Source:</span>
                  <span className="font-bold text-[#1b110b] text-right max-w-sm">{QURAN_DATASET_METADATA.source}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#635043]">Dataset Version:</span>
                  <span className="font-bold text-[#1b110b]">{QURAN_DATASET_METADATA.version}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#635043]">License:</span>
                  <span className="font-bold text-emerald-800">{QURAN_DATASET_METADATA.license}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-semibold text-[#635043]">Total Verified Elements:</span>
                  <span className="font-bold text-[#1b110b]">
                    {QURAN_DATASET_METADATA.totalSurahs} Surahs • {QURAN_DATASET_METADATA.totalAyahs} Ayahs • {QURAN_DATASET_METADATA.totalPages} Pages • {QURAN_DATASET_METADATA.totalJuz} Juz
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#faf7f3] rounded-lg border border-[#e5dad0] text-[11px] text-[#7c695d]">
                <p className="font-semibold text-[#1b110b] mb-1">Attribution Statement:</p>
                <p>{QURAN_DATASET_METADATA.attribution}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#faf7f3] px-4 py-3 border-t border-[#e5dad0] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[#8c7464]">
            Al-Millah Islamic Academy • Class Five Qur’an Tahfeez Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] font-bold rounded-lg cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
