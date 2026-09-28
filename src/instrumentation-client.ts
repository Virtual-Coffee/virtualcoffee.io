import * as Sentry from '@sentry/nextjs';

import { dataCollection } from '@/sentryDataCollection';

// Sentry is a no-op without a DSN, so local dev sends nothing unless
// NEXT_PUBLIC_SENTRY_DSN is in .env. Every runtime passes the shared
// `dataCollection` baseline; unset is permissive in v11. See
// docs/adr/0015-error-monitoring-with-sentry.md.
Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
	dataCollection,
	tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.25,
	// Netlify's injected RUM beacon rejects unhandled when a blocker drops its
	// ingest request; never our code.
	ignoreErrors: [/\(ingesteer\.services-prod\.nsvcs\.net\)/],
	integrations: [
		// Tags events `third_party_code:true` when any frame isn't from our
		// bundles (extensions, injected scripts) rather than dropping them.
		// `contains`, not `exclusively`: Sentry's own fetch wrapper is bundled
		// with us, so extension errors routed through it are mixed-frame. The
		// key is `applicationKey` in next.config.mjs.
		Sentry.thirdPartyErrorFilterIntegration({
			filterKeys: ['virtualcoffee-io'],
			behaviour: 'apply-tag-if-contains-third-party-frames',
		}),
	],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
