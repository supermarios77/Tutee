'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, BookOpen, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StudentUpcomingLessons from '@/components/Dashboard/StudentUpcomingLessons';
import { Skeleton } from "@/components/ui/skeleton";
import { Booking } from '@/types/booking';
import BookLessonModal from '@/components/Dashboard/BookLessonModal';
import logger from '@/lib/logger';

export default function StudentDashboard() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [nextLesson, setNextLesson] = useState<Booking | null>(null);
  const [totalLessons, setTotalLessons] = useState(0);
  const router = useRouter();
  const [isBookLessonModalOpen, setIsBookLessonModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // Fetch next upcoming lesson
      const lessonsRef = collection(db, 'bookings');
      const lessonsQuery = query(
        lessonsRef,
        where('studentId', '==', user.id),
        where('status', '==', 'scheduled'),
        where('date', '>=', new Date().toISOString().split('T')[0]),
        orderBy('date'),
        orderBy('startTime'),
        limit(1)
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      if (!lessonsSnapshot.empty) {
        setNextLesson(lessonsSnapshot.docs[0].data() as Booking);
      }

      // Fetch total number of lessons
      const totalLessonsQuery = query(
        lessonsRef,
        where('studentId', '==', user.id)
      );
      const totalLessonsSnapshot = await getDocs(totalLessonsQuery);
      setTotalLessons(totalLessonsSnapshot.size);

    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      // Optionally, you can add a user-friendly error message here
      logger.error('An error occurred while fetching dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLesson = () => {
    if (nextLesson) {
      router.push(`/meeting/${nextLesson.id}`);
    } else {
      // Handle case when there's no upcoming lesson
      alert('You have no upcoming lessons scheduled.');
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-6">
      <WelcomeCard />
      <StudentUpcomingLessons />

      <div className="grid gap-6 md:grid-cols-3">
        <ActionCard
          onClick={handleStartLesson}
          icon={<UserCircle2 className="h-12 w-12 mb-2 text-white" />}
          title={nextLesson ? "Start Lesson" : "Join Meeting"}
          description={nextLesson ? "Join your next scheduled lesson" : "No upcoming lessons"}
          color="bg-blue-600"
          hoverColor="bg-blue-700"
          disabled={!nextLesson}
        />
        <ActionCard
          onClick={() => setIsBookLessonModalOpen(true)}
          icon={<CalendarDays className="h-12 w-12 mb-2 text-white" />}
          title="Book New Lesson"
          description="Schedule your next lesson"
          color="bg-purple-600"
          hoverColor="bg-purple-700"
        />
        <ActionCard
          href="/student-dashboard/previous"
          icon={<Clock className="h-12 w-12 mb-2 text-white" />}
          title="Previous Lessons"
          description="View your lesson history"
          color="bg-orange-600"
          hoverColor="bg-orange-700"
        />
      </div>

      <StatsCard
        title="Total Lessons Taken"
        value={totalLessons}
        icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
      />

      <BookLessonModal
        isOpen={isBookLessonModalOpen}
        onClose={() => setIsBookLessonModalOpen(false)}
      />
    </div>
  );
}

const WelcomeCard = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now);

  return (
    <Card className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg">
      <CardContent className="p-6">
        <h1 className="text-4xl font-bold text-white">{time}</h1>
        <p className="text-lg text-gray-200">{date}</p>
      </CardContent>
    </Card>
  );
};

const ActionCard = ({ href, onClick, icon, title, description, color, hoverColor, disabled = false }: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  disabled?: boolean;
}) => {
  const content = (
    <Card className={`${color} group-hover:${hoverColor} transition-colors border-none shadow-lg h-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <CardContent className="flex flex-col items-center justify-center p-6 h-full">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-center text-gray-200">{description}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div className="block group" onClick={disabled ? undefined : onClick}>
      {content}
    </div>
  );
};

const StatsCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
  <div className="flex flex-col min-h-screen p-6 space-y-6">
    <Skeleton className="w-full h-24" />
    <Skeleton className="w-full h-64" />
    <div className="grid gap-6 md:grid-cols-3">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
    <Skeleton className="w-full h-24" />
  </div>
);