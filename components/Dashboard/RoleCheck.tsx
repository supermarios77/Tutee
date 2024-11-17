'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Alert from './Alert';

interface RoleCheckProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleCheck({ children, allowedRoles }: RoleCheckProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata.role as string;
      if (!allowedRoles.includes(userRole)) {
        router.push('/');
      }
    }
  }, [isLoaded, user, router, allowedRoles]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) {
    return (
      <Alert title="Access Denied" iconUrl="/assets/icons/access-denied.svg" />
    );
  }

  return <>{children}</>;
}
