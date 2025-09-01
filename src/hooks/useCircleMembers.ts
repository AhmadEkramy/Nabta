import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where,
    writeBatch
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';


export interface CircleMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  level: number;
  streak: number;
  joinedAt: string;
  role: 'member' | 'admin' | 'owner';
  contributions: number;
}

export const useCircleMembers = (circleId: string) => {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!circleId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    console.log('Fetching members for circle:', circleId); // Debugging line

    const q = query(
      collection(db, 'circleMembers'),
      where('circleId', '==', circleId),
      orderBy('joinedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Get the current members count from the circle document
        const circleDoc = await getDoc(doc(db, 'circles', circleId));
        const circleMembers = circleDoc.exists() ? circleDoc.data().members || 0 : 0;
        
        // Get the actual members from circleMembers collection
        const membersList: CircleMember[] = [];
        snapshot.forEach((doc) => {
          membersList.push({ id: doc.id, ...doc.data() } as CircleMember);
        });

        // Log any discrepancies for debugging
        if (circleMembers !== membersList.length) {
          console.warn('Member count mismatch in circle', circleId, {
            circleMembers,
            actualMembers: membersList.length,
            difference: circleMembers - membersList.length
          });
        }

        setMembers(membersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching members:', err);
        setError('Error fetching circle members');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [circleId]);

  const joinCircle = async (): Promise<boolean> => {
    if (!user || !circleId) return false;

    try {
      setJoining(true);

      // Check if already a member
      const membersRef = collection(db, 'circleMembers');
      const q = query(
        membersRef,
        where('circleId', '==', circleId),
        where('userId', '==', user.uid)
      );
      const existingMember = await getDocs(q);

      if (!existingMember.empty) {
        setError('Already a member of this circle');
        return false;
      }

      // Get a new write batch
      const batch = writeBatch(db);

      // Add member document
      const newMemberRef = doc(collection(db, 'circleMembers'));
      batch.set(newMemberRef, {
        userId: user.id,
        userName: user.name || 'Anonymous',
        userAvatar: user.avatar || '/default-avatar.png',
        circleId,
        role: 'member',
        joinedAt: serverTimestamp(),
        level: user.level || 1,
        streak: user.streak || 0,
        contributions: 0
      });

      // Update circle member count and memberIds
      const circleRef = doc(db, 'circles', circleId);
      batch.update(circleRef, {
        members: increment(1),
        memberIds: arrayUnion(user.uid)
      });

      // Update user's circles array
      if (user.uid) {
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, {
          circles: arrayUnion(circleId)
        });
      }

      // Commit all the writes as a single atomic unit
      await batch.commit();

      return true;
    } catch (err) {
      console.error('Error joining circle:', err);
      setError('Failed to join circle');
      return false;
    } finally {
      setJoining(false);
    }
  };

  const leaveCircle = async (): Promise<boolean> => {
    if (!user || !circleId) return false;

    try {
      // Find member document
      const q = query(
        collection(db, 'circleMembers'),
        where('circleId', '==', circleId),
        where('userId', '==', user.uid)
      );
      const memberDocs = await getDocs(q);

      if (memberDocs.empty) {
        setError('Not a member of this circle');
        return false;
      }

      // Get a new write batch
      const batch = writeBatch(db);

      // Delete member document
      const memberDoc = memberDocs.docs[0];
      batch.delete(memberDoc.ref);

      // Update circle member count and memberIds
      const circleRef = doc(db, 'circles', circleId);
      batch.update(circleRef, {
        members: increment(-1),
        memberIds: arrayRemove(user.uid)
      });

      // Update user's circles array
      if (user.uid) {
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, {
          circles: arrayRemove(circleId)
        });
      }

      // Commit all the writes as a single atomic unit
      await batch.commit();

      return true;
    } catch (err) {
      console.error('Error leaving circle:', err);
      setError('Failed to leave circle');
      return false;
    }
  };

  return {
    members,
    loading,
    error,
    joining,
    joinCircle,
    leaveCircle
  };
};
