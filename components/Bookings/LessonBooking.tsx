'use client'

import React, { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Clock, CalendarIcon, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO, isValid, isFuture } from 'date-fns'

interface Teacher {
  id: string;
  name: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
}

const steps = [
  { title: 'Select Teacher', icon: User },
  { title: 'Choose Date', icon: CalendarIcon },
  { title: 'Select Time', icon: Clock },
]

export default function LessonBooking() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      fetchAvailableSlots(selectedTeacher, selectedDate)
    }
  }, [selectedTeacher, selectedDate])

  const fetchTeachers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const teachersRef = collection(db, 'teachers')
      const teachersSnapshot = await getDocs(teachersRef)
      const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }))
      setTeachers(teachersData)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setError('Failed to fetch teachers. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableSlots = async (teacherId: string, date: Date) => {
    setIsLoading(true)
    setError(null)
    try {
      const teacherDoc = await getDocs(query(collection(db, 'teachers'), where('id', '==', teacherId)))
      if (teacherDoc.empty) {
        throw new Error('Teacher not found')
      }
      const teacherData = teacherDoc.docs[0].data()
      const slots = teacherData.availableSlots || []
      const formattedDate = format(date, 'yyyy-MM-dd')
      const filteredSlots = slots
        .filter((slot: { start: string; end: string }) => 
          slot.start.startsWith(formattedDate) && 
          isValid(parseISO(slot.start)) && 
          isValid(parseISO(slot.end)) &&
          isFuture(parseISO(slot.start))
        )
        .map((slot: { start: string; end: string }) => ({
          start: parseISO(slot.start),
          end: parseISO(slot.end),
        }))
      setAvailableSlots(filteredSlots)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setError('Failed to fetch available slots. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookLesson = async () => {
    if (!selectedSlot || !selectedTeacher) return

    setIsLoading(true)
    setError(null)
    try {
      console.log('Booking details:', {
        teacherId: selectedTeacher,
        start: selectedSlot.start,
        end: selectedSlot.end,
      })

      alert('Lesson booked successfully! (Details logged to console)')
      setSelectedSlot(null)
      setSelectedTeacher(undefined)
      setSelectedDate(null)
      setCurrentStep(0)
    } catch (error) {
      console.error('Error booking lesson:', error)
      setError('Failed to book lesson. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const renderWeekCalendar = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {format(currentWeek, 'MMMM yyyy')}
          </h3>
          <Button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <Button
              key={index}
              onClick={() => setSelectedDate(day)}
              variant={isSameDay(day, selectedDate || new Date()) ? "default" : "outline"}
              className="flex flex-col items-center p-2 h-auto"
              disabled={!isFuture(day)}
            >
              <span className="text-xs">{format(day, 'EEE')}</span>
              <span className="text-lg">{format(day, 'd')}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a')
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-blue-600 p-8 text-white flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4">Book Your Lesson</h1>
            <p className="mb-8">Follow these steps to schedule your perfect learning session.</p>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    index <= currentStep ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                  }`}>
                    {index < currentStep ? <CheckCircle size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={index <= currentStep ? 'font-semibold' : 'text-blue-200'}>{step.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-2/3 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 0 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Teacher</h2>
                    <Select onValueChange={(value: string) => { setSelectedTeacher(value); nextStep(); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
                {currentStep === 1 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Choose a Date</h2>
                    {renderWeekCalendar()}
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select a Time</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className="text-sm"
                        >
                          {formatTime(slot.start)}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-8">
              <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep} disabled={currentStep === 1 && !selectedDate}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleBookLesson} disabled={!selectedSlot}>Book Lesson</Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {error && <div className="mt-4 text-red-500 text-center p-2 bg-red-100 dark:bg-red-900 rounded">{error}</div>}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}