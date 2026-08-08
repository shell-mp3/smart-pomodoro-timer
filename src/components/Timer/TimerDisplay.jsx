import { formatTime } from '../../utils/formatTime'

const PHASE_LABELS = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break'
}

const PHASE_COLORS = {
  work: '#10b981', // green
  shortBreak: '#3b82f6', // blue
  longBreak: '#8b5cf6' // purple
}

export default function TimerDisplay({
  timeLeft,
  totalTime,
  phase,
  isRunning,
  isFocused,
  sessionCount
}) {
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100
  const circumference = 2 * Math.PI * 140 // radius = 140
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS.work
  const isPaused = !isFocused && phase === 'work' && isRunning

  return (
    <div className="relative flex flex-col items-center">
      {/* SVG Timer Ring */}
      <div className="relative w-80 h-80">
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 320 320"
        >
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="#343541"
            strokeWidth="12"
          />

          {/* Progress circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke={isPaused ? '#ef4444' : phaseColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />

          {/* Glow effect */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke={isPaused ? '#ef4444' : phaseColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 8px ${isPaused ? '#ef444480' : phaseColor + '80'})`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Time display */}
          <span
            className={`text-6xl font-bold tabular-nums transition-colors duration-300 ${
              isPaused ? 'text-accent-red' : 'text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </span>

          {/* Phase label */}
          <span
            className="text-lg font-medium mt-2 transition-colors duration-300"
            style={{ color: isPaused ? '#ef4444' : phaseColor }}
          >
            {PHASE_LABELS[phase] || 'Work'}
          </span>

          {/* Paused indicator */}
          {isPaused && (
            <span className="text-sm text-accent-red mt-1 animate-pulse">
              Focus to continue
            </span>
          )}

          {/* Session counter */}
          <div className="flex items-center gap-1.5 mt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  i < (sessionCount % 4) ? 'bg-accent-green' : 'bg-dark-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
