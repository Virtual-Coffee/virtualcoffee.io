import type { init } from '@sentry/nextjs';

// @sentry/nextjs doesn't re-export the types; @sentry/core isn't a direct dep.
type Options = Parameters<typeof init>[0];
type DataCollection = NonNullable<Options['dataCollection']>;
type ErrorEvent = Parameters<NonNullable<Options['beforeSend']>>[0];

// The privacy baseline every Sentry.init passes. v11 collects cookies,
// headers, request bodies and user info when this is unset, so it is never
// left unset. See docs/adr/0015-error-monitoring-with-sentry.md.
// Deny terms match query keys as case-insensitive substrings, on top of the
// SDK's built-ins (token, key, secret, auth, ...). `code` is the Slack invite
// on /join-slack and the OAuth callback code, `invite` the Claim Link on
// /join, `state` the OAuth callback state.
const urlQueryParams = {
	deny: [
		'forwarded',
		'-ip',
		'remote-',
		'via',
		'-user',
		'code',
		'invite',
		'state',
	],
};

export const dataCollection = {
	userInfo: false,
	cookies: false,
	// User-Agent only: Sentry derives browser/OS tags and its crawler and
	// legacy-browser inbound filters from it. Every other request header
	// (Referer, Accept-Language, IP-bearing proxies) is filtered, and no
	// response headers are kept.
	httpHeaders: { request: { allow: ['user-agent'] }, response: false },
	httpBodies: [],
	urlQueryParams,
	genAI: { inputs: false, outputs: false },
	databaseQueryData: false,
	queues: false,
	graphQL: { document: false, variables: false },
	// Server stack traces keep local variable values, except where
	// `withoutPiiFrameVars` strips them; only takes effect where
	// `includeLocalVariables` is set. By-name filtering is not used: the
	// bundler renames locals.
	stackFrameVariables: true,
} satisfies DataCollection;

/**
 * Routes whose locals carry what a person typed or who they are: form
 * bodies, CoC report text, recipients' addresses.
 */
export const PII_ROUTES = [
	'/admin',
	'/join',
	'/invites',
	'/report-coc-violation',
	'/volunteer-at-virtual-coffee',
	'/lunch-and-learn-idea',
	'/start-coffee-table-group',
] as const;

/** Whether `path` is a PII route or under one. */
export function underPiiRoute(path: string | undefined): boolean {
	return PII_ROUTES.some(
		(route) => path === route || path?.startsWith(`${route}/`),
	);
}

/**
 * The server's `beforeSend`: drops every frame's local variables from an
 * event `reportHandled` sent (a caught error's locals are captured too) and
 * from any event on a PII route. Elsewhere they stay.
 */
export function withoutPiiFrameVars(event: ErrorEvent): ErrorEvent {
	const requestPath = URL.parse(event.request?.url ?? '')?.pathname;
	// A transaction is `/join` or `POST /join`.
	const transactionPath = event.transaction?.split(' ').at(-1);
	if (
		event.tags?.reported !== 'handled' &&
		!underPiiRoute(requestPath) &&
		!underPiiRoute(transactionPath)
	) {
		return event;
	}

	for (const exception of event.exception?.values ?? []) {
		for (const frame of exception.stacktrace?.frames ?? []) {
			delete frame.vars;
		}
	}
	return event;
}
