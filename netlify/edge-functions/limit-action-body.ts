import type { Config, EdgeFunction } from '@netlify/edge-functions';

// `bodySizeLimit` in next.config.mjs was raised for one form's attachment,
// and Next has no per-action limit — so every other Server Action would take
// the bigger body too. This holds them at Next's old default at the edge; the
// form that needs more is excluded below.
const limit = 1024 * 1024;

// A missing or unreadable Content-Length passes through: Next still enforces
// its own limit on what actually arrives.
const limitActionBody: EdgeFunction = (request) => {
	const length = Number(request.headers.get('content-length'));
	if (Number.isNaN(length) || length <= limit) return;
	return new Response(null, { status: 413 });
};

export default limitActionBody;

export const config: Config = {
	path: '/*',
	method: 'POST',
	// The CoC form is the reason for the raised limit; /monitoring is the
	// Sentry tunnel and /_cache the revalidation route, neither a Server Action.
	excludedPath: ['/report-coc-violation', '/monitoring', '/_cache'],
};
