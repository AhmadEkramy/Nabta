import {
    collection,
    doc,
    DocumentData,
    DocumentSnapshot,
    limit,
    onSnapshot,
    orderBy,
    query,
    QuerySnapshot,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

// Hook to listen to a single document
export const useDocument = (collectionName: string, docId: string) => {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc: DocumentSnapshot) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
};

// Hook to listen to a collection with optional query conditions
export const useCollection = (
  collectionName: string,
  conditions?: Array<{
    field: string;
    operator: any;
    value: any;
  }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  limitCount?: number
) => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(collection(db, collectionName));

    // Add where conditions
    if (conditions) {
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }

    // Add ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    // Add limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching collection:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(conditions), orderByField, orderDirection, limitCount]);

  return { data, loading, error };
};

// Hook to listen to user's posts
export const useUserPosts = (userId: string) => {
  return useCollection(
    'posts',
    [{ field: 'userId', operator: '==', value: userId }],
    'createdAt',
    'desc'
  );
};

// Hook to listen to posts from specific circles
export const useCirclePosts = (circleIds: string[]) => {
  return useCollection(
    'posts',
    circleIds.length > 0 ? [{ field: 'circleId', operator: 'in', value: circleIds }] : undefined,
    'createdAt',
    'desc',
    50
  );
};