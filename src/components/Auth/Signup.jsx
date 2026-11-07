import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Signup({ onToggleMode, onSuccess }) {
  const { signUp, signInWithGoogle, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { user } = await signUp(email, password)

      if (user && !user.confirmed_at) {
        setSuccess(true)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="text-center">
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
          <h3 className="text-lg font-semibold mb-2">Offline Mode</h3>
          <p className="text-dark-400 text-sm">
            Supabase is not configured. You can still use Pomodoro Timer,
            but your data will only be saved locally.
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-accent-green/10 border border-accent-green/50 rounded-lg p-6">
          <svg className="w-12 h-12 text-accent-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Check your email</h3>
          <p className="text-dark-400 text-sm">
            We've sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account.
          </p>
        </div>
        <button
          onClick={onToggleMode}
          className="mt-4 text-accent-green hover:underline text-sm"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-dark-600" />
        <span className="px-4 text-dark-400 text-sm">or</span>
        <div className="flex-1 border-t border-dark-600" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-dark-400 text-sm">
        Already have an account?{' '}
        <button
          onClick={onToggleMode}
          className="text-accent-green hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
