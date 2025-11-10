import { User } from '@/types';
import { Permissions, getPermissions, hasPermission as checkPermission } from '@/lib/permissions';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Hook to get permissions for the current user
 */
export function usePermissions(): Permissions {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    // Return viewer permissions if no user is logged in
    return getPermissions('VIEWER');
  }

  return getPermissions(user.role as any);
}

/**
 * Hook to check if current user has a specific permission
 */
export function useHasPermission(permission: keyof Permissions): boolean {
  const user = useAuthStore((state) => state.user);
  return checkPermission(user, permission);
}

/**
 * Hook to get current user
 */
export function useUser(): User | null {
  return useAuthStore((state) => state.user);
}
