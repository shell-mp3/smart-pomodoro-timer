import { useEffect, useState } from 'react'
import { randomFact } from '../../utils/pomodoroFacts'

/**
 * A fact about the technique, shown only during breaks - the one stretch
 * where idle attention is the point rather than a failure.
 */
export default function BreakFact({ phase }) {
  const onBreak = phase === 'shortBreak' || phase === 'longBreak'
  const [fact, setFact] = useState(null)

  // New fact each time a break begins, not on every render
  useEffect(() => {
    if (onBreak) setFact(prev => randomFact(prev))
  }, [phase, onBreak])

  if (!onBreak || !fact) return null

  return (
    <div className="max-w-sm mx-auto px-5 py-4 rounded-2xl bg-dark-800 border border-dark-600/60 animate-[fadeIn_0.4s_ease]">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent-red mb-2">
        While you rest
      </p>
      <p className="text-[13px] leading-relaxed text-dark-300">{fact}</p>
    </div>
  )
}
