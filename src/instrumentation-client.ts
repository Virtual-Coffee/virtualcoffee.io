import * as Sentry from '@sentry/nextjs';

// Sentry is a no-op without a DSN, so local dev sends nothing unless
// NEXT_PUBLIC_SENTRY_DSN is in .env. PII stays off in every runtime: no
// `sendDefaultPii`, no `dataCollection` block (even `{}` flips the unset
// categories permissive). See docs/adr/0015-error-monitoring-with-sentry.md.
Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
	tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.25,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
