import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

// Bible API endpoints
const BIBLE_API_BASE = 'https://bible-api.com';
// Note: Unfortunately, there's no free public API that provides Arabic Bible text
// Options:
// 1. Use bible-api.com for English (free)
// 2. Manually add Arabic text using addBibleVerseManually or uploadBibleVersesBatch
// 3. Use paid APIs like YouVersion API (requires API key)
// 4. Use web scraping from sites like wordproject.org or st-takla.org (check their terms)

// Complete Bible structure (66 books)
export const BIBLE_BOOKS = [
  // Old Testament (39 books)
  { number: 1, name: 'Genesis', nameAr: 'سفر التكوين', chapters: 50, testament: 'OT' },
  { number: 2, name: 'Exodus', nameAr: 'سفر الخروج', chapters: 40, testament: 'OT' },
  { number: 3, name: 'Leviticus', nameAr: 'سفر اللاويين', chapters: 27, testament: 'OT' },
  { number: 4, name: 'Numbers', nameAr: 'سفر العدد', chapters: 36, testament: 'OT' },
  { number: 5, name: 'Deuteronomy', nameAr: 'سفر التثنية', chapters: 34, testament: 'OT' },
  { number: 6, name: 'Joshua', nameAr: 'سفر يشوع', chapters: 24, testament: 'OT' },
  { number: 7, name: 'Judges', nameAr: 'سفر القضاة', chapters: 21, testament: 'OT' },
  { number: 8, name: 'Ruth', nameAr: 'سفر راعوث', chapters: 4, testament: 'OT' },
  { number: 9, name: '1 Samuel', nameAr: 'صموئيل الأول', chapters: 31, testament: 'OT' },
  { number: 10, name: '2 Samuel', nameAr: 'صموئيل الثاني', chapters: 24, testament: 'OT' },
  { number: 11, name: '1 Kings', nameAr: 'ملوك الأول', chapters: 22, testament: 'OT' },
  { number: 12, name: '2 Kings', nameAr: 'ملوك الثاني', chapters: 25, testament: 'OT' },
  { number: 13, name: '1 Chronicles', nameAr: 'أخبار الأيام الأول', chapters: 29, testament: 'OT' },
  { number: 14, name: '2 Chronicles', nameAr: 'أخبار الأيام الثاني', chapters: 36, testament: 'OT' },
  { number: 15, name: 'Ezra', nameAr: 'سفر عزرا', chapters: 10, testament: 'OT' },
  { number: 16, name: 'Nehemiah', nameAr: 'سفر نحميا', chapters: 13, testament: 'OT' },
  { number: 17, name: 'Esther', nameAr: 'سفر أستير', chapters: 10, testament: 'OT' },
  { number: 18, name: 'Job', nameAr: 'سفر أيوب', chapters: 42, testament: 'OT' },
  { number: 19, name: 'Psalms', nameAr: 'سفر المزامير', chapters: 150, testament: 'OT' },
  { number: 20, name: 'Proverbs', nameAr: 'سفر الأمثال', chapters: 31, testament: 'OT' },
  { number: 21, name: 'Ecclesiastes', nameAr: 'سفر الجامعة', chapters: 12, testament: 'OT' },
  { number: 22, name: 'Song of Songs', nameAr: 'سفر نشيد الأنشاد', chapters: 8, testament: 'OT' },
  { number: 23, name: 'Isaiah', nameAr: 'سفر إشعياء', chapters: 66, testament: 'OT' },
  { number: 24, name: 'Jeremiah', nameAr: 'سفر إرميا', chapters: 52, testament: 'OT' },
  { number: 25, name: 'Lamentations', nameAr: 'سفر مراثي إرميا', chapters: 5, testament: 'OT' },
  { number: 26, name: 'Ezekiel', nameAr: 'سفر حزقيال', chapters: 48, testament: 'OT' },
  { number: 27, name: 'Daniel', nameAr: 'سفر دانيال', chapters: 12, testament: 'OT' },
  { number: 28, name: 'Hosea', nameAr: 'سفر هوشع', chapters: 14, testament: 'OT' },
  { number: 29, name: 'Joel', nameAr: 'سفر يوئيل', chapters: 3, testament: 'OT' },
  { number: 30, name: 'Amos', nameAr: 'سفر عاموس', chapters: 9, testament: 'OT' },
  { number: 31, name: 'Obadiah', nameAr: 'سفر عوبديا', chapters: 1, testament: 'OT' },
  { number: 32, name: 'Jonah', nameAr: 'سفر يونان', chapters: 4, testament: 'OT' },
  { number: 33, name: 'Micah', nameAr: 'سفر ميخا', chapters: 7, testament: 'OT' },
  { number: 34, name: 'Nahum', nameAr: 'سفر ناحوم', chapters: 3, testament: 'OT' },
  { number: 35, name: 'Habakkuk', nameAr: 'سفر حبقوق', chapters: 3, testament: 'OT' },
  { number: 36, name: 'Zephaniah', nameAr: 'سفر صفنيا', chapters: 3, testament: 'OT' },
  { number: 37, name: 'Haggai', nameAr: 'سفر حجي', chapters: 2, testament: 'OT' },
  { number: 38, name: 'Zechariah', nameAr: 'سفر زكريا', chapters: 14, testament: 'OT' },
  { number: 39, name: 'Malachi', nameAr: 'سفر ملاخي', chapters: 4, testament: 'OT' },
  // New Testament (27 books)
  { number: 40, name: 'Matthew', nameAr: 'إنجيل متى', chapters: 28, testament: 'NT' },
  { number: 41, name: 'Mark', nameAr: 'إنجيل مرقس', chapters: 16, testament: 'NT' },
  { number: 42, name: 'Luke', nameAr: 'إنجيل لوقا', chapters: 24, testament: 'NT' },
  { number: 43, name: 'John', nameAr: 'إنجيل يوحنا', chapters: 21, testament: 'NT' },
  { number: 44, name: 'Acts', nameAr: 'سفر أعمال الرسل', chapters: 28, testament: 'NT' },
  { number: 45, name: 'Romans', nameAr: 'رسالة بولس الرسول إلى أهل رومية', chapters: 16, testament: 'NT' },
  { number: 46, name: '1 Corinthians', nameAr: 'رسالة بولس الرسول الأولى إلى أهل كورنثوس', chapters: 16, testament: 'NT' },
  { number: 47, name: '2 Corinthians', nameAr: 'رسالة بولس الرسول الثانية إلى أهل كورنثوس', chapters: 13, testament: 'NT' },
  { number: 48, name: 'Galatians', nameAr: 'رسالة بولس الرسول إلى أهل غلاطية', chapters: 6, testament: 'NT' },
  { number: 49, name: 'Ephesians', nameAr: 'رسالة بولس الرسول إلى أهل أفسس', chapters: 6, testament: 'NT' },
  { number: 50, name: 'Philippians', nameAr: 'رسالة بولس الرسول إلى أهل فيلبي', chapters: 4, testament: 'NT' },
  { number: 51, name: 'Colossians', nameAr: 'رسالة بولس الرسول إلى أهل كولوسي', chapters: 4, testament: 'NT' },
  { number: 52, name: '1 Thessalonians', nameAr: 'رسالة بولس الرسول الأولى إلى أهل تسالونيكي', chapters: 5, testament: 'NT' },
  { number: 53, name: '2 Thessalonians', nameAr: 'رسالة بولس الرسول الثانية إلى أهل تسالونيكي', chapters: 4, testament: 'NT' },
  { number: 54, name: '1 Timothy', nameAr: 'رسالة بولس الرسول الأولى إلى تيموثاوس', chapters: 6, testament: 'NT' },
  { number: 55, name: '2 Timothy', nameAr: 'رسالة بولس الرسول الثانية إلى تيموثاوس', chapters: 4, testament: 'NT' },
  { number: 56, name: 'Titus', nameAr: 'رسالة بولس الرسول إلى تيطس', chapters: 3, testament: 'NT' },
  { number: 57, name: 'Philemon', nameAr: 'رسالة بولس الرسول إلى فليمون', chapters: 1, testament: 'NT' },
  { number: 58, name: 'Hebrews', nameAr: 'رسالة بولس الرسول إلى العبرانيين', chapters: 13, testament: 'NT' },
  { number: 59, name: 'James', nameAr: 'رسالة يعقوب', chapters: 5, testament: 'NT' },
  { number: 60, name: '1 Peter', nameAr: 'رسالة بطرس الرسول الأولى', chapters: 5, testament: 'NT' },
  { number: 61, name: '2 Peter', nameAr: 'رسالة بطرس الرسول الثانية', chapters: 3, testament: 'NT' },
  { number: 62, name: '1 John', nameAr: 'رسالة يوحنا الرسول الأولى', chapters: 5, testament: 'NT' },
  { number: 63, name: '2 John', nameAr: 'رسالة يوحنا الرسول الثانية', chapters: 1, testament: 'NT' },
  { number: 64, name: '3 John', nameAr: 'رسالة يوحنا الرسول الثالثة', chapters: 1, testament: 'NT' },
  { number: 65, name: 'Jude', nameAr: 'رسالة يهوذا', chapters: 1, testament: 'NT' },
  { number: 66, name: 'Revelation', nameAr: 'سفر الرؤيا', chapters: 22, testament: 'NT' },
];

// Interface for Bible API response
interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleAPIResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

// Fetch verses from Bible API
export const fetchBibleVersesFromAPI = async (
  bookName: string,
  chapter: number,
  startVerse: number = 1,
  endVerse?: number
) => {
  try {
    console.log(`Fetching ${bookName} ${chapter}:${startVerse}${endVerse ? `-${endVerse}` : ''}...`);

    // Fetch English text (KJV version)
    const englishUrl = endVerse
      ? `${BIBLE_API_BASE}/${bookName} ${chapter}:${startVerse}-${endVerse}`
      : `${BIBLE_API_BASE}/${bookName} ${chapter}:${startVerse}`;
    
    const englishResponse = await fetch(englishUrl);
    const englishData: BibleAPIResponse = await englishResponse.json();

    if (!englishData || !englishData.verses || englishData.verses.length === 0) {
      console.warn(`No English text found for ${bookName} ${chapter}:${startVerse}`);
      return [];
    }

    // For Arabic, we'll need to use a different approach
    // Since bible-api.com doesn't support Arabic directly, we'll structure the data
    // to allow manual Arabic input or use a different API
    const verses = englishData.verses.map((verse) => ({
      english: verse.text.trim(),
      arabic: '', // Will be populated separately or via different API
      book: bookName,
      bookAr: '', // Will be set based on BIBLE_BOOKS
      chapter: verse.chapter,
      verse: verse.verse,
      reference: `${bookName} ${verse.chapter}:${verse.verse}`,
      referenceAr: `${bookName} ${verse.chapter}:${verse.verse}`, // Will be updated
      bookNumber: BIBLE_BOOKS.find(b => b.name === bookName)?.number || 0,
      testament: BIBLE_BOOKS.find(b => b.name === bookName)?.testament || '',
    }));

    // Set Arabic book name
    const bookInfo = BIBLE_BOOKS.find(b => b.name === bookName);
    if (bookInfo) {
      verses.forEach(v => {
        v.bookAr = bookInfo.nameAr;
        v.referenceAr = `${bookInfo.nameAr} ${v.chapter}:${v.verse}`;
      });
    }

    console.log(`Successfully fetched ${verses.length} verses from ${bookName}`);
    return verses;
  } catch (error) {
    console.error(`Error fetching verses from API for ${bookName} ${chapter}:`, error);
    return [];
  }
};

// Fetch complete chapter
export const fetchBibleChapter = async (bookName: string, chapter: number) => {
  try {
    console.log(`Fetching complete chapter: ${bookName} ${chapter}...`);

    const englishUrl = `${BIBLE_API_BASE}/${bookName} ${chapter}`;
    const englishResponse = await fetch(englishUrl);
    const englishData: BibleAPIResponse = await englishResponse.json();

    if (!englishData || !englishData.verses || englishData.verses.length === 0) {
      console.warn(`No verses found for ${bookName} ${chapter}`);
      return [];
    }

    const bookInfo = BIBLE_BOOKS.find(b => b.name === bookName);
    
    const verses = englishData.verses.map((verse) => ({
      english: verse.text.trim(),
      arabic: '', // Will be populated separately
      book: bookName,
      bookAr: bookInfo?.nameAr || '',
      chapter: verse.chapter,
      verse: verse.verse,
      reference: `${bookName} ${verse.chapter}:${verse.verse}`,
      referenceAr: bookInfo ? `${bookInfo.nameAr} ${verse.chapter}:${verse.verse}` : '',
      bookNumber: bookInfo?.number || 0,
      testament: bookInfo?.testament || '',
    }));

    console.log(`Successfully fetched ${verses.length} verses from ${bookName} ${chapter}`);
    return verses;
  } catch (error) {
    console.error(`Error fetching chapter ${bookName} ${chapter}:`, error);
    return [];
  }
};

// Populate Bible database with verses (English only from API)
// ⚠️ NOTE: This will only populate English text. Arabic will be empty.
// To add Arabic text, use uploadBibleVersesBatch or addBibleVerseManually
export const populateBibleDatabase = async (
  startBook: number = 1,
  endBook: number = 66,
  options: {
    delayBetweenBooks?: number;
    delayBetweenChapters?: number;
  } = {}
) => {
  const {
    delayBetweenBooks = 2000,
    delayBetweenChapters = 1000,
  } = options;

  try {
    console.log(`📖 Starting Bible population from Book ${startBook} to ${endBook}...`);

    let totalAdded = 0;
    const booksToProcess = BIBLE_BOOKS.slice(startBook - 1, endBook);

    console.log(`📚 Processing ${booksToProcess.length} books...`);

    for (const book of booksToProcess) {
      console.log(`\n📖 Processing Book ${book.number}: ${book.name} (${book.nameAr})`);
      console.log(`   ${book.chapters} chapters`);

      try {
        for (let chapter = 1; chapter <= book.chapters; chapter++) {
          try {
            const verses = await fetchBibleChapter(book.name, chapter);

            if (verses.length > 0) {
              for (const verse of verses) {
                try {
                  await addDoc(collection(db, 'bibleVerses'), verse);
                  totalAdded++;

                  // Progress update every 100 verses
                  if (totalAdded % 100 === 0) {
                    console.log(`   ✅ Progress: ${totalAdded} verses added so far...`);
                  }
                } catch (error) {
                  console.error(`   ❌ Error adding verse ${book.name} ${chapter}:${verse.verse}:`, error);
                }
              }

              console.log(`   ✅ Chapter ${chapter}: ${verses.length} verses added`);
            } else {
              console.log(`   ⚠️ Chapter ${chapter}: No verses found`);
            }

            // Delay between chapters (except for the last chapter)
            if (chapter < book.chapters) {
              await new Promise(resolve => setTimeout(resolve, delayBetweenChapters));
            }
          } catch (error) {
            console.error(`   ❌ Error fetching chapter ${chapter}:`, error);
            continue;
          }
        }

        console.log(`✅ Completed Book ${book.number}: ${book.name}`);
      } catch (error) {
        console.error(`❌ Error processing book ${book.name}:`, error);
        continue;
      }

      // Delay between books (except for the last book)
      if (book.number < endBook) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBooks));
      }
    }

    console.log(`\n🎉 COMPLETE! Successfully added ${totalAdded} Bible verses`);
    return {
      totalAdded,
      booksProcessed: booksToProcess.length,
    };
  } catch (error) {
    console.error('❌ Error populating Bible database:', error);
    throw error;
  }
};

// Function to add Bible verse manually with both Arabic and English
export const addBibleVerseManually = async (
  bookName: string,
  bookNameAr: string,
  chapter: number,
  verse: number,
  englishText: string,
  arabicText: string,
  bookNumber?: number,
  testament?: string
) => {
  try {
    const bookInfo = BIBLE_BOOKS.find(b => b.name === bookName || b.nameAr === bookNameAr);
    
    const verseData = {
      english: englishText.trim(),
      arabic: arabicText.trim(),
      book: bookName,
      bookAr: bookNameAr || bookInfo?.nameAr || '',
      chapter: chapter,
      verse: verse,
      reference: `${bookName} ${chapter}:${verse}`,
      referenceAr: `${bookNameAr} ${chapter}:${verse}`,
      bookNumber: bookNumber || bookInfo?.number || 0,
      testament: testament || bookInfo?.testament || '',
    };

    await addDoc(collection(db, 'bibleVerses'), verseData);
    console.log(`✅ Added verse: ${verseData.reference}`);
    return verseData;
  } catch (error) {
    console.error(`❌ Error adding verse ${bookName} ${chapter}:${verse}:`, error);
    throw error;
  }
};

// Function to upload Bible verses from an array (for batch upload)
export const uploadBibleVersesBatch = async (verses: Array<{
  book: string;
  bookAr: string;
  chapter: number;
  verse: number;
  english: string;
  arabic: string;
  bookNumber?: number;
  testament?: string;
}>) => {
  try {
    console.log(`📖 Uploading ${verses.length} Bible verses...`);
    
    let totalAdded = 0;
    let totalFailed = 0;

    for (const verse of verses) {
      try {
        const bookInfo = BIBLE_BOOKS.find(
          b => b.name === verse.book || b.nameAr === verse.bookAr
        );

        const verseData = {
          english: verse.english.trim(),
          arabic: verse.arabic.trim(),
          book: verse.book,
          bookAr: verse.bookAr || bookInfo?.nameAr || '',
          chapter: verse.chapter,
          verse: verse.verse,
          reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
          referenceAr: `${verse.bookAr} ${verse.chapter}:${verse.verse}`,
          bookNumber: verse.bookNumber || bookInfo?.number || 0,
          testament: verse.testament || bookInfo?.testament || '',
        };

        await addDoc(collection(db, 'bibleVerses'), verseData);
        totalAdded++;

        if (totalAdded % 100 === 0) {
          console.log(`   ✅ Progress: ${totalAdded}/${verses.length} verses uploaded...`);
        }
      } catch (error) {
        totalFailed++;
        console.error(`   ❌ Error uploading verse ${verse.book} ${verse.chapter}:${verse.verse}:`, error);
      }
    }

    console.log(`\n🎉 Upload complete! ${totalAdded} verses added, ${totalFailed} failed`);
    return { totalAdded, totalFailed };
  } catch (error) {
    console.error('❌ Error in batch upload:', error);
    throw error;
  }
};

// Function to populate Bible with both English (from API) and Arabic (manual)
// Use this if you have Arabic Bible data in JSON format
export const populateBibleWithArabic = async (
  arabicData: Record<string, Record<string, Record<string, string>>>,
  startBook: number = 1,
  endBook: number = 66
) => {
  try {
    console.log(`📖 Starting Bible population with Arabic text from Book ${startBook} to ${endBook}...`);

    let totalAdded = 0;
    const booksToProcess = BIBLE_BOOKS.slice(startBook - 1, endBook);

    for (const book of booksToProcess) {
      console.log(`\n📖 Processing Book ${book.number}: ${book.name} (${book.nameAr})`);

      try {
        for (let chapter = 1; chapter <= book.chapters; chapter++) {
          try {
            // Fetch English from API
            const englishVerses = await fetchBibleChapter(book.name, chapter);

            if (englishVerses.length > 0) {
              for (const englishVerse of englishVerses) {
                try {
                  // Get Arabic text from provided data
                  const arabicText = arabicData[book.name]?.[chapter.toString()]?.[englishVerse.verse.toString()] || '';
                  
                  const verseData = {
                    ...englishVerse,
                    arabic: arabicText,
                  };

                  await addDoc(collection(db, 'bibleVerses'), verseData);
                  totalAdded++;

                  if (totalAdded % 100 === 0) {
                    console.log(`   ✅ Progress: ${totalAdded} verses added...`);
                  }
                } catch (error) {
                  console.error(`   ❌ Error adding verse ${book.name} ${chapter}:${englishVerse.verse}:`, error);
                }
              }

              console.log(`   ✅ Chapter ${chapter}: ${englishVerses.length} verses added`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`   ❌ Error fetching chapter ${chapter}:`, error);
            continue;
          }
        }

        console.log(`✅ Completed Book ${book.number}: ${book.name}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error processing book ${book.name}:`, error);
        continue;
      }
    }

    console.log(`\n🎉 COMPLETE! Successfully added ${totalAdded} Bible verses with Arabic`);
    return { totalAdded };
  } catch (error) {
    console.error('❌ Error populating Bible with Arabic:', error);
    throw error;
  }
};

// Function to populate sample Bible verses (for testing)
export const populateSampleBible = async () => {
  try {
    console.log('📖 Populating sample Bible verses...');

    const sampleBooks = [
      { book: 'Genesis', chapter: 1, verses: [1, 2, 3] },
      { book: 'John', chapter: 3, verses: [16] },
      { book: 'Psalms', chapter: 23, verses: [1, 2, 3] },
      { book: 'Matthew', chapter: 5, verses: [3, 4, 5] },
    ];

    let totalAdded = 0;

    for (const sample of sampleBooks) {
      for (const verse of sample.verses) {
        const verses = await fetchBibleVersesFromAPI(sample.book, sample.chapter, verse, verse);
        
        for (const v of verses) {
          try {
            await addDoc(collection(db, 'bibleVerses'), v);
            totalAdded++;
            console.log(`Added ${v.reference}`);
          } catch (error) {
            console.error(`Error adding ${v.reference}:`, error);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Successfully added ${totalAdded} sample verses`);
    return totalAdded;
  } catch (error) {
    console.error('❌ Error populating sample Bible:', error);
    throw error;
  }
};

// Function to upload Bible from JSON files (Arabic and English)
export const uploadBibleFromJSONFiles = async () => {
  try {
    console.log('📖 Loading Bible JSON files...');
    
    // Fetch JSON files from public folder
    const [arabicResponse, englishResponse] = await Promise.all([
      fetch('/ar_svd.json'),
      fetch('/en_bbe.json')
    ]);

    if (!arabicResponse.ok || !englishResponse.ok) {
      throw new Error('Failed to load JSON files');
    }

    const arabicData = await arabicResponse.json();
    const englishData = await englishResponse.json();

    console.log(`✅ Loaded ${arabicData.length} books from Arabic file`);
    console.log(`✅ Loaded ${englishData.length} books from English file`);

    // Map book abbreviations to our book names
    const bookAbbrevMap: Record<string, { name: string; nameAr: string; number: number; testament: string }> = {};
    BIBLE_BOOKS.forEach(book => {
      const abbrev = book.name.toLowerCase().substring(0, 2);
      bookAbbrevMap[abbrev] = {
        name: book.name,
        nameAr: book.nameAr,
        number: book.number,
        testament: book.testament
      };
    });

    // Handle special cases for book abbreviations
    const specialAbbrev: Record<string, string> = {
      'gn': 'Genesis',
      'ex': 'Exodus',
      'lv': 'Leviticus',
      'nu': 'Numbers',
      'dt': 'Deuteronomy',
      'js': 'Joshua',
      'jg': 'Judges',
      'rt': 'Ruth',
      '1sa': '1 Samuel',
      '2sa': '2 Samuel',
      '1ki': '1 Kings',
      '2ki': '2 Kings',
      '1ch': '1 Chronicles',
      '2ch': '2 Chronicles',
      'er': 'Ezra',
      'ne': 'Nehemiah',
      'es': 'Esther',
      'jb': 'Job',
      'ps': 'Psalms',
      'pr': 'Proverbs',
      'ec': 'Ecclesiastes',
      'so': 'Song of Songs',
      'is': 'Isaiah',
      'jr': 'Jeremiah',
      'lm': 'Lamentations',
      'ek': 'Ezekiel',
      'dn': 'Daniel',
      'hs': 'Hosea',
      'jl': 'Joel',
      'am': 'Amos',
      'ob': 'Obadiah',
      'jnh': 'Jonah', // Using jnh to avoid conflict with John
      'mc': 'Micah',
      'na': 'Nahum',
      'hk': 'Habakkuk',
      'zp': 'Zephaniah',
      'hg': 'Haggai',
      'zc': 'Zechariah',
      'ml': 'Malachi',
      'mt': 'Matthew',
      'mk': 'Mark',
      'lk': 'Luke',
      'jn': 'John',
      'ac': 'Acts',
      'rm': 'Romans',
      '1co': '1 Corinthians',
      '2co': '2 Corinthians',
      'gl': 'Galatians',
      'ep': 'Ephesians',
      'pp': 'Philippians',
      'cl': 'Colossians',
      '1th': '1 Thessalonians',
      '2th': '2 Thessalonians',
      '1ti': '1 Timothy',
      '2ti': '2 Timothy',
      'tt': 'Titus',
      'ph': 'Philemon',
      'hb': 'Hebrews',
      'jm': 'James',
      '1pe': '1 Peter',
      '2pe': '2 Peter',
      '1jn': '1 John',
      '2jn': '2 John',
      '3jn': '3 John',
      'jd': 'Jude',
      'rv': 'Revelation',
    };

    let totalAdded = 0;
    let totalFailed = 0;

    // Process each book
    for (let bookIndex = 0; bookIndex < Math.min(arabicData.length, englishData.length); bookIndex++) {
      const arabicBook = arabicData[bookIndex];
      const englishBook = englishData[bookIndex];

      // Find book info from abbreviation
      const bookName = specialAbbrev[arabicBook.abbrev] || BIBLE_BOOKS[bookIndex]?.name || `Book ${bookIndex + 1}`;
      const bookInfo = BIBLE_BOOKS.find(b => b.name === bookName) || BIBLE_BOOKS[bookIndex];

      if (!bookInfo) {
        console.warn(`⚠️ Could not find book info for ${arabicBook.abbrev}`);
        continue;
      }

      console.log(`\n📖 Processing Book ${bookInfo.number}: ${bookInfo.name} (${bookInfo.nameAr})`);

      // Process each chapter
      const maxChapters = Math.min(
        arabicBook.chapters?.length || 0,
        englishBook.chapters?.length || 0,
        bookInfo.chapters
      );

      for (let chapterIndex = 0; chapterIndex < maxChapters; chapterIndex++) {
        const arabicChapter = arabicBook.chapters[chapterIndex];
        const englishChapter = englishBook.chapters[chapterIndex];
        const chapterNumber = chapterIndex + 1;

        if (!arabicChapter || !englishChapter) {
          continue;
        }

        // Process each verse
        const maxVerses = Math.min(arabicChapter.length, englishChapter.length);

        for (let verseIndex = 0; verseIndex < maxVerses; verseIndex++) {
          const arabicText = arabicChapter[verseIndex]?.trim() || '';
          const englishText = englishChapter[verseIndex]?.trim() || '';
          const verseNumber = verseIndex + 1;

          if (!arabicText && !englishText) {
            continue;
          }

          try {
            const verseData = {
              english: englishText,
              arabic: arabicText,
              book: bookInfo.name,
              bookAr: bookInfo.nameAr,
              chapter: chapterNumber,
              verse: verseNumber,
              reference: `${bookInfo.name} ${chapterNumber}:${verseNumber}`,
              referenceAr: `${bookInfo.nameAr} ${chapterNumber}:${verseNumber}`,
              bookNumber: bookInfo.number,
              testament: bookInfo.testament,
            };

            await addDoc(collection(db, 'bibleVerses'), verseData);
            totalAdded++;

            if (totalAdded % 100 === 0) {
              console.log(`   ✅ Progress: ${totalAdded} verses uploaded...`);
            }
          } catch (error) {
            totalFailed++;
            console.error(`   ❌ Error uploading verse ${bookInfo.name} ${chapterNumber}:${verseNumber}:`, error);
          }
        }

        if (chapterIndex % 10 === 0 && chapterIndex > 0) {
          console.log(`   ✅ Completed ${chapterIndex} chapters...`);
        }
      }

      console.log(`✅ Completed Book ${bookInfo.number}: ${bookInfo.name}`);
    }

    console.log(`\n🎉 UPLOAD COMPLETE!`);
    console.log(`   ✅ ${totalAdded} verses uploaded`);
    console.log(`   ❌ ${totalFailed} verses failed`);
    
    return { totalAdded, totalFailed };
  } catch (error) {
    console.error('❌ Error uploading Bible from JSON files:', error);
    throw error;
  }
};

// Alternative: Upload from JSON data directly (if you copy-paste the JSON)
export const uploadBibleFromJSONData = async (
  arabicJSON: any[],
  englishJSON: any[]
) => {
  try {
    console.log('📖 Processing Bible JSON data...');
    console.log(`   Arabic: ${arabicJSON.length} books`);
    console.log(`   English: ${englishJSON.length} books`);

    // Same logic as uploadBibleFromJSONFiles but with direct data
    const specialAbbrev: Record<string, string> = {
      'gn': 'Genesis', 'ex': 'Exodus', 'lv': 'Leviticus', 'nu': 'Numbers', 'dt': 'Deuteronomy',
      'js': 'Joshua', 'jg': 'Judges', 'rt': 'Ruth', '1sa': '1 Samuel', '2sa': '2 Samuel',
      '1ki': '1 Kings', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles',
      'er': 'Ezra', 'ne': 'Nehemiah', 'es': 'Esther', 'jb': 'Job', 'ps': 'Psalms',
      'pr': 'Proverbs', 'ec': 'Ecclesiastes', 'so': 'Song of Songs', 'is': 'Isaiah',
      'jr': 'Jeremiah', 'lm': 'Lamentations', 'ek': 'Ezekiel', 'dn': 'Daniel',
      'hs': 'Hosea', 'jl': 'Joel', 'am': 'Amos', 'ob': 'Obadiah', 'jnh': 'Jonah',
      'mc': 'Micah', 'na': 'Nahum', 'hk': 'Habakkuk', 'zp': 'Zephaniah',
      'hg': 'Haggai', 'zc': 'Zechariah', 'ml': 'Malachi',
      'mt': 'Matthew', 'mk': 'Mark', 'lk': 'Luke', 'jn': 'John', 'ac': 'Acts',
      'rm': 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', 'gl': 'Galatians',
      'ep': 'Ephesians', 'pp': 'Philippians', 'cl': 'Colossians',
      '1th': '1 Thessalonians', '2th': '2 Thessalonians', '1ti': '1 Timothy', '2ti': '2 Timothy',
      'tt': 'Titus', 'ph': 'Philemon', 'hb': 'Hebrews', 'jm': 'James',
      '1pe': '1 Peter', '2pe': '2 Peter', '1jn': '1 John', '2jn': '2 John',
      '3jn': '3 John', 'jd': 'Jude', 'rv': 'Revelation',
    };

    let totalAdded = 0;
    let totalFailed = 0;

    for (let bookIndex = 0; bookIndex < Math.min(arabicJSON.length, englishJSON.length); bookIndex++) {
      const arabicBook = arabicJSON[bookIndex];
      const englishBook = englishJSON[bookIndex];

      const bookName = specialAbbrev[arabicBook.abbrev] || BIBLE_BOOKS[bookIndex]?.name || `Book ${bookIndex + 1}`;
      const bookInfo = BIBLE_BOOKS.find(b => b.name === bookName) || BIBLE_BOOKS[bookIndex];

      if (!bookInfo) {
        console.warn(`⚠️ Could not find book info for ${arabicBook.abbrev}`);
        continue;
      }

      console.log(`\n📖 Processing Book ${bookInfo.number}: ${bookInfo.name}`);

      const maxChapters = Math.min(
        arabicBook.chapters?.length || 0,
        englishBook.chapters?.length || 0,
        bookInfo.chapters
      );

      for (let chapterIndex = 0; chapterIndex < maxChapters; chapterIndex++) {
        const arabicChapter = arabicBook.chapters[chapterIndex];
        const englishChapter = englishBook.chapters[chapterIndex];
        const chapterNumber = chapterIndex + 1;

        if (!arabicChapter || !englishChapter) continue;

        const maxVerses = Math.min(arabicChapter.length, englishChapter.length);

        for (let verseIndex = 0; verseIndex < maxVerses; verseIndex++) {
          const arabicText = arabicChapter[verseIndex]?.trim() || '';
          const englishText = englishChapter[verseIndex]?.trim() || '';
          const verseNumber = verseIndex + 1;

          if (!arabicText && !englishText) continue;

          try {
            const verseData = {
              english: englishText,
              arabic: arabicText,
              book: bookInfo.name,
              bookAr: bookInfo.nameAr,
              chapter: chapterNumber,
              verse: verseNumber,
              reference: `${bookInfo.name} ${chapterNumber}:${verseNumber}`,
              referenceAr: `${bookInfo.nameAr} ${chapterNumber}:${verseNumber}`,
              bookNumber: bookInfo.number,
              testament: bookInfo.testament,
            };

            await addDoc(collection(db, 'bibleVerses'), verseData);
            totalAdded++;

            if (totalAdded % 100 === 0) {
              console.log(`   ✅ Progress: ${totalAdded} verses...`);
            }
          } catch (error) {
            totalFailed++;
            if (totalFailed <= 5) {
              console.error(`   ❌ Error: ${bookInfo.name} ${chapterNumber}:${verseNumber}`);
            }
          }
        }
      }

      console.log(`✅ Completed ${bookInfo.name}`);
    }

    console.log(`\n🎉 Complete! ${totalAdded} verses uploaded, ${totalFailed} failed`);
    return { totalAdded, totalFailed };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

// Make functions available globally for console access
(window as any).populateBibleDatabase = populateBibleDatabase;
(window as any).populateSampleBible = populateSampleBible;
(window as any).fetchBibleVersesFromAPI = fetchBibleVersesFromAPI;
(window as any).fetchBibleChapter = fetchBibleChapter;
(window as any).addBibleVerseManually = addBibleVerseManually;
(window as any).uploadBibleVersesBatch = uploadBibleVersesBatch;
(window as any).populateBibleWithArabic = populateBibleWithArabic;
(window as any).uploadBibleFromJSONFiles = uploadBibleFromJSONFiles;
(window as any).uploadBibleFromJSONData = uploadBibleFromJSONData;
(window as any).BIBLE_BOOKS = BIBLE_BOOKS; // Expose books list for reference

