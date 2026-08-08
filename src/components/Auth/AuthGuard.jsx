import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthGuard({ children }) {
  const { user, loading, isConfigured } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-green border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If Supabase is not configured, allow access (offline mode)
  if (!isConfigured) {
    return children
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
