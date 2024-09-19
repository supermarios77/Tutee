import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from "@/components/ui/use-toast"
import { checkForConflicts } from '@/utils/bookingUtils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Lesson {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teacherName: string;
  status: 'scheduled' | 'rescheduling' | 'cancelled';
}

export default function StudentUpcomingLessons() {
  const { user } = useUser()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [reschedulingLesson, setReschedulingLesson] = useState<Lesson | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchLessons()
    }
  }, [user])

  const fetchLessons = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      console.log("Fetching lessons for user:", user.id) // Debug log
      const lessonsRef = collection(db, 'bookings')
      const q = query(
        lessonsRef,
        where('studentId', '==', user.id),
        where('status', 'in', ['scheduled', 'rescheduling']),
        orderBy('date'),
        orderBy('startTime')
      )
      const querySnapshot = await getDocs(q)
      console.log("Query snapshot size:", querySnapshot.size) // Debug log
      const fetchedLessons = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log("Lesson data:", data) // Debug log
        return {
          id: doc.id,
          ...data,
          date: data.date, // Ensure date is properly formatted
          startTime: data.startTime,
          endTime: data.endTime,
        } as Lesson
      })
      setLessons(fetchedLessons)
      console.log("Fetched lessons:", fetchedLessons) // Debug log
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast({ title: "Error", description: "Failed to fetch lessons. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRescheduleRequest = (lesson: Lesson) => {
    setReschedulingLesson(lesson)
    setIsRescheduling(true)
  }

  const handleSubmitReschedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!reschedulingLesson) return

    try {
      const hasConflict = await checkForConflicts(reschedulingLesson.teacherId, newDate, newTime, calculateEndTime(newTime))
      if (hasConflict) {
        toast({ title: "Error", description: "There is a scheduling conflict. Please choose a different time.", variant: "destructive" })
        return
      }

      await updateDoc(doc(db, 'bookings', reschedulingLesson.id), {
        status: 'rescheduling',
        requestedDate: newDate,
        requestedTime: newTime
      })
      setLessons(lessons.map(lesson => 
        lesson.id === reschedulingLesson.id 
          ? {...lesson, status: 'rescheduling', requestedDate: newDate, requestedTime: newTime} 
          : lesson
      ))
      setIsRescheduling(false)
      toast({ title: "Success", description: "Reschedule request submitted successfully." })
    } catch (error) {
      console.error('Error submitting reschedule request:', error)
      toast({ title: "Error", description: "Failed to submit reschedule request. Please try again.", variant: "destructive" })
    }
  }

  function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endDate = new Date(2000, 0, 1, hours + 1, minutes)
    return endDate.toTimeString().slice(0, 5)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Upcoming Lessons</CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length > 0 ? (
          <ul>
            {lessons.map((lesson) => (
              <li key={lesson.id} className="mb-4 p-4 border rounded-lg">
                <h3 className="font-semibold">{lesson.title}</h3>
                <p>Date: {lesson.date}</p>
                <p>Time: {lesson.startTime} - {lesson.endTime}</p>
                <p>Status: {lesson.status}</p>
                {lesson.status === 'scheduled' && (
                  <Button onClick={() => handleRescheduleRequest(lesson)} className="mt-2">Request Reschedule</Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming lessons scheduled.</p>
        )}

        {isRescheduling && reschedulingLesson && (
          <form onSubmit={handleSubmitReschedule} className="mt-4">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mb-2"
              required
            />
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="mb-2"
              required
            />
            <Button type="submit">Submit Reschedule Request</Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}