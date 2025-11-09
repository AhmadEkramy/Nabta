import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const SLEEP_COLLECTION = 'sleepLogs';

export interface SleepSessionDB {
  id: string;
  day: string; // e.g., Mon, Tue
  durationH: number;
  quality: number; // 1-5
  deepH: number;
  timestamp: string; // ISO
}

export interface SleepLog {
  date: string; // YYYY-MM-DD
  sessions: SleepSessionDB[];
}

export type SleepLogWithId = SleepLog & { id: string };

export const getDailySleepLog = async (userId: string, date: string): Promise<SleepLogWithId | null> => {
  const ref = collection(db, SLEEP_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '==', date));
  const snapshot = await getDocs(qy);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as any;
  return { id: d.id, date: data.date, sessions: data.sessions || [] } as SleepLogWithId;
};

export const createDailySleepLog = async (userId: string, log: SleepLog) => {
  const ref = collection(db, SLEEP_COLLECTION);
  const newDocRef = doc(ref);
  await setDoc(newDocRef, { ...log, userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return newDocRef.id;
};

export const addSleepSession = async (logId: string, session: SleepSessionDB) => {
  const logRef = doc(db, SLEEP_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const next = Array.isArray(current.sessions) ? [session, ...current.sessions] : [session];
  await updateDoc(logRef, { sessions: next, updatedAt: new Date().toISOString() });
};

export const deleteSleepSession = async (logId: string, sessionId: string) => {
  const logRef = doc(db, SLEEP_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const next = (current.sessions || []).filter((s: SleepSessionDB) => s.id !== sessionId);
  await updateDoc(logRef, { sessions: next, updatedAt: new Date().toISOString() });
};

export const getWeeklySleepLogs = async (userId: string, startDate: string, endDate: string): Promise<SleepLogWithId[]> => {
  const ref = collection(db, SLEEP_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '>=', startDate), where('date', '<=', endDate), orderBy('date', 'asc'));
  const snapshot = await getDocs(qy);
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    return { id: d.id, date: data.date, sessions: data.sessions || [] } as SleepLogWithId;
  });
};


