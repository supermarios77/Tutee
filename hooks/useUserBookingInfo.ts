// app/hooks/useUserBookingInfo.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserBookingInfo } from '../types/booking';
import { useUser } from '@clerk/nextjs';

export const useUserBookingInfo = () => {
  const { user } = useUser();
  const [userBookingInfo, setUserBookingInfo] = useState<UserBookingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBookingInfo = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserBookingInfo(userDocSnap.data() as UserBookingInfo);
        } else {
          // If the user document doesn't exist, create it with default values
          const newUserBookingInfo: UserBookingInfo = { hasClaimedFreeTrial: false };
          setUserBookingInfo(newUserBookingInfo);
          // You might want to set this data in Firestore here as well
        }
      } catch (error) {
        console.error('Error fetching user booking info:', error);
        setError('Failed to fetch user information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBookingInfo();
  }, [user]);

  return { userBookingInfo, isLoading, error };
};