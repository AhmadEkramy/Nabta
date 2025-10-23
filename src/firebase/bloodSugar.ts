import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const BLOOD_SUGAR_COLLECTION = 'bloodSugarLogs';

export interface BloodSugarEntryDB {
  id: string;
  value: number; // mg/dL
  when: string; // Fasting/Before Meal/etc
  timestamp: string; // ISO string
}

export interface BloodSugarLog {
  date: string; // YYYY-MM-DD
  entries: BloodSugarEntryDB[];
}

export type BloodSugarLogWithId = BloodSugarLog & { id: string };

export const getDailyBloodSugarLog = async (userId: string, date: string): Promise<BloodSugarLogWithId | null> => {
  const ref = collection(db, BLOOD_SUGAR_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '==', date));
  const snapshot = await getDocs(qy);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as any;
  return { id: d.id, date: data.date, entries: data.entries || [] } as BloodSugarLogWithId;
};

export const createDailyBloodSugarLog = async (userId: string, log: BloodSugarLog) => {
  const ref = collection(db, BLOOD_SUGAR_COLLECTION);
  const newDocRef = doc(ref);
  await setDoc(newDocRef, {
    ...log,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return newDocRef.id;
};

export const addBloodSugarEntry = async (logId: string, entry: BloodSugarEntryDB) => {
  const logRef = doc(db, BLOOD_SUGAR_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = Array.isArray(current.entries) ? [entry, ...current.entries] : [entry];
  await updateDoc(logRef, { entries: nextEntries, updatedAt: new Date().toISOString() });
};

export const deleteBloodSugarEntry = async (logId: string, entryId: string) => {
  const logRef = doc(db, BLOOD_SUGAR_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = (current.entries || []).filter((e: BloodSugarEntryDB) => e.id !== entryId);
  await updateDoc(logRef, { entries: nextEntries, updatedAt: new Date().toISOString() });
};

export const getWeeklyBloodSugarLogs = async (userId: string, startDate: string, endDate: string): Promise<BloodSugarLogWithId[]> => {
  const ref = collection(db, BLOOD_SUGAR_COLLECTION);
  const qy = query(
    ref,
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(qy);
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    return { id: d.id, date: data.date, entries: data.entries || [] } as BloodSugarLogWithId;
  });
};


