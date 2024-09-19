import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const { data: users } = await clerkClient.users.getUserList();
    
    for (const user of users) {
      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
        role: user.publicMetadata.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await setDoc(doc(db, 'users', user.id), userData, { merge: true });
    }

    return NextResponse.json({ success: true, message: 'Initial sync completed' });
  } catch (error) {
    console.error('Error during initial sync:', error);
    return NextResponse.json({ success: false, error: 'Initial sync failed' }, { status: 500 });
  }
}