'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Loader from '../Loader';
import MeetingCard from '../Meeting/MeetingCard';
import { useRouter } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  callId: string;
  // Add other properties as needed
}

const CallList = ({ type }: { type: 'upcoming' | 'ended' | 'recordings' }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user) return;

      const lessonsRef = collection(db, 'bookings'); // Changed from 'lessons' to 'bookings'
      const now = new Date();
      const q = query(
        lessonsRef,
        where('teacherId', '==', user.id),
        where(
          'date',
          type === 'upcoming' ? '>=' : '<',
          now.toISOString().split('T')[0],
        ),
        orderBy('date', type === 'upcoming' ? 'asc' : 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const fetchedLessons: Lesson[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Lesson, 'id'>),
      }));
      setLessons(fetchedLessons);
      setIsLoading(false);
    };

    fetchLessons();
  }, [user, type]);

  if (isLoading) return <Loader />;

  const getNoCallsMessage = () => {
    switch (type) {
      case 'upcoming':
        return 'No upcoming lessons scheduled.';
      case 'ended':
        return 'No previous lessons found.';
      case 'recordings':
        return 'No recordings available.';
      default:
        return 'No lessons found.';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {lessons.length > 0 ? (
        lessons.map((lesson) => (
          <MeetingCard
            key={lesson.id}
            icon={
              type === 'ended'
                ? '/assets/icons/previous.svg'
                : '/assets/icons/upcoming.svg'
            }
            title={lesson.title}
            date={`${lesson.date} ${lesson.startTime} - ${lesson.endTime}`}
            isPreviousMeeting={type === 'ended'}
            link={`/meeting/${lesson.callId}`}
            buttonText={type === 'upcoming' ? 'Join' : 'View'}
            handleClick={() => router.push(`/meeting/${lesson.callId}`)}
          />
        ))
      ) : (
        <h1 className="text-2xl font-bold text-white">{getNoCallsMessage()}</h1>
      )}
    </div>
  );
};

export default CallList;
