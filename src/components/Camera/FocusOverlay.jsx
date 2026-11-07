import { useFocusContext } from '../../context/FocusContext'
import StatusBadge from '../UI/StatusBadge'
import { getDistractionMessage } from '../../utils/focusLogic'

export default function FocusOverlay() {
  const {
    isFocused,
    distractionReason,
    focusScore,
    modelsLoaded,
    modelError,
    detectionEnabled
  } = useFocusContext()

  if (!detectionEnabled) {
    return (
      <div className="absolute inset-0 border-2 border-dark-600 rounded-xl pointer-events-none">
        <div className="absolute bottom-2 left-2">
          <StatusBadge status="idle" text="Detection paused" />
        </div>
      </div>
    )
  }

  // Load failed - say so rather than spinning forever
  if (modelError && !modelsLoaded) {
    return (
      <div className="absolute inset-0 border-2 border-accent-orange/60 rounded-xl pointer-events-none">
        <div className="absolute bottom-2 left-2 right-2">
          <StatusBadge status="warning" text="Detection unavailable — timer still works" />
        </div>
      </div>
    )
  }

  // Still loading. Deliberately no scrim: the camera is already live underneath
  // and covering it made the feed look broken.
  if (!modelsLoaded) {
    return (
      <div className="absolute inset-0 border-2 border-dark-600 rounded-xl pointer-events-none">
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <StatusBadge status="loading" text="Starting detection" showDot={false} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${
        isFocused
          ? 'border-2 border-accent-green animate-focus-ring shadow-glow-green'
          : 'border-3 border-accent-red shadow-glow-red'
      }`}
    >
      {/* Focus score indicator */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className="bg-dark-900/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              focusScore >= 80 ? 'bg-accent-green' :
              focusScore >= 50 ? 'bg-accent-orange' : 'bg-accent-red'
            }`}
          />
          <span className="text-xs text-white font-medium">{focusScore}%</span>
        </div>

      </div>

      {/* Status badge */}
      <div className="absolute bottom-2 left-2">
        {isFocused ? (
          <StatusBadge status="focused" text="Focused" />
        ) : (
          <StatusBadge
            status="distracted"
            text={getDistractionMessage(distractionReason)}
          />
        )}
      </div>

      {/* Pulsing corners when focused */}
      {isFocused && (
        <>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent-green rounded-tl-xl animate-pulse" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-green rounded-tr-xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent-green rounded-bl-xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent-green rounded-br-xl animate-pulse" />
        </>
      )}
    </div>
  )
}
