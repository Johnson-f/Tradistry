import * as Sentry from '@sentry/react';

// Initialize Sentry
Sentry.init({
  dsn: 'https://edf0cb365a23ca8e43267f12cef95d2c@o4509539393732621.ingest.us.sentry.io/4509539395436546',
  // Performance Monitoring
  tracesSampleRate: 0.2,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Environment
  environment: import.meta.env.MODE,
  // Enable debug mode in development
  debug: import.meta.env.DEV,
  // Before send function to filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors from localhost in development
    if (import.meta.env.DEV && window.location.hostname === 'localhost') {
      return null;
    }
    return event;
  },
});

export default Sentry; 