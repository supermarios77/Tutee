import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teacherId, date, startTime, endTime } = await request.json()

  if (!teacherId || !date || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      userId,
      teacherId,
      date: Timestamp.fromDate(new Date(date)),
      startTime,
      endTime,
      status: 'scheduled'
    })

    return NextResponse.json({ id: docRef.id, message: 'Lesson booked successfully' })
  } catch (error) {
    logger.error('Error booking lesson:', error)
    return NextResponse.json({ error: 'Failed to book lesson' }, { status: 500 })
  }
}