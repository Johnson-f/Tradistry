import React, { useState } from 'react'
import { ConnectAccountButton } from './ConnectAccountButton'
import { ConnectionModal } from './ConnectionModal'
import { AccountsList } from './AccountsList'
import { ApiQuotaIndicator } from './ApiQuotaIndicator'

export const SnapTradeIntegration: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showQuotaDetails, setShowQuotaDetails] = useState(false)

  const handleConnectClick = () => {
    setIsModalOpen(true)
  }

  const handleConnectionSuccess = () => {
    setIsModalOpen(false)
    // Optionally refresh the page or update state
    window.location.reload()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Trading Account Integration
            </h1>
            <p className="mt-2 text-gray-600">
              Connect your brokerage accounts to view balances, holdings, and track your portfolio performance.
            </p>
          </div>
          
          {/* API Quota Indicator */}
          <div className="flex items-center space-x-4">
            <ApiQuotaIndicator 
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              showDetails={showQuotaDetails}
            />
            <button
              onClick={() => setShowQuotaDetails(!showQuotaDetails)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {showQuotaDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>
      </div>

      {/* Connection Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your First Account
            </h2>
            <p className="text-gray-600">
              Securely connect your brokerage account using SnapTrade's OAuth flow. 
              Your credentials are never stored and all connections are read-only.
            </p>
          </div>
          <ConnectAccountButton onConnect={handleConnectClick} />
        </div>
      </div>

      {/* Connected Accounts */}
      <AccountsList />

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleConnectionSuccess}
      />

      {/* Information Section */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          About SnapTrade Integration
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Security & Privacy</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Read-only access to your accounts</li>
              <li>• No trading capabilities</li>
              <li>• Credentials never stored locally</li>
              <li>• OAuth 2.0 secure authentication</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Free Tier Limitations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 25 API calls per day</li>
              <li>• Sandbox environment only</li>
              <li>• Data cached for 24 hours</li>
              <li>• Automatic fallback to cached data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 