import { StudentGroup } from '../types';

export interface StudentGroupInfo {
  id: StudentGroup;
  nameEn: string;
  nameAr: string;
  shortEn: string;
  shortAr: string;
  reciterEn: string;
  reciterAr: string;
  badgeClass: string;
  borderClass: string;
  bgLightClass: string;
}

export const STUDENT_GROUPS_LIST: StudentGroupInfo[] = [
  {
    id: 'khaleelul_hussary',
    nameEn: 'Group Khaleelul Hussary',
    nameAr: 'مجموعة خليل الحصري',
    shortEn: 'Khaleelul Hussary',
    shortAr: 'خليل الحصري',
    reciterEn: 'Shaykh Mahmoud Khalil Al-Hussary',
    reciterAr: 'الشيخ محمود خليل الحصري',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderClass: 'border-emerald-500',
    bgLightClass: 'bg-emerald-50/60'
  },
  {
    id: 'seddeq_minshawy',
    nameEn: 'Group Seddeq Minshawy',
    nameAr: 'مجموعة صدّيق المنشاوي',
    shortEn: 'Seddeq Minshawy',
    shortAr: 'صدّيق المنشاوي',
    reciterEn: 'Shaykh Mohamed Siddiq El-Minshawi',
    reciterAr: 'الشيخ محمد صديق المنشاوي',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    borderClass: 'border-amber-500',
    bgLightClass: 'bg-amber-50/60'
  },
  {
    id: 'abdulbasit',
    nameEn: 'Group Abdulbasiɗ',
    nameAr: 'مجموعة عبد الباسط',
    shortEn: 'Abdulbasiɗ',
    shortAr: 'عبد الباسط',
    reciterEn: 'Shaykh Abdulbasit Abdussamad',
    reciterAr: 'الشيخ عبد الباسط عبد الصمد',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    borderClass: 'border-sky-500',
    bgLightClass: 'bg-sky-50/60'
  }
];

export const STUDENT_GROUPS_MAP: Record<StudentGroup, StudentGroupInfo> = {
  khaleelul_hussary: STUDENT_GROUPS_LIST[0],
  seddeq_minshawy: STUDENT_GROUPS_LIST[1],
  abdulbasit: STUDENT_GROUPS_LIST[2]
};

export const getStudentGroupName = (group?: StudentGroup, lang: 'en' | 'ar' = 'en'): string => {
  if (!group || !STUDENT_GROUPS_MAP[group]) {
    return lang === 'ar' ? 'غير محدد' : 'Unassigned';
  }
  return lang === 'ar' ? STUDENT_GROUPS_MAP[group].nameAr : STUDENT_GROUPS_MAP[group].nameEn;
};

export const getStudentGroupShortName = (group?: StudentGroup, lang: 'en' | 'ar' = 'en'): string => {
  if (!group || !STUDENT_GROUPS_MAP[group]) {
    return lang === 'ar' ? 'غير محدد' : 'Unassigned';
  }
  return lang === 'ar' ? STUDENT_GROUPS_MAP[group].shortAr : STUDENT_GROUPS_MAP[group].shortEn;
};
