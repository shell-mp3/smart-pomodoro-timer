import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { GRACE_PERIODS, getDistractionReason, calculateFocusScore } from '../utils/focusLogic'

const FocusContext = createContext({})

export function useFocusContext() {
  return useContext(FocusContext)
}

export function FocusProvider({ children }) {
  const [isFocused, setIsFocused] = useState(true)
  const [distractionReason, setDistractionReason] = useState(null)
  const [focusScore, setFocusScore] = useState(100)
  const [detectionEnabled, setDetectionEnabled] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const [detectionStates, setDetectionStates] = useState({
    faceDetected: true,
    phoneDetected: false,
    eyesOpen: true,
    headFacingForward: true
  })

  const focusHistoryRef = useRef([])
  const graceTimerRef = useRef(null)
  const lastFocusedRef = useRef(true)
  const hasStartedTrackingRef = useRef(false)
  const lastScoreUpdateRef = useRef(0)

  // Sensitivity setting (default medium)
  const [sensitivity, setSensitivity] = useState('medium')

  const updateDetectionStates = useCallback((newStates) => {
    setDetectionStates(prev => {
      const updated = { ...prev, ...newStates }
      return updated
    })
  }, [])

  const processFocusState = useCallback((states, sensitivityLevel = sensitivity) => {
    const reason = getDistractionReason(states)
    const currentlyFocused = reason === null

    if (currentlyFocused) {
      // Clear any pending grace timer
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current)
        graceTimerRef.current = null
      }

      if (!lastFocusedRef.current) {
        setIsFocused(true)
        setDistractionReason(null)
        lastFocusedRef.current = true
      }
    } else {
      // Focus is broken
      if (lastFocusedRef.current && !graceTimerRef.current) {
        // Start grace period
        const gracePeriod = GRACE_PERIODS[sensitivityLevel] || GRACE_PERIODS.medium

        graceTimerRef.current = setTimeout(() => {
          setIsFocused(false)
          setDistractionReason(reason)
          lastFocusedRef.current = false
          graceTimerRef.current = null
        }, gracePeriod)
      } else if (!lastFocusedRef.current) {
        // Already unfocused, just update reason
        setDistractionReason(reason)
      }
    }

    // Only start tracking score once confirmed focused at least once (avoids init drop)
    if (lastFocusedRef.current) hasStartedTrackingRef.current = true

    // Record score once per second using post-grace-period state, so brief
    // glances away (under the grace period) never count against the score
    if (hasStartedTrackingRef.current) {
      const now = Date.now()
      if (now - lastScoreUpdateRef.current >= 1000) {
        lastScoreUpdateRef.current = now
        focusHistoryRef.current = [
          ...focusHistoryRef.current.slice(-59),
          lastFocusedRef.current
        ]
        setFocusScore(calculateFocusScore(focusHistoryRef.current))
      }
    }

    return currentlyFocused
  }, [sensitivity])

  const resetFocusState = useCallback(() => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current)
      graceTimerRef.current = null
    }
    focusHistoryRef.current = []
    hasStartedTrackingRef.current = false
    lastScoreUpdateRef.current = 0
    setIsFocused(true)
    setDistractionReason(null)
    setFocusScore(100)
    lastFocusedRef.current = true
  }, [])

  const enableDetection = useCallback(() => {
    setDetectionEnabled(true)
  }, [])

  const disableDetection = useCallback(() => {
    setDetectionEnabled(false)
    resetFocusState()
  }, [resetFocusState])

  const value = {
    // Focus state
    isFocused,
    distractionReason,
    focusScore,
    detectionStates,

    // Detection control
    detectionEnabled,
    enableDetection,
    disableDetection,
    modelsLoaded,
    setModelsLoaded,

    // Camera state
    cameraEnabled,
    setCameraEnabled,
    cameraError,
    setCameraError,

    // Settings
    sensitivity,
    setSensitivity,

    // Actions
    updateDetectionStates,
    processFocusState,
    resetFocusState
  }

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  )
}
