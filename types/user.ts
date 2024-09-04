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