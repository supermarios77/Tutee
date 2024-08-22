'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { addDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TimeSlot {
  start: string;
  end: string;
}

export default function LessonBooking() {
  const { user } = useUser()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [teachers, setTeachers] = useState<string[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (selectedDate && selectedTeacher) {
      fetchAvailableSlots(selectedDate, selectedTeacher)
    }
  }, [selectedDate, selectedTeacher])

  const fetchTeachers = async () => {
    const teachersSnapshot = await getDocs(collection(db, 'teachers'))
    const teacherIds = teachersSnapshot.docs.map(doc => doc.id)
    setTeachers(teacherIds)
  }

  const fetchAvailableSlots = async (date: Date, teacherId: string) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const teacherDoc = await getDocs(query(
      collection(db, 'teachers'),
      where('id', '==', teacherId)
    ))
    const teacherData = teacherDoc.docs[0].data()
    const teacherSlots = teacherData.availableSlots || []

    const bookingsSnapshot = await getDocs(query(
      collection(db, 'bookings'),
      where('teacherId', '==', teacherId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    ))

    const bookedSlots = bookingsSnapshot.docs.map(doc => ({
      start: doc.data().startTime,
      end: doc.data().endTime
    }))

    const availableSlots = teacherSlots.filter(slot => 
      !bookedSlots.some(bookedSlot => 
        bookedSlot.start === slot.start && bookedSlot.end === slot.end
      )
    )

    setAvailableSlots(availableSlots)
  }

  const handleBookLesson = async () => {
    if (!user || !selectedDate || !selectedSlot || !selectedTeacher) return

    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.id,
        teacherId: selectedTeacher,
        date: Timestamp.fromDate(selectedDate),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        status: 'scheduled'
      })

      alert('Lesson booked successfully!')
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setSelectedTeacher(null)
    } catch (error) {
      console.error('Error booking lesson:', error)
      alert('Failed to book lesson. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedTeacher}>
        <SelectTrigger>
          <SelectValue placeholder="Select a teacher" />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacherId) => (
            <SelectItem key={teacherId} value={teacherId}>
              {teacherId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => setSelectedDate(date || undefined)}
        className="rounded-md border"
      />
      {selectedDate && selectedTeacher && (
        <Select onValueChange={(value) => setSelectedSlot(JSON.parse(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a time slot" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.map((slot) => (
              <SelectItem key={`${slot.start}-${slot.end}`} value={JSON.stringify(slot)}>
                {`${slot.start} - ${slot.end}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button onClick={handleBookLesson} disabled={!selectedDate || !selectedSlot || !selectedTeacher}>
        Book Lesson
      </Button>
    </div>
  )
}