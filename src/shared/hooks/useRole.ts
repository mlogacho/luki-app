import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { hasRole } from '@/src/modules/access-control/roles/roles';
import type { UserRole } from '@/src/core/types/user.types';

/**
 * Returns true if the current user has at least the 'admin' role.
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated && user !== null && hasRole(user.role, 'admin');
}

/**
 * Returns true if the current user has at least the given role.
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated && user !== null && hasRole(user.role, requiredRole);
}
