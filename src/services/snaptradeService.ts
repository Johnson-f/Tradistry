import { supabase } from '../supabaseClient';
import { 
  SnapTradeOAuthInitResponse, 
  SnapTradeConnection, 
  SnapTradeOAuthLog 
} from '../types/snaptrade';

export class SnapTradeService {
  private static instance: SnapTradeService;
  private supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = 'https://xzzpqryqndcfrwltlfpj.supabase.co';
  }

  public static getInstance(): SnapTradeService {
    if (!SnapTradeService.instance) {
      SnapTradeService.instance = new SnapTradeService();
    }
    return SnapTradeService.instance;
  }

  /**
   * Get the current user's session token
   */
  private async getSessionToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Initiate SnapTrade OAuth flow
   */
  async initiateOAuth(): Promise<string | null> {
    try {
      const token = await this.getSessionToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${this.supabaseUrl}/functions/v1/snaptrade-oauth-init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate OAuth');
      }

      const data: SnapTradeOAuthInitResponse = await response.json();
      
      if (!data.success || !data.loginUrl) {
        throw new Error(data.error || 'Failed to get login URL');
      }

      return data.loginUrl;
    } catch (error) {
      console.error('Error initiating SnapTrade OAuth:', error);
      throw error;
    }
  }

  /**
   * Get the current user's SnapTrade connection
   */
  async getConnection(): Promise<SnapTradeConnection | null> {
    try {
      const { data, error } = await supabase
        .from('snaptrade_connections')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No connection found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching SnapTrade connection:', error);
      throw error;
    }
  }

  /**
   * Disconnect SnapTrade account
   */
  async disconnect(): Promise<void> {
    try {
      const { error } = await supabase
        .from('snaptrade_connections')
        .delete()
        .neq('id', ''); // Delete all connections for current user

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error disconnecting SnapTrade:', error);
      throw error;
    }
  }

  /**
   * Get OAuth logs for the current user
   */
  async getOAuthLogs(limit: number = 10): Promise<SnapTradeOAuthLog[]> {
    try {
      const { data, error } = await supabase
        .from('snaptrade_oauth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching OAuth logs:', error);
      throw error;
    }
  }

  /**
   * Check if user has an active SnapTrade connection
   */
  async hasActiveConnection(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      return connection?.status === 'active';
    } catch (error) {
      console.error('Error checking active connection:', error);
      return false;
    }
  }

  /**
   * Refresh connection status
   */
  async refreshConnection(): Promise<SnapTradeConnection | null> {
    try {
      // This could be extended to call SnapTrade API to verify connection status
      return await this.getConnection();
    } catch (error) {
      console.error('Error refreshing connection:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const snapTradeService = SnapTradeService.getInstance(); 