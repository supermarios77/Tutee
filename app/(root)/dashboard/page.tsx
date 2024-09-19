'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Teacher, Booking, TimeSlot, User } from '@/types/booking'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Users, DollarSign, Plus, Settings, HelpCircle, CheckCircle, UserPlus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import CreateLessonModal from '@/components/Dashboard/CreateLessonModal'
import ManageUpcomingLessons from '@/components/Dashboard/ManageUpcomingLessons'

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
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false)
  const [students, setStudents] = useState<User[]>([])

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
        where('date', '>=', now.toISOString().split('T')[0]),
        where('status', '==', 'scheduled'),
        orderBy('date'),
        orderBy('startTime'),
        limit(5)
      )
      const lessonsSnapshot = await getDocs(lessonsQuery)
      const lessonsData = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking))
      setUpcomingLessons(lessonsData)

      // Fetch teacher stats
      const statsRef = doc(db, 'teacherStats', user.id)
      const statsSnapshot = await getDoc(statsRef)
      if (statsSnapshot.exists()) {
        const teacherStats = statsSnapshot.data() as TeacherStats
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
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as Activity))
      setRecentActivities(activitiesData)

      // Fetch available slots
      const slotsRef = doc(db, 'availableSlots', user.id)
      const slotsSnapshot = await getDoc(slotsRef)
      if (slotsSnapshot.exists()) {
        const slotsData = slotsSnapshot.data().slots.map((slot: any) => ({
          start: slot.start.toDate(),
          end: slot.end.toDate()
        })) as TimeSlot[]
        setAvailableSlots(slotsData)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error("Failed to load dashboard data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudents = async () => {
    if (!user) return;

    try {
      const studentsRef = collection(db, 'users');
      const studentsQuery = query(studentsRef, where('role', '==', 'user'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          email: data.email || null,
          role: data.role || 'user',
          lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
          hasClaimedFreeTrial: data.hasClaimedFreeTrial || false,
        } as User;
      });
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error("Failed to load students. Please try again.");
    }
  };

  useEffect(() => {
    fetchDashboardData()
    fetchStudents()
  }, [user])

  const handleSlotToggle = async (slot: TimeSlot) => {
    if (!user) return

    const slotsRef = doc(db, 'availableSlots', user.id)
    const isSlotAvailable = availableSlots.some(s =>
      isSameDay(s.start, slot.start) && s.start.getHours() === slot.start.getHours()
    )

    try {
      let updatedSlots: TimeSlot[]
      if (isSlotAvailable) {
        updatedSlots = availableSlots.filter(s =>
          !(isSameDay(s.start, slot.start) && s.start.getHours() === slot.start.getHours())
        )
      } else {
        updatedSlots = [...availableSlots, slot]
      }

      await setDoc(slotsRef, {
        slots: updatedSlots.map(s => ({
          start: Timestamp.fromDate(s.start),
          end: Timestamp.fromDate(s.end)
        }))
      }, { merge: true })

      setAvailableSlots(updatedSlots)
      toast.success(isSlotAvailable ? "Slot removed successfully" : "Slot added successfully")
    } catch (error) {
      console.error('Error updating available slots:', error)
      toast.error("Failed to update time slot. Please try again.")
    }
  }

  const handleLessonCreated = () => {
    fetchDashboardData()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {user?.firstName}!</h1>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
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
                <ScrollArea className="h-[250px] pr-4">
                  {upcomingLessons.length > 0 ? (
                    <ul className="space-y-2">
                      {upcomingLessons.map((lesson) => (
                        <LessonItem key={lesson.id} lesson={lesson} />
                      ))}
                    </ul>
                  ) : (
                    <p>No upcoming lessons scheduled.</p>
                  )}
                </ScrollArea>
                <Button asChild className="mt-4 w-full">
                  <Link href="/dashboard/upcoming">View All Lessons</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px] pr-4">
                  {recentActivities.length > 0 ? (
                    <ul className="space-y-2">
                      {recentActivities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </ul>
                  ) : (
                    <p>No recent activity.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <ManageUpcomingLessons />

          <BookingSlotsCalendar
            availableSlots={availableSlots}
            currentWeek={currentWeek}
            setCurrentWeek={setCurrentWeek}
            handleSlotToggle={handleSlotToggle}
          />

          <QuickActions
            openCreateLessonModal={() => setIsCreateLessonModalOpen(true)}
            router={router}
          />

          <CreateLessonModal
            isOpen={isCreateLessonModalOpen}
            onClose={() => setIsCreateLessonModalOpen(false)}
            onLessonCreated={handleLessonCreated}
            students={students}
          />
        </>
      )}
      <Toaster />
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[100px]" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

interface BookingSlotsCalendarProps {
  availableSlots: TimeSlot[];
  currentWeek: Date;
  setCurrentWeek: React.Dispatch<React.SetStateAction<Date>>;
  handleSlotToggle: (slot: TimeSlot) => Promise<void>;
}

const BookingSlotsCalendar: React.FC<BookingSlotsCalendarProps> = ({ availableSlots, currentWeek, setCurrentWeek, handleSlotToggle }) => (
  <Card>
    <CardHeader>
      <CardTitle>Manage Available Slots</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between mb-4">
        <Button onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>Previous Week</Button>
        <Button onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>Next Week</Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i)).map((day, index) => (
          <div key={index} className="text-center">
            <div className="font-semibold">{format(day, 'EEE')}</div>
            <div>{format(day, 'dd')}</div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2">
                  Manage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{format(day, 'EEEE, MMMM d')}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="mt-2 h-[300px]">
                  <div className="space-y-2">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const slotStart = new Date(day.setHours(hour, 0, 0, 0))
                      const slotEnd = new Date(day.setHours(hour + 1, 0, 0, 0))
                      const isAvailable = availableSlots.some(s =>
                        isSameDay(s.start, slotStart) && s.start.getHours() === hour
                      )
                      return (
                        <Button
                          key={`${index}-${hour}`}
                          variant={isAvailable ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={() => handleSlotToggle({ start: slotStart, end: slotEnd })}
                        >
                          {format(slotStart, 'HH:mm')} - {format(slotEnd, 'HH:mm')}
                        </Button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

interface QuickActionsProps {
  openCreateLessonModal: () => void;
  router: any;
}

const QuickActions: React.FC<QuickActionsProps> = ({ openCreateLessonModal, router }) => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={openCreateLessonModal}>
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
)

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
      <p className="font-semibold">{new Date(lesson.date).toLocaleDateString()}</p>
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