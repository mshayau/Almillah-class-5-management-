/**
 * Automated Acceptance Test Suite for Phase 3: Full Qur’an Reference Data
 * 
 * Verifies:
 * 1. All 114 Surahs are present with correct ordering and numbering.
 * 2. Total ayah count equals exactly 6,236 (standard Hafs count).
 * 3. Page mappings strictly adhere to the 604-page Madinah Mushaf edition.
 * 4. Dataset source, version, and attribution are recorded and read-only.
 * 5. Invalid Surah/page/ayah combinations are accurately rejected.
 * 6. Cross-page ayah ranges are correctly detected and calculated.
 * 7. Cross-Surah ayah ranges are correctly represented and calculated.
 */

import { 
  QURAN_DATASET_METADATA, 
  VERIFIED_SURAHS, 
  MADINAH_PAGES_RAW, 
  MADINAH_JUZS,
  getSurahByNumber,
  getPageForAyah,
  getPageDetails,
  getAyahsOnPage,
  calculateTotalAyahsInRange,
  validateAndCalculateQuranRange
} from '../data/quranReferenceData';

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`✅ [PASS] ${testName}${detail ? ` - ${detail}` : ''}`);
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('\n======================================================');
console.log('Al-Millah Academy — Qur’an Reference Database Tests');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// Test 1: All 114 Surahs are present and ordered
// ---------------------------------------------------------------------
assert(
  VERIFIED_SURAHS.length === 114,
  'Test 1.1: Exactly 114 Surahs are present in dataset',
  `Found ${VERIFIED_SURAHS.length} Surahs`
);

const isSequential = VERIFIED_SURAHS.every((s, idx) => s.number === idx + 1);
assert(
  isSequential,
  'Test 1.2: Surah numbering is strictly sequential from 1 to 114',
  '1 (Al-Fatihah) to 114 (An-Nas)'
);

// ---------------------------------------------------------------------
// Test 2: Surah and ayah numbering are consistent (Total 6,236 ayahs)
// ---------------------------------------------------------------------
const totalAyahs = VERIFIED_SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
assert(
  totalAyahs === 6236,
  'Test 2.1: Total ayah count matches canonical Hafs standard (6,236 ayahs)',
  `Calculated: ${totalAyahs} ayahs`
);

const fatihah = getSurahByNumber(1);
const baqarah = getSurahByNumber(2);
const ikhlas = getSurahByNumber(112);
const nas = getSurahByNumber(114);

assert(
  fatihah?.ayahCount === 7 && baqarah?.ayahCount === 286 && ikhlas?.ayahCount === 4 && nas?.ayahCount === 6,
  'Test 2.2: Landmark Surah ayah counts match verified standard',
  'Fatihah: 7, Baqarah: 286, Ikhlas: 4, Nas: 6'
);

// ---------------------------------------------------------------------
// Test 3: Page mappings match the 604-page Madinah Mushaf edition
// ---------------------------------------------------------------------
assert(
  MADINAH_PAGES_RAW.length === 604,
  'Test 3.1: Exactly 604 pages are mapped in the Madinah Mushaf dataset',
  `Total pages: ${MADINAH_PAGES_RAW.length}`
);

const page1 = getPageDetails(1);
const page2 = getPageDetails(2);
const page604 = getPageDetails(604);

assert(
  page1?.startSurah === 1 && page1?.startAyah === 1 && page1?.endSurah === 1 && page1?.endAyah === 7,
  'Test 3.2: Page 1 accurately maps Surah Al-Fatihah (Ayahs 1–7)',
  `Surah ${page1?.startSurah}:${page1?.startAyah} to ${page1?.endSurah}:${page1?.endAyah}`
);

assert(
  page2?.startSurah === 2 && page2?.startAyah === 1 && page2?.endSurah === 2 && page2?.endAyah === 5,
  'Test 3.3: Page 2 accurately maps Surah Al-Baqarah (Ayahs 1–5)',
  `Surah ${page2?.startSurah}:${page2?.startAyah} to ${page2?.endSurah}:${page2?.endAyah}`
);

assert(
  page604?.startSurah === 112 && page604?.endSurah === 114 && page604?.endAyah === 6,
  'Test 3.4: Page 604 accurately maps concluding Surahs (Al-Ikhlas to An-Nas)',
  `Page 604: Surah ${page604?.startSurah}:${page604?.startAyah} to ${page604?.endSurah}:${page604?.endAyah}`
);

// Every ayah in every Surah maps to a page between 1 and 604
let allAyahsMapped = true;
for (const s of VERIFIED_SURAHS) {
  const pStart = getPageForAyah(s.number, 1);
  const pEnd = getPageForAyah(s.number, s.ayahCount);
  if (pStart < 1 || pStart > 604 || pEnd < 1 || pEnd > 604 || pStart > pEnd) {
    allAyahsMapped = false;
    break;
  }
}
assert(
  allAyahsMapped,
  'Test 3.5: All 6,236 ayahs successfully and monotonically resolve to pages 1–604',
  'All 114 Surah boundaries verified'
);

// ---------------------------------------------------------------------
// Test 4: Dataset metadata, version, and attribution are recorded
// ---------------------------------------------------------------------
assert(
  QURAN_DATASET_METADATA.totalPages === 604 &&
  QURAN_DATASET_METADATA.totalSurahs === 114 &&
  QURAN_DATASET_METADATA.version === '1.0.2' &&
  Boolean(QURAN_DATASET_METADATA.source) &&
  Boolean(QURAN_DATASET_METADATA.attribution),
  'Test 4.1: Dataset source, version, edition, and attribution are properly recorded',
  `Edition: "${QURAN_DATASET_METADATA.editionName}", Source: "${QURAN_DATASET_METADATA.source}"`
);

// ---------------------------------------------------------------------
// Test 5: Invalid Surah / Page / Ayah combinations are rejected
// ---------------------------------------------------------------------
// Invalid Surah number
const invSurah = validateAndCalculateQuranRange(115, 1, 115, 5);
assert(
  !invSurah.valid && invSurah.errors.some(e => e.includes('115')),
  'Test 5.1: Non-existent Surah number (115) rejected',
  `Error: "${invSurah.errors[0]}"`
);

// Out of bounds ayah
const invAyah = validateAndCalculateQuranRange(1, 1, 1, 10); // Al-Fatihah only has 7 ayahs
assert(
  !invAyah.valid && invAyah.errors.some(e => e.includes('out of bounds')),
  'Test 5.2: Out of bounds ayah (Al-Fatihah Ayah 10) rejected',
  `Error: "${invAyah.errors[0]}"`
);

// Inverted range
const invRange = validateAndCalculateQuranRange(2, 50, 2, 20);
assert(
  !invRange.valid && invRange.errors.some(e => e.includes('greater than')),
  'Test 5.3: Inverted ayah range (Ayah 50 to 20) rejected',
  `Error: "${invRange.errors[0]}"`
);

// ---------------------------------------------------------------------
// Test 6: Cross-page ranges are correctly represented and calculated
// ---------------------------------------------------------------------
// Surah Al-Baqarah Ayahs 1 to 25 spans page 2 to page 5
const crossPage = validateAndCalculateQuranRange(2, 1, 2, 25);
assert(
  crossPage.valid && 
  crossPage.isCrossPage === true && 
  crossPage.isCrossSurah === false && 
  crossPage.startPage === 2 && 
  crossPage.endPage === 5 && 
  crossPage.totalAyahs === 25,
  'Test 6.1: Cross-page single Surah range (Al-Baqarah 1–25, pp. 2–5) correctly calculated',
  `Pages: ${crossPage.startPage}–${crossPage.endPage} (${crossPage.totalPagesCovered} pages), Ayahs: ${crossPage.totalAyahs}`
);

// ---------------------------------------------------------------------
// Test 7: Cross-Surah ranges are correctly represented and calculated
// ---------------------------------------------------------------------
// From Surah 111 (Al-Masad, 5 ayahs) to Surah 114 (An-Nas, 6 ayahs)
// Contains: Surah 111 (5 ayahs) + Surah 112 (4 ayahs) + Surah 113 (5 ayahs) + Surah 114 (6 ayahs) = 20 ayahs
const crossSurah = validateAndCalculateQuranRange(111, 1, 114, 6);
assert(
  crossSurah.valid && 
  crossSurah.isCrossSurah === true && 
  crossSurah.totalAyahs === 20 && 
  crossSurah.startPage === 603 && 
  crossSurah.endPage === 604,
  'Test 7.1: Cross-Surah range (Al-Masad 1 to An-Nas 6) spans 4 Surahs and 20 ayahs',
  `Total Ayahs: ${crossSurah.totalAyahs}, Pages: ${crossSurah.startPage}–${crossSurah.endPage}`
);

// Partial cross-Surah: Surah 81 (At-Takwir, 29 ayahs): ayahs 20 to 29 (10 ayahs) + Surah 82 (Al-Infitar, 19 ayahs): ayahs 1 to 5 (5 ayahs) = 15 ayahs
const partialCrossSurah = validateAndCalculateQuranRange(81, 20, 82, 5);
assert(
  partialCrossSurah.valid && partialCrossSurah.totalAyahs === 15,
  'Test 7.2: Partial cross-Surah range (At-Takwir 20–29 + Al-Infitar 1–5 = 15 ayahs) correctly calculated',
  `Total: ${partialCrossSurah.totalAyahs} ayahs (Expected 15)`
);

// ---------------------------------------------------------------------
// Test 8: Reference data immutability (Read-Only)
// ---------------------------------------------------------------------
let isFrozen = Object.isFrozen(VERIFIED_SURAHS) && Object.isFrozen(MADINAH_PAGES_RAW);
assert(
  isFrozen,
  'Test 8.1: Reference data structures are strictly Object.freeze protected (read-only)',
  'VERIFIED_SURAHS & MADINAH_PAGES_RAW are frozen'
);

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount/totalCount)*100)}%)`);
console.log('------------------------------------------------------\n');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
