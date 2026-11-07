import { createContext, useContext, useCallback, useEffect, useRef } from 'react'
import useTimer from '../hooks/useTimer'
import useSession from '../hooks/useSession'
import useSettings from '../hooks/useSettings'
import { useFocusContext } from './FocusContext'
import { useNotification } from '../components/UI/Notification'

const TimerContext = createContext({})

export function useTimerContext() {
  return useContext(TimerContext)
}

/**
 * Owns the countdown and the session record.
 *
 * This lives above the router on purpose. When it sat inside the Timer
 * component, navigating to the dashboard unmounted it and silently destroyed
 * a running pomodoro along with its focused seconds and distraction events -
 * nothing was ever written to the database.
 */
export function TimerProvider({ children }) {
  const { settings } = useSettings()
  const { notify } = useNotification()
  const {
    isFocused,
    distractionReason,
    cameraEnabled,
    modelsLoaded,
    enableDetection
  } = useFocusContext()

  const lastDistractionRef = useRef(null)
  const distractionWarningShownRef = useRef(false)

  const {
    currentSession,
    startSession,
    endSession,
    recordFocusedSecond,
    recordDistraction
  } = useSession()

  // Treat as focused when there is nothing watching - a camera-less user, or
  // one who has navigated away from the timer page, should not be penalised.
  const effectiveFocused = !cameraEnabled || !modelsLoaded || isFocused

  const handlePhaseComplete = useCallback((fromPhase, toPhase) => {
    if (fromPhase === 'work') {
      endSession(true).then(() => {
        if (settings.sound_enabled) playNotificationSound()
        notify({ type: 'success', message: 'Work session completed!' })
      })
      const breakType = toPhase === 'longBreak' ? 'long break' : 'short break'
      notify({ type: 'info', message: `Time for a ${breakType}!` })
    } else {
      if (settings.sound_enabled) playNotificationSound()
      notify({ type: 'info', message: 'Break ended! Ready to focus?' })
    }
  }, [endSession, settings.sound_enabled, notify])

  const handleTick = useCallback((timeLeft, phase, focused) => {
    if (phase === 'work' && focused) recordFocusedSecond()
  }, [recordFocusedSecond])

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

  // Record distractions while a work block is running
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

  const start = useCallback(() => {
    if (phase === 'work' && !currentSession) {
      startSession(settings.work_duration * 60)
    }
    enableDetection()
    startTimer()
  }, [phase, currentSession, settings.work_duration, startSession, enableDetection, startTimer])

  const pause = useCallback(() => {
    pauseTimer()
  }, [pauseTimer])

  const reset = useCallback(() => {
    if (currentSession) endSession(false)
    resetTimer()
  }, [currentSession, endSession, resetTimer])

  const skip = useCallback(() => {
    if (phase === 'work' && currentSession) endSession(false)
    skipPhase()
  }, [phase, currentSession, endSession, skipPhase])

  const getTotalTime = useCallback(() => {
    switch (phase) {
      case 'shortBreak': return settings.short_break * 60
      case 'longBreak': return settings.long_break * 60
      default: return settings.work_duration * 60
    }
  }, [phase, settings])

  const value = {
    timeLeft,
    phase,
    isRunning,
    sessionCount,
    effectiveFocused,
    currentSession,
    totalTime: getTotalTime(),
    start,
    pause,
    reset,
    skip
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

function playNotificationSound() {
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
