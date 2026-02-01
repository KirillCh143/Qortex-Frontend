import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  // Check loading state BEFORE checking authentication to prevent race condition
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-[#1e3a8a]">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login with replace to prevent back button issues
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles specified, check if user's role is permitted
  // Unauthorized roles silently redirect to /chat (user IS authenticated, just not authorized)
  if (allowedRoles && user && !allowedRoles.includes(user.frontend_role)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>
}
