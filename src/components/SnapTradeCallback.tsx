import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SnapTradeCallbackParams } from '../types/snaptrade';

const SnapTradeCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract parameters from URL
        const params: SnapTradeCallbackParams = {
          code: searchParams.get('code') || undefined,
          state: searchParams.get('state') || undefined,
          userId: searchParams.get('userId') || undefined,
          connectionId: searchParams.get('connectionId') || undefined,
          error: searchParams.get('error') || undefined,
        };

        // Check for errors
        if (params.error) {
          setStatus('error');
          setMessage(`Connection failed: ${params.error}`);
          return;
        }

        // Validate required parameters
        if (!params.userId || !params.connectionId) {
          setStatus('error');
          setMessage('Missing required connection parameters');
          return;
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Success
        setStatus('success');
        setMessage('SnapTrade account connected successfully!');

        // Send message to parent window if in iframe
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'SNAPTRADE_SUCCESS',
            timestamp: new Date().toISOString()
          }, '*');
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
          if (window.parent && window.parent !== window) {
            window.close();
          }
        }, 3000);

      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
        
        // Send error message to parent window
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'SNAPTRADE_ERROR',
            error: 'An unexpected error occurred',
            timestamp: new Date().toISOString()
          }, '*');
        }
      }
    };

    handleCallback();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        );
      case 'success':
        return (
          <div className="text-green-500 text-6xl">✅</div>
        );
      case 'error':
        return (
          <div className="text-red-500 text-6xl">❌</div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {getStatusIcon()}
        
        <h1 className={`text-2xl font-bold mt-6 mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Connecting...'}
          {status === 'success' && 'Connected Successfully!'}
          {status === 'error' && 'Connection Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              Your SnapTrade account is now connected. You can close this window and return to the app.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              Please try connecting again or contact support if the problem persists.
            </p>
          </div>
        )}

        <button
          onClick={() => {
            if (window.parent && window.parent !== window) {
              window.close();
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close Window
        </button>
      </div>
    </div>
  );
};

export default SnapTradeCallback; 