import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useFocusContext } from '../../context/FocusContext'
import FocusOverlay from './FocusOverlay'

const CameraFeed = forwardRef(function CameraFeed({ onReady, className = '' }, ref) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isHidden, setIsHidden] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const { setCameraEnabled, setCameraError, cameraEnabled } = useFocusContext()

  useImperativeHandle(ref, () => ({
    getVideoRef: () => videoRef,
    stopCamera: () => stopStream()
  }))

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraError(null)
        setPermissionDenied(false)

        // Wait for video to be ready before calling onReady
        videoRef.current.onloadeddata = () => {
          setCameraEnabled(true)
          onReady?.(videoRef)
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setPermissionDenied(true)
      setCameraEnabled(false)
      setCameraError(err.message)
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraEnabled(false)
  }

  useEffect(() => {
    startCamera()

    return () => {
      stopStream()
    }
  }, [])

  const toggleVisibility = () => {
    setIsHidden(!isHidden)
  }

  if (permissionDenied) {
    return (
      <div className={`bg-dark-800 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3 text-dark-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-white">Camera access denied</p>
            <p className="text-xs">Timer will run without focus detection</p>
          </div>
        </div>
        <button
          onClick={startCamera}
          className="mt-3 text-sm text-accent-green hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
          isHidden ? 'h-12' : 'aspect-video'
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover bg-dark-800 transition-opacity duration-300 ${
            isHidden ? 'opacity-0 h-0' : 'opacity-100'
          }`}
        />

        {!isHidden && cameraEnabled && <FocusOverlay />}

        {isHidden && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
            <span className="text-dark-400 text-sm">Camera hidden (detection active)</span>
          </div>
        )}
      </div>

      <button
        onClick={toggleVisibility}
        className="absolute top-2 right-2 p-1.5 bg-dark-900/80 hover:bg-dark-700 rounded-lg transition-colors z-10"
        title={isHidden ? 'Show camera' : 'Hide camera'}
      >
        {isHidden ? (
          <svg className="w-4 h-4 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  )
})

export default CameraFeed
