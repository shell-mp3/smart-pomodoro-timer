import { useEffect, useState, useRef } from 'react'
import Tomato from './Tomato'
import { randomFact } from '../../utils/pomodoroFacts'

/**
 * Boot splash. Stays mounted through its own fade-out so the exit animation
 * can play, then removes itself.
 */
export default function SplashScreen({ show }) {
  const [mounted, setMounted] = useState(show)
  // Chosen once per mount - a fact that changed mid-fade would look like a glitch
  const factRef = useRef(randomFact())

  useEffect(() => {
    if (show) {
      setMounted(true)
      return
    }
    const t = setTimeout(() => setMounted(false), 420)
    return () => clearTimeout(t)
  }, [show])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-900 px-8 ${
        show ? '' : 'splash-out'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="tomato-bob">
        <Tomato className="w-24 h-24 drop-shadow-[0_10px_30px_rgba(255,69,58,0.35)]" spinning />
      </div>

      <p className="mt-8 text-[22px] font-semibold tracking-tight text-white">FocusFlow</p>

      <p className="mt-6 max-w-sm text-center text-[14px] leading-relaxed text-dark-300">
        {factRef.current}
      </p>

      <span className="sr-only">Loading FocusFlow</span>
    </div>
  )
}
