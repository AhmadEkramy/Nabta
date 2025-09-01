import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

// Free Quran API endpoints
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const ALTERNATIVE_API_BASE = 'https://api.quran.com/api/v4';

// Interface for API response
interface QuranAPIVerse {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
  };
  numberInSurah: number;
}

interface QuranAPIResponse {
  code: number;
  status: string;
  data: QuranAPIVerse[];
}

// Fetch verses from Quran API
export const fetchVersesFromAPI = async (surahNumber: number, startVerse: number = 1, endVerse: number = 10) => {
  try {
    console.log(`Fetching verses from Surah ${surahNumber}, verses ${startVerse}-${endVerse}`);

    // Fetch Arabic text
    const arabicResponse = await fetch(
      `${QURAN_API_BASE}/surah/${surahNumber}/ar.alafasy`
    );
    const arabicData = await arabicResponse.json();

    // Fetch English translation
    const englishResponse = await fetch(
      `${QURAN_API_BASE}/surah/${surahNumber}/en.sahih`
    );
    const englishData = await englishResponse.json();

    console.log('API Response structure:', {
      arabicData: arabicData,
      englishData: englishData
    });

    if (arabicData.code !== 200 || englishData.code !== 200) {
      throw new Error('Failed to fetch from API');
    }

    // Handle different response structures
    let arabicVerses, englishVerses;

    if (arabicData.data && Array.isArray(arabicData.data.ayahs)) {
      // Structure: { data: { ayahs: [...] } }
      arabicVerses = arabicData.data.ayahs.slice(startVerse - 1, endVerse);
      englishVerses = englishData.data.ayahs.slice(startVerse - 1, endVerse);
    } else if (arabicData.data && Array.isArray(arabicData.data)) {
      // Structure: { data: [...] }
      arabicVerses = arabicData.data.slice(startVerse - 1, endVerse);
      englishVerses = englishData.data.slice(startVerse - 1, endVerse);
    } else {
      throw new Error('Unexpected API response structure');
    }

    const verses = [];

    for (let i = 0; i < arabicVerses.length && i < englishVerses.length; i++) {
      const arabicVerse = arabicVerses[i];
      const englishVerse = englishVerses[i];

      verses.push({
        arabic: arabicVerse.text,
        translation: englishVerse.text,
        surah: arabicVerse.surah?.englishName || `Surah ${surahNumber}`,
        surahAr: arabicVerse.surah?.name || `سورة ${surahNumber}`,
        ayah: arabicVerse.numberInSurah || (startVerse + i),
        reference: `${arabicVerse.surah?.name || `سورة ${surahNumber}`}: ${arabicVerse.numberInSurah || (startVerse + i)}`,
        surahNumber: arabicVerse.surah?.number || surahNumber,
        verseNumber: arabicVerse.number || (startVerse + i),
      });
    }

    console.log(`Successfully fetched ${verses.length} verses`);
    return verses;
  } catch (error) {
    console.error('Error fetching verses from API:', error);
    return [];
  }
};

// Complete Quran surah information (all 114 surahs)
export const COMPLETE_QURAN_SURAHS = [
  { number: 1, name: 'Al-Fatiha', nameAr: 'الفاتحة', verses: 7 },
  { number: 2, name: 'Al-Baqarah', nameAr: 'البقرة', verses: 286 },
  { number: 3, name: 'Ali-Imran', nameAr: 'آل عمران', verses: 200 },
  { number: 4, name: 'An-Nisa', nameAr: 'النساء', verses: 176 },
  { number: 5, name: 'Al-Maidah', nameAr: 'المائدة', verses: 120 },
  { number: 6, name: 'Al-Anam', nameAr: 'الأنعام', verses: 165 },
  { number: 7, name: 'Al-Araf', nameAr: 'الأعراف', verses: 206 },
  { number: 8, name: 'Al-Anfal', nameAr: 'الأنفال', verses: 75 },
  { number: 9, name: 'At-Tawbah', nameAr: 'التوبة', verses: 129 },
  { number: 10, name: 'Yunus', nameAr: 'يونس', verses: 109 },
  { number: 11, name: 'Hud', nameAr: 'هود', verses: 123 },
  { number: 12, name: 'Yusuf', nameAr: 'يوسف', verses: 111 },
  { number: 13, name: 'Ar-Rad', nameAr: 'الرعد', verses: 43 },
  { number: 14, name: 'Ibrahim', nameAr: 'إبراهيم', verses: 52 },
  { number: 15, name: 'Al-Hijr', nameAr: 'الحجر', verses: 99 },
  { number: 16, name: 'An-Nahl', verses: 128 },
  { number: 17, name: 'Al-Isra', verses: 111 },
  { number: 18, name: 'Al-Kahf', verses: 110 },
  { number: 19, name: 'Maryam', verses: 98 },
  { number: 20, name: 'Ta-Ha', verses: 135 },
  { number: 21, name: 'Al-Anbiya', verses: 112 },
  { number: 22, name: 'Al-Hajj', verses: 78 },
  { number: 23, name: 'Al-Muminun', verses: 118 },
  { number: 24, name: 'An-Nur', verses: 64 },
  { number: 25, name: 'Al-Furqan', verses: 77 },
  { number: 26, name: 'Ash-Shuara', verses: 227 },
  { number: 27, name: 'An-Naml', verses: 93 },
  { number: 28, name: 'Al-Qasas', verses: 88 },
  { number: 29, name: 'Al-Ankabut', verses: 69 },
  { number: 30, name: 'Ar-Rum', verses: 60 },
  { number: 31, name: 'Luqman', verses: 34 },
  { number: 32, name: 'As-Sajdah', verses: 30 },
  { number: 33, name: 'Al-Ahzab', verses: 73 },
  { number: 34, name: 'Saba', verses: 54 },
  { number: 35, name: 'Fatir', verses: 45 },
  { number: 36, name: 'Ya-Sin', verses: 83 },
  { number: 37, name: 'As-Saffat', verses: 182 },
  { number: 38, name: 'Sad', verses: 88 },
  { number: 39, name: 'Az-Zumar', verses: 75 },
  { number: 40, name: 'Ghafir', verses: 85 },
  { number: 41, name: 'Fussilat', verses: 54 },
  { number: 42, name: 'Ash-Shuraa', verses: 53 },
  { number: 43, name: 'Az-Zukhruf', verses: 89 },
  { number: 44, name: 'Ad-Dukhan', verses: 59 },
  { number: 45, name: 'Al-Jathiyah', verses: 37 },
  { number: 46, name: 'Al-Ahqaf', verses: 35 },
  { number: 47, name: 'Muhammad', verses: 38 },
  { number: 48, name: 'Al-Fath', verses: 29 },
  { number: 49, name: 'Al-Hujurat', verses: 18 },
  { number: 50, name: 'Qaf', verses: 45 },
  { number: 51, name: 'Adh-Dhariyat', verses: 60 },
  { number: 52, name: 'At-Tur', verses: 49 },
  { number: 53, name: 'An-Najm', verses: 62 },
  { number: 54, name: 'Al-Qamar', verses: 55 },
  { number: 55, name: 'Ar-Rahman', verses: 78 },
  { number: 56, name: 'Al-Waqiah', verses: 96 },
  { number: 57, name: 'Al-Hadid', verses: 29 },
  { number: 58, name: 'Al-Mujadila', verses: 22 },
  { number: 59, name: 'Al-Hashr', verses: 24 },
  { number: 60, name: 'Al-Mumtahanah', verses: 13 },
  { number: 61, name: 'As-Saff', verses: 14 },
  { number: 62, name: 'Al-Jumuah', verses: 11 },
  { number: 63, name: 'Al-Munafiqun', verses: 11 },
  { number: 64, name: 'At-Taghabun', verses: 18 },
  { number: 65, name: 'At-Talaq', verses: 12 },
  { number: 66, name: 'At-Tahrim', verses: 12 },
  { number: 67, name: 'Al-Mulk', verses: 30 },
  { number: 68, name: 'Al-Qalam', verses: 52 },
  { number: 69, name: 'Al-Haqqah', verses: 52 },
  { number: 70, name: 'Al-Maarij', verses: 44 },
  { number: 71, name: 'Nuh', verses: 28 },
  { number: 72, name: 'Al-Jinn', verses: 28 },
  { number: 73, name: 'Al-Muzzammil', verses: 20 },
  { number: 74, name: 'Al-Muddaththir', verses: 56 },
  { number: 75, name: 'Al-Qiyamah', verses: 40 },
  { number: 76, name: 'Al-Insan', verses: 31 },
  { number: 77, name: 'Al-Mursalat', verses: 50 },
  { number: 78, name: 'An-Naba', verses: 40 },
  { number: 79, name: 'An-Naziat', verses: 46 },
  { number: 80, name: 'Abasa', verses: 42 },
  { number: 81, name: 'At-Takwir', verses: 29 },
  { number: 82, name: 'Al-Infitar', verses: 19 },
  { number: 83, name: 'Al-Mutaffifin', verses: 36 },
  { number: 84, name: 'Al-Inshiqaq', verses: 25 },
  { number: 85, name: 'Al-Buruj', verses: 22 },
  { number: 86, name: 'At-Tariq', verses: 17 },
  { number: 87, name: 'Al-Ala', verses: 19 },
  { number: 88, name: 'Al-Ghashiyah', verses: 26 },
  { number: 89, name: 'Al-Fajr', verses: 30 },
  { number: 90, name: 'Al-Balad', verses: 20 },
  { number: 91, name: 'Ash-Shams', verses: 15 },
  { number: 92, name: 'Al-Layl', verses: 21 },
  { number: 93, name: 'Ad-Duhaa', verses: 11 },
  { number: 94, name: 'Ash-Sharh', verses: 8 },
  { number: 95, name: 'At-Tin', verses: 8 },
  { number: 96, name: 'Al-Alaq', verses: 19 },
  { number: 97, name: 'Al-Qadr', verses: 5 },
  { number: 98, name: 'Al-Bayyinah', verses: 8 },
  { number: 99, name: 'Az-Zalzalah', verses: 8 },
  { number: 100, name: 'Al-Adiyat', verses: 11 },
  { number: 101, name: 'Al-Qariah', verses: 11 },
  { number: 102, name: 'At-Takathur', verses: 8 },
  { number: 103, name: 'Al-Asr', verses: 3 },
  { number: 104, name: 'Al-Humazah', verses: 9 },
  { number: 105, name: 'Al-Fil', verses: 5 },
  { number: 106, name: 'Quraysh', verses: 4 },
  { number: 107, name: 'Al-Maun', verses: 7 },
  { number: 108, name: 'Al-Kawthar', verses: 3 },
  { number: 109, name: 'Al-Kafirun', verses: 6 },
  { number: 110, name: 'An-Nasr', verses: 3 },
  { number: 111, name: 'Al-Masad', verses: 5 },
  { number: 112, name: 'Al-Ikhlas', verses: 4 },
  { number: 113, name: 'Al-Falaq', verses: 5 },
  { number: 114, name: 'An-Nas', verses: 6 },
];

// Populate database with verses from multiple surahs
export const populateQuranDatabase = async (mode: 'sample' | 'extended' | 'complete' = 'sample') => {
  try {
    console.log(`Starting to populate Quran database from API (${mode} mode)...`);

    let surahsToFetch;

    if (mode === 'sample') {
      // Popular surahs to start with
      surahsToFetch = [
        { number: 1, name: 'Al-Fatiha', verses: 7 },
        { number: 2, name: 'Al-Baqarah', verses: 20 }, // First 20 verses
        { number: 3, name: 'Ali-Imran', verses: 15 },
        { number: 18, name: 'Al-Kahf', verses: 20 },
        { number: 36, name: 'Ya-Sin', verses: 15 },
        { number: 55, name: 'Ar-Rahman', verses: 20 },
        { number: 67, name: 'Al-Mulk', verses: 30 },
        { number: 112, name: 'Al-Ikhlas', verses: 4 },
        { number: 113, name: 'Al-Falaq', verses: 5 },
        { number: 114, name: 'An-Nas', verses: 6 },
      ];
    } else if (mode === 'extended') {
      // More comprehensive selection
      surahsToFetch = [
        { number: 1, name: 'Al-Fatiha', verses: 7 },
        { number: 2, name: 'Al-Baqarah', verses: 100 }, // First 100 verses
        { number: 3, name: 'Ali-Imran', verses: 50 },
        { number: 4, name: 'An-Nisa', verses: 50 },
        { number: 5, name: 'Al-Maidah', verses: 50 },
        { number: 18, name: 'Al-Kahf', verses: 110 }, // Complete
        { number: 36, name: 'Ya-Sin', verses: 83 }, // Complete
        { number: 55, name: 'Ar-Rahman', verses: 78 }, // Complete
        { number: 67, name: 'Al-Mulk', verses: 30 }, // Complete
        { number: 78, name: 'An-Naba', verses: 40 }, // Complete
        { number: 112, name: 'Al-Ikhlas', verses: 4 },
        { number: 113, name: 'Al-Falaq', verses: 5 },
        { number: 114, name: 'An-Nas', verses: 6 },
      ];
    } else {
      // Complete Quran (first 20 surahs for now)
      surahsToFetch = COMPLETE_QURAN_SURAHS.slice(0, 20);
    }
    
    let totalAdded = 0;
    
    for (const surah of surahsToFetch) {
      console.log(`Fetching ${surah.name} (${surah.verses} verses)...`);
      
      const verses = await fetchVersesFromAPI(surah.number, 1, surah.verses);
      
      for (const verse of verses) {
        try {
          await addDoc(collection(db, 'quranVerses'), verse);
          totalAdded++;
          console.log(`Added verse ${verse.surahNumber}:${verse.ayah}`);
        } catch (error) {
          console.error(`Error adding verse ${verse.surahNumber}:${verse.ayah}:`, error);
        }
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Successfully added ${totalAdded} verses to database`);
    
    // Create daily verses from the added verses
    await createDailyVersesFromDatabase();
    
    return totalAdded;
  } catch (error) {
    console.error('Error populating database:', error);
    throw error;
  }
};

// Create daily verses for the next 30 days
export const createDailyVersesFromDatabase = async () => {
  try {
    console.log('Creating daily verses...');
    
    // This would typically fetch random verses from your database
    // For now, we'll create a simple rotation
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Create a simple daily verse entry
      // In a real app, you'd select from your verse collection
      await addDoc(collection(db, 'dailyVerses'), {
        date: dateString,
        isToday: i === 0,
        // You would reference actual verses from your collection here
        note: `Daily verse for ${dateString}`,
      });
    }
    
    console.log('Created 30 daily verse entries');
  } catch (error) {
    console.error('Error creating daily verses:', error);
  }
};

// Get random verses for daily selection
export const getRandomVersesForDaily = async (count: number = 7) => {
  try {
    // Fetch a few verses from different surahs for variety
    const randomSurahs = [1, 2, 18, 36, 67, 112, 113, 114];
    const verses = [];
    
    for (let i = 0; i < count && i < randomSurahs.length; i++) {
      const surahVerses = await fetchVersesFromAPI(randomSurahs[i], 1, 3);
      if (surahVerses.length > 0) {
        // Add date information
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        verses.push({
          ...surahVerses[0], // Take first verse
          date: date.toISOString().split('T')[0],
          isToday: i === 0,
        });
      }
    }
    
    return verses;
  } catch (error) {
    console.error('Error getting random verses:', error);
    return [];
  }
};

// Function to populate complete Quran gradually
export const populateCompleteQuran = async (startSurah: number = 1, endSurah: number = 114) => {
  try {
    console.log(`Starting to populate complete Quran from Surah ${startSurah} to ${endSurah}...`);

    let totalAdded = 0;

    for (let surahNumber = startSurah; surahNumber <= endSurah; surahNumber++) {
      try {
        console.log(`Fetching Surah ${surahNumber}...`);

        // Fetch the complete surah
        const arabicResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/ar.alafasy`);
        const englishResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.sahih`);

        if (arabicResponse.ok && englishResponse.ok) {
          const arabicData = await arabicResponse.json();
          const englishData = await englishResponse.json();

          if (arabicData.code === 200 && englishData.code === 200) {
            const arabicVerses = arabicData.data;
            const englishVerses = englishData.data;

            for (let i = 0; i < arabicVerses.length && i < englishVerses.length; i++) {
              const arabicVerse = arabicVerses[i];
              const englishVerse = englishVerses[i];

              const verse = {
                arabic: arabicVerse.text,
                translation: englishVerse.text,
                surah: arabicVerse.surah.englishName,
                surahAr: arabicVerse.surah.name,
                ayah: arabicVerse.numberInSurah,
                reference: `${arabicVerse.surah.name}: ${arabicVerse.numberInSurah}`,
                surahNumber: arabicVerse.surah.number,
                verseNumber: arabicVerse.number,
              };

              await addDoc(collection(db, 'quranVerses'), verse);
              totalAdded++;

              if (totalAdded % 50 === 0) {
                console.log(`Added ${totalAdded} verses so far...`);
              }
            }

            console.log(`Completed Surah ${surahNumber}: ${arabicVerses.length} verses`);
          }
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error fetching Surah ${surahNumber}:`, error);
        continue;
      }
    }

    console.log(`Successfully added ${totalAdded} verses from Surahs ${startSurah}-${endSurah}`);
    return totalAdded;

  } catch (error) {
    console.error('Error populating complete Quran:', error);
    throw error;
  }
};

// Alternative fetch using different API structure
export const fetchVersesAlternative = async (surahNumber: number, startVerse: number = 1, endVerse: number = 10) => {
  try {
    console.log(`Fetching verses using alternative method from Surah ${surahNumber}, verses ${startVerse}-${endVerse}`);

    // Try simpler endpoint structure
    const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}`);
    const data = await response.json();

    console.log('Alternative API Response:', data);

    if (data.code !== 200) {
      throw new Error('Failed to fetch from alternative API');
    }

    let verses = [];
    let ayahs = [];

    // Extract ayahs from different possible structures
    if (data.data && data.data.ayahs) {
      ayahs = data.data.ayahs;
    } else if (data.data && Array.isArray(data.data)) {
      ayahs = data.data;
    } else {
      throw new Error('Could not find ayahs in response');
    }

    // Get the requested range
    const selectedAyahs = ayahs.slice(startVerse - 1, endVerse);

    for (let i = 0; i < selectedAyahs.length; i++) {
      const ayah = selectedAyahs[i];

      verses.push({
        arabic: ayah.text || ayah.arabic || 'Arabic text not available',
        translation: 'Translation will be fetched separately',
        surah: data.data.englishName || data.data.name || `Surah ${surahNumber}`,
        surahAr: data.data.name || `سورة ${surahNumber}`,
        ayah: ayah.numberInSurah || (startVerse + i),
        reference: `${data.data.name || `سورة ${surahNumber}`}: ${ayah.numberInSurah || (startVerse + i)}`,
        surahNumber: surahNumber,
        verseNumber: ayah.number || (startVerse + i),
      });
    }

    console.log(`Successfully fetched ${verses.length} verses using alternative method`);
    return verses;
  } catch (error) {
    console.error('Error fetching verses from alternative API:', error);
    return [];
  }
};

// Test API response structure
export const testAPIResponse = async (surahNumber: number = 1) => {
  try {
    console.log(`Testing API response for Surah ${surahNumber}...`);

    const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/ar.alafasy`);
    const data = await response.json();

    console.log('Full API Response:', data);
    console.log('Response code:', data.code);
    console.log('Response status:', data.status);
    console.log('Data structure:', data.data);

    if (data.data && data.data.ayahs) {
      console.log('Found ayahs array with', data.data.ayahs.length, 'verses');
      console.log('First verse:', data.data.ayahs[0]);
    } else if (Array.isArray(data.data)) {
      console.log('Found data array with', data.data.length, 'verses');
      console.log('First verse:', data.data[0]);
    } else {
      console.log('Unexpected structure - data is:', typeof data.data);
    }

    return data;
  } catch (error) {
    console.error('Error testing API:', error);
    return null;
  }
};

// Make functions available globally for testing
(window as any).populateQuranDatabase = populateQuranDatabase;
(window as any).populateCompleteQuran = populateCompleteQuran;
(window as any).fetchVersesFromAPI = fetchVersesFromAPI;
(window as any).getRandomVersesForDaily = getRandomVersesForDaily;
(window as any).testAPIResponse = testAPIResponse;
(window as any).fetchVersesAlternative = fetchVersesAlternative;

// Fallback function with hardcoded verses
export const createFallbackVerses = async () => {
  try {
    console.log('Creating fallback verses...');

    const fallbackVerses = [
      {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 1,
        reference: 'الفاتحة: 1',
        surahNumber: 1,
        verseNumber: 1,
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: '[All] praise is [due] to Allah, Lord of the worlds -',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 2,
        reference: 'الفاتحة: 2',
        surahNumber: 1,
        verseNumber: 2,
      },
      {
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'The Entirely Merciful, the Especially Merciful,',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 3,
        reference: 'الفاتحة: 3',
        surahNumber: 1,
        verseNumber: 3,
      },
      {
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Sovereign of the Day of Recompense.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 4,
        reference: 'الفاتحة: 4',
        surahNumber: 1,
        verseNumber: 4,
      },
      {
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'It is You we worship and You we ask for help.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 5,
        reference: 'الفاتحة: 5',
        surahNumber: 1,
        verseNumber: 5,
      },
      {
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide us to the straight path -',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 6,
        reference: 'الفاتحة: 6',
        surahNumber: 1,
        verseNumber: 6,
      },
      {
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
        surah: 'Al-Fatiha',
        surahAr: 'الفاتحة',
        ayah: 7,
        reference: 'الفاتحة: 7',
        surahNumber: 1,
        verseNumber: 7,
      },
      {
        arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
        translation: 'And whoever fears Allah - He will make for him a way out',
        surah: 'At-Talaq',
        surahAr: 'الطلاق',
        ayah: 2,
        reference: 'الطلاق: 2',
        surahNumber: 65,
        verseNumber: 2,
      },
      {
        arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
        translation: 'And whoever relies upon Allah - then He is sufficient for him',
        surah: 'At-Talaq',
        surahAr: 'الطلاق',
        ayah: 3,
        reference: 'الطلاق: 3',
        surahNumber: 65,
        verseNumber: 3,
      },
      {
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        translation: 'Say, "He is Allah, [who is] One,',
        surah: 'Al-Ikhlas',
        surahAr: 'الإخلاص',
        ayah: 1,
        reference: 'الإخلاص: 1',
        surahNumber: 112,
        verseNumber: 1,
      },
      {
        arabic: 'اللَّهُ الصَّمَدُ',
        translation: 'Allah, the Eternal Refuge.',
        surah: 'Al-Ikhlas',
        surahAr: 'الإخلاص',
        ayah: 2,
        reference: 'الإخلاص: 2',
        surahNumber: 112,
        verseNumber: 2,
      },
      {
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        translation: 'He neither begets nor is born,',
        surah: 'Al-Ikhlas',
        surahAr: 'الإخلاص',
        ayah: 3,
        reference: 'الإخلاص: 3',
        surahNumber: 112,
        verseNumber: 3,
      },
      {
        arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        translation: 'Nor is there to Him any equivalent."',
        surah: 'Al-Ikhlas',
        surahAr: 'الإخلاص',
        ayah: 4,
        reference: 'الإخلاص: 4',
        surahNumber: 112,
        verseNumber: 4,
      }
    ];

    // Add to database
    for (const verse of fallbackVerses) {
      await addDoc(collection(db, 'quranVerses'), verse);
      console.log(`Added fallback verse: ${verse.reference}`);
    }

    console.log(`Successfully added ${fallbackVerses.length} fallback verses`);
    return fallbackVerses.length;
  } catch (error) {
    console.error('Error creating fallback verses:', error);
    return 0;
  }
};

(window as any).createFallbackVerses = createFallbackVerses;

// Function to populate the COMPLETE Quran (all 6,236 verses)
export const populateCompleteQuranFull = async (options = {}) => {
  const {
    startSurah = 1,
    endSurah = 114,
    batchSize = 5, // Process 5 surahs at a time
    delayBetweenBatches = 5000, // 5 seconds between batches
    delayBetweenSurahs = 2000, // 2 seconds between surahs
  } = options;

  try {
    console.log(`🕌 Starting COMPLETE Quran population from Surah ${startSurah} to ${endSurah}`);
    console.log(`📊 This will add approximately ${COMPLETE_QURAN_SURAHS.slice(startSurah - 1, endSurah).reduce((sum, s) => sum + s.verses, 0)} verses`);

    let totalAdded = 0;
    let totalExpected = 0;

    // Calculate total expected verses
    for (let i = startSurah - 1; i < endSurah && i < COMPLETE_QURAN_SURAHS.length; i++) {
      totalExpected += COMPLETE_QURAN_SURAHS[i].verses;
    }

    console.log(`🎯 Target: ${totalExpected} verses from ${endSurah - startSurah + 1} surahs`);

    // Process in batches to avoid overwhelming the API
    for (let batchStart = startSurah; batchStart <= endSurah; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize - 1, endSurah);

      console.log(`\n📦 Processing batch: Surahs ${batchStart}-${batchEnd}`);

      for (let surahNumber = batchStart; surahNumber <= batchEnd; surahNumber++) {
        const surahInfo = COMPLETE_QURAN_SURAHS[surahNumber - 1];
        if (!surahInfo) continue;

        try {
          console.log(`📖 Fetching Surah ${surahNumber}: ${surahInfo.name} (${surahInfo.verses} verses)`);

          // Use the alternative method which is more reliable
          const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}`);
          const data = await response.json();

          if (data.code === 200 && data.data) {
            let ayahs = [];

            // Handle different response structures
            if (data.data.ayahs && Array.isArray(data.data.ayahs)) {
              ayahs = data.data.ayahs;
            } else if (Array.isArray(data.data)) {
              ayahs = data.data;
            }

            if (ayahs.length > 0) {
              // Fetch English translation separately
              const englishResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.sahih`);
              const englishData = await englishResponse.json();

              let englishAyahs = [];
              if (englishData.code === 200 && englishData.data) {
                if (englishData.data.ayahs && Array.isArray(englishData.data.ayahs)) {
                  englishAyahs = englishData.data.ayahs;
                } else if (Array.isArray(englishData.data)) {
                  englishAyahs = englishData.data;
                }
              }

              // Add verses to database
              for (let i = 0; i < ayahs.length; i++) {
                const arabicVerse = ayahs[i];
                const englishVerse = englishAyahs[i] || { text: 'Translation not available' };

                const verse = {
                  arabic: arabicVerse.text || 'Arabic text not available',
                  translation: englishVerse.text || 'Translation not available',
                  surah: surahInfo.name,
                  surahAr: data.data.name || `سورة ${surahNumber}`,
                  ayah: arabicVerse.numberInSurah || (i + 1),
                  reference: `${data.data.name || surahInfo.name}: ${arabicVerse.numberInSurah || (i + 1)}`,
                  surahNumber: surahNumber,
                  verseNumber: arabicVerse.number || totalAdded + i + 1,
                };

                await addDoc(collection(db, 'quranVerses'), verse);
                totalAdded++;

                // Progress update every 100 verses
                if (totalAdded % 100 === 0) {
                  console.log(`✅ Progress: ${totalAdded}/${totalExpected} verses (${Math.round(totalAdded/totalExpected*100)}%)`);
                }
              }

              console.log(`✅ Completed Surah ${surahNumber}: ${ayahs.length} verses added`);
            } else {
              console.log(`⚠️ No verses found for Surah ${surahNumber}`);
            }
          } else {
            console.log(`❌ Failed to fetch Surah ${surahNumber}: ${data.status || 'Unknown error'}`);
          }

          // Delay between surahs
          if (surahNumber < batchEnd) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenSurahs));
          }

        } catch (error) {
          console.error(`❌ Error processing Surah ${surahNumber}:`, error);
          continue;
        }
      }

      // Delay between batches (except for the last batch)
      if (batchEnd < endSurah) {
        console.log(`⏳ Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log(`\n🎉 COMPLETE! Successfully added ${totalAdded}/${totalExpected} verses`);
    console.log(`📊 Coverage: ${Math.round(totalAdded/totalExpected*100)}%`);

    return {
      totalAdded,
      totalExpected,
      coverage: Math.round(totalAdded/totalExpected*100)
    };

  } catch (error) {
    console.error('❌ Error populating complete Quran:', error);
    throw error;
  }
};

(window as any).populateCompleteQuranFull = populateCompleteQuranFull;
