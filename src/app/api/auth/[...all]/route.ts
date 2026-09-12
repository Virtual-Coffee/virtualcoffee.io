import { toNextJsHandler } from 'better-auth/next-js';

import { getAuth } from '@/lib/auth';

/**
 * Handlers are resolved per request rather than at module scope: building the
 * Better Auth instance opens a database connection, and this module is
 * imported during `next build` where there is no database.
 */
export async function GET(request: Request) {
	return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
	return toNextJsHandler(getAuth()).POST(request);
}
