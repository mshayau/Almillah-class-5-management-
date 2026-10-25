import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlignTable,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { Student, WeeklyReportSummary } from '../types';
import { StudentReportCardData, buildStudentReportCardData } from './studentReportGenerator';
import { ACADEMIC_WEEKS } from '../data/academicCalendar';

/**
 * Styling Palette constants matching Al-Millah Islamic Academy Luxury Theme
 */
const WORD_COLORS = {
  headerBg: '1A0F08',        // Deep obsidian brown
  headerText: 'FFFFFF',      // White
  goldAccent: 'DF9B52',      // Al-Millah Gold
  goldLight: 'FAEDD9',       // Pale gold
  goldDark: '854D2B',        // Bronze/brown
  sectionBg: '2A170D',       // Dark warm brown section headers
  sectionText: 'F7CB8B',     // Warm gold text
  tableHeaderBg: '2A170D',   // Table header row background
  tableHeaderText: 'F7CB8B', // Table header row text
  zebraEven: 'FBF9F6',       // Off-white zebra row
  zebraOdd: 'FFFFFF',        // Pure white zebra row
  emeraldBg: 'E6F4EA',       // Soft green
  emeraldText: '137333',     // Dark green
  amberBg: 'FEF7E0',         // Soft yellow/amber
  amberText: 'B06000',       // Dark amber
  borderThin: 'D5C5B5',      // Soft border
  borderDark: '854D2B',      // Dark accent border
  textDark: '1F1610',        // Dark body text
  textMuted: '6E5D53',       // Subdued gray text
  blueWord: '185ABD'         // Microsoft Word classic accent
};

// Standard cell border style
const defaultBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: WORD_COLORS.borderThin
};

const cellBorders = {
  top: defaultBorder,
  bottom: defaultBorder,
  left: defaultBorder,
  right: defaultBorder
};

const headerCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
  left: defaultBorder,
  right: defaultBorder
};

const bannerCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
  left: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
  right: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent }
};

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'auto'
};

const cleanBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder
};

// Helper: cell padding margins in dxa (1 pt = 20 dxa)
const cellMargins = {
  top: 140,    // 7pt
  bottom: 140, // 7pt
  left: 180,   // 9pt
  right: 180   // 9pt
};

const tightCellMargins = {
  top: 100,    // 5pt
  bottom: 100, // 5pt
  left: 120,   // 6pt
  right: 120   // 6pt
};

/**
 * Creates a styled table cell with padding, borders and optional shading
 */
function createStyledCell(options: {
  children: Paragraph[];
  shadingColor?: string;
  borders?: typeof cellBorders;
  widthPercent?: number;
  verticalAlign?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
  colSpan?: number;
  rowSpan?: number;
  margins?: typeof cellMargins;
}): TableCell {
  return new TableCell({
    children: options.children,
    width: options.widthPercent ? { size: options.widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: options.shadingColor ? { fill: options.shadingColor, type: ShadingType.CLEAR } : undefined,
    borders: options.borders || cellBorders,
    verticalAlign: options.verticalAlign || VerticalAlignTable.CENTER,
    columnSpan: options.colSpan,
    rowSpan: options.rowSpan,
    margins: options.margins || cellMargins
  });
}

/**
 * Creates a section header banner table
 */
function createSectionHeaderTable(titleEn: string, titleAr: string, subtitle?: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({
                    text: `◆  ${titleEn.toUpperCase()}  •  ${titleAr}  ◆`,
                    bold: true,
                    size: 21, // 10.5 pt
                    color: WORD_COLORS.sectionText,
                    font: 'Calibri'
                  })
                ]
              }),
              ...(subtitle ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 60 },
                  children: [
                    new TextRun({
                      text: subtitle,
                      italics: true,
                      size: 17, // 8.5 pt
                      color: WORD_COLORS.goldLight,
                      font: 'Calibri'
                    })
                  ]
                })
              ] : [])
            ],
            shadingColor: WORD_COLORS.sectionBg,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
              left: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent },
              right: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.goldAccent }
            },
            margins: tightCellMargins
          })
        ]
      })
    ]
  });
}

/**
 * Generates an executive Microsoft Word (.docx) document in structured tabular form for a student's weekly report
 */
export async function generateStudentWeeklyReportWordBlob(
  student: Student,
  report: WeeklyReportSummary,
  weekNumber: number
): Promise<Blob> {
  const currentWeek = ACADEMIC_WEEKS.find(w => w.weekNumber === weekNumber) || ACADEMIC_WEEKS[0];
  const reportData = buildStudentReportCardData(
    student,
    report,
    currentWeek.startDate,
    currentWeek.endDate,
    weekNumber
  );

  const spacer = new Paragraph({ spacing: { before: 140, after: 140 } });
  const smallSpacer = new Paragraph({ spacing: { before: 80, after: 80 } });

  // =========================================================================
  // TABLE 1: ACADEMY BANNER & DOCUMENT HEADER (Tabular Form)
  // =========================================================================
  const academyBannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 40 },
                children: [
                  new TextRun({
                    text: 'مَعهَدُ المِلَّةِ الإِسْلَامِي للتعليم والتربية القرآنية',
                    bold: true,
                    size: 26, // 13 pt
                    color: WORD_COLORS.goldLight,
                    font: 'Traditional Arabic'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: 'AL-MILLAH ISLAMIC ACADEMY',
                    bold: true,
                    size: 30, // 15 pt
                    color: 'FFFFFF',
                    font: 'Calibri'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 80 },
                children: [
                  new TextRun({
                    text: 'DIRECTORATE OF TAHFEEZ-UL-QURAN & CHARACTER DEVELOPMENT',
                    size: 18, // 9 pt
                    color: WORD_COLORS.goldAccent,
                    bold: true,
                    font: 'Calibri'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120 },
                children: [
                  new TextRun({
                    text: `OFFICIAL WEEKLY PERFORMANCE DOSSIER • التقرير الأسبوعي الشامل لمتابعة الطالب (الأسبوع ${weekNumber})`,
                    bold: true,
                    size: 21,
                    color: 'FFFFFF',
                    font: 'Calibri'
                  })
                ]
              })
            ],
            shadingColor: WORD_COLORS.headerBg,
            borders: bannerCellBorders,
            margins: cellMargins
          })
        ]
      })
    ]
  });

  // =========================================================================
  // TABLE 2: STUDENT PARTICULARS & ACADEMIC CALENDAR (Tabular Form)
  // =========================================================================
  const studentInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Row 1: Student Name, Roll #, Group, Grade
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Student Name / اسم الطالب:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: student.fullName, bold: true, size: 21, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: student.arabicName ? `  (${student.arabicName})` : '', bold: true, size: 21, color: WORD_COLORS.goldDark, font: 'Traditional Arabic' })
                ]
              })
            ],
            widthPercent: 36,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Roll & Student ID / رقم القيد:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: `ALM-2026-${String(student.rollNumber).padStart(3, '0')} (Roll #${student.rollNumber})`, bold: true, size: 20, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 24,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Halaqah Group / الحلقة:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: student.group.replace('_', ' ').toUpperCase(), bold: true, size: 20, color: WORD_COLORS.goldDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 20,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Grade Level / الصف:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: 'Class 5 (الصف الخامس)', bold: true, size: 20, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 20,
            shadingColor: 'FFFFFF'
          })
        ]
      }),
      // Row 2: Academic Week, Hijri Range, Gregorian Date Range, Parent Name & Phone
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Academic Week / الأسبوع الدراسي:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: `${currentWeek.labelEn} • ${currentWeek.labelAr}`, bold: true, size: 19, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 36,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Calendar Dates / التواريخ:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: currentWeek.datesFormattedEn, bold: true, size: 19, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 24,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Hijri Period / التاريخ الهجري:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: currentWeek.hijriRangeEn, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 20,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Parent / ولي الأمر:', bold: true, size: 17, color: WORD_COLORS.textMuted, font: 'Calibri' }),
                  new TextRun({ text: '\n' }),
                  new TextRun({ text: student.parentName || 'Parent / Guardian', bold: true, size: 19, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: student.parentPhone ? ` (${student.parentPhone})` : '', size: 16, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 20,
            shadingColor: WORD_COLORS.zebraEven
          })
        ]
      })
    ]
  });

  // =========================================================================
  // TABLE 3: EXECUTIVE SUMMARY & CORE METRICS (Tabular Form)
  // =========================================================================
  const summaryHeaderTable = createSectionHeaderTable(
    'I. Executive Performance Summary',
    'الملخص التنفيذي للأداء الأسبوعي',
    'Comprehensive aggregated metrics calculated over 5 academic instructional days'
  );

  const metricsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Table Header
      new TableRow({
        children: [
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Standing Badge\nالرتبة الأسبوعية', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 15,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Composite Score\nالنتيجة العامة', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 13,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Attendance\nنسبة الحضور', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 12,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ayahs Memorized\nالآيات المحفوظة', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 14,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Homework\nإنجاز الواجبات', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 11,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Punctuality\nالانضباط والمبايعة', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 11,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Good Manners\nحسن الخلق والأدب', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 12,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Focus & Neatness\nالتركيز والهندام', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
            widthPercent: 12,
            shadingColor: WORD_COLORS.tableHeaderBg,
            borders: headerCellBorders
          })
        ]
      }),
      // Table Data Values
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: reportData.summaryMetrics.standingBadge.toUpperCase(), bold: true, size: 19, color: WORD_COLORS.emeraldText, font: 'Calibri' }),
                  new TextRun({ text: `\n${reportData.summaryMetrics.standingBadgeAr}`, bold: true, size: 18, color: WORD_COLORS.emeraldText, font: 'Traditional Arabic' })
                ]
              })
            ],
            widthPercent: 15,
            shadingColor: WORD_COLORS.emeraldBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.summaryMetrics.overallCompositeScore}%`, bold: true, size: 24, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\nGrade A+', size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 13,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.summaryMetrics.attendancePct}%`, bold: true, size: 22, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\n(5/5 Days)', size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 12,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.quranTracker.totalAyahsMemorized}`, bold: true, size: 24, color: WORD_COLORS.goldDark, font: 'Calibri' }),
                  new TextRun({ text: ` / ${reportData.quranTracker.weeklyTargetAyahs} Ayahs\nTarget: 100% Met`, size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 14,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.summaryMetrics.homeworkCompletionPct}%`, bold: true, size: 20, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\nExcellent', size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 11,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.summaryMetrics.earlierComingPct}%`, bold: true, size: 20, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\nOn Time', size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 11,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.summaryMetrics.goodMannersPct}%`, bold: true, size: 20, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: `\n${reportData.summaryMetrics.behaviorRating} / 5.0 ★`, size: 15, color: WORD_COLORS.amberText, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 12,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${reportData.summaryMetrics.concentrationPct}%`, bold: true, size: 20, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: `\nNeat: ${reportData.summaryMetrics.neatnessPct}%`, size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 12,
            shadingColor: WORD_COLORS.zebraEven
          })
        ]
      })
    ]
  });

  // =========================================================================
  // TABLE: QUR'AN MEMORIZATION RESULT (Tabular Form)
  // =========================================================================
  const quranHeaderTable = createSectionHeaderTable(
    'I. Qur\'an Memorization Result',
    'نتيجة حفظ القرآن الكريم',
    `Prescribed Tahfeez Curriculum: ${currentWeek.targetSurahEn} (${currentWeek.targetSurahAr}) • Juz ${reportData.quranTracker.currentJuz || 30}`
  );

  const quranTableRows: TableRow[] = [
    // Header Row
    new TableRow({
      children: [
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Day & Date\nاليوم والتاريخ', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 15,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Category\nنوع التسميع', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 13,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Surah Name\nاسم السورة الكريمة', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 22,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ayah Range\nنطاق الآيات', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 15,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ayahs\nعدد الآيات', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 11,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tajweed Quality\nجودة وأحكام التجويد', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 12,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Evaluation Status\nحالة الاعتماد', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 12,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        })
      ]
    })
  ];

  // Populate daily Quran records (Sat - Wed)
  reportData.quranTracker.dailyRecords.forEach((rec, idx) => {
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? WORD_COLORS.zebraEven : 'FFFFFF';

    quranTableRows.push(
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: rec.dayNameEn, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: ` (${rec.dayNameAr})\n`, size: 16, color: WORD_COLORS.goldDark, font: 'Traditional Arabic' }),
                  new TextRun({ text: rec.date, size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 15,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: rec.type === 'Sabaq' ? 'Sabaq (New Lesson)\nالسبق (الحفظ الجديد)' :
                          rec.type === 'Sabqi' ? 'Sabqi (Recent Review)\nالسبقي (المراجعة القريبة)' :
                          'Manzil (Full Retention)\nالمنزل (المراجعة الكلية)',
                    bold: true,
                    size: 16,
                    color: rec.type === 'Sabaq' ? WORD_COLORS.goldDark : WORD_COLORS.textDark,
                    font: 'Calibri'
                  })
                ]
              })
            ],
            widthPercent: 13,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: rec.surahNameEn, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: `\n${rec.surahNameAr}`, bold: true, size: 18, color: WORD_COLORS.goldDark, font: 'Traditional Arabic' })
                ]
              })
            ],
            widthPercent: 22,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: rec.ayahRange, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 15,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${rec.ayahCount} Ayahs`, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 11,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: rec.tajweedQuality,
                    bold: true,
                    size: 17,
                    color: rec.tajweedQuality === 'Mumtaz' ? WORD_COLORS.emeraldText : WORD_COLORS.amberText,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: rec.tajweedQuality === 'Mumtaz' ? '\nممتاز ومتقن' : '\nجيد جداً',
                    size: 15,
                    color: WORD_COLORS.textMuted,
                    font: 'Traditional Arabic'
                  })
                ]
              })
            ],
            widthPercent: 12,
            shadingColor: rec.tajweedQuality === 'Mumtaz' ? WORD_COLORS.emeraldBg : rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: rec.status === 'Mastered' ? 'Mastered ✓' : rec.status === 'Passed' ? 'Passed ✓' : 'Revision Required',
                    bold: true,
                    size: 17,
                    color: rec.status === 'Mastered' ? WORD_COLORS.emeraldText : WORD_COLORS.goldDark,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: rec.status === 'Mastered' ? '\nمعتمد بنجاح' : '\nمقبول',
                    size: 15,
                    color: WORD_COLORS.textMuted,
                    font: 'Traditional Arabic'
                  })
                ]
              })
            ],
            widthPercent: 12,
            shadingColor: rowBg
          })
        ]
      })
    );
  });

  // Quran Weekly Totals Row
  quranTableRows.push(
    new TableRow({
      children: [
        createStyledCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'WEEKLY TOTALS & TARGET ACHIEVEMENT / حصيلة الأسبوع الإجمالية:',
                  bold: true,
                  size: 18,
                  color: WORD_COLORS.goldDark,
                  font: 'Calibri'
                })
              ]
            })
          ],
          widthPercent: 50,
          colSpan: 3,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Weekly Target: ${reportData.quranTracker.weeklyTargetAyahs} Ayahs`,
                  bold: true,
                  size: 17,
                  color: WORD_COLORS.textDark,
                  font: 'Calibri'
                })
              ]
            })
          ],
          widthPercent: 15,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${reportData.quranTracker.totalAyahsMemorized} Ayahs`,
                  bold: true,
                  size: 20,
                  color: WORD_COLORS.emeraldText,
                  font: 'Calibri'
                })
              ]
            })
          ],
          widthPercent: 11,
          shadingColor: WORD_COLORS.emeraldBg
        }),
        createStyledCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: '100% Target Met\nمتحقق بالكامل',
                  bold: true,
                  size: 16,
                  color: WORD_COLORS.emeraldText,
                  font: 'Calibri'
                })
              ]
            })
          ],
          widthPercent: 24,
          colSpan: 2,
          shadingColor: WORD_COLORS.emeraldBg
        })
      ]
    })
  );

  const quranTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: quranTableRows
  });

  // =========================================================================
  // TABLE: DAILY ACTIVITIES RESULT (Tabular Form)
  // =========================================================================
  const activitiesHeaderTable = createSectionHeaderTable(
    'II. Daily Activities Result',
    'نتيجة الأنشطة اليومية',
    'Daily evaluation across attendance, punctuality, homework, neatness, and peer manners'
  );

  const activitiesTableRows: TableRow[] = [
    // Header Row
    new TableRow({
      children: [
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Day\nاليوم', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 12,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Date\nالتاريخ', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Attendance\nحالة الحضور', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 14,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Punctuality\nالانضباط', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Homework\nالواجبات', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Focus\nالتركيز', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 9,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Manners\nحسن الخلق', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 11,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Neatness\nالهندام', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Daily Standing\nالتقييم اليومي', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 14,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        })
      ]
    })
  ];

  // Daily rows
  reportData.dailyRecords.forEach((d, idx) => {
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? WORD_COLORS.zebraEven : 'FFFFFF';

    activitiesTableRows.push(
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: d.dayNameEn, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: `\n${d.dayNameAr}`, size: 16, color: WORD_COLORS.goldDark, font: 'Traditional Arabic' })
                ]
              })
            ],
            widthPercent: 12,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: d.date, size: 16, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 10,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Present (حاضر)', bold: true, size: 16, color: WORD_COLORS.emeraldText, font: 'Calibri' }),
                  new TextRun({ text: `\n${d.attendanceTime || '07:45 AM'}`, size: 14, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 14,
            shadingColor: WORD_COLORS.emeraldBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${d.earlierComingScore}/10`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 10,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${d.homeworkScore}/10`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 10,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${d.concentrationScore}/10`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 9,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${d.goodMannersScore}/10`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 11,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${d.neatnessScore}/10`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 10,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: d.dailyRating, bold: true, size: 16, color: WORD_COLORS.emeraldText, font: 'Calibri' }),
                  new TextRun({ text: `\n${'★'.repeat(d.dailyRatingStars)} (${d.dailyRatingStars}/5)`, size: 15, color: WORD_COLORS.amberText, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 14,
            shadingColor: WORD_COLORS.emeraldBg
          })
        ]
      })
    );
  });

  // Weekly Averages Row
  activitiesTableRows.push(
    new TableRow({
      children: [
        createStyledCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'WEEKLY AGGREGATE AVERAGE / المعدل التراكمي الأسبوعي:',
                  bold: true,
                  size: 17,
                  color: WORD_COLORS.goldDark,
                  font: 'Calibri'
                })
              ]
            })
          ],
          widthPercent: 36,
          colSpan: 3,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${reportData.summaryMetrics.earlierComingPct}%`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${reportData.summaryMetrics.homeworkCompletionPct}%`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${reportData.summaryMetrics.concentrationPct}%`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
          widthPercent: 9,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${reportData.summaryMetrics.goodMannersPct}%`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
          widthPercent: 11,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${reportData.summaryMetrics.neatnessPct}%`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.goldLight
        }),
        createStyledCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Mumtaz (${reportData.summaryMetrics.overallCompositeScore}%)`, bold: true, size: 17, color: WORD_COLORS.emeraldText, font: 'Calibri' })
              ]
            })
          ],
          widthPercent: 14,
          shadingColor: WORD_COLORS.emeraldBg
        })
      ]
    })
  );

  const activitiesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: activitiesTableRows
  });

  // =========================================================================
  // TABLE 6: CHARACTER & ACADEMIC RUBRIC (8 Pillars Rubric in Tabular Form)
  // =========================================================================
  const rubricHeaderTable = createSectionHeaderTable(
    'IV. Core Character & Tahfeez Competency Assessment',
    'تقييم أركان الكفاءة الأخلاقية والتحصيلية الثمانية',
    'Standardized performance rubric evaluating spiritual and academic benchmarks'
  );

  const pillarsList = [
    { en: '1. Regular Attendance & Commitment', ar: 'المواظبة على الحضور والالتزام', score: `${reportData.summaryMetrics.attendancePct}%`, rating: 'Mumtaz (Distinction)', desc: 'Full punctuality and active presence in daily study circles.' },
    { en: '2. Daily Qur\'an Sabaq Retention', ar: 'حفظ واستيعاب السبق اليومي الجديد', score: `${reportData.quranTracker.totalAyahsMemorized} Ayahs`, rating: 'Exemplary Mastered', desc: 'Flawless recall with accurate articulation of makharij.' },
    { en: '3. Sabqi & Manzil Revision Rigor', ar: 'المراجعة المستمرة للسبقي والمنزل', score: '100% Target', rating: 'High Retention', desc: 'Diligent retention of previously memorized juz.' },
    { en: '4. Homework & Task Completion', ar: 'إنجاز الواجبات والمهام الموكلة', score: `${reportData.summaryMetrics.homeworkCompletionPct}%`, rating: 'Complete & Neat', desc: 'Consistent completion of at-home recitation assignments.' },
    { en: '5. Islamic Adab & Classroom Etiquette', ar: 'الأدب الإسلامي وحسن المعاملة', score: `${reportData.summaryMetrics.goodMannersPct}%`, rating: 'Mumtaz (5.0/5)', desc: 'Nobility in speech, respect for teachers and kindness to peers.' },
    { en: '6. Early Arrival & Halaqah Punctuality', ar: 'التبكير والانضباط في موعد الحلقة', score: `${reportData.summaryMetrics.earlierComingPct}%`, rating: 'Prompt & Prepared', desc: 'Consistently seated and prepared before the opening du\'a.' },
    { en: '7. Personal Neatness & Uniform Elegance', ar: 'النظافة الشخصية والهندام الإسلامي', score: `${reportData.summaryMetrics.neatnessPct}%`, rating: 'Pristine & Clean', desc: 'Impeccable academy thobe, grooming, and book care.' },
    { en: '8. Focus & Reverence in Recitation', ar: 'الخشوع والتركيز أثناء التلاوة', score: `${reportData.summaryMetrics.concentrationPct}%`, rating: 'Attentive & Focused', desc: 'Deep contemplation and undisturbed concentration in halaqah.' }
  ];

  const rubricTableRows: TableRow[] = [
    new TableRow({
      children: [
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Competency Pillar / معيار التقييم', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 38,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Score / النتيجة', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 16,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Standing Level / التقدير', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 20,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Evaluative Observation / الملاحظة التربوية', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 26,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        })
      ]
    })
  ];

  pillarsList.forEach((pillar, idx) => {
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? WORD_COLORS.zebraEven : 'FFFFFF';

    rubricTableRows.push(
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: pillar.en, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: `\n${pillar.ar}`, size: 15, color: WORD_COLORS.goldDark, font: 'Traditional Arabic' })
                ]
              })
            ],
            widthPercent: 38,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: pillar.score, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 16,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: pillar.rating, bold: true, size: 16, color: WORD_COLORS.emeraldText, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 20,
            shadingColor: WORD_COLORS.emeraldBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: pillar.desc, size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 26,
            shadingColor: rowBg
          })
        ]
      })
    );
  });

  const rubricTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rubricTableRows
  });

  // =========================================================================
  // TABLE: TEACHER'S REMARK (Tabular Form)
  // =========================================================================
  const remarksHeaderTable = createSectionHeaderTable(
    'III. Teacher\'s Remark',
    'ملاحظة المعلم',
    'Evaluative remark by class teacher'
  );

  const remarksTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                spacing: { before: 80, after: 80 },
                children: [
                  new TextRun({
                    text: 'Teacher\'s Remark / ملاحظة المعلم:',
                    bold: true,
                    size: 18,
                    color: WORD_COLORS.goldDark,
                    font: 'Calibri'
                  }),
                  new TextRun({ text: '\n\n' }),
                  new TextRun({
                    text: `"${reportData.teacherComment}"`,
                    bold: true,
                    italics: true,
                    size: 19,
                    color: WORD_COLORS.textDark,
                    font: 'Calibri'
                  }),
                  ...(reportData.teacherCommentAr ? [
                    new TextRun({ text: '\n\n' }),
                    new TextRun({
                      text: `"${reportData.teacherCommentAr}"`,
                      bold: true,
                      size: 19,
                      color: WORD_COLORS.goldDark,
                      font: 'Traditional Arabic'
                    })
                  ] : [])
                ]
              })
            ],
            widthPercent: 100,
            shadingColor: WORD_COLORS.zebraEven
          })
        ]
      })
    ]
  });

  // =========================================================================
  // TABLE 8: INSTITUTIONAL VERIFICATION & SIGNOFF (Tabular Form)
  // =========================================================================
  const signoffTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({ text: 'Ustadh & Halaqah Lead / معلم الحلقة', bold: true, size: 17, color: WORD_COLORS.goldDark, font: 'Calibri' }),
                  new TextRun({ text: `\n${reportData.footer.teacherName} (${reportData.footer.teacherArabicName})`, bold: true, size: 18, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\n\n_________________________________\nOfficial Signature & Date', size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 34,
            shadingColor: WORD_COLORS.zebraEven
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({ text: 'Director of Tahfeez / مدير شؤون التحفيظ', bold: true, size: 17, color: WORD_COLORS.goldDark, font: 'Calibri' }),
                  new TextRun({ text: '\nSheikh Dr. Ahmad Al-Ansari\n(فضيلة الشيخ د. أحمد الأنصاري)', bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\n\n[ ACADEMY EMBOSSED SEAL ]\nApproved & Certified', size: 14, color: WORD_COLORS.emeraldText, bold: true, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 33,
            shadingColor: 'FFFFFF'
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({ text: 'Parent / Guardian Acknowledgment\nإقرار واطلاع ولي الأمر', bold: true, size: 17, color: WORD_COLORS.goldDark, font: 'Calibri' }),
                  new TextRun({ text: `\n${student.parentName || 'Parent / Guardian Signature'}`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' }),
                  new TextRun({ text: '\n\n_________________________________\nParent Signature & Date', size: 15, color: WORD_COLORS.textMuted, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 33,
            shadingColor: WORD_COLORS.zebraEven
          })
        ]
      })
    ]
  });

  // Footer document reference note
  const verificationParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 140, after: 80 },
    children: [
      new TextRun({
        text: `Official Document Verification Code: ${reportData.footer.verificationId}  •  Issued on: ${reportData.footer.reportDateFormatted}  •  Al-Millah Islamic Academy`,
        size: 15,
        color: WORD_COLORS.textMuted,
        font: 'Calibri'
      })
    ]
  });

  // Assemble full Word Document
  const doc = new Document({
    creator: 'Al-Millah Islamic Academy',
    description: `Official Weekly Student Performance Dossier for ${student.fullName} (Week ${weekNumber})`,
    title: `Weekly Report - ${student.fullName} - Week ${weekNumber}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch (720 dxa)
              bottom: 720, // 0.5 inch
              left: 720,   // 0.5 inch
              right: 720   // 0.5 inch
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Al-Millah Islamic Academy  |  Official Weekly Report  |  Class 5 Tahfeez',
                    size: 14,
                    color: WORD_COLORS.textMuted,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 15,
                    color: WORD_COLORS.textMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 15,
                    bold: true,
                    color: WORD_COLORS.textMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 15,
                    color: WORD_COLORS.textMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 15,
                    bold: true,
                    color: WORD_COLORS.textMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: `  •  Student: ${student.fullName} (Roll #${student.rollNumber})  •  Confidential Academic Record`,
                    size: 14,
                    color: WORD_COLORS.textMuted,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        children: [
          academyBannerTable,
          smallSpacer,
          studentInfoTable,
          spacer,
          quranHeaderTable,
          smallSpacer,
          quranTable,
          spacer,
          activitiesHeaderTable,
          smallSpacer,
          activitiesTable,
          spacer,
          remarksHeaderTable,
          smallSpacer,
          remarksTable
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates a full Class Master Microsoft Word (.docx) document in tabular form containing
 * all 25 students' weekly records and classwide analytical comparisons.
 */
export async function generateClassWeeklyReportWordBlob(
  students: Student[],
  reportsMap: Map<string, WeeklyReportSummary>,
  weekNumber: number
): Promise<Blob> {
  const currentWeek = ACADEMIC_WEEKS.find(w => w.weekNumber === weekNumber) || ACADEMIC_WEEKS[0];

  const spacer = new Paragraph({ spacing: { before: 140, after: 140 } });
  const smallSpacer = new Paragraph({ spacing: { before: 80, after: 80 } });

  // 1. Academy Class Banner Table
  const classBannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 40 },
                children: [
                  new TextRun({
                    text: 'مَعهَدُ المِلَّةِ الإِسْلَامِي • السِّجِلُّ الشَّامِلُ لِطُلَّابِ الصَّفِّ الخَامِسِ',
                    bold: true,
                    size: 26,
                    color: WORD_COLORS.goldLight,
                    font: 'Traditional Arabic'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: 'AL-MILLAH ISLAMIC ACADEMY — CLASS FIVE MASTER WEEKLY DOSSIER',
                    bold: true,
                    size: 28,
                    color: 'FFFFFF',
                    font: 'Calibri'
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 100 },
                children: [
                  new TextRun({
                    text: `Academic Period: ${currentWeek.labelEn} (${currentWeek.datesFormattedEn})  •  Halaqat: Abu Bakr, Umar, Uthman, Ali  •  Total Students: ${students.length}`,
                    size: 18,
                    color: WORD_COLORS.goldAccent,
                    bold: true,
                    font: 'Calibri'
                  })
                ]
              })
            ],
            shadingColor: WORD_COLORS.headerBg,
            borders: bannerCellBorders,
            margins: cellMargins
          })
        ]
      })
    ]
  });

  // Calculate class aggregates
  let totalAttendance = 0;
  let totalAyahs = 0;
  let mumtazCount = 0;

  students.forEach(st => {
    const rep = reportsMap.get(st.id);
    const att = rep?.attendancePercentage ?? 96;
    const ayahs = rep?.totalAyahsMemorized ?? 38;
    totalAttendance += att;
    totalAyahs += ayahs;
    if (att >= 95) mumtazCount++;
  });

  const avgAttendance = Math.round(totalAttendance / (students.length || 1));

  // 2. Class KPI Overview Table
  const kpiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Enrolled Students\nإجمالي الطلاب', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' }),
                  new TextRun({ text: `\n${students.length}`, bold: true, size: 26, color: 'FFFFFF', font: 'Calibri' }),
                  new TextRun({ text: '\nClass 5 Active Roster', size: 15, color: WORD_COLORS.goldLight, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 25,
            shadingColor: WORD_COLORS.sectionBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Average Attendance\nمعدل حضور الصف', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' }),
                  new TextRun({ text: `\n${avgAttendance}%`, bold: true, size: 26, color: WORD_COLORS.emeraldBg, font: 'Calibri' }),
                  new TextRun({ text: '\nExemplary Record', size: 15, color: WORD_COLORS.goldLight, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 25,
            shadingColor: WORD_COLORS.sectionBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Total Ayahs Recited\nمجموع الآيات المحفوظة', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' }),
                  new TextRun({ text: `\n${totalAyahs}`, bold: true, size: 26, color: 'FFFFFF', font: 'Calibri' }),
                  new TextRun({ text: `\n${currentWeek.targetSurahEn}`, size: 15, color: WORD_COLORS.goldLight, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 25,
            shadingColor: WORD_COLORS.sectionBg
          }),
          createStyledCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Mumtaz Scholars\nمرتبة الامتياز', bold: true, size: 17, color: WORD_COLORS.tableHeaderText, font: 'Calibri' }),
                  new TextRun({ text: `\n${mumtazCount} / ${students.length}`, bold: true, size: 26, color: WORD_COLORS.goldAccent, font: 'Calibri' }),
                  new TextRun({ text: '\nTop Distinction Tier', size: 15, color: WORD_COLORS.goldLight, font: 'Calibri' })
                ]
              })
            ],
            widthPercent: 25,
            shadingColor: WORD_COLORS.sectionBg
          })
        ]
      })
    ]
  });

  // 3. Class Roster Master Table
  const masterHeaderTable = createSectionHeaderTable(
    'Class 5 Complete Weekly Performance Ledger',
    'جدول الرصد العام لجميع طلاب الصف الخامس',
    'Individual metrics sorted by Student Roll Number'
  );

  const rosterTableRows: TableRow[] = [
    new TableRow({
      children: [
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Roll #\nالرقم', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 8,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Student Name\nاسم الطالب', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 24,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Arabic Name\nالاسم بالعربية', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 16,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Halaqah\nالحلقة', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 12,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Attendance\nالحضور', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 12,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ayahs\nالآيات', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 10,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        }),
        createStyledCell({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Standing\nالرتبة', bold: true, size: 16, color: WORD_COLORS.tableHeaderText, font: 'Calibri' })] })],
          widthPercent: 18,
          shadingColor: WORD_COLORS.tableHeaderBg,
          borders: headerCellBorders
        })
      ]
    })
  ];

  students.forEach((st, idx) => {
    const rep = reportsMap.get(st.id);
    const att = rep?.attendancePercentage ?? 96;
    const ayahs = rep?.totalAyahsMemorized ?? 38;
    const standing = att >= 95 ? 'Mumtaz (Distinction)' : 'Jayyid Jiddan (Very Good)';
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? WORD_COLORS.zebraEven : 'FFFFFF';

    rosterTableRows.push(
      new TableRow({
        children: [
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(st.rollNumber), bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
            widthPercent: 8,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [new Paragraph({ children: [new TextRun({ text: st.fullName, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
            widthPercent: 24,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [new Paragraph({ children: [new TextRun({ text: st.arabicName || '—', size: 17, color: WORD_COLORS.goldDark, font: 'Traditional Arabic' })] })],
            widthPercent: 16,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: st.group.replace('_', ' ').toUpperCase(), size: 16, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
            widthPercent: 12,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${att}%`, bold: true, size: 17, color: WORD_COLORS.textDark, font: 'Calibri' })] })],
            widthPercent: 12,
            shadingColor: att >= 95 ? WORD_COLORS.emeraldBg : rowBg
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${ayahs}`, bold: true, size: 17, color: WORD_COLORS.goldDark, font: 'Calibri' })] })],
            widthPercent: 10,
            shadingColor: rowBg
          }),
          createStyledCell({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: standing, bold: true, size: 16, color: att >= 95 ? WORD_COLORS.emeraldText : WORD_COLORS.amberText, font: 'Calibri' })] })],
            widthPercent: 18,
            shadingColor: att >= 95 ? WORD_COLORS.emeraldBg : WORD_COLORS.amberBg
          })
        ]
      })
    );
  });

  const rosterTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rosterTableRows
  });

  const doc = new Document({
    creator: 'Al-Millah Islamic Academy',
    description: `Class Five Master Weekly Performance Dossier (Week ${weekNumber})`,
    title: `Class 5 Master Weekly Report - Week ${weekNumber}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children: [
          classBannerTable,
          smallSpacer,
          kpiTable,
          spacer,
          masterHeaderTable,
          smallSpacer,
          rosterTable
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Downloads a Word .docx Blob to the client's file system
 */
export function downloadWordBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Shares or downloads the weekly report in Microsoft Word (.docx) format for WhatsApp
 */
export async function shareReportToWhatsAppAsWord(params: {
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
    language = 'en'
  } = params;

  const wordBlob = await generateStudentWeeklyReportWordBlob(
    student,
    report,
    weekNumber
  );

  const safeName = student.fullName.replace(/\s+/g, '_');
  const filename = `AlMillah_Weekly_Report_Week${weekNumber}_Std${student.rollNumber}_${safeName}.docx`;

  const guardianTitle = student.parentName || (language === 'ar' ? 'ولي الأمر المحترم' : 'Respected Guardian');
  const studentDisplayName = language === 'ar' && student.arabicName ? `${student.arabicName} (${student.fullName})` : student.fullName;

  const messageText = language === 'ar'
    ? `السلام عليكم ورحمة الله وبركاته\n` +
      `ولي أمر الطالب الكريم: *${guardianTitle}*\n\n` +
      `نرفق لكم طيه تقرير الأسبوع لنجلكم: *${studentDisplayName}* (رقم #${student.rollNumber}) في مَعهَدِ المِلَّةِ الإِسْلَامِي — الصف الخامس:\n\n` +
      `📖 *نتيجة حفظ القرآن الكريم:* ${report.totalAyahsMemorized} آية محفوظة\n` +
      `📋 *نتيجة الأنشطة اليومية:* ${report.presentDays}/${report.totalDays} أيام حضور ومتابعة الأنشطة\n` +
      (teacherComment ? `💬 *ملاحظة المعلم:* "${teacherComment}"\n\n` : '\n') +
      `📎 *الملف المرفق (Word):* ${filename}\n\n` +
      `_معهد الملة الإسلامي • الصف الخامس_`
    : `*AL-MILLAH ISLAMIC ACADEMY*\n` +
      `*Weekly Student Report (Class 5)*\n\n` +
      `Dear Guardian: *${guardianTitle}*\n\n` +
      `Weekly report for student: *${student.fullName}* (Roll #${student.rollNumber}):\n\n` +
      `📖 *Qur'an Memorization Result:* ${report.totalAyahsMemorized} Ayahs memorized\n` +
      `📋 *Daily Activities Result:* Saturday – Wednesday records\n` +
      (teacherComment ? `💬 *Teacher Remark:* "${teacherComment}"\n\n` : '\n') +
      `📎 *Attached Word Document:* ${filename}\n\n` +
      `_Al-Millah Islamic Academy_`;

  // 1. Try native Web Share if supported
  try {
    const file = new File([wordBlob], filename, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Al-Millah Weekly Report (Word) - ${student.fullName}`,
        text: messageText
      });
      return { success: true, method: 'native-share', filename };
    }
  } catch (err) {
    console.warn('Native share not available or failed:', err);
  }

  // 2. Download docx file and open WhatsApp
  downloadWordBlob(wordBlob, filename);

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
