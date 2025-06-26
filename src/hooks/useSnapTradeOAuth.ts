import { useState, useCallback } from 'react';
import { snapTradeService } from '../services/SnapTradeService';
import { UseSnapTradeOAuthReturn } from '../types/snaptrade';

export const useSnapTradeOAuth = (): UseSnapTradeOAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateOAuth = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const loginUrl = await snapTradeService.initiateOAuth();
      return loginUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate OAuth';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    initiateOAuth,
    isLoading,
    error,
  };
}; 