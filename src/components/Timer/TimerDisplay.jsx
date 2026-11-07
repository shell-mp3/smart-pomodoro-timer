import { formatTime } from '../../utils/formatTime'
import Tomato from '../UI/Tomato'

const PHASE_LABELS = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break'
}

// Green while the work is flowing, tomato red while resting, red when focus breaks.
const PHASE_COLORS = {
  work: '#30D158',
  shortBreak: '#FF453A',
  longBreak: '#FF6B57'
}

const PAUSED_COLOR = '#FF453A'

// The ring sits low in the viewBox to leave headroom for the calyx and stem.
const CX = 160
const CY = 172
const RADIUS = 138
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const TOP = CY - RADIUS // where the stem meets the fruit

export default function TimerDisplay({
  timeLeft,
  totalTime,
  phase,
  isRunning,
  isFocused,
  sessionCount
}) {
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS.work
  const isPaused = !isFocused && phase === 'work' && isRunning
  const ringColor = isPaused ? PAUSED_COLOR : phaseColor

  const completed = sessionCount % 4

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-80 h-[21.25rem]">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 320 340">
          <defs>
            <radialGradient id="ringLeaf" cx="30%" cy="25%" r="80%">
              <stop offset="0%" stopColor="#3E9E4A" />
              <stop offset="100%" stopColor="#14532D" />
            </radialGradient>
          </defs>

          {/* Only the arc is rotated, so the stem above stays upright */}
          <g transform={`rotate(-90 ${CX} ${CY})`}>
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none" stroke="#2C2C2E" strokeWidth="10"
            />
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 10px ${ringColor}66)` }}
            />
          </g>

          {/* Calyx and stem, crowning the ring at twelve o'clock */}
          <g transform={`translate(${CX} ${TOP - 1})`}>
            {/* Stem first, so the leaves overlap its base like a real calyx */}
            <rect x="-4" y="-34" width="8" height="26" rx="4" fill="#15602A" />
            <rect x="-4" y="-34" width="3" height="26" rx="1.5" fill="#1F7A38" />
            {[0, 54, 126, 180, 234, 306].map(a => (
              <ellipse
                key={a}
                cx="14" cy="0" rx="14" ry="5"
                fill="url(#ringLeaf)"
                stroke="#0C3D1E"
                strokeWidth="0.75"
                transform={`rotate(${a})`}
              />
            ))}
            <circle r="6" fill="#1B6B30" stroke="#0C3D1E" strokeWidth="0.75" />
          </g>
        </svg>

        {/* Centred on the fruit, not the viewBox, so the stem does not push it down */}
        <div
          className="absolute inset-x-0 flex flex-col items-center justify-center"
          style={{ top: 0, height: `${(CY * 2 / 340) * 100}%` }}
        >
          <span
            className={`text-[64px] leading-none font-semibold tracking-tighter tabular transition-colors duration-300 ${
              isPaused ? 'text-accent-red' : 'text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </span>

          <span
            className="mt-3 text-[15px] font-medium tracking-tight transition-colors duration-300"
            style={{ color: ringColor }}
          >
            {PHASE_LABELS[phase] || 'Focus'}
          </span>

          {isPaused && (
            <span className="mt-1 text-[13px] text-accent-red animate-pulse">
              Focus to continue
            </span>
          )}

          <div className="flex items-center gap-2 mt-5" aria-label={`${completed} of 4 pomodori complete`}>
            {[...Array(4)].map((_, i) => (
              <Tomato
                key={i}
                className={`w-4 h-4 transition-[opacity,transform,filter] duration-500 ease-ios ${
                  i < completed ? 'opacity-100 scale-100' : 'opacity-25 grayscale scale-90'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
