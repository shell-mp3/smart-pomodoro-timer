import { useRef } from 'react'
import { randomFact } from '../../utils/pomodoroFacts'

/**
 * A single fact about the technique, sitting quietly under the timer.
 *
 * Picked once per mount rather than per phase or per render: a line that
 * swaps itself out while you are mid-sentence is worse than no line at all.
 */
export default function PomodoroFact() {
  const factRef = useRef(randomFact())

  return (
    <p className="max-w-xs mx-auto text-center text-[12.5px] leading-relaxed text-dark-400">
      {factRef.current}
    </p>
  )
}
