// hooks/useUserBookingInfo.ts

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';

export function useUserBookingInfo() {
  const { user } = useUser();
  const [userBookingInfo, setUserBookingInfo] = useState<{
    hasClaimedFreeTrial: boolean;
    bookings: Booking[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserBookingInfo() {
      if (!user) return;

      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          // Fetch user's bookings
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('studentId', '==', user.id),
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookings = bookingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Booking[];

          setUserBookingInfo({
            hasClaimedFreeTrial: userData.hasClaimedFreeTrial || false,
            bookings: bookings,
          });
        } else {
          setUserBookingInfo({
            hasClaimedFreeTrial: false,
            bookings: [],
          });
        }
      } catch (error) {
        console.error('Error fetching user booking info:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserBookingInfo();
  }, [user]);

  return { userBookingInfo, isLoading };
}
