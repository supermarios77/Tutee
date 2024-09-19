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
  const [lessons, setLessons] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreviousLessons();
    }
  }, [user]);

  const fetchPreviousLessons = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const lessonsRef = collection(db, 'bookings');
      const q = query(
        lessonsRef,
        where('studentId', '==', user.id),
        where('date', '<', new Date().toISOString().split('T')[0]),
        orderBy('date', 'desc'),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedLessons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      setLessons(fetchedLessons);
    } catch (error) {
      console.error('Error fetching previous lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Previous Lessons</h1>
      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle>{lesson.title || 'Untitled Lesson'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Date: {format(new Date(lesson.date), 'MMMM d, yyyy')}</p>
                <p>Time: {lesson.startTime} - {lesson.endTime}</p>
                <p>Teacher: {lesson.teacherName || 'Unknown Teacher'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No previous lessons found.</p>
      )}
    </div>
  );
};

export default PreviousLessons;