import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export const SnapTradeSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  const accounts = searchParams.get('accounts')
  const parsedAccounts = accounts ? JSON.parse(decodeURIComponent(accounts)) : []

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/SnapTrade')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Successful!
          </h1>
          <p className="text-gray-600">
            Your trading account has been successfully connected.
          </p>
        </div>

        {parsedAccounts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Connected Accounts ({parsedAccounts.length})
            </h2>
            <div className="space-y-2">
              {parsedAccounts.map((account: any, index: number) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 text-left"
                >
                  <div className="font-medium text-gray-900">
                    {account.name || account.id}
                  </div>
                  <div className="text-sm text-gray-600">
                    {account.brokerage?.name || 'Unknown Brokerage'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/SnapTrade')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Trading Accounts</span>
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  )
} 