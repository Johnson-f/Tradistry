import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

interface Account {
  id: string
  account_id: string
  brokerage_name: string
  account_name: string
  account_number: string
  connection_status: string
  created_at: string
}

interface AccountData {
  balance?: any
  holdings?: any
  lastUpdated?: string
}

interface AccountsState {
  accounts: Account[]
  accountData: Record<string, AccountData>
  isLoading: boolean
  error: string | null
  cached: boolean
}

interface AccountsActions {
  fetchAccounts: () => Promise<void>
  fetchAccountData: (accountId: string, dataType: 'balance' | 'holdings') => Promise<void>
  refreshAllData: () => Promise<void>
}

export const useAccounts = (): AccountsState & AccountsActions => {
  const [state, setState] = useState<AccountsState>({
    accounts: [],
    accountData: {},
    isLoading: false,
    error: null,
    cached: false
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

  const fetchAccounts = async () => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/snaptrade-accounts', {
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
          accounts: data.accounts || [],
          cached: data.cached || false,
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Failed to fetch accounts',
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

  const fetchAccountData = async (accountId: string, dataType: 'balance' | 'holdings') => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/snaptrade-holdings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ 
          userId: user.id, 
          accountId, 
          dataType 
        })
      })

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          accountData: {
            ...prev.accountData,
            [accountId]: {
              ...prev.accountData[accountId],
              [dataType]: data.data,
              lastUpdated: new Date().toISOString()
            }
          },
          cached: data.cached || false,
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || `Failed to fetch ${dataType}`,
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

  const refreshAllData = async () => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // First fetch accounts
      await fetchAccounts()

      // Then fetch data for each account
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('connection_status', 'active')

      if (accounts) {
        for (const account of accounts) {
          await fetchAccountData(account.account_id, 'balance')
          await fetchAccountData(account.account_id, 'holdings')
        }
      }

      setState(prev => ({ ...prev, isLoading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh all data',
        isLoading: false
      }))
    }
  }

  // Fetch accounts on mount
  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  return {
    ...state,
    fetchAccounts,
    fetchAccountData,
    refreshAllData
  }
} 