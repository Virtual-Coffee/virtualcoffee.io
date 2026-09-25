import type { Config, EdgeFunction } from '@netlify/edge-functions';

// Declarative: Netlify enforces windowLimit/windowSize before this function
// is ever invoked, returning 429 itself. There is nothing to check in the
// handler below — it exists only because an edge function file needs one.
export const config: Config = {
	path: '/join',
	method: 'POST',
	rateLimit: {
		windowLimit: 5,
		windowSize: 60,
		aggregateBy: ['ip'],
	},
};

// Under the limit, let the request through to the server action.
const rateLimitJoin: EdgeFunction = () => undefined;

export default rateLimitJoin;
