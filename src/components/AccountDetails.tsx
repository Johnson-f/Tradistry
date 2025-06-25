import React, { useState } from 'react'
import { useApiQuota } from '../hooks/useApiQuota'

interface AccountData {
  balance?: any
  holdings?: any
  lastUpdated?: string
}

interface AccountDetailsProps {
  accountId: string
  accountData?: AccountData
  onFetchData: (accountId: string, dataType: 'balance' | 'holdings') => Promise<void>
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ 
  accountId, 
  accountData, 
  onFetchData 
}) => {
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false)
  const { remainingCalls } = useApiQuota()

  const handleFetchBalance = async () => {
    if (remainingCalls <= 0) return
    setIsLoadingBalance(true)
    await onFetchData(accountId, 'balance')
    setIsLoadingBalance(false)
  }

  const handleFetchHoldings = async () => {
    if (remainingCalls <= 0) return
    setIsLoadingHoldings(true)
    await onFetchData(accountId, 'holdings')
    setIsLoadingHoldings(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getTotalBalance = () => {
    if (!accountData?.balance) return 0
    return accountData.balance.reduce((total: number, balance: any) => {
      return total + (balance.cash || 0)
    }, 0)
  }

  const getTopHoldings = () => {
    if (!accountData?.holdings) return []
    return accountData.holdings
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
  }

  return (
    <div className="space-y-4">
      {/* Balance Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Account Balance</h4>
          <button
            onClick={handleFetchBalance}
            disabled={isLoadingBalance || remainingCalls <= 0}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isLoadingBalance ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {accountData?.balance ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(getTotalBalance())}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last updated: {accountData.lastUpdated ? new Date(accountData.lastUpdated).toLocaleString() : 'Unknown'}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <button
              onClick={handleFetchBalance}
              disabled={isLoadingBalance || remainingCalls <= 0}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isLoadingBalance ? 'Loading...' : 'Load Balance'}
            </button>
          </div>
        )}
      </div>

      {/* Holdings Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Top Holdings</h4>
          <button
            onClick={handleFetchHoldings}
            disabled={isLoadingHoldings || remainingCalls <= 0}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isLoadingHoldings ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {accountData?.holdings ? (
          <div className="space-y-2">
            {getTopHoldings().map((holding: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {holding.symbol || 'Unknown'}
                  </div>
                  <div className="text-gray-500 truncate">
                    {holding.description || 'No description'}
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(holding.value || 0)}
                  </div>
                  <div className="text-gray-500">
                    {holding.quantity} shares
                  </div>
                </div>
              </div>
            ))}
            {accountData.holdings.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-2">
                No holdings found
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <button
              onClick={handleFetchHoldings}
              disabled={isLoadingHoldings || remainingCalls <= 0}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isLoadingHoldings ? 'Loading...' : 'Load Holdings'}
            </button>
          </div>
        )}
      </div>

      {/* API Quota Warning */}
      {remainingCalls <= 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs text-orange-800">
              {remainingCalls} API calls remaining today
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 