import { useEffect, useState } from 'react'
import Tomato from './Tomato'

/**
 * Boot splash. Stays mounted through its own fade-out so the exit animation
 * can play, then removes itself.
 */
export default function SplashScreen({ show }) {
  const [mounted, setMounted] = useState(show)

  useEffect(() => {
    if (show) {
      setMounted(true)
      return
    }
    // Match the fade duration below before unmounting
    const t = setTimeout(() => setMounted(false), 420)
    return () => clearTimeout(t)
  }, [show])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900 ${
        show ? '' : 'splash-out'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="tomato-bob">
        <Tomato className="w-24 h-24 drop-shadow-[0_8px_24px_rgba(230,58,40,0.35)]" spinning />
      </div>

      <p className="mt-7 text-lg font-semibold tracking-tight">FocusFlow</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-dark-400">Warming up</p>
      <span className="sr-only">Loading FocusFlow</span>
    </div>
  )
}
