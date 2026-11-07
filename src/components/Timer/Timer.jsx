import { useRef, useEffect, useCallback, useState } from 'react'
import TimerDisplay from './TimerDisplay'
import TimerControls from './TimerControls'
import CameraFeed from '../Camera/CameraFeed'
import DebugPanel from '../Detection/DebugPanel'
import PomodoroFact from '../UI/PomodoroFact'
import useFocusState from '../Detection/useFocusState'
import useTimer from '../../hooks/useTimer'
import useSession from '../../hooks/useSession'
import useSettings from '../../hooks/useSettings'
import { useFocusContext } from '../../context/FocusContext'
import { useNotification } from '../UI/Notification'
import { playTick } from '../../utils/tickSound'

export default function Timer() {
  const cameraRef = useRef(null)
  const videoRef = useRef(null)
  const lastDistractionRef = useRef(null)
  const distractionWarningShownRef = useRef(false)

  const { settings } = useSettings()
  const { enableDetection, disableDetection, isFocused: contextFocused, cameraEnabled, detectionEnabled, modelsLoaded } = useFocusContext()
  const { notify } = useNotification()

  const [showCamera, setShowCamera] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  const {
    currentSession,
    startSession,
    endSession,
    recordFocusedSecond,
    recordDistraction
  } = useSession()

  // Initialize focus detection when video is ready
  const handleCameraReady = useCallback((ref) => {
    if (ref && ref.current) {
      videoRef.current = ref.current
      setVideoReady(true)
      // Auto-enable detection when camera is ready
      enableDetection()
    }
  }, [enableDetection])

  // Use focus state detection - enable when video is ready
  const { isFocused, distractionReason, cleanup: cleanupDetection } = useFocusState(
    videoRef,
    videoReady && cameraEnabled && detectionEnabled
  )

  // Effective focus state (assume focused if camera not enabled or models still loading)
  const effectiveFocused = !cameraEnabled || !modelsLoaded || isFocused

  const handlePhaseComplete = useCallback((fromPhase, toPhase) => {
    if (fromPhase === 'work') {
      // End the work session
      endSession(true).then(() => {
        if (settings.sound_enabled) {
          playNotificationSound()
        }
        notify({
          type: 'success',
          message: 'Work session completed!'
        })
      })

      // Notify about break
      const breakType = toPhase === 'longBreak' ? 'long break' : 'short break'
      notify({
        type: 'info',
        message: `Time for a ${breakType}!`
      })
    } else {
      // Break ended
      if (settings.sound_enabled) {
        playNotificationSound()
      }
      notify({
        type: 'info',
        message: 'Break ended! Ready to focus?'
      })
    }
  }, [endSession, settings.sound_enabled, notify])

  const handleTick = useCallback((timeLeft, phase, focused) => {
    if (phase === 'work' && focused) {
      recordFocusedSecond()
      // The tick only runs while the work is actually counting, so it stops
      // the moment focus breaks - the silence is itself a signal.
      if (settings.ticking_enabled) playTick()
    }
  }, [recordFocusedSecond, settings.ticking_enabled])

  const {
    timeLeft,
    phase,
    isRunning,
    sessionCount,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    skip: skipPhase
  } = useTimer({
    isFocused: effectiveFocused,
    workDuration: settings.work_duration,
    shortBreak: settings.short_break,
    longBreak: settings.long_break,
    onPhaseComplete: handlePhaseComplete,
    onTick: handleTick
  })

  // Track distractions - only when models are loaded
  useEffect(() => {
    if (!isRunning || phase !== 'work' || !modelsLoaded) return

    if (!effectiveFocused && distractionReason) {
      if (lastDistractionRef.current !== distractionReason) {
        recordDistraction(distractionReason)
        lastDistractionRef.current = distractionReason
      }
      if (!distractionWarningShownRef.current) {
        distractionWarningShownRef.current = true
        notify({ type: 'warning', message: 'Focus lost - timer paused' })
      }
    } else if (effectiveFocused) {
      lastDistractionRef.current = null
      distractionWarningShownRef.current = false
    }
  }, [effectiveFocused, distractionReason, isRunning, phase, modelsLoaded, recordDistraction, notify])

  const handleStart = useCallback(() => {
    if (phase === 'work' && !currentSession) {
      startSession(settings.work_duration * 60)
    }
    enableDetection()
    startTimer()
  }, [phase, currentSession, settings.work_duration, startSession, enableDetection, startTimer])

  const handlePause = useCallback(() => {
    pauseTimer()
    // Don't disable detection, just pause the timer
  }, [pauseTimer])

  const handleReset = useCallback(() => {
    if (currentSession) {
      endSession(false) // Mark as incomplete
    }
    disableDetection()
    cleanupDetection()
    resetTimer()
  }, [currentSession, endSession, disableDetection, cleanupDetection, resetTimer])

  const handleSkip = useCallback(() => {
    if (phase === 'work' && currentSession) {
      endSession(false) // Mark as incomplete when skipping
    }
    skipPhase()
  }, [phase, currentSession, endSession, skipPhase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableDetection()
      cleanupDetection()
    }
  }, [disableDetection, cleanupDetection])

  // Calculate total time for progress
  const getTotalTime = () => {
    switch (phase) {
      case 'work':
        return settings.work_duration * 60
      case 'shortBreak':
        return settings.short_break * 60
      case 'longBreak':
        return settings.long_break * 60
      default:
        return settings.work_duration * 60
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-6">
      {/* Timer Section */}
      <div className="flex flex-col items-center gap-8">
        <TimerDisplay
          timeLeft={timeLeft}
          totalTime={getTotalTime()}
          phase={phase}
          isRunning={isRunning}
          isFocused={effectiveFocused}
          sessionCount={sessionCount}
        />

        <TimerControls
          isRunning={isRunning}
          phase={phase}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSkip={handleSkip}
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

            {/* Quick stats */}
            {currentSession && (
            <div className="mt-4 bg-dark-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-dark-400 mb-2">Current Session</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent-green">
                    {Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 60000)}m
                  </p>
                  <p className="text-xs text-dark-400">Elapsed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-blue">
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
        className="fixed bottom-4 right-4 p-3 bg-dark-700 hover:bg-dark-600 rounded-full shadow-lg lg:hidden"
        title={showCamera ? 'Hide camera' : 'Show camera'}
      >
        <svg className="w-5 h-5 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )
}

function playNotificationSound() {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3

    oscillator.start()

    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (err) {
    console.error('Failed to play notification sound:', err)
  }
}
