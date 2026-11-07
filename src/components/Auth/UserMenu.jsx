import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import useProfile from '../../hooks/useProfile'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const containerRef = useRef(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) return null

  const name = profile?.display_name || user.email?.split('@')[0] || 'You'
  const avatar = profile?.avatar_url
  const initial = name[0]?.toUpperCase() || 'U'

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      setOpen(false)
    } catch (err) {
      console.error('Sign out failed:', err)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="relative ml-2" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-dark-600 hover:ring-dark-500 transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-green"
      >
        {avatar && !avatarFailed ? (
          <img
            src={avatar}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center bg-accent-green/20 text-sm font-medium text-accent-green">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg border border-dark-600 bg-dark-800 shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-dark-700">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-dark-400 truncate">{user.email}</p>
          </div>

          <button
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-left px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
