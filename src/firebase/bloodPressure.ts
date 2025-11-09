import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';

const BLOOD_PRESSURE_COLLECTION = 'bloodPressureLogs';

export interface BloodPressureEntryDB {
  id: string;
  sys: number; // mmHg systolic
  dia: number; // mmHg diastolic
  pulse: number; // bpm
  timestamp: string; // ISO string
}

export interface BloodPressureLog {
  date: string; // YYYY-MM-DD
  entries: BloodPressureEntryDB[];
}

export type BloodPressureLogWithId = BloodPressureLog & { id: string };

export const getDailyBloodPressureLog = async (userId: string, date: string): Promise<BloodPressureLogWithId | null> => {
  const ref = collection(db, BLOOD_PRESSURE_COLLECTION);
  const qy = query(ref, where('userId', '==', userId), where('date', '==', date));
  const snapshot = await getDocs(qy);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  const data = d.data() as any;
  return { id: d.id, date: data.date, entries: data.entries || [] } as BloodPressureLogWithId;
};

export const createDailyBloodPressureLog = async (userId: string, log: BloodPressureLog) => {
  const ref = collection(db, BLOOD_PRESSURE_COLLECTION);
  const newDocRef = doc(ref);
  await setDoc(newDocRef, {
    ...log,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return newDocRef.id;
};

export const addBloodPressureEntry = async (logId: string, entry: BloodPressureEntryDB) => {
  const logRef = doc(db, BLOOD_PRESSURE_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = Array.isArray(current.entries) ? [entry, ...current.entries] : [entry];
  await updateDoc(logRef, { entries: nextEntries, updatedAt: new Date().toISOString() });
};

export const deleteBloodPressureEntry = async (logId: string, entryId: string) => {
  const logRef = doc(db, BLOOD_PRESSURE_COLLECTION, logId);
  const snap = await getDoc(logRef);
  if (!snap.exists()) return;
  const current = snap.data() as any;
  const nextEntries = (current.entries || []).filter((e: BloodPressureEntryDB) => e.id !== entryId);
  await updateDoc(logRef, { entries: nextEntries, updatedAt: new Date().toISOString() });
};

export const getWeeklyBloodPressureLogs = async (userId: string, startDate: string, endDate: string): Promise<BloodPressureLogWithId[]> => {
  const ref = collection(db, BLOOD_PRESSURE_COLLECTION);
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
    return { id: d.id, date: data.date, entries: data.entries || [] } as BloodPressureLogWithId;
  });
};


