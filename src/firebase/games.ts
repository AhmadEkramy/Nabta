import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Game } from '../types';
import { db } from './config';

// Add a new game
export const addGame = async (game: Omit<Game, 'id'>) => {
  const docRef = await addDoc(collection(db, 'games'), {
    ...game,
    isActive: game.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Add a new game only if a game with the same name doesn't already exist
export const addGameIfNotExists = async (game: Omit<Game, 'id'>) => {
  const existingQ = query(collection(db, 'games'), where('name', '==', game.name));
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    // Return the first existing id to keep callers happy
    return existingSnap.docs[0].id;
  }
  return addGame(game);
};

// Get all games
export const getGames = async () => {
  const q = query(collection(db, 'games'));
  const querySnapshot = await getDocs(q);
  const games: Game[] = [];
  querySnapshot.forEach((doc) => {
    games.push({
      id: doc.id,
      ...(doc.data() as Omit<Game, 'id'>),
    });
  });
  return games;
};

// Update a game
export const updateGame = async (gameId: string, data: Partial<Game>) => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Get active games only
export const getActiveGames = async () => {
  const q = query(collection(db, 'games'), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);
  const games: Game[] = [];
  querySnapshot.forEach((doc) => {
    games.push({
      id: doc.id,
      ...(doc.data() as Omit<Game, 'id'>),
    });
  });
  return games;
};

// Delete a game
export const deleteGame = async (gameId: string) => {
  const gameRef = doc(db, 'games', gameId);
  await deleteDoc(gameRef);
};
