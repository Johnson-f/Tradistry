import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

interface SnapTradeAuthState {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  authUrl: string | null
  snaptradeUserId: string | null
}

interface SnapTradeAuthActions {
  connectAccount: () => Promise<void>
  disconnectAccount: (accountId: string) => Promise<void>
  refreshConnection: () => Promise<void>
}

export const useSnapTradeAuth = (): SnapTradeAuthState & SnapTradeAuthActions => {
  const [state, setState] = useState<SnapTradeAuthState>({
    isConnected: false,
    isLoading: false,
    error: null,
    authUrl: null,
    snaptradeUserId: null
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

  const connectAccount = async () => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/snaptrade-register', {
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
          authUrl: data.authUrl,
          snaptradeUserId: data.snaptradeUserId,
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Failed to connect account',
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

  const disconnectAccount = async (accountId: string) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/snaptrade-disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ userId: user.id, accountId })
      })

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Failed to disconnect account',
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

  const refreshConnection = async () => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if user has any connected accounts
      const { data: connectedAccounts } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('connection_status', 'active')

      setState(prev => ({
        ...prev,
        isConnected: (connectedAccounts?.length || 0) > 0,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh connection status',
        isLoading: false
      }))
    }
  }

  // Check connection status on mount
  useEffect(() => {
    if (user) {
      refreshConnection()
    }
  }, [user])

  return {
    ...state,
    connectAccount,
    disconnectAccount,
    refreshConnection
  }
} 