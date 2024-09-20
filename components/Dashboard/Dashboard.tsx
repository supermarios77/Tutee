import React, { useState, useEffect } from 'react';
import DatabaseManagement from './DatabaseManagement';
import { useUser } from '@clerk/nextjs';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

export default function Dashboard() {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const { role, isLoading: isFirebaseLoading } = useFirebaseUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isClerkLoaded && !isFirebaseLoading && role === 'admin') {
      setIsAdmin(true);
    }
  }, [isClerkLoaded, isFirebaseLoading, role]);

  if (!isClerkLoaded || isFirebaseLoading) {
    return <div>Loading...</div>;
  }

  if (!clerkUser) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  return (
    <div>
      {/* Existing dashboard content */}
      {isAdmin && <DatabaseManagement />}
    </div>
  );
}