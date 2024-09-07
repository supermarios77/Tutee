'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Booking, Teacher } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, BookOpen, Users, DollarSign, ChevronRight, Plus, Settings, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MeetingTypeList from '@/components/Meeting/MeetingTypeList'

interface TeacherStats {
  totalStudents: number;
  totalLessons: number;
  totalEarnings: number;
}

interface Activity {
  id: string;
  type: 'lesson_completed' | 'meeting_created' | 'student_joined';
  description: string;
  timestamp: Date;
}

export default function TeacherDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [upcomingLessons, setUpcomingLessons] = useState<Booking[]>([])
  const [stats, setStats] = useState<TeacherStats>({ totalStudents: 0, totalLessons: 0, totalEarnings: 0 })
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch upcoming lessons
        const now = new Date()
        const lessonsRef = collection(db, 'bookings')
        const lessonsQuery = query(
          lessonsRef,
          where('teacherId', '==', user.id),
          where('date', '>=', now),
          where('status', '==', 'scheduled'),
          orderBy('date'),
          limit(5)
        )
        const lessonsSnapshot = await getDocs(lessonsQuery)
        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking))
        setUpcomingLessons(lessonsData)

        // Fetch teacher stats
        const statsRef = collection(db, 'teacherStats')
        const statsQuery = query(statsRef, where('teacherId', '==', user.id))
        const statsSnapshot = await getDocs(statsQuery)
        if (!statsSnapshot.empty) {
          const teacherStats = statsSnapshot.docs[0].data() as TeacherStats
          setStats(teacherStats)
        }

        // Fetch recent activities
        const activitiesRef = collection(db, 'teacherActivities')
        const activitiesQuery = query(
          activitiesRef,
          where('teacherId', '==', user.id),
          orderBy('timestamp', 'desc'),
          limit(5)
        )
        const activitiesSnapshot = await getDocs(activitiesQuery)
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Activity))
        setRecentActivities(activitiesData)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Students" value={stats.totalStudents} icon={<Users className="h-6 w-6" />} />
        <StatsCard title="Total Lessons" value={stats.totalLessons} icon={<BookOpen className="h-6 w-6" />} />
        <StatsCard title="Total Earnings" value={stats.totalEarnings} icon={<DollarSign className="h-6 w-6" />} prefix="$" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLessons.length > 0 ? (
              <ul className="space-y-2">
                {upcomingLessons.map((lesson) => (
                  <LessonItem key={lesson.id} lesson={lesson} />
                ))}
              </ul>
            ) : (
              <p>No upcoming lessons scheduled.</p>
            )}
            <Button asChild className="mt-4">
              <Link href="/dashboard/upcoming">View All Lessons</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
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

      <MeetingTypeList />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/create-lesson')}>
              <Plus className="mr-2 h-4 w-4" /> Create Lesson
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/students')}>
              <Users className="mr-2 h-4 w-4" /> Manage Students
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/support')}>
              <HelpCircle className="mr-2 h-4 w-4" /> Get Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const StatsCard = ({ title, value, icon, prefix = '' }: { title: string; value: number; icon: React.ReactNode; prefix?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{prefix}{value}</div>
    </CardContent>
  </Card>
)

const LessonItem = ({ lesson }: { lesson: Booking }) => (
  <li className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
    <div>
      <p className="font-semibold">{new Date(lesson.date.seconds * 1000).toLocaleDateString()}</p>
      <p className="text-sm text-gray-600">{lesson.startTime} - {lesson.endTime}</p>
    </div>
    <Button size="sm" asChild>
      <Link href={`/meeting/${lesson.id}`}>Join</Link>
    </Button>
  </li>
)

const ActivityItem = ({ activity }: { activity: Activity }) => (
  <li className="flex items-center p-2 hover:bg-gray-100 rounded">
    <div className="mr-4">
      {activity.type === 'lesson_completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
      {activity.type === 'meeting_created' && <Calendar className="h-5 w-5 text-blue-500" />}
      {activity.type === 'student_joined' && <UserPlus className="h-5 w-5 text-purple-500" />}
    </div>
    <div>
      <p className="font-semibold">{activity.description}</p>
      <p className="text-sm text-gray-600">{activity.timestamp.toLocaleString()}</p>
    </div>
  </li>
)