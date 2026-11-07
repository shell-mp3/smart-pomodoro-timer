import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Login from '../components/Auth/Login'
import Signup from '../components/Auth/Signup'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isConfigured } = useAuth()

  // Redirect if already logged in
  if (user) {
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
    return null
  }

  const handleSuccess = () => {
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Pomodoro Timer</h1>
          <p className="text-dark-400 mt-2">
            AI-powered focus tracking for better productivity
          </p>
        </div>

        {/* Auth Form */}
        <div className="card">
          {isLogin ? (
            <Login
              onToggleMode={() => setIsLogin(false)}
              onSuccess={handleSuccess}
            />
          ) : (
            <Signup
              onToggleMode={() => setIsLogin(true)}
              onSuccess={handleSuccess}
            />
          )}
        </div>

        {/* Continue as Guest */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-dark-400 hover:text-white text-sm transition-colors"
          >
            Continue without signing in
          </button>
        </div>
      </div>
    </div>
  )
}
