import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Keeps the old name on purpose: renaming the key would orphan data
// already saved in people's browsers.
const LOCAL_STORAGE_KEY = 'focusflow_settings'

const DEFAULT_SETTINGS = {
  work_duration: 25,
  short_break: 5,
  long_break: 15,
  sensitivity_level: 'medium',
  sound_enabled: true
}

export default function useSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load settings on mount and when user changes
  useEffect(() => {
    loadSettings()
  }, [user])

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isSupabaseConfigured() && user) {
        const { data, error: fetchError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No settings found, create default
            const { data: newData, error: insertError } = await supabase
              .from('user_settings')
              .insert({ user_id: user.id, ...DEFAULT_SETTINGS })
              .select()
              .single()

            if (insertError) throw insertError
            setSettings(newData)
          } else {
            throw fetchError
          }
        } else {
          setSettings(data)
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (stored) {
          setSettings(JSON.parse(stored))
        } else {
          setSettings(DEFAULT_SETTINGS)
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError(err.message)
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      if (isSupabaseConfigured() && user) {
        const { error: updateError } = await supabase
          .from('user_settings')
          .update({
            work_duration: updated.work_duration,
            short_break: updated.short_break,
            long_break: updated.long_break,
            sensitivity_level: updated.sensitivity_level,
            sound_enabled: updated.sound_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Save to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
      }

      return true
    } catch (err) {
      console.error('Failed to update settings:', err)
      setError(err.message)
      return false
    }
  }, [settings, user])

  const resetSettings = useCallback(async () => {
    return updateSettings(DEFAULT_SETTINGS)
  }, [updateSettings])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    DEFAULT_SETTINGS
  }
}
