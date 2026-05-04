import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchProfile() {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (err && err.code !== 'PGRST116') throw err
        setProfile(data || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  async function updateProfile(updates) {
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          updated_at: new Date(),
          ...updates,
        })
        .select()
        .single()

      if (err) throw err
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { profile, loading, error, updateProfile }
}