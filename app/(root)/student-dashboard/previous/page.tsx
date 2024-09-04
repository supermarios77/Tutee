'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const PreviousLessons = () => {
  const { user } = useUser();
  const [previousLessons, setPreviousLessons] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreviousLessons = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const now = new Date();
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('studentId', '==', user.id),
          where('date', '<', now.toISOString().split('T')[0]),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const lessons = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));

        setPreviousLessons(lessons);
      } catch (error) {
        console.error('Error fetching previous lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviousLessons();
  }, [user]);

  if (isLoading) {
    return <div>Loading previous lessons...</div>;
  }

  if (previousLessons.length === 0) {
    return <div>No previous lessons found.</div>;
  }

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <h1 className="text-3xl font-bold mb-4">Previous Lessons</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {previousLessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardHeader>
              <CardTitle>{format(new Date(lesson.date), 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Time: {lesson.startTime} - {lesson.endTime}</p>
              <p>Teacher: {lesson.teacherId}</p>
              <p>Type: {lesson.lessonType}</p>
              <p>Status: {lesson.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PreviousLessons;