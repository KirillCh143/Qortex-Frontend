import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'administrator' | 'moderator' | 'user';

export function usePermissions() {
  const { user } = useAuth();

  const role: UserRole = user?.frontend_role ?? 'user';

  return {
    /** Raw role string, falls back to 'user' if null */
    role,
    /** True only for administrator — gates Settings/Portainer page */
    canAccessSettings: role === 'administrator',
    /** True for administrator and moderator — gates file CRUD in Knowledge Base */
    canManageFiles: role === 'administrator' || role === 'moderator',
    /** True only for administrator */
    isAdministrator: role === 'administrator',
    /** True for administrator or moderator */
    isModerator: role === 'administrator' || role === 'moderator',
  };
}
