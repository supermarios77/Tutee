'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, BookOpen, UserCircle2, Users, DollarSign, ChevronRight, Video } from 'lucide-react';
import Link from 'next/link';
import { useStreamVideoClient, Call } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function TeacherHome() {
  const { user } = useUser();
  const [upcomingLessons, setUpcomingLessons] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalLessons: 0, totalEarnings: 0 });
  const [meetingState, setMeetingState] = useState<'isInstantMeeting' | 'isScheduleMeeting' | undefined>(undefined);
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
  });
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const router = useRouter();
  const { toast } = useToast();

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
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  const createMeeting = async (isInstant: boolean) => {
    if (!client || !user) return;
    try {
      if (!isInstant && !values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt = isInstant ? new Date().toISOString() : values.dateTime.toISOString();
      const description = isInstant ? 'Instant Meeting' : values.description || 'Scheduled Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (isInstant) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
        description: isInstant ? 'Joining the meeting now.' : 'Meeting scheduled successfully.',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

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
        {Object.entries(stats).map(([key, value]) => (
          <StatsCard key={key} title={key} value={value} />
        ))}
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
                <LessonItem key={lesson.id} lesson={lesson} />
              ))}
            </ul>
          ) : (
            <p>No upcoming lessons scheduled.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <ActionCard
          icon={Video}
          title="Start Instant Meeting"
          description="Begin an immediate video session"
          bgColor="bg-blue-600"
          hoverColor="bg-blue-700"
          onClick={() => createMeeting(true)}
        />
        <ActionCard
          icon={CalendarDays}
          title="Schedule Meeting"
          description="Plan your next video session"
          bgColor="bg-purple-600"
          hoverColor="bg-purple-700"
          onClick={() => setMeetingState('isScheduleMeeting')}
        />
        <ActionCard
          href="/teacher/history"
          icon={Clock}
          title="Lesson History"
          description="View past lessons and earnings"
          bgColor="bg-green-600"
          hoverColor="bg-green-700"
        />
      </div>

      {meetingState === 'isScheduleMeeting' && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Schedule Meeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Meeting description"
                value={values.description}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date and Time</label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date) => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 border rounded"
              />
            </div>
            <Button onClick={() => createMeeting(false)}>Schedule Meeting</Button>
          </CardContent>
        </Card>
      )}

      {callDetail && !meetingState && (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Meeting Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your meeting has been created successfully.</p>
            <Button 
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail.id}`);
                toast({ title: 'Meeting link copied to clipboard' });
              }}
            >
              Copy Meeting Link
            </Button>
          </CardContent>
        </Card>
      )}
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

const ActionCard = ({ href, icon: Icon, title, description, bgColor, hoverColor, onClick }: { href?: string; icon: any; title: string; description: string; bgColor: string; hoverColor: string; onClick?: () => void }) => {
  const content = (
    <Card className={`${bgColor} hover:${hoverColor} transition-colors border-none shadow-lg h-full cursor-pointer`}>
      <CardContent className="flex flex-col items-center justify-center p-6 h-full">
        <Icon className="h-12 w-12 mb-2 text-white" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-center text-gray-100">{description}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};