import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from "@/components/ui/use-toast"
import { checkForConflicts } from '@/utils/bookingUtils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import logger from '@/lib/logger'

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
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const lessonsRef = collection(db, 'bookings')
    const q = query(
      lessonsRef,
      where('studentId', '==', user.id),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lessonData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson))
      setLessons(lessonData)
      setIsLoading(false)
    }, (error) => {
      logger.error('Error fetching lessons:', error)
      toast({ title: "Error", description: "Failed to fetch lessons", variant: "destructive" })
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user, toast])

  // Rest of the component code...
}