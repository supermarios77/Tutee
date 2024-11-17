import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFirebaseAuth() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const getToken = async () => {
        try {
          // Get the Firebase token from your API route
          const response = await fetch('/api/get-firebase-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          });
          const { firebaseToken } = await response.json();

          // Sign in to Firebase with the custom token
          const userCredential = await signInWithCustomToken(
            auth,
            firebaseToken,
          );
          const firebaseUser = userCredential.user;
          console.log('Firebase user signed in:', firebaseUser);
        } catch (error) {
          console.error('Error signing in to Firebase:', error);
        }
      };
      getToken();
    }
  }, [isSignedIn, user]);

  return auth.currentUser as FirebaseUser | null;
}
