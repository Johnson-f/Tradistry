import React from 'react'
import { useSnapTradeAuth } from '../hooks/useSnapTradeAuth'
import { useApiQuota } from '../hooks/useApiQuota'

interface ConnectAccountButtonProps {
  onConnect?: () => void
  className?: string
}

export const ConnectAccountButton: React.FC<ConnectAccountButtonProps> = ({ 
  onConnect, 
  className = '' 
}) => {
  const { 
    isConnected, 
    isLoading, 
    error, 
    authUrl, 
    connectAccount 
  } = useSnapTradeAuth()
  
  const { remainingCalls } = useApiQuota()

  const handleConnect = async () => {
    await connectAccount()
    onConnect?.()
  }

  const handleOAuthRedirect = () => {
    if (authUrl) {
      window.open(authUrl, 'snaptrade-oauth', 'width=600,height=700,scrollbars=yes,resizable=yes')
    }
  }

  if (isConnected) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Connected</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <button
        onClick={handleConnect}
        disabled={isLoading || remainingCalls <= 0}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${isLoading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : remainingCalls <= 0
            ? 'bg-red-100 text-red-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : remainingCalls <= 0 ? (
          'API Limit Reached'
        ) : (
          'Connect Trading Account'
        )}
      </button>

      {authUrl && (
        <button
          onClick={handleOAuthRedirect}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Complete OAuth Connection
        </button>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {remainingCalls <= 5 && remainingCalls > 0 && (
        <div className="text-orange-600 text-sm bg-orange-50 p-2 rounded">
          ⚠️ Only {remainingCalls} API calls remaining today
        </div>
      )}

      {remainingCalls <= 0 && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          🚫 Daily API limit reached. Try again tomorrow or upgrade your plan.
        </div>
      )}
    </div>
  )
} 