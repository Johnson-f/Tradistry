// SnapTrade Configuration Types
export interface SnapTradeConfig {
  id: string;
  client_id: string;
  consumer_secret: string;
  redirect_uri: string;
  sandbox_mode: boolean;
  created_at: string;
  updated_at: string;
}

// SnapTrade Connection Types
export interface SnapTradeConnection {
  id: string;
  user_id: string;
  snaptrade_user_id: string;
  snaptrade_connection_id: string;
  status: 'active' | 'pending' | 'error';
  created_at: string;
  updated_at: string;
}

// SnapTrade OAuth Log Types
export interface SnapTradeOAuthLog {
  id: string;
  user_id: string;
  action: string;
  status: 'pending' | 'success' | 'error';
  metadata: Record<string, any>;
  created_at: string;
}

// API Response Types
export interface SnapTradeOAuthInitResponse {
  success: boolean;
  loginUrl?: string;
  error?: string;
}

export interface SnapTradeCallbackParams {
  code?: string;
  state?: string;
  userId?: string;
  connectionId?: string;
  error?: string;
}

// Component Props Types
export interface SnapTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (connection: SnapTradeConnection) => void;
  onError?: (error: string) => void;
}

export interface SnapTradeIframeProps {
  src: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

// Hook Return Types
export interface UseSnapTradeConnectionReturn {
  connection: SnapTradeConnection | null;
  isLoading: boolean;
  error: string | null;
  refreshConnection: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface UseSnapTradeOAuthReturn {
  initiateOAuth: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

// Event Types for iframe communication
export interface SnapTradeIframeMessage {
  type: 'SNAPTRADE_SUCCESS' | 'SNAPTRADE_ERROR';
  error?: string;
  timestamp: string;
} 