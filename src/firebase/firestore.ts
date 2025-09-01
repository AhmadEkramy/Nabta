import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentSnapshot,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QuerySnapshot,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './config';

// Generic function to add a document to a collection
export const addDocument = async (
  collectionName: string,
  data: any
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

// Generic function to get a document by ID
export const getDocument = async (
  collectionName: string,
  docId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  const docRef = doc(db, collectionName, docId);
  return await getDoc(docRef);
};

// Generic function to get all documents from a collection
export const getDocuments = async (
  collectionName: string
): Promise<QuerySnapshot<DocumentData>> => {
  return await getDocs(collection(db, collectionName));
};

// Generic function to update a document
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: any
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  return await updateDoc(docRef, data);
};

// Generic function to delete a document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  return await deleteDoc(docRef);
};

// Function to query documents with conditions
export const queryDocuments = async (
  collectionName: string,
  conditions: Array<{
    field: string;
    operator: any;
    value: any;
  }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  limitCount?: number
): Promise<QuerySnapshot<DocumentData>> => {
  let q = query(collection(db, collectionName));

  // Add where conditions
  conditions.forEach(condition => {
    q = query(q, where(condition.field, condition.operator, condition.value));
  });

  // Add ordering
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection));
  }

  // Add limit
  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  return await getDocs(q);
};