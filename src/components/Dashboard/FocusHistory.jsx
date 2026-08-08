import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import useSession from '../../hooks/useSession'
import { formatDate } from '../../utils/formatTime'

const DISTRACTION_COLORS = {
  no_face: '#ef4444',
  phone_detected: '#f97316',
  eyes_closed: '#8b5cf6',
  head_turned: '#3b82f6'
}

const DISTRACTION_LABELS = {
  no_face: 'Face Not Detected',
  phone_detected: 'Phone Detected',
  eyes_closed: 'Eyes Closed',
  head_turned: 'Head Turned'
}

export default function FocusHistory() {
  const { getAllSessions } = useSession()
  const [data, setData] = useState({ sessions: [], distractionEvents: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7)

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    setIsLoading(true)
    const result = await getAllSessions(timeRange)
    setData(result)
    setIsLoading(false)
  }

  // Process data for focus duration chart
  const focusChartData = useMemo(() => {
    const byDate = {}

    data.sessions.forEach(session => {
      const date = new Date(session.started_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

      if (!byDate[date]) {
        byDate[date] = { date, focusedMinutes: 0, sessions: 0 }
      }

      byDate[date].focusedMinutes += Math.round((session.focused_duration || 0) / 60)
      byDate[date].sessions += 1
    })

    return Object.values(byDate).reverse()
  }, [data.sessions])

  // Process data for distraction breakdown
  const distractionChartData = useMemo(() => {
    const counts = {
      no_face: 0,
      phone_detected: 0,
      eyes_closed: 0,
      head_turned: 0
    }

    data.distractionEvents.forEach(event => {
      if (counts.hasOwnProperty(event.reason)) {
        counts[event.reason]++
      }
    })

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([reason, count]) => ({
        reason,
        label: DISTRACTION_LABELS[reason],
        count,
        color: DISTRACTION_COLORS[reason]
      }))
  }, [data.distractionEvents])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card h-64 animate-pulse bg-dark-700" />
        <div className="card h-64 animate-pulse bg-dark-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-dark-400">Show:</span>
        {[7, 14, 30].map(days => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              timeRange === days
                ? 'bg-accent-green text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Focus Duration Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Focus Duration Over Time</h3>

        {focusChartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-dark-400">
            No session data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#343541" />
                <XAxis
                  dataKey="date"
                  stroke="#8e8ea0"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#8e8ea0"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#343541',
                    border: '1px solid #565869',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => [
                    name === 'focusedMinutes' ? `${value} min` : value,
                    name === 'focusedMinutes' ? 'Focused Time' : 'Sessions'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="focusedMinutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Distraction Breakdown Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Distraction Breakdown</h3>

        {distractionChartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-dark-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No distractions recorded!</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distractionChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#343541" />
                <XAxis
                  type="number"
                  stroke="#8e8ea0"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#8e8ea0"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#343541',
                    border: '1px solid #565869',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value} times`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distractionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
