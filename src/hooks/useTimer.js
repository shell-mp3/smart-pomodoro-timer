import { useState, useEffect, useRef, useCallback } from 'react'

const PHASES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
}

export default function useTimer({
  isFocused = true,
  workDuration = 25,
  shortBreak = 5,
  longBreak = 15,
  onPhaseComplete,
  onTick
}) {
  const [phase, setPhase] = useState(PHASES.WORK)
  const [timeLeft, setTimeLeft] = useState(workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0)

  const intervalRef = useRef(null)
  const phaseRef = useRef(phase)
  const timeLeftRef = useRef(timeLeft)

  // Keep refs in sync
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  // Get duration for current phase
  const getPhaseDuration = useCallback((p) => {
    switch (p) {
      case PHASES.WORK:
        return workDuration * 60
      case PHASES.SHORT_BREAK:
        return shortBreak * 60
      case PHASES.LONG_BREAK:
        return longBreak * 60
      default:
        return workDuration * 60
    }
  }, [workDuration, shortBreak, longBreak])

  // Move to next phase
  const nextPhase = useCallback(() => {
    const currentPhase = phaseRef.current

    if (currentPhase === PHASES.WORK) {
      setCompletedWorkSessions(prev => prev + 1)
      const newCompleted = completedWorkSessions + 1

      // After 4 work sessions, take a long break
      if (newCompleted % 4 === 0) {
        setPhase(PHASES.LONG_BREAK)
        setTimeLeft(longBreak * 60)
        onPhaseComplete?.(PHASES.WORK, PHASES.LONG_BREAK)
      } else {
        setPhase(PHASES.SHORT_BREAK)
        setTimeLeft(shortBreak * 60)
        onPhaseComplete?.(PHASES.WORK, PHASES.SHORT_BREAK)
      }
    } else {
      // After any break, go back to work
      setPhase(PHASES.WORK)
      setTimeLeft(workDuration * 60)
      setSessionCount(prev => prev + 1)
      onPhaseComplete?.(currentPhase, PHASES.WORK)
    }
  }, [completedWorkSessions, workDuration, shortBreak, longBreak, onPhaseComplete])

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      // Only tick down when focused during work phase, always tick during breaks
      const currentPhase = phaseRef.current
      const shouldTick = currentPhase !== PHASES.WORK || isFocused

      if (shouldTick) {
        setTimeLeft(prev => {
          const newTime = prev - 1

          if (newTime <= 0) {
            nextPhase()
            return getPhaseDuration(phaseRef.current)
          }

          onTick?.(newTime, currentPhase, isFocused)
          return newTime
        })
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isFocused, nextPhase, getPhaseDuration, onTick])

  // Update timeLeft only when durations change (not when pausing)
  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      return
    }
    // Only reset time if settings changed while not running
    if (!isRunning && !intervalRef.current) {
      setTimeLeft(getPhaseDuration(phase))
    }
  }, [workDuration, shortBreak, longBreak])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setPhase(PHASES.WORK)
    setTimeLeft(workDuration * 60)
    setSessionCount(0)
    setCompletedWorkSessions(0)
  }, [workDuration])

  const skip = useCallback(() => {
    nextPhase()
  }, [nextPhase])

  return {
    timeLeft,
    phase,
    isRunning,
    sessionCount,
    completedWorkSessions,
    start,
    pause,
    reset,
    skip,
    PHASES
  }
}
