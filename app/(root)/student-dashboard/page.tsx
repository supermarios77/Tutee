'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, BookOpen, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Component() {
  const { user } = useUser();
  const [upcomingLessons, setUpcomingLessons] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingLessons = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const now = new Date();
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('studentId', '==', user.id),
          where('date', '>=', now.toISOString().split('T')[0]),
          where('status', '==', 'scheduled')
        );

        const querySnapshot = await getDocs(q);
        const lessons = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().startTime
        } as Booking));

        setUpcomingLessons(lessons);
      } catch (error) {
        console.error('Error fetching upcoming lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingLessons();
  }, [user]);

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now);

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-6">
      <Card className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold text-white">{time}</h1>
          <p className="text-lg text-gray-200">{date}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card text-card-foreground transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Lessons
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLessons.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingLessons.length === 1 ? 'lesson' : 'lessons'} scheduled
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Lesson
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingLessons[0]?.date || 'No lessons'}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingLessons[0]?.time || 'Schedule a lesson'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lessons
            </CardTitle>
            <BookOpen className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming soon</div>
            <p className="text-xs text-muted-foreground">
              Track your learning progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card text-card-foreground transition-colors duration-300">
        <CardHeader>
          <CardTitle>Upcoming Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : upcomingLessons.length > 0 ? (
            <ul className="space-y-2">
              {upcomingLessons.map((lesson) => (
                <li key={lesson.id} className="bg-muted p-3 rounded-lg transition-colors duration-300">
                  <p className="font-semibold">{lesson.date}</p>
                  <p className="text-sm text-muted-foreground">{lesson.time}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming lessons scheduled.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/join-meeting" className="block group">
          <Card className="bg-blue-600 group-hover:bg-blue-700 transition-colors border-none shadow-lg h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <UserCircle2 className="h-12 w-12 mb-2 text-white" />
              <h3 className="text-lg font-semibold text-white">Join Meeting</h3>
              <p className="text-sm text-center text-blue-100">Join your scheduled lesson</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/book-lesson" className="block group">
          <Card className="bg-purple-600 group-hover:bg-purple-700 transition-colors border-none shadow-lg h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <CalendarDays className="h-12 w-12 mb-2 text-white" />
              <h3 className="text-lg font-semibold text-white">Book New Lesson</h3>
              <p className="text-sm text-center text-purple-100">Schedule your next lesson</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/previous-lessons" className="block group">
          <Card className="bg-orange-600 group-hover:bg-orange-700 transition-colors border-none shadow-lg h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Clock className="h-12 w-12 mb-2 text-white" />
              <h3 className="text-lg font-semibold text-white">Previous Lessons</h3>
              <p className="text-sm text-center text-orange-100">View your lesson history</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}