import type { UserResource } from '@clerk/types';

export interface UserMetadata {
  role?: string;
}

export type UserWithMetadata = UserResource & {
  publicMetadata: UserMetadata;
};

export function checkUserRole(user: UserWithMetadata | null): boolean {
  console.log('Checking user role:', JSON.stringify(user, null, 2));
  const isAdmin = user?.publicMetadata?.role === 'admin';
  console.log('Is admin:', isAdmin);
  return isAdmin;
}