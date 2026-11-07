import { useState, useEffect, useRef, useCallback } from 'react'
import { recordDetection, recordVideo, recordBackend, recordHeadPose } from '../../utils/detectStats'
import { headPoseFromMatrix, normalizeAngle } from '../../utils/headPose'

// Pinned to the installed @mediapipe/tasks-vision version. The WASM bundle and
// the JS wrapper must match - a version skew between them is a silent failure.
const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// Blendshape score above which an eye counts as shut (0 = wide open, 1 = closed)
const EYE_BLINK_THRESHOLD = 0.5
// How far the head may turn or tilt before it stops counting as facing forward
const YAW_LIMIT_DEG = 28
const PITCH_LIMIT_DEG = 24

export default function useFaceDetection(videoRef, enabled = false) {
  const [faceDetected, setFaceDetected] = useState(true)
  const [eyesOpen, setEyesOpen] = useState(true)
  const [headFacingForward, setHeadFacingForward] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modelReady, setModelReady] = useState(false)

  const landmarkerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastVideoTimeRef = useRef(-1)
  const lastTimestampRef = useRef(0)

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) {
      setIsLoading(false)
      setModelReady(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH)

      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
      })

      recordBackend('mediapipe-gpu')
      setModelReady(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load face landmarker:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }, [])

  const detectFace = useCallback(() => {
    const landmarker = landmarkerRef.current
    if (!landmarker || !enabled) return

    const video = videoRef?.current || videoRef
    if (!video || video.readyState < 2) return
    if (!video.videoWidth || !video.videoHeight) return

    // Only run when the camera has actually produced a new frame. Re-running on
    // the same frame wastes inference and, worse, repeats a timestamp.
    if (video.currentTime === lastVideoTimeRef.current) return
    lastVideoTimeRef.current = video.currentTime
    recordVideo(video)

    // detectForVideo requires strictly increasing timestamps
    const timestamp = Math.max(lastTimestampRef.current + 1, Math.round(performance.now()))
    lastTimestampRef.current = timestamp

    const startedAt = performance.now()
    try {
      // Synchronous: no promise, so calls cannot overlap or pile up
      const result = landmarker.detectForVideo(video, timestamp)
      const faces = result.faceLandmarks || []
      recordDetection('face', { ms: performance.now() - startedAt, count: faces.length })

      if (faces.length === 0) {
        setFaceDetected(false)
        setEyesOpen(true)
        setHeadFacingForward(true)
        return
      }

      setFaceDetected(true)

      // Eye state straight from the model's blendshapes - no landmark geometry
      const shapes = result.faceBlendshapes?.[0]?.categories
      if (shapes && shapes.length) {
        let left = 0
        let right = 0
        for (const c of shapes) {
          if (c.categoryName === 'eyeBlinkLeft') left = c.score
          else if (c.categoryName === 'eyeBlinkRight') right = c.score
        }
        // Average the two so a wink does not read as "eyes closed"
        setEyesOpen((left + right) / 2 < EYE_BLINK_THRESHOLD)
      } else {
        setEyesOpen(true)
      }

      // Head orientation from the model's own 4x4 transformation matrix
      const matrix = result.facialTransformationMatrixes?.[0]
      const pose = matrix ? headPoseFromMatrix(matrix.data) : null
      if (pose) {
        const yaw = normalizeAngle(pose.yaw)
        const pitch = normalizeAngle(pose.pitch)
        recordHeadPose(yaw, pitch)
        setHeadFacingForward(Math.abs(yaw) < YAW_LIMIT_DEG && Math.abs(pitch) < PITCH_LIMIT_DEG)
      } else {
        setHeadFacingForward(true)
      }
    } catch (err) {
      console.error('Face detection error:', err)
      recordDetection('face', { error: err && err.message })
    }
  }, [videoRef, enabled])

  const runDetectionLoop = useCallback(() => {
    detectFace()
    if (enabled) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
    }
  }, [detectFace, enabled])

  useEffect(() => {
    if (enabled) {
      loadModel().then(() => {
        if (landmarkerRef.current) runDetectionLoop()
      })
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [enabled, loadModel, runDetectionLoop])

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (landmarkerRef.current) {
      landmarkerRef.current.close()
      landmarkerRef.current = null
    }
    lastVideoTimeRef.current = -1
  }, [])

  return { faceDetected, eyesOpen, headFacingForward, isLoading, modelReady, error, cleanup }
}
