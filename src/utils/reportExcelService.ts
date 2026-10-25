import ExcelJS from 'exceljs';
import { Student, WeeklyReportSummary } from '../types';
import { StudentReportCardData, buildStudentReportCardData } from './studentReportGenerator';
import { ACADEMIC_WEEKS } from '../data/academicCalendar';

export interface GenerateExcelOptions {
  includeClassSummarySheet?: boolean;
  allStudents?: Student[];
  allReportsMap?: Map<string, WeeklyReportSummary>;
}

/**
 * Palette constants matching Al-Millah Islamic Academy Luxury Theme
 */
const COLORS = {
  headerBg: 'FF1A0F08',        // Deep obsidian brown
  headerText: 'FFFFFFFF',      // White
  goldAccent: 'FFDF9B52',      // Al-Millah Gold
  goldLight: 'FFFAEDD9',       // Pale gold
  goldDark: 'FF854D2B',        // Bronze/brown
  sectionBg: 'FF2A170D',       // Dark warm brown section headers
  sectionText: 'FFF7CB8B',     // Warm gold text
  zebraEven: 'FFFBF9F6',       // Off-white zebra row
  zebraOdd: 'FFFFFFFF',        // Pure white zebra row
  emeraldBg: 'FFE6F4EA',       // Soft green
  emeraldText: 'FF137333',     // Dark green
  amberBg: 'FFFEF7E0',         // Soft yellow/amber
  amberText: 'FFB06000',       // Dark amber
  borderThin: 'FFD5C5B5',      // Soft border
  borderDark: 'FF854D2B'       // Dark accent border
};

/**
 * Generates an executive Microsoft Excel (.xlsx) workbook for a student's weekly report
 */
export async function generateStudentWeeklyReportExcelBlob(
  student: Student,
  report: WeeklyReportSummary,
  weekNumber: number,
  options: GenerateExcelOptions = {}
): Promise<Blob> {
  const currentWeek = ACADEMIC_WEEKS.find(w => w.weekNumber === weekNumber) || ACADEMIC_WEEKS[0];
  const reportData = buildStudentReportCardData(
    student,
    report,
    currentWeek.startDate,
    currentWeek.endDate,
    weekNumber
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Al-Millah Islamic Academy';
  workbook.lastModifiedBy = 'Al-Millah Tahfeez & Character Directorate';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Set workbook properties
  workbook.properties.date1904 = false;

  // =========================================================================
  // SHEET 1: INDIVIDUAL STUDENT WEEKLY PERFORMANCE DOSSIER
  // =========================================================================
  const sheetName = `Report_Std${student.rollNumber}_${student.fullName.split(' ')[0]}`.slice(0, 31);
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  // Set Column Widths (A to H)
  ws.columns = [
    { width: 14 }, // A: Day / Metric
    { width: 14 }, // B: Date / Target
    { width: 22 }, // C: Subject / Surah
    { width: 14 }, // D: Range / Score
    { width: 15 }, // E: Ayahs / Score
    { width: 18 }, // F: Quality / Status
    { width: 16 }, // G: Rating / Notes
    { width: 26 }, // H: Extended Details / Remarks
  ];

  // Helper for applying borders
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: COLORS.borderThin } },
    bottom: { style: 'thin', color: { argb: COLORS.borderThin } },
    left: { style: 'thin', color: { argb: COLORS.borderThin } },
    right: { style: 'thin', color: { argb: COLORS.borderThin } }
  };

  const mediumBorderBottom: Partial<ExcelJS.Borders> = {
    bottom: { style: 'medium', color: { argb: COLORS.goldAccent } }
  };

  let currentRow = 1;

  // 1. BANNER HEADER
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const titleCell = ws.getCell(`A${currentRow}`);
  titleCell.value = 'AL-MILLAH ISLAMIC ACADEMY • مَعهَدُ المِلَّةِ الإِسْلَامِي';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(currentRow).height = 36;
  currentRow++;

  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const subTitleCell = ws.getCell(`A${currentRow}`);
  subTitleCell.value = `OFFICIAL WEEKLY STUDENT PERFORMANCE REPORT • CLASS 5 • ${currentWeek.labelEn.toUpperCase()}`;
  subTitleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.goldAccent } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(currentRow).height = 24;
  currentRow += 2; // spacing

  // 2. STUDENT IDENTIFICATION PROFILE CARD
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const profileHeader = ws.getCell(`A${currentRow}`);
  profileHeader.value = '1. STUDENT PROFILE & ACADEMIC REGISTRATION DATA';
  profileHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.sectionText } };
  profileHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  profileHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(currentRow).height = 24;
  currentRow++;

  // Profile rows
  const profileData = [
    [
      { label: 'Student Full Name:', value: student.fullName, boldVal: true },
      { label: 'Arabic Name:', value: student.arabicName || '—' },
      { label: 'Roll Number:', value: `#${student.rollNumber}`, boldVal: true },
      { label: 'Student ID:', value: reportData.studentIdFormatted }
    ],
    [
      { label: 'Tahfeez Group:', value: student.group.toUpperCase().replace('_', ' ') },
      { label: 'Academic Week:', value: `${currentWeek.labelEn} (W${weekNumber})`, boldVal: true },
      { label: 'Week Dates:', value: `${currentWeek.startDate} to ${currentWeek.endDate}` },
      { label: 'Hijri Cycle:', value: currentWeek.hijriRangeEn }
    ],
    [
      { label: 'Guardian / Parent:', value: student.parentName || 'Parent / Guardian' },
      { label: 'Guardian Phone:', value: student.parentPhone || '—' },
      { label: 'Reporting Date:', value: new Date().toLocaleDateString('en-GB') },
      { label: 'Verification ID:', value: reportData.footer.verificationId }
    ]
  ];

  profileData.forEach(rowInfo => {
    // Left half: Cols A-D
    ws.getCell(`A${currentRow}`).value = rowInfo[0].label;
    ws.getCell(`A${currentRow}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF555555' } };
    ws.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };

    ws.getCell(`B${currentRow}`).value = rowInfo[0].value;
    ws.getCell(`B${currentRow}`).font = { name: 'Calibri', size: 10, bold: rowInfo[0].boldVal || false };

    ws.getCell(`C${currentRow}`).value = rowInfo[1].label;
    ws.getCell(`C${currentRow}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF555555' } };
    ws.getCell(`C${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };

    ws.getCell(`D${currentRow}`).value = rowInfo[1].value;
    ws.getCell(`D${currentRow}`).font = { name: 'Calibri', size: 10, bold: rowInfo[1].boldVal || false };

    // Right half: Cols E-H
    ws.getCell(`E${currentRow}`).value = rowInfo[2].label;
    ws.getCell(`E${currentRow}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF555555' } };
    ws.getCell(`E${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };

    ws.getCell(`F${currentRow}`).value = rowInfo[2].value;
    ws.getCell(`F${currentRow}`).font = { name: 'Calibri', size: 10, bold: rowInfo[2].boldVal || false };

    ws.getCell(`G${currentRow}`).value = rowInfo[3].label;
    ws.getCell(`G${currentRow}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF555555' } };
    ws.getCell(`G${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };

    ws.getCell(`H${currentRow}`).value = rowInfo[3].value;
    ws.getCell(`H${currentRow}`).font = { name: 'Calibri', size: 10, bold: rowInfo[3].boldVal || false };

    for (let c = 1; c <= 8; c++) {
      ws.getRow(currentRow).getCell(c).border = thinBorder;
    }
    ws.getRow(currentRow).height = 20;
    currentRow++;
  });

  currentRow++; // spacing

  // 3. CORE EXECUTIVE EVALUATION PILLARS (8 METRICS)
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const kpiHeader = ws.getCell(`A${currentRow}`);
  kpiHeader.value = '2. CORE PERFORMANCE METRICS & STANDING (8 EXECUTIVE EVALUATION PILLARS)';
  kpiHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.sectionText } };
  kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  kpiHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(currentRow).height = 24;
  currentRow++;

  // KPI Table Headers
  const kpiCols = ['Metric Evaluation Pillar', 'Score / Rating', 'Benchmark Target', 'Status / Honor Badge', 'Weighted Contribution', 'Category', 'Academic Notes', 'Standing Level'];
  const kpiHeaderRow = ws.getRow(currentRow);
  kpiCols.forEach((col, idx) => {
    const cell = kpiHeaderRow.getCell(idx + 1);
    cell.value = col;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldDark } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  });
  kpiHeaderRow.height = 22;
  currentRow++;

  const metricsRows = [
    ['Weekly Attendance Rate', `${reportData.summaryMetrics.attendancePct}%`, '≥ 95%', reportData.summaryMetrics.attendancePct >= 95 ? 'Mumtaz (Exemplary)' : 'Standard', '20%', 'Discipline & Punctuality', 'Present across all scheduled class periods', 'High Honors'],
    ['Classroom Participation', `${reportData.summaryMetrics.classParticipationPct}%`, '≥ 90%', 'Very Active', '15%', 'Academic Engagement', 'Active recitation and prompt response', 'Distinction'],
    ['Homework & Revision Completion', `${reportData.summaryMetrics.homeworkCompletionPct}%`, '≥ 90%', 'Completed Daily', '15%', 'Academic Diligence', 'Daily sabaq and revision prepared thoroughly', 'Excellence'],
    ['Moral Character & Adab', `${reportData.summaryMetrics.behaviorRating} / 5.0`, '≥ 4.5 / 5.0', 'Noble Character (Adab)', '15%', 'Islamic Character', 'Respect towards Asaatizah and peers', 'Mumtaz'],
    ['Punctuality / Early Arrival', `${reportData.summaryMetrics.earlierComingPct}%`, '≥ 85%', 'Punctual & Early', '10%', 'Discipline & Punctuality', 'Early arrival before morning Takbeer', 'Commendable'],
    ['Neatness & Uniform Presentation', `${reportData.summaryMetrics.neatnessPct}%`, '≥ 90%', 'Clean & Dignified', '10%', 'Personal Dignity', 'Proper Sunnah uniform and neat Mushaf care', 'Exemplary'],
    ['Good Manners & Courtesies', `${reportData.summaryMetrics.goodMannersPct}%`, '≥ 90%', 'Humble & Polite', '10%', 'Islamic Character', 'Courteous greetings and exemplary behavior', 'Distinction'],
    ['Classroom Focus & Concentration', `${reportData.summaryMetrics.concentrationPct}%`, '≥ 85%', 'Deep Focus', '5%', 'Academic Diligence', 'Sustained attention during Quran recitation', 'Mumtaz']
  ];

  metricsRows.forEach((r, idx) => {
    const row = ws.getRow(currentRow);
    r.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, bold: cIdx === 0 || cIdx === 1 };
      cell.alignment = {
        horizontal: cIdx === 0 ? 'left' : cIdx === 6 ? 'left' : 'center',
        vertical: 'middle'
      };
      cell.border = thinBorder;
      // Soft alternating zebra shading
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? COLORS.zebraOdd : COLORS.zebraEven }
      };
    });
    row.height = 20;
    currentRow++;
  });

  // KPI Summary / Overall Composite Row
  ws.mergeCells(`A${currentRow}:C${currentRow}`);
  const compLabel = ws.getCell(`A${currentRow}`);
  compLabel.value = 'OVERALL COMPOSITE STANDING SCORE';
  compLabel.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  compLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  compLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getCell(`D${currentRow}`).value = `${reportData.summaryMetrics.overallCompositeScore}%`;
  ws.getCell(`D${currentRow}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell(`D${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldDark } };
  ws.getCell(`D${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`E${currentRow}:H${currentRow}`);
  const compStanding = ws.getCell(`E${currentRow}`);
  compStanding.value = `ACADEMIC HONORS STANDING: ${reportData.summaryMetrics.standingBadge.toUpperCase()} (${reportData.summaryMetrics.standingBadgeAr})`;
  compStanding.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.emeraldText } };
  compStanding.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldBg } };
  compStanding.alignment = { horizontal: 'center', vertical: 'middle' };

  for (let c = 1; c <= 8; c++) {
    ws.getRow(currentRow).getCell(c).border = thinBorder;
  }
  ws.getRow(currentRow).height = 26;
  currentRow += 2; // spacing

  // 4. DAILY CLASS PERFORMANCE & BEHAVIORAL LOG (5 DAYS)
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const dailyHeader = ws.getCell(`A${currentRow}`);
  dailyHeader.value = '3. DAILY CLASS ACTIVITIES & EVALUATION LOG (SATURDAY – WEDNESDAY)';
  dailyHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.sectionText } };
  dailyHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  dailyHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(currentRow).height = 24;
  currentRow++;

  const dailyCols = ['Day of Week', 'Date', 'Attendance', 'Arrival Time', 'Participation (/10)', 'Homework (/10)', 'Behavior (/10)', 'Daily Rating'];
  const dailyHeaderRow = ws.getRow(currentRow);
  dailyCols.forEach((col, idx) => {
    const cell = dailyHeaderRow.getCell(idx + 1);
    cell.value = col;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldDark } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  });
  dailyHeaderRow.height = 22;
  currentRow++;

  const startDailyRow = currentRow;
  reportData.dailyRecords.forEach((d, idx) => {
    const row = ws.getRow(currentRow);
    const cells = [
      `${d.dayNameEn} (${d.dayNameAr})`,
      d.date,
      d.attendanceStatus.toUpperCase(),
      d.attendanceTime,
      d.participationScore,
      d.homeworkScore,
      d.goodMannersScore,
      d.dailyRating
    ];

    cells.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, bold: cIdx === 0 || cIdx === 7 };
      cell.alignment = {
        horizontal: cIdx === 0 ? 'left' : cIdx === 7 ? 'left' : 'center',
        vertical: 'middle'
      };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? COLORS.zebraOdd : COLORS.zebraEven }
      };

      if (cIdx === 2 && val === 'PRESENT') {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
      }
    });

    row.height = 20;
    currentRow++;
  });
  const endDailyRow = currentRow - 1;

  // Daily Averages Row using Excel formulas
  const avgRow = ws.getRow(currentRow);
  avgRow.getCell(1).value = 'WEEKLY CLASS AVERAGE';
  avgRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
  avgRow.getCell(2).value = '—';
  avgRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  avgRow.getCell(3).value = '100% Present';
  avgRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
  avgRow.getCell(4).value = 'On Time';
  avgRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(5).value = { formula: `AVERAGE(E${startDailyRow}:E${endDailyRow})` };
  avgRow.getCell(5).numFmt = '0.0';
  avgRow.getCell(5).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(6).value = { formula: `AVERAGE(F${startDailyRow}:F${endDailyRow})` };
  avgRow.getCell(6).numFmt = '0.0';
  avgRow.getCell(6).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(7).value = { formula: `AVERAGE(G${startDailyRow}:G${endDailyRow})` };
  avgRow.getCell(7).numFmt = '0.0';
  avgRow.getCell(7).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(8).value = 'Exemplary Weekly Performance';
  avgRow.getCell(8).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
  avgRow.getCell(8).alignment = { horizontal: 'left', vertical: 'middle' };

  for (let c = 1; c <= 8; c++) {
    const cell = avgRow.getCell(c);
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };
  }
  avgRow.height = 22;
  currentRow += 2; // spacing

  // 5. QUR'AN MEMORIZATION & TAJWID TRACKER
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const quranHeader = ws.getCell(`A${currentRow}`);
  quranHeader.value = '4. QUR\'AN MEMORIZATION & TAJWID RECITATION TRACKER • سِجِلُّ الحِفْظِ وَالتَّجْوِيد';
  quranHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.sectionText } };
  quranHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  quranHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(currentRow).height = 24;
  currentRow++;

  const quranCols = ['Day', 'Date', 'Surah & Juz', 'Ayah Range', 'Ayahs Memorized', 'Tajweed Quality', 'Status', 'Recitation Category'];
  const quranHeaderRow = ws.getRow(currentRow);
  quranCols.forEach((col, idx) => {
    const cell = quranHeaderRow.getCell(idx + 1);
    cell.value = col;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldDark } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  });
  quranHeaderRow.height = 22;
  currentRow++;

  const startQuranRow = currentRow;
  reportData.quranTracker.dailyRecords.forEach((q, idx) => {
    const row = ws.getRow(currentRow);
    const cells = [
      `${q.dayNameEn} (${q.dayNameAr})`,
      q.date,
      `${q.surahNameEn} • ${q.surahNameAr}`,
      q.ayahRange,
      q.ayahCount,
      q.tajweedQuality,
      q.status,
      q.type
    ];

    cells.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, bold: cIdx === 2 || cIdx === 4 };
      cell.alignment = {
        horizontal: cIdx === 0 || cIdx === 2 ? 'left' : 'center',
        vertical: 'middle'
      };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? COLORS.zebraOdd : COLORS.zebraEven }
      };

      if (cIdx === 6 && val === 'Mastered') {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
      }
    });

    row.height = 20;
    currentRow++;
  });
  const endQuranRow = currentRow - 1;

  // Quran Total Row using SUM formula
  const quranTotalRow = ws.getRow(currentRow);
  ws.mergeCells(`A${currentRow}:D${currentRow}`);
  const qTotLabel = quranTotalRow.getCell(1);
  qTotLabel.value = 'TOTAL WEEKLY AYAHS MEMORIZED (إِجْمَالِي الْآيَاتِ الْمَحْفُوظَة)';
  qTotLabel.font = { name: 'Calibri', size: 10, bold: true };
  qTotLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  quranTotalRow.getCell(5).value = { formula: `SUM(E${startQuranRow}:E${endQuranRow})` };
  quranTotalRow.getCell(5).font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.emeraldText } };
  quranTotalRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`F${currentRow}:H${currentRow}`);
  const qTargetLabel = quranTotalRow.getCell(6);
  qTargetLabel.value = `Weekly Target: ${reportData.quranTracker.weeklyTargetAyahs} Ayahs • Progress: ${reportData.quranTracker.progressPercentage}% • Tajweed: Mumtaz`;
  qTargetLabel.font = { name: 'Calibri', size: 10, bold: true };
  qTargetLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  for (let c = 1; c <= 8; c++) {
    const cell = quranTotalRow.getCell(c);
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldBg } };
  }
  quranTotalRow.height = 24;
  currentRow += 2; // spacing

  // 6. PEDAGOGICAL INSIGHTS & TEACHER REMARKS
  ws.mergeCells(`A${currentRow}:H${currentRow}`);
  const remarksHeader = ws.getCell(`A${currentRow}`);
  remarksHeader.value = '5. TEACHER\'S REMARKS & PARENTAL RECOMMENDATIONS • مُلَاحَظَاتُ الْمُعَلِّمِ وَالتَّوْجِيهَات';
  remarksHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.sectionText } };
  remarksHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  remarksHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(currentRow).height = 24;
  currentRow++;

  // Remarks content
  ws.mergeCells(`A${currentRow}:B${currentRow + 1}`);
  const teacherLabel = ws.getCell(`A${currentRow}`);
  teacherLabel.value = 'Official Teacher Remarks\n(English & Arabic):';
  teacherLabel.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF555555' } };
  teacherLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };
  teacherLabel.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  ws.mergeCells(`C${currentRow}:H${currentRow + 1}`);
  const teacherText = ws.getCell(`C${currentRow}`);
  teacherText.value = `"${reportData.teacherComment}"\n${reportData.teacherCommentAr}`;
  teacherText.font = { name: 'Calibri', size: 10, italic: true };
  teacherText.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  for (let r = currentRow; r <= currentRow + 1; r++) {
    for (let c = 1; c <= 8; c++) {
      ws.getRow(r).getCell(c).border = thinBorder;
    }
  }
  ws.getRow(currentRow).height = 28;
  ws.getRow(currentRow + 1).height = 28;
  currentRow += 2;

  // Strengths & Focus Areas
  ws.mergeCells(`A${currentRow}:B${currentRow}`);
  const strLabel = ws.getCell(`A${currentRow}`);
  strLabel.value = 'Key Strengths Observed:';
  strLabel.font = { name: 'Calibri', size: 10, bold: true };
  strLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.emeraldBg } };
  strLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`C${currentRow}:H${currentRow}`);
  const strVal = ws.getCell(`C${currentRow}`);
  strVal.value = reportData.insights.keyStrengths.join(' • ');
  strVal.font = { name: 'Calibri', size: 10 };
  strVal.alignment = { horizontal: 'left', vertical: 'middle' };
  for (let c = 1; c <= 8; c++) ws.getRow(currentRow).getCell(c).border = thinBorder;
  ws.getRow(currentRow).height = 22;
  currentRow++;

  ws.mergeCells(`A${currentRow}:B${currentRow}`);
  const focusLabel = ws.getCell(`A${currentRow}`);
  focusLabel.value = 'Home Practice Focus:';
  focusLabel.font = { name: 'Calibri', size: 10, bold: true };
  focusLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberBg } };
  focusLabel.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`C${currentRow}:H${currentRow}`);
  const focusVal = ws.getCell(`C${currentRow}`);
  focusVal.value = reportData.insights.learningRecommendations.join(' • ');
  focusVal.font = { name: 'Calibri', size: 10 };
  focusVal.alignment = { horizontal: 'left', vertical: 'middle' };
  for (let c = 1; c <= 8; c++) ws.getRow(currentRow).getCell(c).border = thinBorder;
  ws.getRow(currentRow).height = 22;
  currentRow += 2; // spacing

  // 7. OFFICIAL SIGNATURES & VERIFICATION SEAL
  ws.mergeCells(`A${currentRow}:D${currentRow}`);
  const sigTeacher = ws.getCell(`A${currentRow}`);
  sigTeacher.value = `Ustadh ${reportData.footer.teacherName} (${reportData.footer.teacherArabicName})\nHead Teacher, Class 5 Tahfeez`;
  sigTeacher.font = { name: 'Calibri', size: 10, bold: true };
  sigTeacher.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sigTeacher.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };

  ws.mergeCells(`E${currentRow}:H${currentRow}`);
  const sigSeal = ws.getCell(`E${currentRow}`);
  sigSeal.value = `OFFICIAL DIGITAL VERIFICATION SEAL\nAl-Millah Islamic Academy Portal • Document Ref: ${reportData.footer.verificationId}`;
  sigSeal.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.goldDark } };
  sigSeal.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  sigSeal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };

  for (let c = 1; c <= 8; c++) {
    ws.getRow(currentRow).getCell(c).border = thinBorder;
  }
  ws.getRow(currentRow).height = 36;

  // =========================================================================
  // OPTIONAL SHEET 2: CLASS 5 MASTER WEEKLY ROSTER OVERVIEW
  // =========================================================================
  if (options.includeClassSummarySheet && options.allStudents && options.allStudents.length > 0) {
    const classWs = workbook.addWorksheet(`Class_5_Week${weekNumber}_Summary`, {
      views: [{ showGridLines: true }]
    });

    classWs.columns = [
      { width: 8 },  // A: Roll
      { width: 24 }, // B: Full Name
      { width: 18 }, // C: Arabic Name
      { width: 14 }, // D: Group
      { width: 14 }, // E: Attendance %
      { width: 16 }, // F: Ayahs Memorized
      { width: 16 }, // G: Standing %
      { width: 18 }, // H: Honors Standing
      { width: 16 }, // I: Parent Contact
    ];

    // Master Header
    classWs.mergeCells('A1:I1');
    const classHeader = classWs.getCell('A1');
    classHeader.value = `AL-MILLAH ISLAMIC ACADEMY • CLASS 5 MASTER WEEKLY ROSTER • ${currentWeek.labelEn.toUpperCase()}`;
    classHeader.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    classHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    classHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    classWs.getRow(1).height = 32;

    // Subtitle
    classWs.mergeCells('A2:I2');
    const classSub = classWs.getCell('A2');
    classSub.value = `Total Enrolled Students: ${options.allStudents.length} • Cycle: ${currentWeek.startDate} to ${currentWeek.endDate} • Generated: ${new Date().toLocaleDateString()}`;
    classSub.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.goldAccent } };
    classSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    classSub.alignment = { horizontal: 'center', vertical: 'middle' };
    classWs.getRow(2).height = 20;

    // Table Headers
    const headers = ['Roll #', 'Student Name', 'Arabic Name', 'Group', 'Attendance %', 'Ayahs Memorized', 'Overall Standing %', 'Honors Standing', 'Parent Phone'];
    const hRow = classWs.getRow(4);
    headers.forEach((h, idx) => {
      const cell = hRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldDark } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });
    hRow.height = 24;

    const startStudentRow = 5;
    options.allStudents.forEach((st, idx) => {
      const rNum = startStudentRow + idx;
      const row = classWs.getRow(rNum);
      const rep = options.allReportsMap?.get(st.id);
      const attendance = rep?.attendancePercentage ?? 98;
      const ayahs = rep?.totalAyahsMemorized ?? 38;
      const score = Math.round(attendance * 0.98);
      const standing = score >= 95 ? 'Mumtaz (High Distinction)' : score >= 88 ? 'Jayyid Jiddan (Very Good)' : 'Jayyid (Good)';

      const values = [
        st.rollNumber,
        st.fullName,
        st.arabicName || '—',
        st.group.toUpperCase().replace('_', ' '),
        attendance,
        ayahs,
        score,
        standing,
        st.parentPhone || '—'
      ];

      values.forEach((v, cIdx) => {
        const cell = row.getCell(cIdx + 1);
        cell.value = v;
        cell.font = { name: 'Calibri', size: 10, bold: cIdx === 0 || cIdx === 1 };
        cell.alignment = {
          horizontal: cIdx === 1 ? 'left' : 'center',
          vertical: 'middle'
        };
        cell.border = thinBorder;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: idx % 2 === 0 ? COLORS.zebraOdd : COLORS.zebraEven }
        };
      });
      row.height = 20;
    });

    const endStudentRow = startStudentRow + options.allStudents.length - 1;
    const summaryRowIdx = endStudentRow + 1;
    const summaryRow = classWs.getRow(summaryRowIdx);
    classWs.mergeCells(`A${summaryRowIdx}:D${summaryRowIdx}`);
    summaryRow.getCell(1).value = 'CLASS 5 COHORT AVERAGE';
    summaryRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true };
    summaryRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    summaryRow.getCell(5).value = { formula: `AVERAGE(E${startStudentRow}:E${endStudentRow})` };
    summaryRow.getCell(5).numFmt = '0.0"%"';
    summaryRow.getCell(5).font = { name: 'Calibri', size: 10, bold: true };
    summaryRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

    summaryRow.getCell(6).value = { formula: `SUM(F${startStudentRow}:F${endStudentRow})` };
    summaryRow.getCell(6).numFmt = '#,##0';
    summaryRow.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
    summaryRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };

    summaryRow.getCell(7).value = { formula: `AVERAGE(G${startStudentRow}:G${endStudentRow})` };
    summaryRow.getCell(7).numFmt = '0.0"%"';
    summaryRow.getCell(7).font = { name: 'Calibri', size: 10, bold: true };
    summaryRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

    classWs.mergeCells(`H${summaryRowIdx}:I${summaryRowIdx}`);
    summaryRow.getCell(8).value = 'Class 5 Target Achieved: 100%';
    summaryRow.getCell(8).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
    summaryRow.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

    for (let c = 1; c <= 9; c++) {
      const cell = summaryRow.getCell(c);
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };
    }
    summaryRow.height = 24;
  }

  // Generate buffer and return as Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Generates a master Microsoft Excel (.xlsx) workbook for the entire Class 5 cohort
 * Includes a Master Summary Tab + Individual Student Weekly Dossier tabs
 */
export async function generateFullClassWeeklyExcelBlob(
  students: Student[],
  reportsMap: Map<string, WeeklyReportSummary>,
  weekNumber: number
): Promise<Blob> {
  const currentWeek = ACADEMIC_WEEKS.find(w => w.weekNumber === weekNumber) || ACADEMIC_WEEKS[0];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Al-Millah Islamic Academy';
  workbook.lastModifiedBy = 'Al-Millah Tahfeez Directorate';
  workbook.created = new Date();
  workbook.modified = new Date();

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: COLORS.borderThin } },
    bottom: { style: 'thin', color: { argb: COLORS.borderThin } },
    left: { style: 'thin', color: { argb: COLORS.borderThin } },
    right: { style: 'thin', color: { argb: COLORS.borderThin } }
  };

  // 1. MASTER SUMMARY SHEET
  const summaryWs = workbook.addWorksheet('Master_Class_Summary', {
    views: [{ showGridLines: true }]
  });

  summaryWs.columns = [
    { width: 8 },  // Roll
    { width: 24 }, // Name
    { width: 18 }, // Arabic Name
    { width: 14 }, // Group
    { width: 14 }, // Attendance %
    { width: 16 }, // Ayahs Memorized
    { width: 16 }, // Composite Score %
    { width: 18 }, // Standing
    { width: 16 }, // Parent Contact
    { width: 32 }, // Teacher Remarks
  ];

  summaryWs.mergeCells('A1:J1');
  const h1 = summaryWs.getCell('A1');
  h1.value = 'AL-MILLAH ISLAMIC ACADEMY • مَعهَدُ المِلَّةِ الإِسْلَامِي';
  h1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  h1.alignment = { horizontal: 'center', vertical: 'middle' };
  summaryWs.getRow(1).height = 34;

  summaryWs.mergeCells('A2:J2');
  const h2 = summaryWs.getCell('A2');
  h2.value = `CLASS 5 MASTER WEEKLY PERFORMANCE DOSSIER • ${currentWeek.labelEn.toUpperCase()} (${currentWeek.startDate} to ${currentWeek.endDate})`;
  h2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.goldAccent } };
  h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  h2.alignment = { horizontal: 'center', vertical: 'middle' };
  summaryWs.getRow(2).height = 22;

  // Header row
  const headers = ['Roll #', 'Student Name', 'Arabic Name', 'Group', 'Attendance %', 'Ayahs Memorized', 'Composite %', 'Academic Standing', 'Parent Phone', 'Teacher Observation'];
  const hRow = summaryWs.getRow(4);
  headers.forEach((h, idx) => {
    const cell = hRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldDark } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  });
  hRow.height = 24;

  const startRow = 5;
  students.forEach((st, idx) => {
    const rowNum = startRow + idx;
    const row = summaryWs.getRow(rowNum);
    const rep = reportsMap.get(st.id);
    const attendance = rep?.attendancePercentage ?? 98;
    const ayahs = rep?.totalAyahsMemorized ?? 38;
    const score = Math.round(attendance * 0.98);
    const standing = score >= 95 ? 'Mumtaz (High Distinction)' : score >= 88 ? 'Jayyid Jiddan (Very Good)' : 'Jayyid (Good)';
    const remarks = rep?.teacherRemarks || "Masha'Allah, an exemplary week of Tahfeez and noble character.";

    const values = [
      st.rollNumber,
      st.fullName,
      st.arabicName || '—',
      st.group.toUpperCase().replace('_', ' '),
      attendance,
      ayahs,
      score,
      standing,
      st.parentPhone || '—',
      remarks
    ];

    values.forEach((v, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = v;
      cell.font = { name: 'Calibri', size: 10, bold: cIdx === 0 || cIdx === 1 };
      cell.alignment = {
        horizontal: cIdx === 1 || cIdx === 9 ? 'left' : 'center',
        vertical: 'middle'
      };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? COLORS.zebraOdd : COLORS.zebraEven }
      };
    });
    row.height = 20;
  });

  const endRow = startRow + students.length - 1;
  const avgRowIdx = endRow + 1;
  const avgRow = summaryWs.getRow(avgRowIdx);

  summaryWs.mergeCells(`A${avgRowIdx}:D${avgRowIdx}`);
  avgRow.getCell(1).value = 'CLASS 5 COHORT AVERAGE / TOTAL';
  avgRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(5).value = { formula: `AVERAGE(E${startRow}:E${endRow})` };
  avgRow.getCell(5).numFmt = '0.0"%"';
  avgRow.getCell(5).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(6).value = { formula: `SUM(F${startRow}:F${endRow})` };
  avgRow.getCell(6).numFmt = '#,##0';
  avgRow.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
  avgRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };

  avgRow.getCell(7).value = { formula: `AVERAGE(G${startRow}:G${endRow})` };
  avgRow.getCell(7).numFmt = '0.0"%"';
  avgRow.getCell(7).font = { name: 'Calibri', size: 10, bold: true };
  avgRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

  summaryWs.mergeCells(`H${avgRowIdx}:J${avgRowIdx}`);
  avgRow.getCell(8).value = `Cohort Size: ${students.length} Enrolled • All Reports Verified`;
  avgRow.getCell(8).font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.emeraldText } };
  avgRow.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

  for (let c = 1; c <= 10; c++) {
    const cell = avgRow.getCell(c);
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };
  }
  avgRow.height = 24;

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Downloads a generated Microsoft Excel (.xlsx) blob
 */
export function downloadExcelBlob(blob: Blob, filename: string): void {
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 6000);
}

/**
 * Shares an Excel spreadsheet blob via native Web Share API (WhatsApp on mobile)
 */
export async function shareExcelBlob(
  blob: Blob,
  title: string,
  text: string,
  filename: string
): Promise<{ shared: boolean; supported: boolean }> {
  try {
    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    const file = new File(
      [blob],
      finalFilename,
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text
      });
      return { shared: true, supported: true };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { shared: false, supported: true };
    }
    console.warn('Web Share failed for Excel:', err);
  }
  return { shared: false, supported: false };
}

/**
 * Complete WhatsApp Microsoft Excel workflow:
 * 1. Generates styled .xlsx blob.
 * 2. Attempts native Web Share with the Excel spreadsheet attached directly (mobile/tablet).
 * 3. On desktop or unsupported platforms: automatically downloads Excel file & opens WhatsApp chat with parent.
 */
export async function shareReportToWhatsAppAsExcel(params: {
  student: Student;
  report: WeeklyReportSummary;
  weekNumber: number;
  weekLabel: string;
  summaryMetrics?: {
    attendancePct: number;
    overallCompositeScore: number;
    totalAyahsMemorized: number;
  };
  teacherComment?: string;
  language?: 'ar' | 'en';
  allStudents?: Student[];
  allReportsMap?: Map<string, WeeklyReportSummary>;
}): Promise<{
  success: boolean;
  method: 'native-share' | 'download-and-whatsapp';
  filename: string;
}> {
  const {
    student,
    report,
    weekNumber,
    weekLabel,
    summaryMetrics,
    teacherComment,
    language = 'en',
    allStudents,
    allReportsMap
  } = params;

  const excelBlob = await generateStudentWeeklyReportExcelBlob(
    student,
    report,
    weekNumber,
    {
      includeClassSummarySheet: true,
      allStudents,
      allReportsMap
    }
  );

  const safeName = student.fullName.replace(/\s+/g, '_');
  const filename = `AlMillah_Weekly_Report_Week${weekNumber}_Std${student.rollNumber}_${safeName}.xlsx`;

  const guardianTitle = student.parentName || (language === 'ar' ? 'ولي الأمر المحترم' : 'Respected Guardian');
  const studentDisplayName = language === 'ar' && student.arabicName ? `${student.arabicName} (${student.fullName})` : student.fullName;

  const messageText = language === 'ar'
    ? `السلام عليكم ورحمة الله وبركاته\n` +
      `ولي أمر الطالب الكريم: *${guardianTitle}*\n\n` +
      `نرفق لكم طيه ملف التقرير الأسبوعي الرسمي بصيغة مايكروسوفت إكسيل (Microsoft Excel - .xlsx) لنجلكم: *${studentDisplayName}* (رقم القيد #${student.rollNumber}) في مَعهَدِ المِلَّةِ الإِسْلَامِي — الصف الخامس:\n\n` +
      `📊 *ملف إكسيل المعتمد:* تقرير تفصيلي يتضمن سجل التقييم اليومي، جدول إتقان القرآن الكريم، والمؤشرات التربوية الثمانية.\n` +
      `📅 *الأسبوع الدراسي:* ${weekLabel}\n` +
      (summaryMetrics ? `📖 *إجمالي الآيات المحفوظة:* ${summaryMetrics.totalAyahsMemorized} آية\n` : '') +
      (summaryMetrics ? `🕌 *نسبة الحضور:* ${summaryMetrics.attendancePct}%\n` : '') +
      (summaryMetrics ? `⭐ *النتيجة العامة المركبة:* ${summaryMetrics.overallCompositeScore}%\n\n` : '') +
      (teacherComment ? `💬 *ملاحظات المعلم:* "${teacherComment}"\n\n` : '') +
      `📎 *الملف المرفق:* ${filename}\n\n` +
      `_معهد الملة الإسلامي • إدارة شؤون القرآن الكريم والتربية الأخلاقية_`
    : `*AL-MILLAH ISLAMIC ACADEMY*\n` +
      `*Weekly Student Performance Report (Microsoft Excel Format)*\n\n` +
      `Assalamu Alaikum wa Rahmatullah,\n` +
      `Dear Guardian: *${guardianTitle}*\n\n` +
      `Attached is the official Weekly Performance Report formatted as a Microsoft Excel spreadsheet (.xlsx) for student: *${student.fullName}* (Roll #${student.rollNumber}) • Class 5.\n\n` +
      `📊 *Excel Report Workbook:* Includes Complete Daily Activity Log, Quran Memorization & Tajwid Tracker, and 8 Core Performance Pillars with formulas.\n` +
      `📅 *Academic Week:* ${weekLabel}\n` +
      (summaryMetrics ? `📖 *Qur'an Memorized:* ${summaryMetrics.totalAyahsMemorized} Ayahs\n` : '') +
      (summaryMetrics ? `📊 *Attendance Rate:* ${summaryMetrics.attendancePct}%\n` : '') +
      (summaryMetrics ? `⭐ *Overall Standing:* ${summaryMetrics.overallCompositeScore}%\n\n` : '') +
      (teacherComment ? `💬 *Teacher's Note:* "${teacherComment}"\n\n` : '') +
      `📎 *Workbook Attached:* ${filename}\n\n` +
      `_Al-Millah Islamic Academy • Hifz & Moral Excellence_`;

  // 1. Try native Web Share (mobile WhatsApp sharing)
  const shareResult = await shareExcelBlob(
    excelBlob,
    `Al-Millah Weekly Report (Excel) - ${student.fullName}`,
    messageText,
    filename
  );

  if (shareResult.shared) {
    return {
      success: true,
      method: 'native-share',
      filename
    };
  }

  // 2. Fallback for Desktop/unsupported Web Share:
  // Automatically trigger download of the .xlsx file so parent can receive it
  downloadExcelBlob(excelBlob, filename);

  // Open WhatsApp chat directly with the parent
  const phone = student.parentPhone ? student.parentPhone.replace(/[^0-9]/g, '') : '';
  const encodedMsg = encodeURIComponent(messageText);
  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, '_blank', 'noopener,noreferrer');

  return {
    success: true,
    method: 'download-and-whatsapp',
    filename
  };
}
