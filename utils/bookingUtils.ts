import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function checkForConflicts(teacherId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
  const bookingsRef = collection(db, 'bookings')
  const q = query(
    bookingsRef,
    where('teacherId', '==', teacherId),
    where('date', '==', date),
    where('status', '==', 'scheduled')
  )

  const querySnapshot = await getDocs(q)
  
  for (const doc of querySnapshot.docs) {
    const booking = doc.data()
    if (
      (startTime >= booking.startTime && startTime < booking.endTime) ||
      (endTime > booking.startTime && endTime <= booking.endTime) ||
      (startTime <= booking.startTime && endTime >= booking.endTime)
    ) {
      return true // Conflict found
    }
  }

  return false // No conflict
}