import { useState, useEffect, useCallback } from 'react';
import { snapTradeService } from '../services/SnapTradeService';
import { SnapTradeConnection, UseSnapTradeConnectionReturn } from '../types/snaptrade';

export const useSnapTradeConnection = (): UseSnapTradeConnectionReturn => {
  const [connection, setConnection] = useState<SnapTradeConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await snapTradeService.getConnection();
      setConnection(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch connection';
      setError(errorMessage);
      setConnection(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshConnection = useCallback(async () => {
    await fetchConnection();
  }, [fetchConnection]);

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await snapTradeService.disconnect();
      setConnection(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch connection on mount
  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  return {
    connection,
    isLoading,
    error,
    refreshConnection,
    disconnect,
  };
}; 