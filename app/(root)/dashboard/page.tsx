'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs, Timestamp, deleteDoc, doc, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking, User } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, BookOpen, Users, DollarSign, ChevronRight, X, Plus, Settings, HelpCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import MeetingTypeList from '@/components/Meeting/MeetingTypeList';

interface ActiveMeeting {
  id: string;
  description: string;
  startTime: Date;
  callId: string;
}

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface Activity {
  id: string;
  type: 'lesson_completed' | 'meeting_created' | 'student_joined';
  description: string;
  timestamp: Date;
}

function CustomDatePicker({ selectedDate, onDateChange, upcomingLessons }: { selectedDate: Date; onDateChange: (date: Date) => void; upcomingLessons: Booking[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i + 1);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const hasLesson = (day: number) => {
    return upcomingLessons.some(lesson => {
      const lessonDate = new Date(lesson.date.seconds * 1000);
      return lessonDate.getDate() === day && 
             lessonDate.getMonth() === currentMonth.getMonth() && 
             lessonDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
        {previousMonthDays.map((_, index) => (
          <div key={`prev-${index}`} className="text-gray-300 dark:text-gray-600">
            {new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, daysInMonth - firstDayOfMonth + index + 1).getDate()}
          </div>
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => onDateChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
            className={`p-2 rounded-full ${
              isToday(day) ? 'bg-blue-500 text-white' : 
              hasLesson(day) ? 'bg-green-200 dark:bg-green-700' : 
              'hover:bg-gray-200 dark:hover:bg-gray-700'
            } ${
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === currentMonth.getMonth() && 
              selectedDate.getFullYear() === currentMonth.getFullYear() 
                ? 'ring-2 ring-blue-500' 
                : ''
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TeacherHome() {
  const { user } = useUser();
  const [upcomingLessons, setUpcomingLessons] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalLessons: 0, totalEarnings: 0 });
  const [activeMeetings, setActiveMeetings] = useState<ActiveMeeting[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const client = useStreamVideoClient();
  const router = useRouter();
  const { toast } = useToast<ToastProps>();

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const now = Timestamp.now();
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('teacherId', '==', user.id),
          where('date', '>=', now),
          where('status', '==', 'scheduled')
        );

        const querySnapshot = await getDocs(q);
        const lessons = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));

        setUpcomingLessons(lessons);

        const statsQuery = query(collection(db, 'teacherStats'), where('teacherId', '==', user.id));
        const statsSnapshot = await getDocs(statsQuery);
        if (!statsSnapshot.empty) {
          const teacherStats = statsSnapshot.docs[0].data();
          setStats({
            totalStudents: teacherStats.totalStudents || 0,
            totalLessons: teacherStats.totalLessons || 0,
            totalEarnings: teacherStats.totalEarnings || 0
          });
        }

        // Fetch active meetings
        const activeMeetingsRef = collection(db, 'meetings');
        const activeMeetingsQuery = query(activeMeetingsRef, where('teacherId', '==', user.id));
        const activeMeetingsSnapshot = await getDocs(activeMeetingsQuery);
        const activeMeetingsData = activeMeetingsSnapshot.docs.map(doc => ({
          id: doc.id,
          description: doc.data().description,
          startTime: doc.data().startTime.toDate(),
          callId: doc.data().callId,
        }));
        setActiveMeetings(activeMeetingsData);

        // Fetch recent activities
        const activitiesRef = collection(db, 'teacherActivities');
        const activitiesQuery = query(
          activitiesRef, 
          where('teacherId', '==', user.id),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Activity));
        setRecentActivities(activitiesData);

      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  const endMeeting = async (meetingId: string) => {
    if (!client || !user) return;
    try {
      const meetingToEnd = activeMeetings.find(m => m.id === meetingId);
      if (meetingToEnd) {
        try {
          const call = client.call('default', meetingToEnd.callId);
          await call.endCall();
        } catch (streamError) {
          console.error('Error ending call in Stream:', streamError);
        }
      }

      await deleteDoc(doc(db, 'meetings', meetingId));
      setActiveMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));

      toast({
        title: 'Meeting Ended',
        description: 'The meeting has been removed from your active meetings.',
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      toast({ 
        title: 'Error Ending Meeting', 
        description: 'The meeting could not be ended. It has been removed from your active meetings.',
        variant: 'destructive'
      });
      
      try {
        await deleteDoc(doc(db, 'meetings', meetingId));
        setActiveMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));
      } catch (deleteError) {
        console.error('Error removing meeting from database:', deleteError);
      }
    }
  };

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold text-white">{time}</h1>
          <p className="text-lg text-gray-200">{date}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(stats).map(([key, value]) => (
          <StatsCard key={key} title={key} value={value} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                  <LessonItem key={lesson.id} lesson={lesson} />
                ))}
              </ul>
            ) : (
              <p>No upcoming lessons scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomDatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              upcomingLessons={upcomingLessons}
            />
          </CardContent>
        </Card>
      </div>

      <MeetingTypeList />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card text-card-foreground transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : activeMeetings.length > 0 ? (
              <ul className="space-y-2">
                {activeMeetings.map((meeting) => (
                  <ActiveMeetingItem key={meeting.id} meeting={meeting} onEndMeeting={endMeeting} />
                ))}
              </ul>
            ) : (
              <p>No active meetings.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground transition-colors duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => router.push('/teacher/create-lesson')}>
                <Plus className="h-4 w-4 mr-2" /> Create Lesson
              </Button>
              <Button variant="outline" onClick={() => router.push('/teacher/students')}>
                <Users className="h-4 w-4 mr-2" /> Manage Students
              </Button>
              <Button variant="outline" onClick={() => router.push('/teacher/settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
              <Button variant="outline" onClick={() => router.push('/teacher/support')}>
                <HelpCircle className="h-4 w-4 mr-2" /> Get Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card text-card-foreground transition-colors duration-300">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : recentActivities.length > 0 ? (
            <ul className="space-y-2">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatsCard = ({ title, value }: { title: string; value: number }) => (
  <Card className="bg-card text-card-foreground hover:bg-accent transition-colors duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title.split(/(?=[A-Z])/).join(' ')}
      </CardTitle>
      {title === 'totalStudents' && <Users className="h-4 w-4 text-blue-400" />}
      {title === 'totalLessons' && <BookOpen className="h-4 w-4 text-purple-400" />}
      {title === 'totalEarnings' && <DollarSign className="h-4 w-4 text-green-400" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{title === 'totalEarnings' ? `$${value}` : value}</div>
      <p className="text-xs text-muted-foreground">
        {title === 'totalStudents' && 'Active students'}
        {title === 'totalLessons' && 'Lessons conducted'}
        {title === 'totalEarnings' && 'Lifetime earnings'}
      </p>
    </CardContent>
  </Card>
);

const LessonItem = ({ lesson }: { lesson: Booking }) => (
  <li className="bg-muted p-3 rounded-lg transition-colors duration-300 hover:bg-accent">
    <p className="font-semibold">{new Date(lesson.date.seconds * 1000).toLocaleDateString()}</p>
    <p className="text-sm text-muted-foreground">{lesson.time}</p>
    <p className="text-sm">Student: {lesson.studentName}</p>
  </li>
);

const ActiveMeetingItem = ({ meeting, onEndMeeting }: { meeting: ActiveMeeting; onEndMeeting: (id: string) => void }) => (
  <li className="bg-muted p-3 rounded-lg transition-colors duration-300 hover:bg-accent flex justify-between items-center">
    <div>
      <p className="font-semibold">{meeting.description}</p>
      <p className="text-sm text-muted-foreground">Started: {meeting.startTime.toLocaleString()}</p>
    </div>
    <Button variant="destructive" size="sm" onClick={() => onEndMeeting(meeting.id)}>
      <X className="h-4 w-4 mr-1" /> End Meeting
    </Button>
  </li>
);

const ActivityItem = ({ activity }: { activity: Activity }) => (
  <li className="bg-muted p-3 rounded-lg transition-colors duration-300 hover:bg-accent">
    <p className="font-semibold">{activity.description}</p>
    <p className="text-sm text-muted-foreground">{activity.timestamp.toLocaleString()}</p>
  </li>
);