import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * The signed-in user's profile row.
 *
 * Falls back to whatever the identity provider put in user_metadata if the
 * profiles table has not been created yet, so the UI still shows a name and
 * avatar on a project where 0002_profiles.sql has not been run.
 */
export default function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const metadataFallback = useCallback(() => {
    if (!user) return null
    const meta = user.user_metadata || {}
    return {
      id: user.id,
      display_name: meta.full_name || meta.name || user.email?.split('@')[0] || 'You',
      avatar_url: meta.avatar_url || meta.picture || null
    }
  }, [user])

  const load = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch {
      // Table missing, or no row yet - show provider metadata instead of nothing
      setProfile(metadataFallback())
    } finally {
      setIsLoading(false)
    }
  }, [user, metadataFallback])

  useEffect(() => { load() }, [load])

  const updateProfile = useCallback(async (changes) => {
    if (!user || !isSupabaseConfigured()) return false

    const next = { ...profile, ...changes }
    setProfile(next)

    const { error } = await supabase
      .from('profiles')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('Failed to update profile:', error)
      return false
    }
    return true
  }, [user, profile])

  return { profile, isLoading, updateProfile, reload: load }
}
