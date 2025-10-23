import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const WATER_COLLECTION = 'waterLogs';

export interface WaterEntryDB {
  id: string;
  amount: number; // in ml
  timestamp: string; // ISO string
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  entries: WaterEntryDB[];
  dailyGoal: number; // in ml
}

export type WaterLogWithId = WaterLog & { id: string };

export const getDailyWaterLog = async (userId: string, date: string): Promise<WaterLogWithId | null> => {
  const waterRef = collection(db, WATER_COLLECTION);
  const q = query(
    waterRef,
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return { id: docSnap.id, date: data.date, entries: data.entries || [], dailyGoal: data.dailyGoal } as WaterLogWithId;
};

export const createDailyWaterLog = async (userId: string, log: WaterLog) => {
  const waterRef = collection(db, WATER_COLLECTION);
  const newDocRef = doc(waterRef);
  await setDoc(newDocRef, {
    ...log,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return newDocRef.id;
};

export const addWaterEntry = async (logId: string, entry: WaterEntryDB) => {
  const logRef = doc(db, WATER_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = Array.isArray(current.entries) ? [...current.entries, entry] : [entry];
  await updateDoc(logRef, { entries: nextEntries, updatedAt: new Date().toISOString() });
};

export const deleteWaterEntry = async (logId: string, entryId: string) => {
  const logRef = doc(db, WATER_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = (current.entries || []).filter((e: WaterEntryDB) => e.id !== entryId);
  await updateDoc(logRef, { entries: nextEntries, updatedAt: new Date().toISOString() });
};

export const updateDailyWaterGoal = async (logId: string, dailyGoal: number) => {
  const logRef = doc(db, WATER_COLLECTION, logId);
  await updateDoc(logRef, { dailyGoal, updatedAt: new Date().toISOString() });
};

export const resetWaterEntries = async (logId: string) => {
  const logRef = doc(db, WATER_COLLECTION, logId);
  await updateDoc(logRef, { entries: [], updatedAt: new Date().toISOString() });
};

export const setWaterEntries = async (logId: string, entries: WaterEntryDB[]) => {
  const logRef = doc(db, WATER_COLLECTION, logId);
  await updateDoc(logRef, { entries, updatedAt: new Date().toISOString() });
};

export const getWeeklyWaterLogs = async (userId: string, startDate: string, endDate: string): Promise<WaterLogWithId[]> => {
  const waterRef = collection(db, WATER_COLLECTION);
  const q = query(
    waterRef,
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => {
    const data = d.data() as any;
    return { id: d.id, date: data.date, entries: data.entries || [], dailyGoal: data.dailyGoal } as WaterLogWithId;
  });
};


