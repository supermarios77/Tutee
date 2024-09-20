import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'

export interface Lesson {
  userId: string
  date: Date
  status: 'scheduled' | 'completed' | 'cancelled'
}

export async function scheduleLesson(lesson: Omit<Lesson, 'status'>) {
  try {
    const docRef = await addDoc(collection(db, 'lessons'), {
      ...lesson,
      date: Timestamp.fromDate(lesson.date),
      status: 'scheduled',
    })
    console.log('Lesson scheduled with ID: ', docRef.id)
    return docRef.id
  } catch (error) {
    logger.error('Error scheduling lesson: ', error)
    throw error
  }
}

export async function getAvailableSlots(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, 'lessons'),
    where('date', '>=', Timestamp.fromDate(startOfDay)),
    where('date', '<=', Timestamp.fromDate(endOfDay))
  )

  const querySnapshot = await getDocs(q)
  const bookedSlots = querySnapshot.docs.map(doc => doc.data().date.toDate().getHours())

  // Assuming lessons are available from 9 AM to 5 PM
  const availableSlots = []
  for (let hour = 9; hour <= 17; hour++) {
    if (!bookedSlots.includes(hour)) {
      availableSlots.push(hour)
    }
  }

  return availableSlots
}