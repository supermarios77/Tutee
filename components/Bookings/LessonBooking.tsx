import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { scheduleLesson, getAvailableSlots } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const LessonBooking: React.FC = () => {
  const { user } = useUser()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableSlots, setAvailableSlots] = useState<number[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  useEffect(() => {
    if (selectedDate) {
      getAvailableSlots(selectedDate).then(setAvailableSlots)
    }
  }, [selectedDate])

  const handleBookLesson = async () => {
    if (!user || !selectedDate || selectedSlot === null) return

    const lessonDate = new Date(selectedDate)
    lessonDate.setHours(selectedSlot, 0, 0, 0)

    try {
      await scheduleLesson({
        userId: user.id,
        date: lessonDate,
      })
      alert('Lesson booked successfully!')
    } catch (error) {
      console.error('Error booking lesson:', error)
      alert('Failed to book lesson. Please try again.')
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
      />
      <Select onValueChange={(value) => setSelectedSlot(parseInt(value, 10))}>
        <SelectTrigger>
          <SelectValue placeholder="Select a time slot" />
        </SelectTrigger>
        <SelectContent>
          {availableSlots.map((slot) => (
            <SelectItem key={slot} value={slot.toString()}>
              {`${slot}:00`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleBookLesson} disabled={!selectedDate || selectedSlot === null}>
        Book Free Lesson
      </Button>
    </div>
  )
}

export default LessonBooking