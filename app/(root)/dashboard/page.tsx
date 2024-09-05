'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, BookOpen, UserCircle2, Users, DollarSign, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TeacherHome() {
  const { user } = useUser();
  const [upcomingLessons, setUpcomingLessons] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalLessons: 0, totalEarnings: 0 });

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const now = new Date();
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('teacherId', '==', user.id),
          where('date', '>=', now.toISOString().split('T')[0]),
          where('status', '==', 'scheduled')
        );

        const querySnapshot = await getDocs(q);
        const lessons = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));

        setUpcomingLessons(lessons);

        // Fetch stats (this is a placeholder, you'd need to implement the actual logic)
        setStats({
          totalStudents: 50,
          totalLessons: 200,
          totalEarnings: 5000
        });
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
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
        <Card className="bg-card text-card-foreground hover:bg-accent transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active students
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground hover:bg-accent transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lessons
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              Lessons conducted
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground hover:bg-accent transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card text-card-foreground transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Lessons</CardTitle>
          <Link href="/teacher/lessons" className="text-sm text-blue-500 hover:text-blue-700 flex items-center">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : upcomingLessons.length > 0 ? (
            <ul className="space-y-2">
              {upcomingLessons.slice(0, 3).map((lesson) => (
                <li key={lesson.id} className="bg-muted p-3 rounded-lg transition-colors duration-300 hover:bg-accent">
                  <p className="font-semibold">{lesson.date}</p>
                  <p className="text-sm text-muted-foreground">{lesson.time}</p>
                  <p className="text-sm">Student: {lesson.studentName}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming lessons scheduled.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/teacher/join-meeting" className="block group">
          <Card className="bg-blue-600 group-hover:bg-blue-700 transition-colors border-none shadow-lg h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <UserCircle2 className="h-12 w-12 mb-2 text-white" />
              <h3 className="text-lg font-semibold text-white">Join Meeting</h3>
              <p className="text-sm text-center text-blue-100">Start your scheduled lesson</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/availability" className="block group">
          <Card className="bg-purple-600 group-hover:bg-purple-700 transition-colors border-none shadow-lg h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <CalendarDays className="h-12 w-12 mb-2 text-white" />
              <h3 className="text-lg font-semibold text-white">Manage Availability</h3>
              <p className="text-sm text-center text-purple-100">Update your teaching schedule</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/history" className="block group">
          <Card className="bg-green-600 group-hover:bg-green-700 transition-colors border-none shadow-lg h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Clock className="h-12 w-12 mb-2 text-white" />
              <h3 className="text-lg font-semibold text-white">Lesson History</h3>
              <p className="text-sm text-center text-green-100">View past lessons and earnings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}