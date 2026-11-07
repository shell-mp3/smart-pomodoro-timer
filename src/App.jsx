import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import AuthGuard from './components/Auth/AuthGuard'
import UserMenu from './components/Auth/UserMenu'
import SplashScreen from './components/UI/SplashScreen'
import Tomato from './components/UI/Tomato'
import PageTransition from './components/UI/PageTransition'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import { useAuth } from './context/AuthContext'

function Navigation() {
  const location = useLocation()
  const { user, isConfigured } = useAuth()

  const navItems = [
    { path: '/', label: 'Timer', icon: TimerIcon },
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon }
  ]

  return (
    <header className="sticky top-0 z-40 glass border-b border-dark-600/60">
      <nav className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="pressable pressable-sm flex items-center gap-2.5 group">
            <Tomato className="w-7 h-7 transition-transform duration-300 ease-ios group-hover:scale-110" />
            <span className="font-semibold text-[17px] tracking-tight hidden sm:block">Pomodoro Timer</span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  pressable pressable-sm flex items-center gap-2 px-3.5 py-2 rounded-full text-[14px] font-medium
                  ${location.pathname === path
                    ? 'bg-dark-700 text-white shadow-ios'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}

            {/* Auth Button */}
            {isConfigured && !user && (
              <Link
                to="/auth"
                className="ml-2 btn-primary py-2 px-4 text-[14px]"
              >
                Sign In
              </Link>
            )}

            {user && <UserMenu />}
          </div>
        </div>
      </nav>
    </header>
  )
}

function TimerIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// Keep the splash up briefly even on a warm load, so it reads as an intro
// rather than a flash of red.
const MIN_SPLASH_MS = 1100

export default function App() {
  const { loading: authLoading } = useAuth()
  const [minTimePassed, setMinTimePassed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  const booting = authLoading || !minTimePassed

  return (
    <>
      <SplashScreen show={booting} />
      <div className="min-h-screen bg-dark-900">
        <Navigation />
        <main>
          <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
          </PageTransition>
        </main>
      </div>
    </>
  )
}
