import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Timer from '../components/Timer/Timer'
import { hasSeenWelcome } from '../utils/welcome'

export default function Home() {
  // Read once on mount so the timer never flashes before the redirect
  const [seenWelcome] = useState(hasSeenWelcome)

  if (!seenWelcome) {
    return <Navigate to="/welcome" replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <Timer />
    </div>
  )
}
