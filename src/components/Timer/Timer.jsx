import { useRef, useEffect, useCallback, useState } from 'react'
import TimerDisplay from './TimerDisplay'
import TimerControls from './TimerControls'
import CameraFeed from '../Camera/CameraFeed'
import DebugPanel from '../Detection/DebugPanel'
import PomodoroFact from '../UI/PomodoroFact'
import useFocusState from '../Detection/useFocusState'
import { useFocusContext } from '../../context/FocusContext'
import { useTimerContext } from '../../context/TimerContext'

/**
 * The timer page. The countdown and session record live in TimerContext,
 * above the router, so they survive navigation. What stays here is the view
 * and the camera, which should stop when you leave the page.
 */
export default function Timer() {
  const cameraRef = useRef(null)
  const videoRef = useRef(null)

  const { enableDetection, disableDetection, cameraEnabled, detectionEnabled } = useFocusContext()
  const {
    timeLeft,
    phase,
    isRunning,
    sessionCount,
    effectiveFocused,
    currentSession,
    totalTime,
    start,
    pause,
    reset,
    skip
  } = useTimerContext()

  const [showCamera, setShowCamera] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  const handleCameraReady = useCallback((ref) => {
    if (ref && ref.current) {
      videoRef.current = ref.current
      setVideoReady(true)
      enableDetection()
    }
  }, [enableDetection])

  const { cleanup: cleanupDetection } = useFocusState(
    videoRef,
    videoReady && cameraEnabled && detectionEnabled
  )

  // Detection stops with the page; the countdown does not. Leaving the timer
  // page simply means nothing is watching, so the clock keeps running.
  useEffect(() => {
    return () => {
      disableDetection()
      cleanupDetection()
    }
  }, [disableDetection, cleanupDetection])

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-6">
      {/* Timer Section */}
      <div className="flex flex-col items-center gap-8">
        <TimerDisplay
          timeLeft={timeLeft}
          totalTime={totalTime}
          phase={phase}
          isRunning={isRunning}
          isFocused={effectiveFocused}
          sessionCount={sessionCount}
        />

        <TimerControls
          isRunning={isRunning}
          phase={phase}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onSkip={skip}
        />
      </div>

      {/* Side column */}
      <div className="w-full lg:w-80 flex-shrink-0">
        {showCamera && (
          <>
            <CameraFeed
              ref={cameraRef}
              onReady={handleCameraReady}
              className="w-full"
            />

            <DebugPanel />

            {currentSession && (
              <div className="mt-4 bg-dark-800 rounded-2xl p-4 border border-dark-600/60">
                <h4 className="text-[13px] font-medium text-dark-400 mb-2">Current Session</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-semibold text-accent-green tabular">
                      {Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 60000)}m
                    </p>
                    <p className="text-xs text-dark-400">Elapsed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-dark-200 tabular">
                      {phase === 'work' ? sessionCount + 1 : sessionCount}
                    </p>
                    <p className="text-xs text-dark-400">Sessions</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 lg:pt-2">
          <PomodoroFact />
        </div>
      </div>

      {/* Toggle camera button */}
      <button
        onClick={() => setShowCamera(!showCamera)}
        className="fixed bottom-4 right-4 p-3 bg-dark-700 hover:bg-dark-600 rounded-full shadow-ios lg:hidden"
        title={showCamera ? 'Hide camera' : 'Show camera'}
      >
        <svg className="w-5 h-5 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )
}
