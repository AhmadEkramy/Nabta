import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const ACTIVITY_COLLECTION = 'activityLogs';

export type ActivityKey = 'running' | 'cycling' | 'swimming' | 'walking' | 'yoga' | 'strength';

export interface ActivitySessionDB {
  id: string;
  activity: ActivityKey;
  durationSec: number;
  calories: number;
  distanceKm?: number;
  timestamp: string; // ISO string
}

export interface ActivityLog {
  date: string; // YYYY-MM-DD
  sessions: ActivitySessionDB[];
}

export type ActivityLogWithId = ActivityLog & { id: string };

export const getDailyActivityLog = async (userId: string, date: string): Promise<ActivityLogWithId | null> => {
  const ref = collection(db, ACTIVITY_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '==', date));
  const snapshot = await getDocs(qy);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as any;
  return { id: d.id, date: data.date, sessions: data.sessions || [] } as ActivityLogWithId;
};

export const createDailyActivityLog = async (userId: string, log: ActivityLog) => {
  const ref = collection(db, ACTIVITY_COLLECTION);
  const newDocRef = doc(ref);
  await setDoc(newDocRef, {
    ...log,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return newDocRef.id;
};

export const addActivitySession = async (logId: string, session: ActivitySessionDB) => {
  const logRef = doc(db, ACTIVITY_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const next = Array.isArray(current.sessions) ? [session, ...current.sessions] : [session];
  await updateDoc(logRef, { sessions: next, updatedAt: new Date().toISOString() });
};

export const deleteActivitySession = async (logId: string, sessionId: string) => {
  const logRef = doc(db, ACTIVITY_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const next = (current.sessions || []).filter((s: ActivitySessionDB) => s.id !== sessionId);
  await updateDoc(logRef, { sessions: next, updatedAt: new Date().toISOString() });
};

export const setActivitySessions = async (logId: string, sessions: ActivitySessionDB[]) => {
  const logRef = doc(db, ACTIVITY_COLLECTION, logId);
  await updateDoc(logRef, { sessions, updatedAt: new Date().toISOString() });
};

export const getWeeklyActivityLogs = async (userId: string, startDate: string, endDate: string): Promise<ActivityLogWithId[]> => {
  const ref = collection(db, ACTIVITY_COLLECTION);
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
    return { id: d.id, date: data.date, sessions: data.sessions || [] } as ActivityLogWithId;
  });
};


