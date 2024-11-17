import type { UserResource } from '@clerk/types';

export interface UserMetadata {
  role?: string;
}

export type UserWithMetadata = UserResource & {
  publicMetadata: UserMetadata;
};

export function checkUserRole(user: UserWithMetadata | null): boolean {
  const role = user?.publicMetadata?.role;
  return role === 'admin';
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  username: string | null;
  primaryEmailAddress: string | null;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  imageUrl: string;
  hasClaimedFreeTrial?: boolean;
  role?: string;
  name?: string;
}
