interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // TODO: Replace with real authentication in Phase 3
  const isAuthenticated = true

  if (!isAuthenticated) {
    // TODO: Redirect to login when authentication is implemented
    return null
  }

  return <>{children}</>
}
