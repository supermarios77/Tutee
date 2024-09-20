'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { checkForConflicts } from '@/utils/bookingUtils'
import { addDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Teacher } from '@/types/booking'  // Add this import

export default function BookLessonPage() {
  const { user } = useUser()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    const teachersRef = collection(db, 'users')
    const q = query(teachersRef, where('role', '==', 'teacher'))
    const querySnapshot = await getDocs(q)
    setTeachers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)))
  }

  const handleBookLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedTeacher || !date || !time) return

    setIsLoading(true)
    try {
      const hasConflict = await checkForConflicts(selectedTeacher, date, time, calculateEndTime(time))
      if (hasConflict) {
        toast({ title: "Error", description: "There is a scheduling conflict. Please choose a different time.", variant: "destructive" })
        return
      }

      await addDoc(collection(db, 'bookings'), {
        teacherId: selectedTeacher,
        studentId: user.id,
        date,
        startTime: time,
        endTime: calculateEndTime(time),
        status: 'scheduled'
      })

      toast({ title: "Success", description: "Lesson booked successfully." })
      router.push('/student-dashboard')
    } catch (error) {
      logger.error('Error booking lesson:', error)
      toast({ title: "Error", description: "Failed to book lesson. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  function calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endDate = new Date(2000, 0, 1, hours + 1, minutes)
    return endDate.toTimeString().slice(0, 5)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Book a New Lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBookLesson} className="space-y-4">
            <Select onValueChange={setSelectedTeacher} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name || `${teacher.firstName} ${teacher.lastName}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Booking...' : 'Book Lesson'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}