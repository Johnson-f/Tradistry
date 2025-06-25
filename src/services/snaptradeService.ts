import { supabase } from '../supabaseClient'

interface SnapTradeResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
}

class SnapTradeService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    }
  }

  async registerUser(userId: string): Promise<SnapTradeResponse> {
    try {
      const response = await fetch('/api/snaptrade-register', {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async fetchAccounts(userId: string): Promise<SnapTradeResponse> {
    try {
      const response = await fetch('/api/snaptrade-accounts', {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async fetchAccountData(
    userId: string, 
    accountId: string, 
    dataType: 'balance' | 'holdings'
  ): Promise<SnapTradeResponse> {
    try {
      const response = await fetch('/api/snaptrade-holdings', {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ 
          userId, 
          accountId, 
          dataType 
        })
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async disconnectAccount(userId: string, accountId: string): Promise<SnapTradeResponse> {
    try {
      const response = await fetch('/api/snaptrade-disconnect', {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ userId, accountId })
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async getQuota(userId: string): Promise<SnapTradeResponse> {
    try {
      const response = await fetch('/api/snaptrade-quota', {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ userId })
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  // Helper method to check if user has connected accounts
  async hasConnectedAccounts(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('user_id', userId)
        .eq('connection_status', 'active')
        .limit(1)

      if (error) throw error
      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Error checking connected accounts:', error)
      return false
    }
  }

  // Helper method to get cached account data
  async getCachedAccountData(accountId: string, dataType: 'balance' | 'holdings') {
    try {
      const { data, error } = await supabase
        .from('account_data')
        .select('data, last_updated')
        .eq('connected_account_id', accountId)
        .eq('data_type', dataType)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting cached data:', error)
      return null
    }
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Helper method to format percentage
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`
  }

  // Helper method to get account status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'inactive':
        return 'text-gray-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Helper method to get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':
        return '🟢'
      case 'inactive':
        return '⚪'
      case 'error':
        return '🔴'
      default:
        return '⚪'
    }
  }
}

export const snaptradeService = new SnapTradeService() 