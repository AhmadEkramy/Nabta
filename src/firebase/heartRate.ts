import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const HEART_RATE_COLLECTION = 'heartRateLogs';

export interface HeartRateEntryDB {
  id: string;
  bpm: number;
  timestamp: string; // ISO string
}

export interface HeartRateLog {
  date: string; // YYYY-MM-DD
  latest: number; // latest bpm for convenience
  entries: HeartRateEntryDB[];
}

export type HeartRateLogWithId = HeartRateLog & { id: string };

export const getDailyHeartRateLog = async (userId: string, date: string): Promise<HeartRateLogWithId | null> => {
  const ref = collection(db, HEART_RATE_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '==', date));
  const snapshot = await getDocs(qy);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as any;
  return { id: d.id, date: data.date, latest: data.latest ?? 0, entries: data.entries || [] } as HeartRateLogWithId;
};

export const createDailyHeartRateLog = async (userId: string, log: Omit<HeartRateLog, 'latest'> & { latest?: number }) => {
  const ref = collection(db, HEART_RATE_COLLECTION);
  const newDocRef = doc(ref);
  const latest = typeof log.latest === 'number' ? log.latest : (log.entries?.[0]?.bpm ?? 0);
  await setDoc(newDocRef, {
    ...log,
    latest,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return newDocRef.id;
};

export const addHeartRateEntry = async (logId: string, entry: HeartRateEntryDB) => {
  const logRef = doc(db, HEART_RATE_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = Array.isArray(current.entries) ? [entry, ...current.entries] : [entry];
  const latest = entry.bpm;
  await updateDoc(logRef, { entries: nextEntries, latest, updatedAt: new Date().toISOString() });
};

export const getWeeklyHeartRateLogs = async (userId: string, startDate: string, endDate: string): Promise<HeartRateLogWithId[]> => {
  const ref = collection(db, HEART_RATE_COLLECTION);
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
    return { id: d.id, date: data.date, latest: data.latest ?? 0, entries: data.entries || [] } as HeartRateLogWithId;
  });
};


