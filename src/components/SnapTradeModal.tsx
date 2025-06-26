import React, { useState, useEffect } from 'react';
import { SnapTradeModalProps, SnapTradeConnection } from '../types/snaptrade';
import { useSnapTradeOAuth } from '../hooks/useSnapTradeOAuth';
import { useSnapTradeConnection } from '../hooks/useSnapTradeConnection';
import SnapTradeIframe from './SnapTradeIframe';

const SnapTradeModal: React.FC<SnapTradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { initiateOAuth, isLoading: isOAuthLoading, error: oauthError } = useSnapTradeOAuth();
  const { connection, refreshConnection } = useSnapTradeConnection();

  // Handle OAuth initiation
  const handleInitiateOAuth = async () => {
    try {
      setIsConnecting(true);
      const url = await initiateOAuth();
      if (url) {
        setLoginUrl(url);
      } else {
        throw new Error('Failed to get login URL');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate OAuth';
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle iframe success
  const handleIframeSuccess = async () => {
    try {
      // Refresh connection data
      await refreshConnection();
      
      // Get updated connection
      const updatedConnection = await refreshConnection();
      
      if (updatedConnection) {
        onSuccess?.(updatedConnection);
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh connection';
      onError?.(errorMessage);
    }
  };

  // Handle iframe error
  const handleIframeError = (error: string) => {
    onError?.(error);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setLoginUrl(null);
      setIsConnecting(false);
    }
  }, [isOpen]);

  // Auto-initiate OAuth when modal opens
  useEffect(() => {
    if (isOpen && !loginUrl && !isOAuthLoading) {
      handleInitiateOAuth();
    }
  }, [isOpen, loginUrl, isOAuthLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Connect SnapTrade Account
                  </h3>
                  <p className="text-sm text-gray-500">
                    Securely connect your trading account to import your portfolio data
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-4 pb-5 sm:p-6 sm:pb-4">
            {isOAuthLoading || isConnecting ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">
                  {isOAuthLoading ? 'Preparing SnapTrade connection...' : 'Connecting to SnapTrade...'}
                </p>
                <p className="text-gray-500 text-sm mt-2">Please wait while we set up your secure connection</p>
              </div>
            ) : oauthError ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">❌</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Failed</h3>
                <p className="text-gray-600 mb-4">{oauthError}</p>
                <button
                  onClick={handleInitiateOAuth}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            ) : loginUrl ? (
              <div className="h-[600px]">
                <SnapTradeIframe
                  src={loginUrl}
                  onSuccess={handleIframeSuccess}
                  onError={handleIframeError}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⏳</div>
                <p className="text-gray-600">Initializing connection...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
            {connection && (
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Connected to SnapTrade
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapTradeModal; 