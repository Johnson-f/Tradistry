import React, { useState } from 'react'
import { useSnapTradeAuth } from '../hooks/useSnapTradeAuth'

interface DisconnectButtonProps {
  accountId: string
  onDisconnect?: () => void
  className?: string
}

export const DisconnectButton: React.FC<DisconnectButtonProps> = ({ 
  accountId, 
  onDisconnect,
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { disconnectAccount } = useSnapTradeAuth()

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      await disconnectAccount(accountId)
      onDisconnect?.()
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to disconnect account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={handleDisconnect}
          disabled={isLoading}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 transition-colors"
        >
          {isLoading ? 'Disconnecting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`p-1 text-gray-400 hover:text-red-600 transition-colors ${className}`}
      title="Disconnect account"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
} 