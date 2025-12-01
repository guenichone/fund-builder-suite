import * as Sentry from '@sentry/react';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseIntegration } from '@supabase/sentry-js-integration';

export function initSentry(supabaseClient: SupabaseClient) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error monitoring is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      new SupabaseIntegration(Sentry, {
        tracing: true,
        breadcrumbs: true,
        errors: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/.*\.supabase\.co/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    environment: import.meta.env.MODE,
  });
}

export { Sentry };
