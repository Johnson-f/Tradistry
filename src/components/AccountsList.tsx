import React, { useEffect } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { useSnapTradeAuth } from '../hooks/useSnapTradeAuth'
import { DisconnectButton } from './DisconnectButton'
import { AccountDetails } from './AccountDetails'

interface AccountsListProps {
  className?: string
}

export const AccountsList: React.FC<AccountsListProps> = ({ className = '' }) => {
  const { 
    accounts, 
    accountData, 
    isLoading, 
    error, 
    cached,
    fetchAccounts, 
    fetchAccountData 
  } = useAccounts()

  const { refreshConnection } = useSnapTradeAuth()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleRefresh = async () => {
    await fetchAccounts()
    await refreshConnection()
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Accounts</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Accounts</h3>
          <p className="text-gray-600 mb-4">
            Connect your first trading account to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
          <p className="text-sm text-gray-600">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {cached && (
            <div className="flex items-center space-x-1 text-orange-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Cached Data</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Account Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {account.account_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {account.brokerage_name}
                </p>
                {account.account_number && (
                  <p className="text-xs text-gray-500 mt-1">
                    ****{account.account_number.slice(-4)}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  account.connection_status === 'active' 
                    ? 'bg-green-500' 
                    : account.connection_status === 'inactive'
                    ? 'bg-gray-400'
                    : 'bg-red-500'
                }`}></div>
                <DisconnectButton 
                  accountId={account.account_id}
                  onDisconnect={handleRefresh}
                />
              </div>
            </div>

            {/* Account Details */}
            <AccountDetails
              accountId={account.account_id}
              accountData={accountData[account.account_id]}
              onFetchData={fetchAccountData}
            />
          </div>
        ))}
      </div>
    </div>
  )
} 