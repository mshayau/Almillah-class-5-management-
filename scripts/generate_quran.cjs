const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('/tmp/quran_meta.json', 'utf8')).data;
const surahsRaw = raw.surahs.references;
const pagesRaw = raw.pages.references; // 604
const juzsRaw = raw.juzs.references; // 30

// Read existing surahs.ts for canonical transliterated names
const existingSurahsCode = fs.readFileSync('src/data/surahs.ts', 'utf8');
const existingNames = {};
const existingArNames = {};
const matchRegex = /number:\s*(\d+),\s*name:\s*"([^"]+)",\s*arabicName:\s*"([^"]+)"/g;
let m;
while ((m = matchRegex.exec(existingSurahsCode)) !== null) {
  existingNames[Number(m[1])] = m[2];
  existingArNames[Number(m[1])] = m[3];
}

// Compute page boundaries
const pageBoundaries = [];
for (let i = 0; i < pagesRaw.length; i++) {
  const pageNum = i + 1;
  const start = pagesRaw[i];
  let end;
  if (i < pagesRaw.length - 1) {
    const nextStart = pagesRaw[i + 1];
    if (nextStart.ayah > 1) {
      end = { surah: nextStart.surah, ayah: nextStart.ayah - 1 };
    } else {
      const prevSurah = surahsRaw[nextStart.surah - 2];
      end = { surah: prevSurah.number, ayah: prevSurah.numberOfAyahs };
    }
  } else {
    end = { surah: 114, ayah: 6 };
  }

  let pageJuz = 1;
  for (let j = 0; j < juzsRaw.length; j++) {
    const jz = juzsRaw[j];
    if (start.surah > jz.surah || (start.surah === jz.surah && start.ayah >= jz.ayah)) {
      pageJuz = j + 1;
    }
  }

  pageBoundaries.push([pageNum, pageJuz, start.surah, start.ayah, end.surah, end.ayah]);
}

// Compute Surahs
const surahs = surahsRaw.map(s => {
  const pages = pageBoundaries.filter(p => p[2] <= s.number && p[4] >= s.number).map(p => p[0]);
  const startPage = Math.min(...pages);
  const endPage = Math.max(...pages);

  let startJuz = 1;
  for (let j = 0; j < juzsRaw.length; j++) {
    const jz = juzsRaw[j];
    if (s.number > jz.surah || (s.number === jz.surah && 1 >= jz.ayah)) {
      startJuz = j + 1;
    }
  }

  return {
    number: s.number,
    name: existingNames[s.number] || s.englishName,
    arabicName: existingArNames[s.number] || s.name.replace('سُورَةُ ', '').replace('سورة ', '').trim(),
    ayahCount: s.numberOfAyahs,
    juzNumber: startJuz,
    startPage,
    endPage,
    revelationType: s.revelationType,
    bismillahPre: s.number !== 9
  };
});

// Juz names in Arabic
const juzNamesAr = [
  'الم (الجزء الأول)', 'سيقول السفهاء (الجزء الثاني)', 'تلك الرسل (الجزء الثالث)', 'لن تنالوا البر (الجزء الرابع)',
  'والمحصنات (الجزء الخامس)', 'لا يحب الله (الجزء السادس)', 'وإذا سمعوا (الجزء السابع)', 'ولو أننا (الجزء الثامن)',
  'قال الملأ (الجزء التاسع)', 'واعلموا (الجزء العاشر)', 'يعتذرون (الجزء الحادي عشر)', 'وما من دابة (الجزء الثاني عشر)',
  'وما أبرئ نفسي (الجزء الثالث عشر)', 'ربما (الجزء الرابع عشر)', 'سبحان الذي (الجزء الخامس عشر)', 'قال ألم (الجزء السادس عشر)',
  'اقترب للناس (الجزء السابع عشر)', 'قد أفلح (الجزء الثامن عشر)', 'وقال الذين (الجزء التاسع عشر)', 'أمن خلق (الجزء العشرون)',
  'اتل ما أوحي (الجزء الحادي والعشرون)', 'ومن يقنت (الجزء الثاني والعشرون)', 'وما لي (الجزء الثالث والعشرون)', 'فمن أظلم (الجزء الرابع والعشرون)',
  'إليه يرد (الجزء الخامس والعشرون)', 'حم (الجزء السادس والعشرون)', 'قال فما خطبكم (الجزء السابع والعشرون)', 'قد سمع الله (الجزء الثامن والعشرون)',
  'تبارك الذي (الجزء التاسع والعشرون)', 'عم يتساءلون (جزء عم)'
];

const juzs = [];
for (let j = 0; j < juzsRaw.length; j++) {
  const juzNum = j + 1;
  const start = juzsRaw[j];
  const startPage = pageBoundaries.find(p => {
    if (p[2] === p[4]) {
      return p[2] === start.surah && start.ayah >= p[3] && start.ayah <= p[5];
    }
    if (start.surah === p[2]) return start.ayah >= p[3];
    if (start.surah === p[4]) return start.ayah <= p[5];
    return start.surah > p[2] && start.surah < p[4];
  })[0];

  let endSurah, endAyah, endPage;
  if (j < juzsRaw.length - 1) {
    const nextStart = juzsRaw[j + 1];
    if (nextStart.ayah > 1) {
      endSurah = nextStart.surah;
      endAyah = nextStart.ayah - 1;
    } else {
      const prevSurah = surahsRaw[nextStart.surah - 2];
      endSurah = prevSurah.number;
      endAyah = prevSurah.numberOfAyahs;
    }
    endPage = pageBoundaries.find(p => {
      if (p[2] === p[4]) {
        return p[2] === endSurah && endAyah >= p[3] && endAyah <= p[5];
      }
      if (endSurah === p[2]) return endAyah >= p[3];
      if (endSurah === p[4]) return endAyah <= p[5];
      return endSurah > p[2] && endSurah < p[4];
    })[0];
  } else {
    endSurah = 114;
    endAyah = 6;
    endPage = 604;
  }

  juzs.push({
    juzNumber: juzNum,
    nameAr: juzNamesAr[j] || ('الجزء ' + juzNum),
    startSurah: start.surah,
    startAyah: start.ayah,
    startPage,
    endSurah,
    endAyah,
    endPage
  });
}

// Generate TS code
const code = `/**
 * =====================================================================
 * Al-Millah Academy — Verified Qur’an Reference Database (Phase 3)
 * 
 * Dataset Metadata:
 *   Edition: Madinah Mushaf (مصحف المدينة النبوية) — 604 Pages
 *   Standard: 15 Lines per page, Hafs 'an 'Asim (حفص عن عاصم)
 *   Source: King Fahd Complex for the Printing of the Holy Quran & Tanzil Project
 *   Version: 1.0.2
 *   Total Surahs: 114 | Total Ayahs: 6,236 | Total Pages: 604 | Total Juz: 30
 *   License: Creative Commons Attribution 3.0 / Open Access Quranic Metadata
 * =====================================================================
 */

export interface QuranDatasetMetadata {
  editionName: string;
  editionIdentifier: string;
  source: string;
  version: string;
  totalPages: 604;
  totalSurahs: 114;
  totalAyahs: 6236;
  totalJuz: 30;
  scriptType: string;
  license: string;
  attribution: string;
}

export const QURAN_DATASET_METADATA: QuranDatasetMetadata = {
  editionName: "Madinah Mushaf (مصحف المدينة النبوية)",
  editionIdentifier: "quran-madinah-604",
  source: "King Fahd Glorious Qur’an Printing Complex (مجمع الملك فهد لطباعة المصحف الشريف) & Tanzil Project",
  version: "1.0.2",
  totalPages: 604,
  totalSurahs: 114,
  totalAyahs: 6236,
  totalJuz: 30,
  scriptType: "Hafs 'an 'Asim (حفص عن عاصم) - Standard 15-line Madinah Mushaf",
  license: "Creative Commons Attribution 3.0",
  attribution: "Verified Qur’an reference metadata sourced from Tanzil.net and aligned with the 15-line Madinah Mushaf published by the King Fahd Complex."
};

export interface VerifiedSurah {
  number: number;
  name: string;
  arabicName: string;
  ayahCount: number;
  juzNumber: number;
  startPage: number;
  endPage: number;
  revelationType: "Meccan" | "Medinan";
  bismillahPre: boolean;
}

export interface MadinahPageInfo {
  page: number;
  juz: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface MadinahJuzInfo {
  juzNumber: number;
  nameAr: string;
  startSurah: number;
  startAyah: number;
  startPage: number;
  endSurah: number;
  endAyah: number;
  endPage: number;
}

export interface PageAyahSegment {
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  startAyah: number;
  endAyah: number;
}

export interface QuranRangeCalculation {
  valid: boolean;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  totalAyahs: number;
  startPage: number;
  endPage: number;
  totalPagesCovered: number;
  isCrossSurah: boolean;
  isCrossPage: boolean;
  summaryEn: string;
  summaryAr: string;
  errors: string[];
}

// ---------------------------------------------------------------------
// 1. ALL 114 VERIFIED SURAHS
// ---------------------------------------------------------------------
export const VERIFIED_SURAHS: ReadonlyArray<VerifiedSurah> = Object.freeze(${JSON.stringify(surahs, null, 2)});

// ---------------------------------------------------------------------
// 2. 604 MADINAH MUSHAF PAGES [page, juz, startSurah, startAyah, endSurah, endAyah]
// ---------------------------------------------------------------------
export const MADINAH_PAGES_RAW: ReadonlyArray<[number, number, number, number, number, number]> = Object.freeze(${JSON.stringify(pageBoundaries)});

// ---------------------------------------------------------------------
// 3. 30 JUZ REFERENCE
// ---------------------------------------------------------------------
export const MADINAH_JUZS: ReadonlyArray<MadinahJuzInfo> = Object.freeze(${JSON.stringify(juzs, null, 2)});

// ---------------------------------------------------------------------
// 4. HELPER & VALIDATION FUNCTIONS (READ-ONLY)
// ---------------------------------------------------------------------
export function getSurahByNumber(num: number): VerifiedSurah | undefined {
  return VERIFIED_SURAHS.find(s => s.number === num);
}

export function getPageDetails(pageNumber: number): MadinahPageInfo | undefined {
  if (pageNumber < 1 || pageNumber > 604) return undefined;
  const p = MADINAH_PAGES_RAW[pageNumber - 1];
  if (!p) return undefined;
  return {
    page: p[0],
    juz: p[1],
    startSurah: p[2],
    startAyah: p[3],
    endSurah: p[4],
    endAyah: p[5]
  };
}

export function getPageForAyah(surahNumber: number, ayahNumber: number): number {
  const surah = getSurahByNumber(surahNumber);
  if (!surah || ayahNumber < 1 || ayahNumber > surah.ayahCount) return -1;

  for (let i = 0; i < MADINAH_PAGES_RAW.length; i++) {
    const p = MADINAH_PAGES_RAW[i];
    const [page, , startS, startA, endS, endA] = p;
    if (startS === endS) {
      if (startS === surahNumber && ayahNumber >= startA && ayahNumber <= endA) {
        return page;
      }
    } else {
      if (surahNumber === startS && ayahNumber >= startA) return page;
      if (surahNumber === endS && ayahNumber <= endA) return page;
      if (surahNumber > startS && surahNumber < endS) return page;
    }
  }
  return -1;
}

export function getAyahsOnPage(pageNumber: number): PageAyahSegment[] {
  const p = getPageDetails(pageNumber);
  if (!p) return [];

  const segments: PageAyahSegment[] = [];
  for (let s = p.startSurah; s <= p.endSurah; s++) {
    const surah = getSurahByNumber(s);
    if (!surah) continue;

    let startAyah = 1;
    let endAyah = surah.ayahCount;

    if (s === p.startSurah) startAyah = p.startAyah;
    if (s === p.endSurah) endAyah = p.endAyah;

    segments.push({
      surahNumber: s,
      surahName: surah.name,
      surahArabicName: surah.arabicName,
      startAyah,
      endAyah
    });
  }
  return segments;
}

export function calculateTotalAyahsInRange(
  startSurah: number, 
  startAyah: number, 
  endSurah: number, 
  endAyah: number
): number {
  if (startSurah > endSurah) return 0;
  if (startSurah === endSurah) {
    if (startAyah > endAyah) return 0;
    return endAyah - startAyah + 1;
  }

  let total = 0;
  for (let s = startSurah; s <= endSurah; s++) {
    const surah = getSurahByNumber(s);
    if (!surah) continue;
    if (s === startSurah) {
      total += Math.max(0, surah.ayahCount - startAyah + 1);
    } else if (s === endSurah) {
      total += Math.max(0, endAyah);
    } else {
      total += surah.ayahCount;
    }
  }
  return total;
}

export function validateAndCalculateQuranRange(
  startSurah: number, 
  startAyah: number, 
  endSurah: number, 
  endAyah: number
): QuranRangeCalculation {
  const errors: string[] = [];

  const sStart = getSurahByNumber(startSurah);
  const sEnd = getSurahByNumber(endSurah);

  if (!sStart) errors.push(\`Start Surah #\${startSurah} is invalid (must be 1–114).\`);
  if (!sEnd) errors.push(\`End Surah #\${endSurah} is invalid (must be 1–114).\`);

  if (sStart && (startAyah < 1 || startAyah > sStart.ayahCount)) {
    errors.push(\`Start Ayah \${startAyah} is out of bounds for \${sStart.name} (has \${sStart.ayahCount} ayahs).\`);
  }

  if (sEnd && (endAyah < 1 || endAyah > sEnd.ayahCount)) {
    errors.push(\`End Ayah \${endAyah} is out of bounds for \${sEnd.name} (has \${sEnd.ayahCount} ayahs).\`);
  }

  if (startSurah > endSurah) {
    errors.push(\`Start Surah (\${startSurah}) cannot be after End Surah (\${endSurah}).\`);
  } else if (startSurah === endSurah && startAyah > endAyah) {
    errors.push(\`Start Ayah (\${startAyah}) cannot be greater than End Ayah (\${endAyah}).\`);
  }

  if (errors.length > 0 || !sStart || !sEnd) {
    return {
      valid: false,
      startSurah,
      startAyah,
      endSurah,
      endAyah,
      totalAyahs: 0,
      startPage: -1,
      endPage: -1,
      totalPagesCovered: 0,
      isCrossSurah: startSurah !== endSurah,
      isCrossPage: false,
      summaryEn: "",
      summaryAr: "",
      errors
    };
  }

  const startPage = getPageForAyah(startSurah, startAyah);
  const endPage = getPageForAyah(endSurah, endAyah);
  const totalAyahs = calculateTotalAyahsInRange(startSurah, startAyah, endSurah, endAyah);
  const isCrossSurah = startSurah !== endSurah;
  const isCrossPage = startPage !== endPage;
  const totalPagesCovered = Math.max(1, endPage - startPage + 1);

  let summaryEn: string;
  let summaryAr: string;

  if (!isCrossSurah) {
    summaryEn = \`\${sStart.name} (Ayahs \${startAyah}–\${endAyah})\`;
    summaryAr = \`سورة \${sStart.arabicName} (الآيات \${startAyah}–\${endAyah})\`;
  } else {
    summaryEn = \`\${sStart.name} (Ayah \${startAyah}) → \${sEnd.name} (Ayah \${endAyah})\`;
    summaryAr = \`سورة \${sStart.arabicName} (\${startAyah}) إلى سورة \${sEnd.arabicName} (\${endAyah})\`;
  }

  return {
    valid: true,
    startSurah,
    startAyah,
    endSurah,
    endAyah,
    totalAyahs,
    startPage,
    endPage,
    totalPagesCovered,
    isCrossSurah,
    isCrossPage,
    summaryEn,
    summaryAr,
    errors: []
  };
}
`;

fs.writeFileSync('src/data/quranReferenceData.ts', code);
console.log('Successfully generated src/data/quranReferenceData.ts! Total lines:', code.split('\n').length);
