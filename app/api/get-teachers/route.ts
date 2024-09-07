// app/api/get-teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { User } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from Clerk
    const usersResponse = await clerkClient.users.getUserList({
      limit: 500, // Adjust this value based on your total number of users
    });

    // Filter users with 'teacher' role
    const teacherUsers = usersResponse.data.filter((user: User) => {
      const role = user.publicMetadata.role;
      const roles = user.publicMetadata.roles;
      return role === 'teacher' || (Array.isArray(roles) && roles.includes('teacher'));
    });

    // Fetch additional teacher data from Firebase
    const teachersRef = collection(db, 'teachers');
    const teachersSnapshot = await getDocs(teachersRef);
    const teachersData = teachersSnapshot.docs.reduce<Record<string, any>>((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    const teachers = teacherUsers.map((user: User) => ({
      id: user.id,
      name: user.firstName,
      ...teachersData[user.id]
    }));

    return NextResponse.json({ teachers });
  } catch (error: unknown) {
    console.error('Error fetching teachers:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch teachers', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}