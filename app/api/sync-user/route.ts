import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const payload = await req.json();
  const { data, type } = payload;

  if (type === 'user.created' || type === 'user.updated') {
    const { id, first_name, last_name, email_addresses, image_url, public_metadata } = data;
    
    const userData = {
      id,
      firstName: first_name,
      lastName: last_name,
      email: email_addresses[0]?.email_address,
      imageUrl: image_url,
      role: public_metadata.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', id), userData, { merge: true });
    return NextResponse.json({ success: true });
  }

  if (type === 'user.deleted') {
    // Implement user deletion logic if needed
  }

  return NextResponse.json({ success: false, error: 'Unsupported event type' }, { status: 400 });
}