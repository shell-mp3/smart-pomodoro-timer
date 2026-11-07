import { useEffect, useRef, useState } from 'react'
import { useFocusContext } from '../../context/FocusContext'
import useFaceDetection from './useFaceDetection'

export default function useFocusState(videoRef, enabled = false) {
  const {
    isFocused,
    distractionReason,
    focusScore,
    sensitivity,
    updateDetectionStates,
    processFocusState,
    setModelsLoaded,
    setModelError
  } = useFocusContext()

  const {
    faceDetected,
    eyesOpen,
    headFacingForward,
    isLoading: faceLoading,
    modelReady: faceModelReady,
    error: faceError,
    cleanup: cleanupFace
  } = useFaceDetection(videoRef, enabled)

  const processingRef = useRef(false)
  const [warmupDone, setWarmupDone] = useState(false)
  const warmupTimerRef = useRef(null)

  useEffect(() => {
    setModelsLoaded(faceModelReady && !faceError && enabled)
  }, [faceModelReady, faceError, enabled, setModelsLoaded])

  // Surface load failures so the overlay can say so instead of spinning forever
  useEffect(() => {
    setModelError(faceError ? `Focus detection unavailable: ${faceError}` : null)
  }, [faceError, setModelError])

  // Wait 2s after the model is ready before scoring — lets the camera stabilize
  useEffect(() => {
    if (faceModelReady && enabled) {
      warmupTimerRef.current = setTimeout(() => setWarmupDone(true), 2000)
    } else {
      setWarmupDone(false)
      if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current)
    }
    return () => { if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current) }
  }, [faceModelReady, enabled])

  useEffect(() => {
    if (!enabled || processingRef.current || !faceModelReady || !warmupDone) return

    processingRef.current = true

    const states = { faceDetected, eyesOpen, headFacingForward }
    updateDetectionStates(states)
    processFocusState(states, sensitivity)

    processingRef.current = false
  }, [
    enabled,
    faceDetected,
    eyesOpen,
    headFacingForward,
    sensitivity,
    faceModelReady,
    warmupDone,
    updateDetectionStates,
    processFocusState
  ])

  return {
    isFocused,
    distractionReason,
    focusScore,
    isLoading: faceLoading,
    error: faceError,
    detectionStates: { faceDetected, eyesOpen, headFacingForward },
    cleanup: cleanupFace
  }
}
