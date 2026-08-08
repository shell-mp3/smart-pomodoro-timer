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
    setModelsLoaded,
    setPhoneDetectionReady,
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

  // Face detection is what gates the UI: it loads in well under a second, while
  // COCO-SSD takes ~15s. Waiting on both left the camera covered the whole time,
  // so phone detection now joins late instead of holding everything up.
  useEffect(() => {
    setModelsLoaded(faceModelReady && !faceError && enabled)
  }, [faceModelReady, faceError, enabled, setModelsLoaded])

  useEffect(() => {
    setPhoneDetectionReady(objectModelReady && !objectError && enabled)
  }, [objectModelReady, objectError, enabled, setPhoneDetectionReady])

  // Surface load failures so the overlay can say so instead of spinning forever
  useEffect(() => {
    if (faceError) {
      setModelError(`Focus detection unavailable: ${faceError}`)
    } else if (objectError) {
      setModelError(`Phone detection unavailable: ${objectError}`)
    } else {
      setModelError(null)
    }
  }, [faceError, objectError, setModelError])

  // Wait 2s after the face model is ready before scoring — lets the camera stabilize
  useEffect(() => {
    if (faceModelReady && enabled) {
      warmupTimerRef.current = setTimeout(() => setWarmupDone(true), 2000)
    } else {
      setWarmupDone(false)
      if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current)
    }
    return () => { if (warmupTimerRef.current) clearTimeout(warmupTimerRef.current) }
  }, [faceModelReady, enabled])

  // Process combined detection states - only when models are loaded
  useEffect(() => {
    // Scoring starts once the face model is ready and warmup has passed. Phone
    // state stays false until COCO-SSD lands, which is a safe default.
    if (!enabled || processingRef.current || !faceModelReady || !warmupDone) return

    processingRef.current = true

    const states = {
      faceDetected,
      phoneDetected: objectModelReady ? phoneDetected : false,
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
