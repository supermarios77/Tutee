import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  const { userId } = await request.json();

  try {
    const firebaseToken = await auth().createCustomToken(userId);
    return NextResponse.json({ firebaseToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    return NextResponse.json({ error: 'Failed to create Firebase token' }, { status: 500 });
  }
}