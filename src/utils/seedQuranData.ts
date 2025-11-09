import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

export const seedQuranData = async () => {
  try {
    console.log('Starting to seed Quran data...');

    // Sample Quran verses
    const verses = [
      {
        arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
        translation: 'And whoever fears Allah - He will make for him a way out and provide for him from where he does not expect.',
        surah: 'At-Talaq',
        surahAr: 'الطلاق',
        ayah: 2,
        reference: 'الطلاق: 2-3',
      },
      {
        arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ',
        translation: 'And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.',
        surah: 'At-Talaq',
        surahAr: 'الطلاق',
        ayah: 3,
        reference: 'الطلاق: 3',
      },
      {
        arabic: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ وَعَسَىٰ أَن تُحِبُّوا شَيْئًا وَهُوَ شَرٌّ لَّكُمْ',
        translation: 'But perhaps you hate a thing and it is good for you; and perhaps you love a thing and it is bad for you.',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 216,
        reference: 'البقرة: 216',
      },
      {
        arabic: 'وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
        translation: 'And Allah loves the doers of good',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 195,
        reference: 'البقرة: 195',
      },
      {
        arabic: 'وَبَشِّرِ الصَّابِرِينَ',
        translation: 'And give good tidings to the patient',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 155,
        reference: 'البقرة: 155',
      },
      {
        arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ',
        translation: 'And my success is not but through Allah. Upon him I have relied, and to Him I return.',
        surah: 'Hud',
        surahAr: 'هود',
        ayah: 88,
        reference: 'هود: 88',
      },
      {
        arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
        translation: 'And He is with you wherever you are',
        surah: 'Al-Hadid',
        surahAr: 'الحديد',
        ayah: 4,
        reference: 'الحديد: 4',
      },
      {
        arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
        translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
        surah: 'Al-Baqarah',
        surahAr: 'البقرة',
        ayah: 152,
        reference: 'البقرة: 152',
      },
      {
        arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
        translation: 'And I did not create the jinn and mankind except to worship Me.',
        surah: 'Adh-Dhariyat',
        surahAr: 'الذاريات',
        ayah: 56,
        reference: 'الذاريات: 56',
      },
      {
        arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ',
        translation: 'And do not despair of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people.',
        surah: 'Yusuf',
        surahAr: 'يوسف',
        ayah: 87,
        reference: 'يوسف: 87',
      }
    ];

    // Add Quran verses
    for (const verse of verses) {
      await addDoc(collection(db, 'quranVerses'), verse);
      console.log(`Added verse from: ${verse.surah}`);
    }

    // Create daily verses for the past week
    const dailyVerses = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Use different verses for different days
      const verseIndex = i % verses.length;
      const verse = verses[verseIndex];
      
      dailyVerses.push({
        ...verse,
        date: dateString,
        isToday: i === 0,
      });
    }

    // Add daily verses
    for (const dailyVerse of dailyVerses) {
      await addDoc(collection(db, 'dailyVerses'), dailyVerse);
      console.log(`Added daily verse for: ${dailyVerse.date}`);
    }

    console.log('Quran data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Quran data:', error);
    throw error;
  }
};

// Function to call from browser console
(window as any).seedQuranData = seedQuranData;
