import { useState, useEffect } from 'react'
import useSession from '../../hooks/useSession'
import { formatDuration } from '../../utils/formatTime'

export default function SessionStats() {
  const { getSessionStats, getStreak } = useSession()
  const [stats, setStats] = useState({
    totalFocusedTime: 0,
    completedSessions: 0,
    avgFocusScore: 100
  })
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    const [sessionStats, currentStreak] = await Promise.all([
      getSessionStats(),
      getStreak()
    ])

    setStats(sessionStats)
    setStreak(currentStreak)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 w-20 bg-dark-700 rounded mb-2" />
            <div className="h-8 w-16 bg-dark-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: 'Focused Today',
      value: formatDuration(stats.totalFocusedTime),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-accent-green'
    },
    {
      label: 'Sessions Today',
      value: stats.completedSessions.toString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-accent-blue'
    },
    {
      label: 'Avg Focus Score',
      value: `${stats.avgFocusScore}%`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: stats.avgFocusScore >= 80 ? 'text-accent-green' :
             stats.avgFocusScore >= 50 ? 'text-accent-orange' : 'text-accent-red'
    },
    {
      label: 'Current Streak',
      value: `${streak} ${streak === 1 ? 'day' : 'days'}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      color: 'text-accent-orange'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className={stat.color}>{stat.icon}</span>
            <span className="text-sm text-dark-400">{stat.label}</span>
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
