import React from 'react'
import { useApiQuota } from '../hooks/useApiQuota'

interface ApiQuotaIndicatorProps {
  className?: string
  showDetails?: boolean
}

export const ApiQuotaIndicator: React.FC<ApiQuotaIndicatorProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const { 
    dailyUsage, 
    remainingCalls, 
    limit, 
    recentUsage, 
    isLoading, 
    error,
    refreshQuota 
  } = useApiQuota()

  const getQuotaColor = () => {
    const percentage = (dailyUsage / limit) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getQuotaIcon = () => {
    const percentage = (dailyUsage / limit) * 100
    if (percentage >= 90) return '🔴'
    if (percentage >= 75) return '🟠'
    if (percentage >= 50) return '🟡'
    return '🟢'
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading quota...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-red-600 text-sm">⚠️ Quota error</span>
        <button
          onClick={refreshQuota}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Quota Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getQuotaIcon()}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">
              API Quota
            </div>
            <div className={`text-xs ${getQuotaColor()}`}>
              {dailyUsage} / {limit} calls used
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {remainingCalls} remaining
          </div>
          <button
            onClick={refreshQuota}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            (dailyUsage / limit) * 100 >= 90 
              ? 'bg-red-500' 
              : (dailyUsage / limit) * 100 >= 75
              ? 'bg-orange-500'
              : (dailyUsage / limit) * 100 >= 50
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min((dailyUsage / limit) * 100, 100)}%` }}
        ></div>
      </div>

      {/* Warning Messages */}
      {remainingCalls <= 5 && remainingCalls > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs text-orange-800">
              Only {remainingCalls} API calls remaining today
            </span>
          </div>
        </div>
      )}

      {remainingCalls <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs text-red-800">
              Daily API limit reached. Try again tomorrow.
            </span>
          </div>
        </div>
      )}

      {/* Recent Usage Details */}
      {showDetails && recentUsage.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-700">Recent API Calls</h4>
          <div className="space-y-1">
            {recentUsage.slice(0, 5).map((usage, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {usage.endpoint.replace('snaptrade-', '')}
                </span>
                <div className="flex items-center space-x-2">
                  {usage.response_cached && (
                    <span className="text-orange-600">📦</span>
                  )}
                  <span className="text-gray-500">
                    {new Date(usage.called_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 