# Sentry Integration Setup

This project is now configured with Sentry.js for error monitoring and performance tracking, integrated with Supabase.

## What's Included

- **Error Tracking**: Automatically capture and report application errors
- **Performance Monitoring**: Track application performance and identify bottlenecks
- **Session Replay**: Record user sessions to understand issues in context
- **Supabase Integration**: Monitor Supabase queries and errors with full tracing

## Setup Instructions

### 1. Create a Sentry Project

1. Sign up or log in at [sentry.io](https://sentry.io)
2. Create a new project and select **React** as the platform
3. Copy your project's DSN (Data Source Name)

### 2. Configure Environment Variables

Add your Sentry DSN to the `.env` file:

```bash
VITE_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

**Note**: If `VITE_SENTRY_DSN` is empty or not set, Sentry will be disabled and the app will display a console warning.

### 3. Adjust Monitoring Settings (Optional)

You can customize Sentry settings in `src/lib/sentry.ts`:

- **tracesSampleRate**: Percentage of transactions to monitor (1.0 = 100%)
- **replaysSessionSampleRate**: Percentage of sessions to record (0.1 = 10%)
- **replaysOnErrorSampleRate**: Percentage of error sessions to record (1.0 = 100%)

## Features

### Error Monitoring
All uncaught errors are automatically sent to Sentry with full stack traces and context.

### Supabase Integration
The integration provides:
- Query performance tracking
- Breadcrumbs for all Supabase operations
- Error capturing for failed queries
- Request/response tracing

### Performance Monitoring
Tracks:
- Page load times
- Component render performance
- Network request durations
- Custom performance marks

### Session Replay
Records user interactions to help reproduce and debug issues, with privacy controls for sensitive data.

## Production Recommendations

Before deploying to production, consider adjusting:

1. **Sample Rates**: Lower `tracesSampleRate` and `replaysSessionSampleRate` to reduce quota usage
2. **Environment**: The integration automatically uses `import.meta.env.MODE` to tag events
3. **Source Maps**: Configure your build to upload source maps to Sentry for better error reporting

## Documentation

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Supabase Sentry Integration](https://supabase.com/docs/guides/telemetry/sentry-monitoring)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
