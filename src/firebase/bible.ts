import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './config';

// Bible verse interface
export interface BibleVerse {
  id: string;
  english: string;
  arabic: string;
  book: string;
  bookAr: string;
  chapter: number;
  verse: number;
  reference: string;
  referenceAr: string;
  bookNumber: number;
  testament: 'OT' | 'NT';
}

// Bible reading position interface
export interface BibleReadingPosition {
  userId: string;
  currentVerseIndex: number;
  currentBook: number;
  currentBookName: string;
  currentBookNameAr: string;
  currentChapter: number;
  lastReadAt: Date;
  progressPercentage: number;
}

// Bible progress interface
export interface BibleProgress {
  readVerses: number;
  totalVerses: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: Date | null;
  currentVerseIndex?: number;
  currentBook?: number;
  currentBookName?: string;
  currentBookNameAr?: string;
  currentChapter?: number;
  progressPercentage?: number;
}

// Get a single Bible verse by book, chapter, and verse number
export const getBibleVerse = async (
  bookNumber: number,
  chapter: number,
  verse: number
): Promise<BibleVerse | null> => {
  try {
    const versesQuery = query(
      collection(db, 'bibleVerses'),
      where('bookNumber', '==', bookNumber),
      where('chapter', '==', chapter),
      where('verse', '==', verse),
      limit(1)
    );

    const snapshot = await getDocs(versesQuery);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      english: data.english || '',
      arabic: data.arabic || '',
      book: data.book || '',
      bookAr: data.bookAr || '',
      chapter: data.chapter || 1,
      verse: data.verse || 1,
      reference: data.reference || '',
      referenceAr: data.referenceAr || '',
      bookNumber: data.bookNumber || 0,
      testament: data.testament || 'OT',
    };
  } catch (error) {
    console.error('❌ Error fetching Bible verse:', error);
    return null;
  }
};

// Get Bible verse by global index using pagination
// This function loads verses efficiently by paginating through the collection
export const getBibleVerseByIndex = async (verseIndex: number): Promise<BibleVerse | null> => {
  try {
    if (verseIndex < 0) return null;

    // For index 0, get first verse
    if (verseIndex === 0) {
      const firstQuery = query(
        collection(db, 'bibleVerses'),
        orderBy('bookNumber', 'asc'),
        orderBy('chapter', 'asc'),
        orderBy('verse', 'asc'),
        limit(1)
      );
      
      const snapshot = await getDocs(firstQuery);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        english: data.english || '',
        arabic: data.arabic || '',
        book: data.book || '',
        bookAr: data.bookAr || '',
        chapter: data.chapter || 1,
        verse: data.verse || 1,
        reference: data.reference || '',
        referenceAr: data.referenceAr || '',
        bookNumber: data.bookNumber || 0,
        testament: data.testament || 'OT',
      };
    }

    // For other indices, paginate through using startAfter
    // This is more efficient than loading all verses
    let lastDoc: any = null;
    let currentIndex = 0;
    const batchSize = 100; // Process in batches for efficiency

    while (currentIndex < verseIndex) {
      const remaining = verseIndex - currentIndex;
      const limitCount = Math.min(batchSize, remaining + 1);
      
      let versesQuery;
      if (lastDoc) {
        versesQuery = query(
          collection(db, 'bibleVerses'),
          orderBy('bookNumber', 'asc'),
          orderBy('chapter', 'asc'),
          orderBy('verse', 'asc'),
          startAfter(lastDoc),
          limit(limitCount)
        );
      } else {
        versesQuery = query(
          collection(db, 'bibleVerses'),
          orderBy('bookNumber', 'asc'),
          orderBy('chapter', 'asc'),
          orderBy('verse', 'asc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(versesQuery);
      
      if (snapshot.empty) {
        return null; // Reached end of collection
      }

      const docs = snapshot.docs;
      lastDoc = docs[docs.length - 1];
      currentIndex += docs.length;

      // If we've reached or passed the target index
      if (currentIndex > verseIndex) {
        const targetDocIndex = docs.length - (currentIndex - verseIndex);
        if (targetDocIndex >= 0 && targetDocIndex < docs.length) {
          const doc = docs[targetDocIndex];
          const data = doc.data();
          return {
            id: doc.id,
            english: data.english || '',
            arabic: data.arabic || '',
            book: data.book || '',
            bookAr: data.bookAr || '',
            chapter: data.chapter || 1,
            verse: data.verse || 1,
            reference: data.reference || '',
            referenceAr: data.referenceAr || '',
            bookNumber: data.bookNumber || 0,
            testament: data.testament || 'OT',
          };
        }
      }
    }

    // If we've reached the exact index
    if (currentIndex === verseIndex && lastDoc) {
      const data = lastDoc.data();
      return {
        id: lastDoc.id,
        english: data.english || '',
        arabic: data.arabic || '',
        book: data.book || '',
        bookAr: data.bookAr || '',
        chapter: data.chapter || 1,
        verse: data.verse || 1,
        reference: data.reference || '',
        referenceAr: data.referenceAr || '',
        bookNumber: data.bookNumber || 0,
        testament: data.testament || 'OT',
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching Bible verse by index:', error);
    return null;
  }
};

// Get total count of Bible verses (for progress calculation)
export const getBibleVersesCount = async (): Promise<number> => {
  try {
    const countQuery = query(collection(db, 'bibleVerses'));
    const snapshot = await getDocs(countQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting Bible verses count:', error);
    return 31102; // Fallback to approximate total
  }
};

// Get Bible verse by position using pagination (more efficient)
export const getBibleVerseByPosition = async (
  startAfterDoc?: any,
  limitCount: number = 1
): Promise<{ verses: BibleVerse[]; lastDoc: any }> => {
  try {
    let versesQuery;
    
    if (startAfterDoc) {
      versesQuery = query(
        collection(db, 'bibleVerses'),
        orderBy('bookNumber', 'asc'),
        orderBy('chapter', 'asc'),
        orderBy('verse', 'asc'),
        startAfter(startAfterDoc),
        limit(limitCount)
      );
    } else {
      versesQuery = query(
        collection(db, 'bibleVerses'),
        orderBy('bookNumber', 'asc'),
        orderBy('chapter', 'asc'),
        orderBy('verse', 'asc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(versesQuery);
    const verses: BibleVerse[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      verses.push({
        id: doc.id,
        english: data.english || '',
        arabic: data.arabic || '',
        book: data.book || '',
        bookAr: data.bookAr || '',
        chapter: data.chapter || 1,
        verse: data.verse || 1,
        reference: data.reference || '',
        referenceAr: data.referenceAr || '',
        bookNumber: data.bookNumber || 0,
        testament: data.testament || 'OT',
      });
    });

    return {
      verses,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('❌ Error fetching Bible verse by position:', error);
    return { verses: [], lastDoc: null };
  }
};

// Get next verse efficiently using cached document reference
export const getNextBibleVerse = async (currentVerse: BibleVerse): Promise<BibleVerse | null> => {
  try {
    // Get the document reference for the current verse
    const currentDocRef = doc(db, 'bibleVerses', currentVerse.id);
    const currentDocSnapshot = await getDoc(currentDocRef);
    
    if (!currentDocSnapshot.exists()) {
      return null;
    }

    // Get next verse using startAfter
    const nextQuery = query(
      collection(db, 'bibleVerses'),
      orderBy('bookNumber', 'asc'),
      orderBy('chapter', 'asc'),
      orderBy('verse', 'asc'),
      startAfter(currentDocSnapshot),
      limit(1)
    );

    const snapshot = await getDocs(nextQuery);
    
    if (snapshot.empty) {
      return null;
    }

    const nextDoc = snapshot.docs[0];
    const data = nextDoc.data();
    
    return {
      id: nextDoc.id,
      english: data.english || '',
      arabic: data.arabic || '',
      book: data.book || '',
      bookAr: data.bookAr || '',
      chapter: data.chapter || 1,
      verse: data.verse || 1,
      reference: data.reference || '',
      referenceAr: data.referenceAr || '',
      bookNumber: data.bookNumber || 0,
      testament: data.testament || 'OT',
    };
  } catch (error) {
    console.error('❌ Error fetching next Bible verse:', error);
    return null;
  }
};

// Get previous verse efficiently
export const getPreviousBibleVerse = async (currentVerse: BibleVerse): Promise<BibleVerse | null> => {
  try {
    // For previous, we need to query in reverse order
    // Get all verses before current and take the last one
    const prevQuery = query(
      collection(db, 'bibleVerses'),
      orderBy('bookNumber', 'desc'),
      orderBy('chapter', 'desc'),
      orderBy('verse', 'desc'),
      where('bookNumber', '<=', currentVerse.bookNumber),
      limit(100) // Get a batch to find the previous one
    );

    const snapshot = await getDocs(prevQuery);
    
    // Find the verse that comes before current
    for (const prevDoc of snapshot.docs) {
      const data = prevDoc.data();
      const verse: BibleVerse = {
        id: prevDoc.id,
        english: data.english || '',
        arabic: data.arabic || '',
        book: data.book || '',
        bookAr: data.bookAr || '',
        chapter: data.chapter || 1,
        verse: data.verse || 1,
        reference: data.reference || '',
        referenceAr: data.referenceAr || '',
        bookNumber: data.bookNumber || 0,
        testament: data.testament || 'OT',
      };

      // Check if this verse comes before current
      if (verse.bookNumber < currentVerse.bookNumber ||
          (verse.bookNumber === currentVerse.bookNumber && verse.chapter < currentVerse.chapter) ||
          (verse.bookNumber === currentVerse.bookNumber && verse.chapter === currentVerse.chapter && verse.verse < currentVerse.verse)) {
        return verse;
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching previous Bible verse:', error);
    return null;
  }
};

// Get all Bible verses (DEPRECATED - use lazy loading instead)
// Keep for backward compatibility but should not be used
export const getAllBibleVerses = async (): Promise<BibleVerse[]> => {
  console.warn('⚠️ getAllBibleVerses is deprecated. Use lazy loading instead.');
  return [];
};

// Get user's Bible reading progress
export const getUserBibleProgress = async (userId: string): Promise<BibleProgress> => {
  try {
    console.log('📖 Fetching Bible progress for user:', userId);
    
    // Get all user's reading history to ensure accuracy
    const allReadingHistoryQuery = query(
      collection(db, 'userBibleVerseReads'),
      where('userId', '==', userId)
    );
    
    const allReadingHistorySnapshot = await getDocs(allReadingHistoryQuery);
    
    // Get unique verse IDs from reading history
    const uniqueReadVerses = new Set<string>();
    allReadingHistorySnapshot.docs.forEach(doc => {
      const verseId = doc.data().verseId;
      if (verseId) {
        uniqueReadVerses.add(verseId);
      }
    });
    
    const actualReadCount = uniqueReadVerses.size;
    console.log('📊 Actual read verses from userBibleVerseReads collection:', actualReadCount);
    
    // Get recent reading history for streak calculation
    const recentReadingHistoryQuery = query(
      collection(db, 'userBibleVerseReads'),
      where('userId', '==', userId),
      orderBy('readAt', 'desc'),
      limit(30) // Last 30 days for streak calculation
    );
    
    const recentReadingHistorySnapshot = await getDocs(recentReadingHistoryQuery);
    const readingHistory = recentReadingHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      readAt: doc.data().readAt?.toDate?.() || new Date(doc.data().readAt),
    }));
    
    // Calculate streaks (simplified - you can improve this later)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (readingHistory.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      
      for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayRecord = readingHistory.find(r => {
          const readDate = new Date(r.readAt);
          readDate.setHours(0, 0, 0, 0);
          return readDate.toISOString().split('T')[0] === dateStr;
        });
        
        if (dayRecord) {
          if (i === 0 || currentStreak > 0) {
            currentStreak++;
          }
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i === 0) {
            // Today not read yet, but don't break streak if it's still today
            const now = new Date();
            if (dateStr === now.toISOString().split('T')[0]) {
              // It's still today, don't break streak yet
            } else {
              tempStreak = 0;
            }
          } else {
            tempStreak = 0;
          }
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    // Get progress document for other data
    const progressDoc = await getDoc(doc(db, 'userBibleProgress', userId));
    
    // Determine the most accurate read verses count
    // Priority: actualReadCount from userBibleVerseReads > progressDoc.readVerses
    let readVersesCount = actualReadCount;
    
    // If no data in userBibleVerseReads, fallback to progress document
    if (readVersesCount === 0 && progressDoc.exists()) {
      const data = progressDoc.data();
      readVersesCount = data.readVerses || 0;
    }
    
    // Update progress document if there's a mismatch
    if (actualReadCount > 0 && progressDoc.exists()) {
      const data = progressDoc.data();
      if (actualReadCount !== data.readVerses) {
        console.log('🔄 Syncing readVerses in userBibleProgress document:', actualReadCount);
        try {
          await updateDoc(doc(db, 'userBibleProgress', userId), {
            readVerses: actualReadCount
          });
        } catch (updateError) {
          console.error('Error updating readVerses:', updateError);
        }
      }
    }
    
    console.log('✅ Final read verses count:', readVersesCount);
    
    // Get other data from progress document if it exists
    if (progressDoc.exists()) {
      const data = progressDoc.data();
      return {
        readVerses: readVersesCount,
        totalVerses: data.totalVerses || 31102,
        currentStreak: currentStreak || data.currentStreak || 0,
        longestStreak: longestStreak || data.longestStreak || 0,
        lastReadDate: readingHistory.length > 0 ? readingHistory[0].readAt : (data.lastReadDate?.toDate() || null),
        currentVerseIndex: data.currentVerseIndex || 0,
        currentBook: data.currentBook,
        currentBookName: data.currentBookName,
        currentBookNameAr: data.currentBookNameAr,
        currentChapter: data.currentChapter,
        progressPercentage: data.progressPercentage || 0,
      };
    }
    
    return {
      readVerses: readVersesCount,
      totalVerses: 31102,
      currentStreak,
      longestStreak,
      lastReadDate: readingHistory.length > 0 ? readingHistory[0].readAt : null,
      currentVerseIndex: 0,
      progressPercentage: 0,
    };
  } catch (error) {
    console.error('❌ Error fetching user Bible progress:', error);
    return {
      readVerses: 0,
      totalVerses: 31102,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      currentVerseIndex: 0,
      progressPercentage: 0,
    };
  }
};

// Get user's current reading position
export const getCurrentBibleReadingPosition = async (userId: string): Promise<BibleReadingPosition | null> => {
  try {
    const positionDoc = await getDoc(doc(db, 'userBibleReadingPositions', userId));

    if (!positionDoc.exists()) {
      return {
        userId,
        currentVerseIndex: 0,
        currentBook: 1,
        currentBookName: 'Genesis',
        currentBookNameAr: 'سفر التكوين',
        currentChapter: 1,
        lastReadAt: new Date(),
        progressPercentage: 0,
      };
    }

    const data = positionDoc.data() as BibleReadingPosition;
    if (data.lastReadAt && typeof data.lastReadAt !== 'object') {
      data.lastReadAt = new Date(data.lastReadAt);
    }

    return data;
  } catch (error) {
    console.error('Error fetching Bible reading position:', error);
    return null;
  }
};

// Update reading position
export const updateBibleReadingPosition = async (userId: string, verseIndex: number, verse: BibleVerse) => {
  try {
    const totalVerses = 31102; // Approximate total
    const progressPercentage = (verseIndex / totalVerses) * 100;

    const readingPosition: BibleReadingPosition = {
      userId,
      currentVerseIndex: verseIndex,
      currentBook: verse.bookNumber,
      currentBookName: verse.book,
      currentBookNameAr: verse.bookAr,
      currentChapter: verse.chapter,
      lastReadAt: new Date(),
      progressPercentage,
    };

    await setDoc(doc(db, 'userBibleReadingPositions', userId), readingPosition);
    return true;
  } catch (error) {
    console.error('Error updating Bible reading position:', error);
    throw error;
  }
};

// Reset reading position
export const resetBibleReadingPosition = async (userId: string) => {
  try {
    const defaultPosition: BibleReadingPosition = {
      userId,
      currentVerseIndex: 0,
      currentBook: 1,
      currentBookName: 'Genesis',
      currentBookNameAr: 'سفر التكوين',
      currentChapter: 1,
      lastReadAt: new Date(),
      progressPercentage: 0,
    };

    await setDoc(doc(db, 'userBibleReadingPositions', userId), defaultPosition);
    return true;
  } catch (error) {
    console.error('Error resetting Bible reading position:', error);
    throw error;
  }
};

// Mark verse as read
export const markBibleVerseAsRead = async (userId: string, verseId: string, verse: BibleVerse) => {
  try {
    // Add to user's read verses collection
    await addDoc(collection(db, 'userBibleVerseReads'), {
      userId,
      verseId,
      verseData: verse,
      readAt: serverTimestamp(),
    });

    // Update user's progress
    const progressDoc = doc(db, 'userBibleProgress', userId);
    const progressSnapshot = await getDoc(progressDoc);

    if (progressSnapshot.exists()) {
      const currentData = progressSnapshot.data();
      await updateDoc(progressDoc, {
        readVerses: (currentData.readVerses || 0) + 1,
        lastReadDate: serverTimestamp(),
      });
    } else {
      await setDoc(progressDoc, {
        readVerses: 1,
        totalVerses: 31102,
        currentStreak: 1,
        longestStreak: 1,
        lastReadDate: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error marking Bible verse as read:', error);
    throw error;
  }
};

// Check if user has read a verse
export const hasUserReadBibleVerse = async (userId: string, verseId: string): Promise<boolean> => {
  try {
    const readQuery = query(
      collection(db, 'userBibleVerseReads'),
      where('userId', '==', userId),
      where('verseId', '==', verseId),
      limit(1)
    );

    const snapshot = await getDocs(readQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if verse is read:', error);
    return false;
  }
};

