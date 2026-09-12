import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { eq } from 'drizzle-orm';

import { db, user } from '@/db';
import { getAuth, type Session } from '@/lib/auth';
import {
	parseRoles,
	roles,
	SECTIONS,
	type Section,
	type RoleName,
} from '@/lib/permissions';

/**
 * Whether /admin should render at all on this deploy. Previews 404 unless
 * `PREVIEW_ADMIN_BYPASS=true`, which is safe only because `db:sanitize-preview`
 * scrubbed the branch during the build. See docs/adr/0007.
 */
export function adminRoutesEnabled(): boolean {
	const context = process.env.CONTEXT;
	if (context !== 'deploy-preview' && context !== 'branch-deploy') return true;
	return process.env.PREVIEW_ADMIN_BYPASS === 'true';
}

const DEPLOYED_CONTEXTS = new Set([
	'production',
	'deploy-preview',
	'branch-deploy',
]);

/** A session that exists only in memory: no `user` row, no account. */
function bypassSession(fields: {
	id: string;
	name: string;
	email: string;
	role: string;
	slackUserId: string;
}): Session {
	const now = new Date();
	return {
		session: {
			id: fields.id,
			token: fields.id,
			userId: fields.id,
			createdAt: now,
			updatedAt: now,
			expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
		},
		user: {
			id: fields.id,
			name: fields.name,
			email: fields.email,
			emailVerified: true,
			image: null,
			role: fields.role,
			slackUserId: fields.slackUserId,
			createdAt: now,
			updatedAt: now,
		},
	} as unknown as Session;
}

/**
 * A stand-in admin session for local development.
 *
 * Slack sign-in needs OAuth credentials and a registered redirect URI, which a
 * contributor working from a fork has no way to get. Three conditions must all
 * hold, and each is independently sufficient to disable it in any deployed
 * environment: `ADMIN_DEV_BYPASS` is explicitly `true`, `NODE_ENV` is not
 * production, and `CONTEXT` is not a deployed context — `netlify dev` sets
 * `CONTEXT=dev`, so this checks for the three deployed values rather than for
 * the variable being absent.
 *
 * `ADMIN_DEV_BYPASS_ROLES` narrows what the session holds (default `admin`).
 * `ADMIN_DEV_BYPASS_SLACK_ID` is what an Invite Allowance is keyed on;
 * `pnpm db:seed` creates a Volunteer for the default, so
 * `ADMIN_DEV_BYPASS_ROLES=volunteer` works with no further setup.
 */
function devBypassSession(): Session | null {
	const enabled =
		process.env.ADMIN_DEV_BYPASS === 'true' &&
		process.env.NODE_ENV !== 'production' &&
		!DEPLOYED_CONTEXTS.has(process.env.CONTEXT ?? '');

	if (!enabled) return null;

	return bypassSession({
		id: 'dev-bypass',
		name: 'Local dev',
		email: 'dev@localhost',
		role: process.env.ADMIN_DEV_BYPASS_ROLES?.trim() || 'admin',
		slackUserId:
			process.env.ADMIN_DEV_BYPASS_SLACK_ID?.trim() || 'U_DEV_BYPASS',
	});
}

/**
 * The mirror image for a sanitized deploy preview: fires only in a *deployed*
 * preview context, never locally or in production. Anyone with the preview
 * link gets this session, which is safe only because `db:sanitize-preview`
 * has scrubbed the branch by the time the deploy is live (docs/adr/0007).
 * `adminRoutesEnabled()` gates the route on the same conditions; this checks
 * them again rather than trusting the caller.
 */
const PREVIEW_BYPASS_CONTEXTS = new Set(['deploy-preview', 'branch-deploy']);

function previewBypassSession(): Session | null {
	const enabled =
		process.env.PREVIEW_ADMIN_BYPASS === 'true' &&
		PREVIEW_BYPASS_CONTEXTS.has(process.env.CONTEXT ?? '');

	if (!enabled) return null;

	return bypassSession({
		id: 'preview-bypass',
		name: 'Preview reviewer',
		email: 'preview-bypass@preview.invalid',
		role: process.env.PREVIEW_ADMIN_BYPASS_ROLES?.trim() || 'admin',
		slackUserId:
			process.env.PREVIEW_ADMIN_BYPASS_SLACK_ID?.trim() || 'U_PREVIEW_BYPASS',
	});
}

export async function getSession(): Promise<Session | null> {
	const devBypass = devBypassSession();
	if (devBypass) return devBypass;

	const previewBypass = previewBypassSession();
	if (previewBypass) return previewBypass;

	return getAuth().api.getSession({ headers: await headers() });
}

function sessionRoles(session: Session | null): RoleName[] {
	return parseRoles(
		(session?.user as { role?: string | null } | undefined)?.role,
	);
}

/**
 * Whether the session's roles grant an action on a section.
 *
 * Evaluated against the local access-control definitions rather than through
 * `auth.api.userHasPermission`: the answer depends only on the role string
 * already in the session, so a round trip through the plugin's HTTP layer
 * would add a request per section on every dashboard render. The plugin's own
 * endpoints still enforce their own checks independently.
 */
export function sessionCan(
	session: Session | null,
	section: Section,
	action: 'read' | 'manage' = 'read',
): boolean {
	return sessionRoles(session).some(
		(name) =>
			roles[name].authorize({ [section]: [action] } as never).success === true,
	);
}

/** Sections this session can see, in nav order. Drives the nav and the dashboard. */
export function visibleSections(session: Session | null): Section[] {
	return SECTIONS.filter((section) => sessionCan(session, section, 'read'));
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
export async function requireSession(): Promise<Session> {
	if (!adminRoutesEnabled()) {
		notFound();
	}

	const session = await getSession();

	if (visibleSections(session).length === 0) {
		redirect('/admin/sign-in');
	}

	return session as Session;
}

/**
 * The boundary for one section. Anyone without `read` on it gets a 404 rather
 * than a 403: a volunteer_coordinator should not learn that /admin/submissions/coc
 * exists.
 */
export async function requirePermission(
	section: Section,
	action: 'read' | 'manage' = 'read',
): Promise<Session> {
	const session = await requireSession();

	if (!sessionCan(session, section, action)) {
		notFound();
	}

	return session;
}

/**
 * The actor to record on an audit row for this session, or null.
 *
 * The dev bypass and the preview bypass sessions above have no `user` row, and
 * every `*_event.actor_user_id` is a foreign key — so writing the session's id
 * straight in would throw on the event insert, after the status change it was
 * meant to record had already been written. Looking the row up is what makes a
 * bypass session's events land with no actor rather than not at all. Every
 * server action that records an event should get its actor from here.
 */
export async function actorId(userId: string): Promise<string | null> {
	const [row] = await db()
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);
	return row?.id ?? null;
}
