import React from 'react'
import * as Sentry from '@sentry/react'
import { logger } from '../services/logger'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state to show fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details with Sentry
        logger.error('Error caught by ErrorBoundary', error, {
            errorInfo,
            componentStack: errorInfo.componentStack,
        });
        
        // Also capture with Sentry directly for React errors
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1>Something went wrong.</h1>
                    <p>{this.state.error?.message}</p>
                    <button 
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Wrap the ErrorBoundary with Sentry's error boundary for additional features
export default Sentry.withErrorBoundary(ErrorBoundary, {
    fallback: (error, componentStack, eventId) => (
        <div className="sentry-error-boundary">
            <h1>Something went wrong.</h1>
            <p>We've been notified and are working on a fix.</p>
            <p>Error ID: {eventId}</p>
            <button 
                onClick={() => window.location.reload()}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            >
                Reload Page
            </button>
        </div>
    ),
});