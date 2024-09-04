import type { UserResource } from '@clerk/types';

export interface UserMetadata {
  role?: string;
}

export type UserWithMetadata = UserResource & {
  publicMetadata: UserMetadata;
};

export function checkUserRole(user: UserWithMetadata | null): boolean {
  return user?.publicMetadata?.role === 'admin';
}