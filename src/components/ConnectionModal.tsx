import React, { useEffect, useState } from 'react'
import { useSnapTradeAuth } from '../hooks/useSnapTradeAuth'

interface ConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { authUrl, isLoading, error } = useSnapTradeAuth()
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    if (isOpen && authUrl) {
      setIframeKey(prev => prev + 1)
    }
  }, [isOpen, authUrl])

  useEffect(() => {
    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'SNAPTRADE_SUCCESS') {
        onSuccess?.()
        onClose()
      } else if (event.data.type === 'SNAPTRADE_ERROR') {
        console.error('SnapTrade OAuth error:', event.data.error)
        onClose()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSuccess, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect Your Trading Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Preparing connection...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center h-64 flex items-center justify-center">
              <div className="text-red-600">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-lg font-medium mb-2">Connection Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : authUrl ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Secure Connection
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You'll be redirected to SnapTrade to securely connect your brokerage account. 
                      This process is safe and encrypted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Iframe */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  key={iframeKey}
                  src={authUrl}
                  className="w-full h-96"
                  title="SnapTrade OAuth"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Complete the connection in the window above</p>
                <p className="mt-1">You can close this modal once connected</p>
              </div>
            </div>
          ) : (
            <div className="text-center h-64 flex items-center justify-center">
              <div className="text-gray-600">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-lg font-medium mb-2">No Connection URL</p>
                <p className="text-sm">Please try connecting again</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
} 