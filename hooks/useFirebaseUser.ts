import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types/booking';

export function useFirebaseUser() {
  const { user } = useUser();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFirebaseUser() {
      if (user) {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setFirebaseUser(userSnap.data() as User);
        }
        setIsLoading(false);
      }
    }

    fetchFirebaseUser();
  }, [user]);

  return { user: firebaseUser, role: firebaseUser?.role, isLoading };
}