import { useState, useEffect, useRef, useCallback } from 'react'

const PHONE_CONFIDENCE_THRESHOLD = 0.1
const PHONE_CLASSES = ['cell phone', 'remote', 'book']
const DETECTION_INTERVAL = 200 // ~5 FPS

export default function useObjectDetection(videoRef, enabled = false) {
  const [phoneDetected, setPhoneDetected] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start as loading
  const [error, setError] = useState(null)
  const [modelReady, setModelReady] = useState(false)

  const modelRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastDetectionTimeRef = useRef(0)

  const loadModel = useCallback(async () => {
    if (modelRef.current) {
      setIsLoading(false)
      setModelReady(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Loading COCO-SSD object detection model...')

      // Dynamically import TensorFlow.js and COCO-SSD
      const tf = await import('@tensorflow/tfjs')
      await import('@tensorflow/tfjs-backend-webgl')
      await tf.setBackend('webgl')
      await tf.ready()

      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      modelRef.current = await cocoSsd.load()

      console.log('Object detection model loaded successfully')
      setModelReady(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load object detection model:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }, [])

  const detectObjects = useCallback(async () => {
    if (!modelRef.current || !videoRef?.current || !enabled) return

    const video = videoRef.current
    if (video.readyState < 2) return

    try {
      const predictions = await modelRef.current.detect(video)

      // Log all detections for debugging
      if (predictions.length > 0) {
        console.log('Objects detected:', predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`).join(', '))
      }

      // Check for cell phone detection (includes 'remote' since COCO-SSD often
      // misclassifies phone backs/cases as remotes due to similar shape)
      const phoneDetection = predictions.find(
        pred => PHONE_CLASSES.includes(pred.class) && pred.score > PHONE_CONFIDENCE_THRESHOLD
      )

      if (phoneDetection) {
        console.log(`Phone detected as "${phoneDetection.class}" with confidence:`, phoneDetection.score)
      }

      setPhoneDetected(!!phoneDetection)
    } catch (err) {
      console.error('Object detection error:', err)
    }
  }, [videoRef, enabled])

  const runDetectionLoop = useCallback(() => {
    const now = Date.now()

    if (now - lastDetectionTimeRef.current >= DETECTION_INTERVAL) {
      detectObjects()
      lastDetectionTimeRef.current = now
    }

    if (enabled) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
    }
  }, [detectObjects, enabled])

  useEffect(() => {
    if (enabled) {
      loadModel().then(() => {
        if (modelRef.current) {
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
    modelRef.current = null
  }, [])

  return {
    phoneDetected,
    isLoading,
    modelReady,
    error,
    cleanup
  }
}
