import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const usersRef = collection(db, 'users');
    const teachersQuery = query(usersRef, where('role', '==', 'teacher'));
    const teachersSnapshot = await getDocs(teachersQuery);
    
    const teachersPromises = teachersSnapshot.docs.map(async (teacherDoc) => {
      const teacherData = teacherDoc.data();
      const availabilityRef = doc(db, 'teacherAvailability', teacherDoc.id);
      const availabilitySnapshot = await getDoc(availabilityRef);
      const availability = availabilitySnapshot.exists() ? availabilitySnapshot.data() : {};

      return {
        id: teacherDoc.id,
        ...teacherData,
        availability
      };
    });

    const teachers = await Promise.all(teachersPromises);

    console.log('Fetched teachers:', teachers);

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}