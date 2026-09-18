import * as Sentry from '@sentry/nextjs';

// See src/instrumentation-client.ts for the DSN and PII rules.
Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
	tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.25,
	includeLocalVariables: true,
});
