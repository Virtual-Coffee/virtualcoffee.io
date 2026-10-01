import * as Sentry from '@sentry/nextjs';

import { dataCollection } from '@/sentryDataCollection';

// Nothing runs on Next's edge runtime today (block-bots is a Netlify/Deno
// edge function, outside Sentry's reach); this is the SDK's default shape so
// the first edge route is covered. See src/instrumentation-client.ts.
Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
	dataCollection,
	tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.25,
});
