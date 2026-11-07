import { useRef } from 'react'
import { randomFact } from '../../utils/pomodoroFacts'

/**
 * A single fact about the technique, tucked into the side column.
 *
 * Picked once per mount rather than per render: a line that rewrites itself
 * while you are mid-sentence is worse than no line at all.
 */
export default function PomodoroFact() {
  const factRef = useRef(randomFact())

  return (
    <div className="border-t border-dark-600/50 pt-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-dark-500 mb-1.5">
        Pomodoro
      </p>
      <p className="text-[12px] leading-relaxed text-dark-400">
        {factRef.current}
      </p>
    </div>
  )
}
