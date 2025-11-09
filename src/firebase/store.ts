import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

export interface StoreItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  category: 'avatar' | 'theme' | 'badge' | 'boost' | 'special' | 'game';
  icon: string;
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isLimited?: boolean;
  discount?: number;
  gameId?: string; // ID of the game this item unlocks
  createdAt?: any;
  updatedAt?: any;
}

// Get all store items
export const getStoreItems = async (): Promise<StoreItem[]> => {
  try {
    const itemsQuery = query(
      collection(db, 'storeItems'),
      // orderBy('price', 'asc') // Optional: order by price
    );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    const items: StoreItem[] = [];
    
    itemsSnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
      } as StoreItem);
    });
    
    return items;
  } catch (error) {
    console.error('Error fetching store items:', error);
    throw error;
  }
};

// Get user's purchased items
export const getUserPurchasedItems = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.purchasedItems || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user purchased items:', error);
    return [];
  }
};

// Purchase an item (deduct XP and add to purchased items)
export const purchaseStoreItem = async (
  userId: string,
  itemId: string,
  itemPrice: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    const currentXP = userData.xp || 0;
    const purchasedItems = userData.purchasedItems || [];
    
    // Check if user already owns this item
    if (purchasedItems.includes(itemId)) {
      return { success: false, error: 'Item already purchased' };
    }
    
    // Check if user has enough XP
    if (currentXP < itemPrice) {
      return { success: false, error: 'Not enough XP' };
    }
    
    // Deduct XP and add item to purchased items
    await updateDoc(userRef, {
      xp: increment(-itemPrice),
      purchasedItems: arrayUnion(itemId),
    });
    
    // Create purchase record
    await addDoc(collection(db, 'purchases'), {
      userId,
      itemId,
      price: itemPrice,
      purchasedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error purchasing item:', error);
    return { success: false, error: 'Failed to purchase item' };
  }
};

// Check if user owns an item
export const checkItemOwnership = async (
  userId: string,
  itemId: string
): Promise<boolean> => {
  try {
    const purchasedItems = await getUserPurchasedItems(userId);
    return purchasedItems.includes(itemId);
  } catch (error) {
    console.error('Error checking item ownership:', error);
    return false;
  }
};

// Delete all store items from Firebase
export const deleteAllStoreItems = async (): Promise<{ success: boolean; deletedCount: number; error?: string }> => {
  try {
    const itemsQuery = query(collection(db, 'storeItems'));
    const itemsSnapshot = await getDocs(itemsQuery);
    
    if (itemsSnapshot.empty) {
      return { success: true, deletedCount: 0 };
    }
    
    const batch = writeBatch(db);
    let count = 0;
    
    itemsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${count} store items`);
    
    return { success: true, deletedCount: count };
  } catch (error) {
    console.error('Error deleting all store items:', error);
    return { success: false, deletedCount: 0, error: 'Failed to delete store items' };
  }
};

// Remove duplicate game items (keep only one of each gameId)
export const removeDuplicateGameItems = async (): Promise<{ success: boolean; removedCount: number; error?: string }> => {
  try {
    const itemsQuery = query(
      collection(db, 'storeItems'),
      where('category', '==', 'game')
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    
    if (itemsSnapshot.empty) {
      return { success: true, removedCount: 0 };
    }
    
    // Group items by gameId
    const itemsByGameId = new Map<string, any[]>();
    
    itemsSnapshot.forEach((doc) => {
      const data = doc.data();
      const gameId = data.gameId?.toLowerCase();
      
      if (gameId) {
        if (!itemsByGameId.has(gameId)) {
          itemsByGameId.set(gameId, []);
        }
        itemsByGameId.get(gameId)!.push({ id: doc.id, ...data });
      }
    });
    
    // Find duplicates and keep only the first one
    const batch = writeBatch(db);
    let removedCount = 0;
    
    itemsByGameId.forEach((items, gameId) => {
      if (items.length > 1) {
        // Keep the first item, delete the rest
        for (let i = 1; i < items.length; i++) {
          batch.delete(doc(db, 'storeItems', items[i].id));
          removedCount++;
        }
      }
    });
    
    if (removedCount > 0) {
      await batch.commit();
      console.log(`✅ Removed ${removedCount} duplicate game items`);
    }
    
    return { success: true, removedCount };
  } catch (error) {
    console.error('Error removing duplicate game items:', error);
    return { success: false, removedCount: 0, error: 'Failed to remove duplicate game items' };
  }
};

// Add game items to store (Chess and Sudoku)
export const addGameItemsToStore = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if items already exist by gameId
    const itemsQuery = query(
      collection(db, 'storeItems'),
      where('category', '==', 'game')
    );
    const existingItems = await getDocs(itemsQuery);
    
    const existingGameIds = new Set<string>();
    existingItems.forEach((doc) => {
      const data = doc.data();
      if (data.gameId) {
        existingGameIds.add(data.gameId.toLowerCase());
      }
    });
    
    // Add Chess game item if it doesn't exist
    if (!existingGameIds.has('chess')) {
      await addDoc(collection(db, 'storeItems'), {
        name: 'Chess Game',
        nameAr: 'لعبة الشطرنج',
        description: 'Unlock the premium Chess game and challenge strategic AI opponents',
        descriptionAr: 'افتح لعبة الشطرنج المميزة وتحدى منافسين ذكاء اصطناعي استراتيجيين',
        price: 500,
        category: 'game',
        icon: '♟️',
        rarity: 'epic',
        gameId: 'chess', // Identifier for the game
        createdAt: serverTimestamp(),
      });
      console.log('✅ Added Chess game item to store');
    }
    
    // Add Sudoku game item if it doesn't exist
    if (!existingGameIds.has('sudoku')) {
      await addDoc(collection(db, 'storeItems'), {
        name: 'Sudoku Game',
        nameAr: 'لعبة السودوكو',
        description: 'Unlock the premium Sudoku game and test your logic skills',
        descriptionAr: 'افتح لعبة السودوكو المميزة واختبر مهاراتك المنطقية',
        price: 400,
        category: 'game',
        icon: '🧮',
        rarity: 'epic',
        gameId: 'sudoku', // Identifier for the game
        createdAt: serverTimestamp(),
      });
      console.log('✅ Added Sudoku game item to store');
    }
    
    if (existingGameIds.has('chess') && existingGameIds.has('sudoku')) {
      console.log('Game items already exist in store');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding game items to store:', error);
    return { success: false, error: 'Failed to add game items' };
  }
};

// Check if user owns a game
export const checkGameOwnership = async (
  userId: string,
  gameName: string
): Promise<boolean> => {
  try {
    // Get all purchased items
    const purchasedItems = await getUserPurchasedItems(userId);
    
    // Find store items that unlock this game
    const itemsQuery = query(
      collection(db, 'storeItems'),
      where('category', '==', 'game')
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    
    // Check if user owns any item that unlocks this game
    for (const itemDoc of itemsSnapshot.docs) {
      const itemData = itemDoc.data();
      const gameId = itemData.gameId?.toLowerCase();
      const gameNameLower = gameName.toLowerCase();
      
      // Check if this item unlocks the game and user owns it
      if (gameId === gameNameLower && purchasedItems.includes(itemDoc.id)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking game ownership:', error);
    return false;
  }
};

// Get store item ID for a game
export const getGameStoreItemId = async (gameName: string): Promise<string | null> => {
  try {
    const itemsQuery = query(
      collection(db, 'storeItems'),
      where('category', '==', 'game')
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    
    for (const itemDoc of itemsSnapshot.docs) {
      const itemData = itemDoc.data();
      const gameId = itemData.gameId?.toLowerCase();
      const gameNameLower = gameName.toLowerCase();
      
      if (gameId === gameNameLower) {
        return itemDoc.id;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting game store item ID:', error);
    return null;
  }
};

