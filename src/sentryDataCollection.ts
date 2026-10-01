import type { init } from '@sentry/nextjs';

// @sentry/nextjs doesn't re-export the type; @sentry/core isn't a direct dep.
type DataCollection = NonNullable<Parameters<typeof init>[0]['dataCollection']>;

// The privacy baseline every Sentry.init passes. v11 collects cookies,
// headers, request bodies and user info when this is unset, so it is never
// left unset. See docs/adr/0015-error-monitoring-with-sentry.md.
const ipParams = { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] };

export const dataCollection = {
	userInfo: false,
	cookies: false,
	// User-Agent only: Sentry derives browser/OS tags and its crawler and
	// legacy-browser inbound filters from it. Every other request header
	// (Referer, Accept-Language, IP-bearing proxies) is filtered, and no
	// response headers are kept.
	httpHeaders: { request: { allow: ['user-agent'] }, response: false },
	httpBodies: [],
	urlQueryParams: ipParams,
	genAI: { inputs: false, outputs: false },
	databaseQueryData: false,
	queues: false,
	graphQL: { document: false, variables: false },
	// Server stack traces keep local variable values (ADR 0015 accepts the
	// trade-off); only takes effect where `includeLocalVariables` is set.
	stackFrameVariables: true,
} satisfies DataCollection;
