import React, { useEffect, useRef, useState } from 'react';
import { SnapTradeIframeProps, SnapTradeIframeMessage } from '../types/snaptrade';

const SnapTradeIframe: React.FC<SnapTradeIframeProps> = ({
  src,
  onLoad,
  onError,
  onSuccess,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from our iframe
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      try {
        const message: SnapTradeIframeMessage = event.data;
        
        if (message.type === 'SNAPTRADE_SUCCESS') {
          setHasError(false);
          onSuccess?.();
        } else if (message.type === 'SNAPTRADE_ERROR') {
          setHasError(true);
          onError?.(message.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error parsing iframe message:', error);
      }
    };

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.('Failed to load SnapTrade login page');
    };

    // Add event listeners
    window.addEventListener('message', handleMessage);
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
    }

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      }
    };
  }, [onLoad, onError, onSuccess]);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading SnapTrade...</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium">Failed to load SnapTrade</p>
            <p className="text-red-500 text-sm mt-2">Please try again or contact support</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full min-h-[600px] border-0 rounded-lg"
        title="SnapTrade Login"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        allow="camera; microphone; geolocation"
      />
    </div>
  );
};

export default SnapTradeIframe; 