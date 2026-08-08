export default function TimerControls({
  isRunning,
  phase,
  onStart,
  onPause,
  onReset,
  onSkip,
  disabled = false
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Reset button */}
      <button
        onClick={onReset}
        disabled={disabled}
        className="p-3 rounded-full bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Play/Pause button */}
      <button
        onClick={isRunning ? onPause : onStart}
        disabled={disabled}
        className={`p-5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRunning
            ? 'bg-accent-orange hover:bg-orange-600'
            : 'bg-accent-green hover:bg-emerald-600'
        }`}
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 9v6m4-6v6"
            />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Skip button */}
      <button
        onClick={onSkip}
        disabled={disabled}
        className="p-3 rounded-full bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Skip to next phase"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  )
}
