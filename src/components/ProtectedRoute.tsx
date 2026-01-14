import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

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

  return <>{children}</>
}
