import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const STEPS_COLLECTION = 'stepsLogs';

export interface StepsEntryDB {
  id: string;
  amount: number; // steps added in this entry
  timestamp: string; // ISO string
}

export interface StepsLog {
  date: string; // YYYY-MM-DD
  total: number; // total steps for the day (derived but stored for convenience)
  entries: StepsEntryDB[];
}

export type StepsLogWithId = StepsLog & { id: string };

export const getDailyStepsLog = async (userId: string, date: string): Promise<StepsLogWithId | null> => {
  const ref = collection(db, STEPS_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '==', date));
  const snapshot = await getDocs(qy);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as any;
  return { id: d.id, date: data.date, total: data.total ?? 0, entries: data.entries || [] } as StepsLogWithId;
};

export const createDailyStepsLog = async (userId: string, log: Omit<StepsLog, 'total'> & { total?: number }) => {
  const ref = collection(db, STEPS_COLLECTION);
  const newDocRef = doc(ref);
  const total = typeof log.total === 'number' ? log.total : (log.entries || []).reduce((s, e) => s + (e.amount || 0), 0);
  await setDoc(newDocRef, {
    ...log,
    total,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return newDocRef.id;
};

export const addStepsEntry = async (logId: string, entry: StepsEntryDB) => {
  const logRef = doc(db, STEPS_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = Array.isArray(current.entries) ? [entry, ...current.entries] : [entry];
  const nextTotal = (current.total || 0) + (entry.amount || 0);
  await updateDoc(logRef, { entries: nextEntries, total: nextTotal, updatedAt: new Date().toISOString() });
};

export const setStepsTotal = async (logId: string, total: number) => {
  const logRef = doc(db, STEPS_COLLECTION, logId);
  await updateDoc(logRef, { total, updatedAt: new Date().toISOString() });
};

export const resetStepsEntries = async (logId: string) => {
  const logRef = doc(db, STEPS_COLLECTION, logId);
  await updateDoc(logRef, { entries: [], total: 0, updatedAt: new Date().toISOString() });
};

export const getWeeklyStepsLogs = async (userId: string, startDate: string, endDate: string): Promise<StepsLogWithId[]> => {
  const ref = collection(db, STEPS_COLLECTION);
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
    return { id: d.id, date: data.date, total: data.total ?? 0, entries: data.entries || [] } as StepsLogWithId;
  });
};


