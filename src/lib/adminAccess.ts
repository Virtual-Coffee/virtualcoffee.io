import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth, type Session } from '@/lib/auth';

/**
 * Deploy previews must never serve /admin.
 *
 * Netlify gives each deploy preview its own database branch seeded with a copy
 * of production data, and preview URLs are public and unguessable-but-shareable.
 * Combining those with a relaxed auth check would put real applicants' email
 * addresses and personal writing on a public URL. Previews therefore 404 rather
 * than render, and the UI is reviewed locally against seeded data instead.
 */
export function adminRoutesEnabled(): boolean {
	const context = process.env.CONTEXT;
	return context !== 'deploy-preview' && context !== 'branch-deploy';
}

/**
 * A stand-in admin session for local development.
 *
 * Slack sign-in needs OAuth credentials and a registered redirect URI, which a
 * contributor working from a fork has no way to get. Without this, /admin is
 * unreachable for exactly the people most likely to want to change it.
 *
 * Three conditions must all hold, and each is independently sufficient to
 * disable it in any deployed environment:
 *   - `ADMIN_DEV_BYPASS` is explicitly `true` (opt-in, not a default)
 *   - `NODE_ENV` is not production (every Netlify build sets it)
 *   - `CONTEXT` is not a deployed context. Note `netlify dev` sets
 *     `CONTEXT=dev`, so this checks for the three deployed values rather than
 *     for the variable being absent.
 */
const DEPLOYED_CONTEXTS = new Set([
	'production',
	'deploy-preview',
	'branch-deploy',
]);

function devBypassSession(): Session | null {
	const enabled =
		process.env.ADMIN_DEV_BYPASS === 'true' &&
		process.env.NODE_ENV !== 'production' &&
		!DEPLOYED_CONTEXTS.has(process.env.CONTEXT ?? '');

	if (!enabled) return null;

	return {
		session: {
			id: 'dev-bypass',
			token: 'dev-bypass',
			userId: 'dev-bypass',
			createdAt: new Date(),
			updatedAt: new Date(),
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		},
		user: {
			id: 'dev-bypass',
			name: 'Local dev',
			email: 'dev@localhost',
			emailVerified: true,
			image: null,
			role: 'admin',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	} as unknown as Session;
}

export async function getSession(): Promise<Session | null> {
	const bypass = devBypassSession();
	if (bypass) return bypass;

	return auth.api.getSession({ headers: await headers() });
}

export function isAdmin(session: Session | null): boolean {
	return session?.user.role === 'admin';
}

/**
 * The authorization boundary for /admin.
 *
 * Deliberately here and in each server action rather than in `proxy.ts`:
 * Next.js 16 renamed middleware to Proxy and its docs say Proxy "should not be
 * used as a full session management or authorization solution". Server actions
 * re-check independently rather than trusting the route they were reached from.
 * See docs/adr/0003.
 */
export async function requireAdmin(): Promise<Session> {
	if (!adminRoutesEnabled()) {
		notFound();
	}

	const session = await getSession();

	if (!isAdmin(session)) {
		redirect('/admin/sign-in');
	}

	return session as Session;
}
