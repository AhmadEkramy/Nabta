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
