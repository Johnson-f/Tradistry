import React, { useState } from 'react';
import { useSnapTradeConnection } from '../hooks/useSnapTradeConnection';
import SnapTradeModal from './SnapTradeModal';
import { SnapTradeConnection } from '../types/snaptrade';

interface SnapTradeConnectionStatusProps {
  className?: string;
  onConnectionChange?: (connection: SnapTradeConnection | null) => void;
}

const SnapTradeConnectionStatus: React.FC<SnapTradeConnectionStatusProps> = ({
  className = '',
  onConnectionChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connection, isLoading, error, disconnect } = useSnapTradeConnection();

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your SnapTrade account?')) {
      try {
        await disconnect();
        onConnectionChange?.(null);
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  };

  const handleModalSuccess = (newConnection: SnapTradeConnection) => {
    onConnectionChange?.(newConnection);
  };

  const handleModalError = (error: string) => {
    console.error('SnapTrade connection error:', error);
    // You could show a toast notification here
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Checking connection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-600">Connection error</span>
        </div>
        <button
          onClick={handleConnect}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (connection) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">Connected to SnapTrade</span>
          <span className="text-xs text-gray-500">
            ID: {connection.snaptrade_user_id.slice(0, 8)}...
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            Connected {new Date(connection.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        <span className="text-sm text-gray-600">Not connected to SnapTrade</span>
      </div>
      <button
        onClick={handleConnect}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Connect
      </button>

      {/* SnapTrade Modal */}
      <SnapTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
      />
    </div>
  );
};

export default SnapTradeConnectionStatus; 