import type { UserRole } from '@/src/core/types/user.types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  subscriber: 1,
  reseller: 2,
  admin: 3,
  superadmin: 4,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
