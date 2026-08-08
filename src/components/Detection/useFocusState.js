import { useEffect, useRef, useCallback, useState } from 'react'
import { useFocusContext } from '../../context/FocusContext'
import useFaceDetection from './useFaceDetection'
import useObjectDetection from './useObjectDetection'

export default function useFocusState(videoRef, enabled = false) {
  const {
    isFocused,
    distractionReason,
    focusScore,
    sensitivity,
    updateDetectionStates,
    processFocusState,
    setModelsLoaded
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

  const {
    phoneDetected,
    isLoading: objectLoading,
    modelReady: objectModelReady,
    error: objectError,
    cleanup: cleanupObject
  } = useObjectDetection(videoRef, enabled)

  const processingRef = useRef(false)
  const [warmupDone, setWarmupDone] = useState(false)
  const warmupTimerRef = useRef(null)

  // Update loading state - only mark as loaded when both models are actually ready
  useEffect(() => {
    const modelsReady = faceModelReady && objectModelReady && !faceError && !objectError
    setModelsLoaded(modelsReady && enabled)
    if (modelsReady && enabled) {
      console.log('All detection models loaded and ready')
    }
  }, [faceModelReady, objectModelReady, faceError, objectError, enabled, setModelsLoaded])

  // Wait 2s after models are ready before scoring — gives the camera time to stabilize
  useEffect(() => {
    if (faceModelReady && objectModelReady && enabled) {
      warmupTimerRef.current = setTimeout(() => setWarmupDone(true), 2000)
    } else {
      setWarmupDone(false)
      if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current)
    }
    return () => { if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current) }
  }, [faceModelReady, objectModelReady, enabled])

  // Process combined detection states - only when models are loaded
  useEffect(() => {
    // Don't process until both models are ready and warmup has passed
    if (!enabled || processingRef.current || !faceModelReady || !objectModelReady || !warmupDone) return

    processingRef.current = true

    const states = {
      faceDetected,
      phoneDetected,
      eyesOpen,
      headFacingForward
    }

    updateDetectionStates(states)
    processFocusState(states, sensitivity)

    processingRef.current = false
  }, [
    enabled,
    faceDetected,
    phoneDetected,
    eyesOpen,
    headFacingForward,
    sensitivity,
    faceModelReady,
    objectModelReady,
    warmupDone,
    updateDetectionStates,
    processFocusState
  ])

  const cleanup = useCallback(() => {
    cleanupFace()
    cleanupObject()
  }, [cleanupFace, cleanupObject])

  return {
    isFocused,
    distractionReason,
    focusScore,
    isLoading: faceLoading || objectLoading,
    error: faceError || objectError,
    detectionStates: {
      faceDetected,
      phoneDetected,
      eyesOpen,
      headFacingForward
    },
    cleanup
  }
}
