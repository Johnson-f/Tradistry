import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

interface QuotaState {
  dailyUsage: number
  remainingCalls: number
  limit: number
  recentUsage: Array<{
    endpoint: string
    called_at: string
    response_cached: boolean
  }>
  isLoading: boolean
  error: string | null
}

interface QuotaActions {
  fetchQuota: () => Promise<void>
  refreshQuota: () => Promise<void>
}

export const useApiQuota = (): QuotaState & QuotaActions => {
  const [state, setState] = useState<QuotaState>({
    dailyUsage: 0,
    remainingCalls: 25,
    limit: 25,
    recentUsage: [],
    isLoading: false,
    error: null
  })

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchQuota = async () => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/snaptrade-quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          dailyUsage: data.dailyUsage || 0,
          remainingCalls: data.remainingCalls || 0,
          limit: data.limit || 25,
          recentUsage: data.recentUsage || [],
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Failed to fetch quota',
          isLoading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error occurred',
        isLoading: false
      }))
    }
  }

  const refreshQuota = async () => {
    await fetchQuota()
  }

  // Fetch quota on mount and set up auto-refresh
  useEffect(() => {
    if (user) {
      fetchQuota()

      // Refresh quota every 5 minutes
      const interval = setInterval(fetchQuota, 5 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [user])

  return {
    ...state,
    fetchQuota,
    refreshQuota
  }
} 