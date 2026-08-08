import { useState, useRef, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const LOCAL_STORAGE_KEY = 'focusflow_sessions'

export default function useSession() {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const sessionDataRef = useRef({
    focusedDuration: 0,
    distractionCount: 0,
    distractionEvents: []
  })

  const startSession = useCallback((plannedDuration) => {
    const session = {
      id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
      planned_duration: plannedDuration,
      user_id: user?.id || null
    }

    sessionDataRef.current = {
      focusedDuration: 0,
      distractionCount: 0,
      distractionEvents: []
    }

    setCurrentSession(session)
    return session
  }, [user])

  const recordFocusedSecond = useCallback(() => {
    sessionDataRef.current.focusedDuration += 1
  }, [])

  const recordDistraction = useCallback((reason) => {
    sessionDataRef.current.distractionCount += 1
    sessionDataRef.current.distractionEvents.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      reason
    })
  }, [])

  const endSession = useCallback(async (completed = false) => {
    if (!currentSession) return null

    const sessionData = {
      ...currentSession,
      ended_at: new Date().toISOString(),
      focused_duration: sessionDataRef.current.focusedDuration,
      distraction_count: sessionDataRef.current.distractionCount,
      completed
    }

    const distractionEvents = sessionDataRef.current.distractionEvents.map(event => ({
      ...event,
      session_id: currentSession.id,
      user_id: user?.id || null
    }))

    setIsSaving(true)

    try {
      if (isSupabaseConfigured() && user) {
        // Save to Supabase
        const { error: sessionError } = await supabase
          .from('sessions')
          .insert({
            id: sessionData.id,
            user_id: user.id,
            started_at: sessionData.started_at,
            ended_at: sessionData.ended_at,
            planned_duration: sessionData.planned_duration,
            focused_duration: sessionData.focused_duration,
            distraction_count: sessionData.distraction_count,
            completed: sessionData.completed
          })

        if (sessionError) throw sessionError

        if (distractionEvents.length > 0) {
          const { error: eventsError } = await supabase
            .from('distraction_events')
            .insert(distractionEvents.map(e => ({
              id: e.id,
              session_id: e.session_id,
              user_id: user.id,
              timestamp: e.timestamp,
              reason: e.reason
            })))

          if (eventsError) throw eventsError
        }
      } else {
        // Save to localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        const sessions = stored ? JSON.parse(stored) : { sessions: [], distractionEvents: [] }

        sessions.sessions.push(sessionData)
        sessions.distractionEvents.push(...distractionEvents)

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions))
      }
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setIsSaving(false)
    }

    setCurrentSession(null)
    sessionDataRef.current = {
      focusedDuration: 0,
      distractionCount: 0,
      distractionEvents: []
    }

    return sessionData
  }, [currentSession, user])

  const getSessionStats = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && user) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', today.toISOString())
          .order('started_at', { ascending: false })

        if (error) throw error

        const totalFocusedTime = sessions.reduce((sum, s) => sum + (s.focused_duration || 0), 0)
        const completedSessions = sessions.filter(s => s.completed).length
        const avgFocusScore = sessions.length > 0
          ? Math.round(sessions.reduce((sum, s) => {
              const score = s.planned_duration > 0
                ? (s.focused_duration / s.planned_duration) * 100
                : 100
              return sum + score
            }, 0) / sessions.length)
          : 100

        return {
          totalFocusedTime,
          completedSessions,
          avgFocusScore,
          sessions
        }
      } else {
        // Get from localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (!stored) return { totalFocusedTime: 0, completedSessions: 0, avgFocusScore: 100, sessions: [] }

        const { sessions } = JSON.parse(stored)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todaySessions = sessions.filter(s =>
          new Date(s.started_at) >= today
        )

        const totalFocusedTime = todaySessions.reduce((sum, s) => sum + (s.focused_duration || 0), 0)
        const completedSessions = todaySessions.filter(s => s.completed).length
        const avgFocusScore = todaySessions.length > 0
          ? Math.round(todaySessions.reduce((sum, s) => {
              const score = s.planned_duration > 0
                ? (s.focused_duration / s.planned_duration) * 100
                : 100
              return sum + score
            }, 0) / todaySessions.length)
          : 100

        return {
          totalFocusedTime,
          completedSessions,
          avgFocusScore,
          sessions: todaySessions
        }
      }
    } catch (err) {
      console.error('Failed to get session stats:', err)
      return { totalFocusedTime: 0, completedSessions: 0, avgFocusScore: 100, sessions: [] }
    }
  }, [user])

  const getAllSessions = useCallback(async (days = 7) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)

      if (isSupabaseConfigured() && user) {
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', startDate.toISOString())
          .order('started_at', { ascending: false })

        if (sessionsError) throw sessionsError

        const { data: events, error: eventsError } = await supabase
          .from('distraction_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startDate.toISOString())

        if (eventsError) throw eventsError

        return { sessions: sessions || [], distractionEvents: events || [] }
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (!stored) return { sessions: [], distractionEvents: [] }

        const data = JSON.parse(stored)

        const filteredSessions = data.sessions.filter(s =>
          new Date(s.started_at) >= startDate
        )

        const sessionIds = new Set(filteredSessions.map(s => s.id))
        const filteredEvents = data.distractionEvents.filter(e =>
          sessionIds.has(e.session_id)
        )

        return { sessions: filteredSessions, distractionEvents: filteredEvents }
      }
    } catch (err) {
      console.error('Failed to get all sessions:', err)
      return { sessions: [], distractionEvents: [] }
    }
  }, [user])

  const getStreak = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && user) {
        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('started_at, completed')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('started_at', { ascending: false })

        if (error) throw error
        return calculateStreak(sessions)
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (!stored) return 0

        const { sessions } = JSON.parse(stored)
        const completed = sessions.filter(s => s.completed)
        return calculateStreak(completed)
      }
    } catch (err) {
      console.error('Failed to get streak:', err)
      return 0
    }
  }, [user])

  return {
    currentSession,
    isSaving,
    startSession,
    endSession,
    recordFocusedSecond,
    recordDistraction,
    getSessionStats,
    getAllSessions,
    getStreak
  }
}

function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0

  // Group sessions by date
  const dateSet = new Set()
  sessions.forEach(s => {
    const date = new Date(s.started_at).toDateString()
    dateSet.add(date)
  })

  const dates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a))

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (dates[i] === expectedDate.toDateString()) {
      streak++
    } else {
      break
    }
  }

  return streak
}
