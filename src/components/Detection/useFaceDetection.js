import { useState, useEffect, useRef, useCallback } from 'react'
import { calculateEyeAspectRatio, isHeadFacingForward, EYE_ASPECT_RATIO_THRESHOLD } from '../../utils/focusLogic'

// MediaPipe Face Mesh eye landmark indices
const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
const NOSE_TIP_INDEX = 1

export default function useFaceDetection(videoRef, enabled = false) {
  const [faceDetected, setFaceDetected] = useState(true)
  const [eyesOpen, setEyesOpen] = useState(true)
  const [headFacingForward, setHeadFacingForward] = useState(true)
  const [isLoading, setIsLoading] = useState(true) // Start as loading
  const [error, setError] = useState(null)
  const [modelReady, setModelReady] = useState(false)

  const detectorRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastDetectionTimeRef = useRef(0)

  const DETECTION_INTERVAL = 100 // ~10 FPS

  const loadModel = useCallback(async () => {
    if (detectorRef.current) {
      setIsLoading(false)
      setModelReady(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Loading TensorFlow.js face detection model...')

      // Dynamically import TensorFlow.js and face detection
      const tf = await import('@tensorflow/tfjs')
      await import('@tensorflow/tfjs-backend-webgl')
      await tf.setBackend('webgl')
      await tf.ready()

      const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection')

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
      // The 'mediapipe' runtime breaks in production builds: bundling the CommonJS
      // @mediapipe/face_mesh package yields a namespace whose FaceMesh is not a
      // constructor, so createDetector throws. The tfjs runtime uses the TF.js
      // graph model directly - same landmarks, no CDN assets, bundles cleanly.
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 1
      }

      detectorRef.current = await faceLandmarksDetection.createDetector(model, detectorConfig)
      console.log('Face detection model loaded successfully')
      setModelReady(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load face detection model:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }, [])

  const detectFace = useCallback(async () => {
    if (!detectorRef.current || !enabled) return

    // Get video element - handle both ref object and direct element
    const video = videoRef?.current || videoRef
    if (!video) {
      console.log('No video element available')
      return
    }
    if (video.readyState < 2) {
      console.log('Video not ready, readyState:', video.readyState)
      return
    }

    try {
      const faces = await detectorRef.current.estimateFaces(video)

      console.log('Faces detected:', faces.length)

      if (faces.length === 0) {
        setFaceDetected(false)
        setEyesOpen(true)
        setHeadFacingForward(true)
        return
      }

      setFaceDetected(true)
      const face = faces[0]
      const keypoints = face.keypoints

      // Calculate eye aspect ratios
      const leftEyePoints = LEFT_EYE_INDICES.map(i => keypoints[i]).filter(Boolean)
      const rightEyePoints = RIGHT_EYE_INDICES.map(i => keypoints[i]).filter(Boolean)

      if (leftEyePoints.length >= 6 && rightEyePoints.length >= 6) {
        const leftEAR = calculateEyeAspectRatio(leftEyePoints)
        const rightEAR = calculateEyeAspectRatio(rightEyePoints)
        const avgEAR = (leftEAR + rightEAR) / 2
        setEyesOpen(avgEAR > EYE_ASPECT_RATIO_THRESHOLD)
      } else {
        setEyesOpen(true) // Default to eyes open if can't detect
      }

      // Check head orientation
      const noseTip = keypoints[NOSE_TIP_INDEX]
      const box = face.box
      if (box && noseTip) {
        const faceCenter = {
          x: box.xMin + box.width / 2,
          y: box.yMin + box.height / 2
        }
        setHeadFacingForward(isHeadFacingForward(noseTip, faceCenter, box.width))
      } else {
        setHeadFacingForward(true)
      }
    } catch (err) {
      console.error('Face detection error:', err)
    }
  }, [videoRef, enabled])

  const runDetectionLoop = useCallback(() => {
    const now = Date.now()

    if (now - lastDetectionTimeRef.current >= DETECTION_INTERVAL) {
      detectFace()
      lastDetectionTimeRef.current = now
    }

    if (enabled) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
    }
  }, [detectFace, enabled])

  useEffect(() => {
    if (enabled) {
      loadModel().then(() => {
        if (detectorRef.current) {
          runDetectionLoop()
        }
      })
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled, loadModel, runDetectionLoop])

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    detectorRef.current = null
  }, [])

  return {
    faceDetected,
    eyesOpen,
    headFacingForward,
    isLoading,
    modelReady,
    error,
    cleanup
  }
}
