import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInWithCustomToken } from 'firebase/auth';
import logger from '@/lib/logger';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
let db: Firestore;
let auth: Auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    logger.info('Firebase initialized successfully');
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  logger.error('Error initializing Firebase:', error);
}

export { db, auth };

export async function signInWithClerk() {
  try {
    const response = await fetch('/api/get-firebase-token', {
      method: 'POST',
    });
    const { token } = await response.json();
    if (token) {
      await signInWithCustomToken(auth, token);
      logger.info('Signed in with custom token');
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    logger.error('Error signing in with Clerk:', error);
    throw error;
  }
}