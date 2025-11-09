import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './config';

/**
 * Sync user's Quran reading data
 * This function ensures that the readVersesCount in the user document
 * matches the actual count of unique verses in userVerseReads collection
 */
export const syncUserQuranData = async (userId: string): Promise<{
  success: boolean;
  oldCount: number;
  newCount: number;
  synced: boolean;
}> => {
  try {
    console.log('🔄 Starting Quran data sync for user:', userId);
    
    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('⚠️ User document does not exist');
      return { success: false, oldCount: 0, newCount: 0, synced: false };
    }
    
    const userData = userDoc.data();
    const oldCount = userData.readVersesCount || 0;
    
    // Get all unique verses from userVerseReads collection
    const readsQuery = query(
      collection(db, 'userVerseReads'),
      where('userId', '==', userId)
    );
    
    const readsSnapshot = await getDocs(readsQuery);
    
    // Get unique verse IDs
    const uniqueVerseIds = new Set<string>();
    readsSnapshot.docs.forEach(doc => {
      const verseId = doc.data().verseId;
      if (verseId) {
        uniqueVerseIds.add(verseId);
      }
    });
    
    const actualCount = uniqueVerseIds.size;
    
    console.log('📊 Sync results:', {
      oldCount,
      actualCount,
      difference: actualCount - oldCount
    });
    
    // Update if there's a difference
    if (actualCount !== oldCount) {
      await updateDoc(userRef, {
        readVersesCount: actualCount,
        readVerses: Array.from(uniqueVerseIds)
      });
      
      console.log('✅ Successfully synced readVersesCount:', actualCount);
      return { success: true, oldCount, newCount: actualCount, synced: true };
    }
    
    console.log('✅ Data already in sync');
    return { success: true, oldCount, newCount: actualCount, synced: false };
    
  } catch (error) {
    console.error('❌ Error syncing Quran data:', error);
    return { success: false, oldCount: 0, newCount: 0, synced: false };
  }
};

/**
 * Sync Quran data for all users (admin function)
 * Use with caution - this will process all users
 */
export const syncAllUsersQuranData = async (): Promise<{
  totalUsers: number;
  synced: number;
  failed: number;
  results: any[];
}> => {
  try {
    console.log('🔄 Starting bulk Quran data sync for all users...');
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const results = [];
    let synced = 0;
    let failed = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      try {
        const result = await syncUserQuranData(userId);
        if (result.success && result.synced) {
          synced++;
        }
        results.push({ userId, ...result });
      } catch (error) {
        failed++;
        results.push({ userId, success: false, error: error.message });
      }
    }
    
    console.log('✅ Bulk sync completed:', {
      total: usersSnapshot.docs.length,
      synced,
      failed
    });
    
    return {
      totalUsers: usersSnapshot.docs.length,
      synced,
      failed,
      results
    };
    
  } catch (error) {
    console.error('❌ Error in bulk sync:', error);
    throw error;
  }
};

