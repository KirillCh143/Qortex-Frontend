import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Chat from '@/pages/Chat'
import KnowledgeBase from '@/pages/KnowledgeBase'
import Settings from '@/pages/Settings'

// Root redirect component that checks authentication
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null // or loading spinner
  }

  return <Navigate to={isAuthenticated ? '/chat' : '/login'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Login route - NOT protected */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout hideHeader>
              <Chat />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/knowledge-base"
        element={
          <ProtectedRoute>
            <Layout title="Knowledge Base">
              <KnowledgeBase />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout title="Settings">
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
