import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePrisms(userId) {
  const [prisms, setPrisms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchPrisms() {
      try {
        const { data, error: err } = await supabase
          .from('prisms')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (err) throw err
        setPrisms(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrisms()
  }, [userId])

  async function savePrism(prismData) {
    try {
      const { data, error: err } = await supabase
        .from('prisms')
        .insert([{
          user_id: userId,
          created_at: new Date(),
          ...prismData,
        }])
        .select()
        .single()

      if (err) throw err
      setPrisms([data, ...prisms])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { prisms, loading, error, savePrism }
}