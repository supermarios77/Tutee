// app/hooks/useTeachers.ts
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Teacher } from '../types/booking';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const teachersRef = collection(db, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        const teachersData = teachersSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Teacher,
        );
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setError('Failed to fetch teachers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return { teachers, isLoading, error };
};
