import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching teachers');
    const usersRef = collection(db, 'users');
    const teachersQuery = query(usersRef, where('role', '==', 'teacher'));
    const teachersSnapshot = await getDocs(teachersQuery);
    
    logger.info(`Found ${teachersSnapshot.docs.length} teachers`);

    const teachersPromises = teachersSnapshot.docs.map(async (teacherDoc) => {
      const teacherData = teacherDoc.data();
      const availabilityRef = doc(db, 'teacherAvailability', teacherDoc.id);
      const availabilitySnapshot = await getDoc(availabilityRef);
      const availability = availabilitySnapshot.exists() ? availabilitySnapshot.data() : {};

      logger.info(`Fetched availability for teacher ${teacherDoc.id}`);

      return {
        id: teacherDoc.id,
        ...teacherData,
        availability
      };
    });

    const teachers = await Promise.all(teachersPromises);

    logger.info('Successfully fetched all teachers with availability', { teacherCount: teachers.length });

    return NextResponse.json({ teachers });
  } catch (error) {
    logger.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}