// Quran data structures and utilities for navigation and organization

export interface JuzInfo {
  number: number;
  name: string;
  nameAr: string;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
  totalVerses: number;
}

export interface SurahInfo {
  number: number;
  name: string;
  nameAr: string;
  verses: number;
  juz: number[]; // Which Juz this surah appears in
}

export interface VersePosition {
  globalIndex: number; // 0-based index in the entire Quran
  surahNumber: number;
  verseNumber: number;
  juzNumber: number;
  surahName: string;
  surahNameAr: string;
}

// Complete Quran Juz (Parts) information - all 30 Juz
export const QURAN_JUZ: JuzInfo[] = [
  { number: 1, name: 'Alif Lam Meem', nameAr: 'الم', startSurah: 1, startVerse: 1, endSurah: 2, endVerse: 141, totalVerses: 148 },
  { number: 2, name: 'Sayaqool', nameAr: 'سيقول', startSurah: 2, startVerse: 142, endSurah: 2, endVerse: 252, totalVerses: 111 },
  { number: 3, name: 'Tilka Rusul', nameAr: 'تلك الرسل', startSurah: 2, startVerse: 253, endSurah: 3, endVerse: 92, totalVerses: 126 },
  { number: 4, name: 'Lan Tanaloo', nameAr: 'لن تنالوا', startSurah: 3, startVerse: 93, endSurah: 4, endVerse: 23, totalVerses: 131 },
  { number: 5, name: 'Wal Mohsanat', nameAr: 'والمحصنات', startSurah: 4, startVerse: 24, endSurah: 4, endVerse: 147, totalVerses: 124 },
  { number: 6, name: 'La Yuhibbullah', nameAr: 'لا يحب الله', startSurah: 4, startVerse: 148, endSurah: 5, endVerse: 81, totalVerses: 111 },
  { number: 7, name: 'Wa Iza Samiu', nameAr: 'وإذا سمعوا', startSurah: 5, startVerse: 82, endSurah: 6, endVerse: 110, totalVerses: 149 },
  { number: 8, name: 'Wa Lau Annana', nameAr: 'ولو أننا', startSurah: 6, startVerse: 111, endSurah: 7, endVerse: 87, totalVerses: 142 },
  { number: 9, name: 'Qal Almalao', nameAr: 'قال الملأ', startSurah: 7, startVerse: 88, endSurah: 8, endVerse: 40, totalVerses: 172 },
  { number: 10, name: 'Wa Alamoo', nameAr: 'واعلموا', startSurah: 8, startVerse: 41, endSurah: 9, endVerse: 92, totalVerses: 129 },
  { number: 11, name: 'Yatazeroon', nameAr: 'يعتذرون', startSurah: 9, startVerse: 93, endSurah: 11, endVerse: 5, totalVerses: 148 },
  { number: 12, name: 'Wa Ma Min Dabbah', nameAr: 'وما من دابة', startSurah: 11, startVerse: 6, endSurah: 12, endVerse: 52, totalVerses: 165 },
  { number: 13, name: 'Wa Ma Ubrioo', nameAr: 'وما أبرئ', startSurah: 12, startVerse: 53, endSurah: 14, endVerse: 52, totalVerses: 154 },
  { number: 14, name: 'Rubama', nameAr: 'ربما', startSurah: 15, startVerse: 1, endSurah: 16, endVerse: 128, totalVerses: 227 },
  { number: 15, name: 'Subhan Allazi', nameAr: 'سبحان الذي', startSurah: 17, startVerse: 1, endSurah: 18, endVerse: 74, totalVerses: 185 },
  { number: 16, name: 'Qal Alam', nameAr: 'قال ألم', startSurah: 18, startVerse: 75, endSurah: 20, endVerse: 135, totalVerses: 201 },
  { number: 17, name: 'Iqtaraba', nameAr: 'اقترب', startSurah: 21, startVerse: 1, endSurah: 22, endVerse: 78, totalVerses: 190 },
  { number: 18, name: 'Qad Aflaha', nameAr: 'قد أفلح', startSurah: 23, startVerse: 1, endSurah: 25, endVerse: 20, totalVerses: 238 },
  { number: 19, name: 'Wa Qal Allazina', nameAr: 'وقال الذين', startSurah: 25, startVerse: 21, endSurah: 27, endVerse: 55, totalVerses: 243 },
  { number: 20, name: 'A Ammantum', nameAr: 'أمن خلق', startSurah: 27, startVerse: 56, endSurah: 29, endVerse: 45, totalVerses: 259 },
  { number: 21, name: 'Utlu Ma Uhiya', nameAr: 'اتل ما أوحي', startSurah: 29, startVerse: 46, endSurah: 33, endVerse: 30, totalVerses: 302 },
  { number: 22, name: 'Wa Man Yaqnut', nameAr: 'ومن يقنت', startSurah: 33, startVerse: 31, endSurah: 36, endVerse: 27, totalVerses: 289 },
  { number: 23, name: 'Wa Mali', nameAr: 'وما لي', startSurah: 36, startVerse: 28, endSurah: 39, endVerse: 31, totalVerses: 434 },
  { number: 24, name: 'Fa Man Azlam', nameAr: 'فمن أظلم', startSurah: 39, startVerse: 32, endSurah: 41, endVerse: 46, totalVerses: 171 },
  { number: 25, name: 'Ilaih Yuraddu', nameAr: 'إليه يرد', startSurah: 41, startVerse: 47, endSurah: 45, endVerse: 37, totalVerses: 197 },
  { number: 26, name: 'Ha Meem', nameAr: 'حم', startSurah: 46, startVerse: 1, endSurah: 51, endVerse: 30, totalVerses: 259 },
  { number: 27, name: 'Qala Fa Ma Khatbukum', nameAr: 'قال فما خطبكم', startSurah: 51, startVerse: 31, endSurah: 57, endVerse: 29, totalVerses: 195 },
  { number: 28, name: 'Qad Samia', nameAr: 'قد سمع', startSurah: 58, startVerse: 1, endSurah: 66, endVerse: 12, totalVerses: 243 },
  { number: 29, name: 'Tabarak Allazi', nameAr: 'تبارك الذي', startSurah: 67, startVerse: 1, endSurah: 77, endVerse: 50, totalVerses: 431 },
  { number: 30, name: 'Amma Yatasa aloon', nameAr: 'عم يتساءلون', startSurah: 78, startVerse: 1, endSurah: 114, endVerse: 6, totalVerses: 564 }
];

// Complete Quran surah information (all 114 surahs) with Juz mapping
export const COMPLETE_QURAN_SURAHS = [
  { number: 1, name: 'Al-Fatiha', nameAr: 'الفاتحة', verses: 7, juz: [1] },
  { number: 2, name: 'Al-Baqarah', nameAr: 'البقرة', verses: 286, juz: [1, 2, 3] },
  { number: 3, name: 'Ali-Imran', nameAr: 'آل عمران', verses: 200, juz: [3, 4] },
  { number: 4, name: 'An-Nisa', nameAr: 'النساء', verses: 176, juz: [4, 5, 6] },
  { number: 5, name: 'Al-Maidah', nameAr: 'المائدة', verses: 120, juz: [6, 7] },
  { number: 6, name: 'Al-Anam', nameAr: 'الأنعام', verses: 165, juz: [7, 8] },
  { number: 7, name: 'Al-Araf', nameAr: 'الأعراف', verses: 206, juz: [8, 9] },
  { number: 8, name: 'Al-Anfal', nameAr: 'الأنفال', verses: 75, juz: [9, 10] },
  { number: 9, name: 'At-Tawbah', nameAr: 'التوبة', verses: 129, juz: [10, 11] },
  { number: 10, name: 'Yunus', nameAr: 'يونس', verses: 109, juz: [11] },
  { number: 11, name: 'Hud', nameAr: 'هود', verses: 123, juz: [11, 12] },
  { number: 12, name: 'Yusuf', nameAr: 'يوسف', verses: 111, juz: [12, 13] },
  { number: 13, name: 'Ar-Rad', nameAr: 'الرعد', verses: 43, juz: [13] },
  { number: 14, name: 'Ibrahim', nameAr: 'إبراهيم', verses: 52, juz: [13] },
  { number: 15, name: 'Al-Hijr', nameAr: 'الحجر', verses: 99, juz: [14] },
  { number: 16, name: 'An-Nahl', nameAr: 'النحل', verses: 128, juz: [14] },
  { number: 17, name: 'Al-Isra', nameAr: 'الإسراء', verses: 111, juz: [15] },
  { number: 18, name: 'Al-Kahf', nameAr: 'الكهف', verses: 110, juz: [15, 16] },
  { number: 19, name: 'Maryam', nameAr: 'مريم', verses: 98, juz: [16] },
  { number: 20, name: 'Ta-Ha', nameAr: 'طه', verses: 135, juz: [16] },
  { number: 21, name: 'Al-Anbiya', nameAr: 'الأنبياء', verses: 112, juz: [17] },
  { number: 22, name: 'Al-Hajj', nameAr: 'الحج', verses: 78, juz: [17] },
  { number: 23, name: 'Al-Muminun', nameAr: 'المؤمنون', verses: 118, juz: [18] },
  { number: 24, name: 'An-Nur', nameAr: 'النور', verses: 64, juz: [18] },
  { number: 25, name: 'Al-Furqan', nameAr: 'الفرقان', verses: 77, juz: [18, 19] },
  { number: 26, name: 'Ash-Shuara', nameAr: 'الشعراء', verses: 227, juz: [19] },
  { number: 27, name: 'An-Naml', nameAr: 'النمل', verses: 93, juz: [19, 20] },
  { number: 28, name: 'Al-Qasas', nameAr: 'القصص', verses: 88, juz: [20] },
  { number: 29, name: 'Al-Ankabut', nameAr: 'العنكبوت', verses: 69, juz: [20, 21] },
  { number: 30, name: 'Ar-Rum', nameAr: 'الروم', verses: 60, juz: [21] },
  { number: 31, name: 'Luqman', nameAr: 'لقمان', verses: 34, juz: [21] },
  { number: 32, name: 'As-Sajdah', nameAr: 'السجدة', verses: 30, juz: [21] },
  { number: 33, name: 'Al-Ahzab', nameAr: 'الأحزاب', verses: 73, juz: [21, 22] },
  { number: 34, name: 'Saba', nameAr: 'سبأ', verses: 54, juz: [22] },
  { number: 35, name: 'Fatir', nameAr: 'فاطر', verses: 45, juz: [22] },
  { number: 36, name: 'Ya-Sin', nameAr: 'يس', verses: 83, juz: [22, 23] },
  { number: 37, name: 'As-Saffat', nameAr: 'الصافات', verses: 182, juz: [23] },
  { number: 38, name: 'Sad', nameAr: 'ص', verses: 88, juz: [23] },
  { number: 39, name: 'Az-Zumar', nameAr: 'الزمر', verses: 75, juz: [23, 24] },
  { number: 40, name: 'Ghafir', nameAr: 'غافر', verses: 85, juz: [24] },
  { number: 41, name: 'Fussilat', nameAr: 'فصلت', verses: 54, juz: [24, 25] },
  { number: 42, name: 'Ash-Shuraa', nameAr: 'الشورى', verses: 53, juz: [25] },
  { number: 43, name: 'Az-Zukhruf', nameAr: 'الزخرف', verses: 89, juz: [25] },
  { number: 44, name: 'Ad-Dukhan', nameAr: 'الدخان', verses: 59, juz: [25] },
  { number: 45, name: 'Al-Jathiyah', nameAr: 'الجاثية', verses: 37, juz: [25] },
  { number: 46, name: 'Al-Ahqaf', nameAr: 'الأحقاف', verses: 35, juz: [26] },
  { number: 47, name: 'Muhammad', nameAr: 'محمد', verses: 38, juz: [26] },
  { number: 48, name: 'Al-Fath', nameAr: 'الفتح', verses: 29, juz: [26] },
  { number: 49, name: 'Al-Hujurat', nameAr: 'الحجرات', verses: 18, juz: [26] },
  { number: 50, name: 'Qaf', nameAr: 'ق', verses: 45, juz: [26] },
  { number: 51, name: 'Adh-Dhariyat', nameAr: 'الذاريات', verses: 60, juz: [26, 27] },
  { number: 52, name: 'At-Tur', nameAr: 'الطور', verses: 49, juz: [27] },
  { number: 53, name: 'An-Najm', nameAr: 'النجم', verses: 62, juz: [27] },
  { number: 54, name: 'Al-Qamar', nameAr: 'القمر', verses: 55, juz: [27] },
  { number: 55, name: 'Ar-Rahman', nameAr: 'الرحمن', verses: 78, juz: [27] },
  { number: 56, name: 'Al-Waqiah', nameAr: 'الواقعة', verses: 96, juz: [27] },
  { number: 57, name: 'Al-Hadid', nameAr: 'الحديد', verses: 29, juz: [27] },
  { number: 58, name: 'Al-Mujadila', nameAr: 'المجادلة', verses: 22, juz: [28] },
  { number: 59, name: 'Al-Hashr', nameAr: 'الحشر', verses: 24, juz: [28] },
  { number: 60, name: 'Al-Mumtahanah', nameAr: 'الممتحنة', verses: 13, juz: [28] },
  { number: 61, name: 'As-Saff', nameAr: 'الصف', verses: 14, juz: [28] },
  { number: 62, name: 'Al-Jumuah', nameAr: 'الجمعة', verses: 11, juz: [28] },
  { number: 63, name: 'Al-Munafiqun', nameAr: 'المنافقون', verses: 11, juz: [28] },
  { number: 64, name: 'At-Taghabun', nameAr: 'التغابن', verses: 18, juz: [28] },
  { number: 65, name: 'At-Talaq', nameAr: 'الطلاق', verses: 12, juz: [28] },
  { number: 66, name: 'At-Tahrim', nameAr: 'التحريم', verses: 12, juz: [28] },
  { number: 67, name: 'Al-Mulk', nameAr: 'الملك', verses: 30, juz: [29] },
  { number: 68, name: 'Al-Qalam', nameAr: 'القلم', verses: 52, juz: [29] },
  { number: 69, name: 'Al-Haqqah', nameAr: 'الحاقة', verses: 52, juz: [29] },
  { number: 70, name: 'Al-Maarij', nameAr: 'المعارج', verses: 44, juz: [29] },
  { number: 71, name: 'Nuh', nameAr: 'نوح', verses: 28, juz: [29] },
  { number: 72, name: 'Al-Jinn', nameAr: 'الجن', verses: 28, juz: [29] },
  { number: 73, name: 'Al-Muzzammil', nameAr: 'المزمل', verses: 20, juz: [29] },
  { number: 74, name: 'Al-Muddaththir', nameAr: 'المدثر', verses: 56, juz: [29] },
  { number: 75, name: 'Al-Qiyamah', nameAr: 'القيامة', verses: 40, juz: [29] },
  { number: 76, name: 'Al-Insan', nameAr: 'الإنسان', verses: 31, juz: [29] },
  { number: 77, name: 'Al-Mursalat', nameAr: 'المرسلات', verses: 50, juz: [29] },
  { number: 78, name: 'An-Naba', nameAr: 'النبأ', verses: 40, juz: [30] },
  { number: 79, name: 'An-Naziat', nameAr: 'النازعات', verses: 46, juz: [30] },
  { number: 80, name: 'Abasa', nameAr: 'عبس', verses: 42, juz: [30] },
  { number: 81, name: 'At-Takwir', nameAr: 'التكوير', verses: 29, juz: [30] },
  { number: 82, name: 'Al-Infitar', nameAr: 'الانفطار', verses: 19, juz: [30] },
  { number: 83, name: 'Al-Mutaffifin', nameAr: 'المطففين', verses: 36, juz: [30] },
  { number: 84, name: 'Al-Inshiqaq', nameAr: 'الانشقاق', verses: 25, juz: [30] },
  { number: 85, name: 'Al-Buruj', nameAr: 'البروج', verses: 22, juz: [30] },
  { number: 86, name: 'At-Tariq', nameAr: 'الطارق', verses: 17, juz: [30] },
  { number: 87, name: 'Al-Ala', nameAr: 'الأعلى', verses: 19, juz: [30] },
  { number: 88, name: 'Al-Ghashiyah', nameAr: 'الغاشية', verses: 26, juz: [30] },
  { number: 89, name: 'Al-Fajr', nameAr: 'الفجر', verses: 30, juz: [30] },
  { number: 90, name: 'Al-Balad', nameAr: 'البلد', verses: 20, juz: [30] },
  { number: 91, name: 'Ash-Shams', nameAr: 'الشمس', verses: 15, juz: [30] },
  { number: 92, name: 'Al-Layl', nameAr: 'الليل', verses: 21, juz: [30] },
  { number: 93, name: 'Ad-Duhaa', nameAr: 'الضحى', verses: 11, juz: [30] },
  { number: 94, name: 'Ash-Sharh', nameAr: 'الشرح', verses: 8, juz: [30] },
  { number: 95, name: 'At-Tin', nameAr: 'التين', verses: 8, juz: [30] },
  { number: 96, name: 'Al-Alaq', nameAr: 'العلق', verses: 19, juz: [30] },
  { number: 97, name: 'Al-Qadr', nameAr: 'القدر', verses: 5, juz: [30] },
  { number: 98, name: 'Al-Bayyinah', nameAr: 'البينة', verses: 8, juz: [30] },
  { number: 99, name: 'Az-Zalzalah', nameAr: 'الزلزلة', verses: 8, juz: [30] },
  { number: 100, name: 'Al-Adiyat', nameAr: 'العاديات', verses: 11, juz: [30] },
  { number: 101, name: 'Al-Qariah', nameAr: 'القارعة', verses: 11, juz: [30] },
  { number: 102, name: 'At-Takathur', nameAr: 'التكاثر', verses: 8, juz: [30] },
  { number: 103, name: 'Al-Asr', nameAr: 'العصر', verses: 3, juz: [30] },
  { number: 104, name: 'Al-Humazah', nameAr: 'الهمزة', verses: 9, juz: [30] },
  { number: 105, name: 'Al-Fil', nameAr: 'الفيل', verses: 5, juz: [30] },
  { number: 106, name: 'Quraysh', nameAr: 'قريش', verses: 4, juz: [30] },
  { number: 107, name: 'Al-Maun', nameAr: 'الماعون', verses: 7, juz: [30] },
  { number: 108, name: 'Al-Kawthar', nameAr: 'الكوثر', verses: 3, juz: [30] },
  { number: 109, name: 'Al-Kafirun', nameAr: 'الكافرون', verses: 6, juz: [30] },
  { number: 110, name: 'An-Nasr', nameAr: 'النصر', verses: 3, juz: [30] },
  { number: 111, name: 'Al-Masad', nameAr: 'المسد', verses: 5, juz: [30] },
  { number: 112, name: 'Al-Ikhlas', nameAr: 'الإخلاص', verses: 4, juz: [30] },
  { number: 113, name: 'Al-Falaq', nameAr: 'الفلق', verses: 5, juz: [30] },
  { number: 114, name: 'An-Nas', nameAr: 'الناس', verses: 6, juz: [30] }
];

// Total verses in the Quran
export const TOTAL_QURAN_VERSES = 6236;

// Utility functions for Quran navigation and organization

/**
 * Calculate the global verse index (0-based) from surah and verse numbers
 */
export const getGlobalVerseIndex = (surahNumber: number, verseNumber: number): number => {
  let globalIndex = 0;

  // Add verses from all previous surahs
  for (let i = 1; i < surahNumber; i++) {
    const surah = COMPLETE_QURAN_SURAHS.find(s => s.number === i);
    if (surah) {
      globalIndex += surah.verses;
    }
  }

  // Add the verse number (convert to 0-based)
  globalIndex += verseNumber - 1;

  return globalIndex;
};

/**
 * Get surah and verse numbers from global verse index (0-based)
 */
export const getVerseFromGlobalIndex = (globalIndex: number): { surahNumber: number; verseNumber: number } => {
  let currentIndex = 0;

  for (const surah of COMPLETE_QURAN_SURAHS) {
    if (currentIndex + surah.verses > globalIndex) {
      return {
        surahNumber: surah.number,
        verseNumber: globalIndex - currentIndex + 1
      };
    }
    currentIndex += surah.verses;
  }

  // If we reach here, return the last verse
  return { surahNumber: 114, verseNumber: 6 };
};

/**
 * Get the Juz number for a specific verse
 */
export const getJuzForVerse = (surahNumber: number, verseNumber: number): number => {
  const globalIndex = getGlobalVerseIndex(surahNumber, verseNumber);

  for (const juz of QURAN_JUZ) {
    const startGlobalIndex = getGlobalVerseIndex(juz.startSurah, juz.startVerse);
    const endGlobalIndex = getGlobalVerseIndex(juz.endSurah, juz.endVerse);

    if (globalIndex >= startGlobalIndex && globalIndex <= endGlobalIndex) {
      return juz.number;
    }
  }

  return 1; // Default to first Juz if not found
};

/**
 * Get complete verse position information
 */
export const getVersePosition = (globalIndex: number): VersePosition => {
  const { surahNumber, verseNumber } = getVerseFromGlobalIndex(globalIndex);
  const surah = COMPLETE_QURAN_SURAHS.find(s => s.number === surahNumber);
  const juzNumber = getJuzForVerse(surahNumber, verseNumber);

  return {
    globalIndex,
    surahNumber,
    verseNumber,
    juzNumber,
    surahName: surah?.name || '',
    surahNameAr: surah?.nameAr || ''
  };
};

/**
 * Get all verses in a specific Juz
 */
export const getVersesInJuz = (juzNumber: number): VersePosition[] => {
  const juz = QURAN_JUZ.find(j => j.number === juzNumber);
  if (!juz) return [];

  const verses: VersePosition[] = [];
  const startGlobalIndex = getGlobalVerseIndex(juz.startSurah, juz.startVerse);
  const endGlobalIndex = getGlobalVerseIndex(juz.endSurah, juz.endVerse);

  for (let i = startGlobalIndex; i <= endGlobalIndex; i++) {
    verses.push(getVersePosition(i));
  }

  return verses;
};

/**
 * Get Juz information by number
 */
export const getJuzInfo = (juzNumber: number): JuzInfo | null => {
  return QURAN_JUZ.find(j => j.number === juzNumber) || null;
};

/**
 * Get Surah information by number
 */
export const getSurahInfo = (surahNumber: number): SurahInfo | null => {
  return COMPLETE_QURAN_SURAHS.find(s => s.number === surahNumber) || null;
};

/**
 * Calculate reading progress percentage
 */
export const calculateReadingProgress = (currentGlobalIndex: number): number => {
  return Math.round((currentGlobalIndex / TOTAL_QURAN_VERSES) * 100 * 100) / 100; // Round to 2 decimal places
};

/**
 * Get the next verse global index
 */
export const getNextVerseIndex = (currentGlobalIndex: number): number | null => {
  if (currentGlobalIndex >= TOTAL_QURAN_VERSES - 1) {
    return null; // Already at the last verse
  }
  return currentGlobalIndex + 1;
};

/**
 * Get the previous verse global index
 */
export const getPreviousVerseIndex = (currentGlobalIndex: number): number | null => {
  if (currentGlobalIndex <= 0) {
    return null; // Already at the first verse
  }
  return currentGlobalIndex - 1;
};
