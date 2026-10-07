import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { eq } from 'drizzle-orm';

import { db, user } from '@/db';
import { getAuth, type Session } from '@/lib/access/auth';
import type { Actor } from '@/lib/access/roleAssignment';
import {
	parseRoles,
	roles,
	SECTIONS,
	type Section,
	type RoleName,
} from '@/lib/access/permissions';

/**
 * Wrapped in React's `cache()` so the layout, the page and any action
 * rendered for one request share a single session lookup instead of each
 * hitting the database. Not Better Auth's cookie cache: a role change must
 * apply on the next request, not when a cookie expires.
 */
export const getSession = cache(async (): Promise<Session | null> =>
	getAuth().api.getSession({ headers: await headers() }),
);

/** The roles on the session's user. */
export function sessionRoles(session: Session | null): RoleName[] {
	return parseRoles(session?.user.role);
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

/** The authorization boundary for /admin — here, not in proxy.ts (docs/adr/0003). */
export async function requireSession(): Promise<Session> {
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
 * Every `*_event.actor_user_id` is a foreign key, so writing a session's id
 * straight in would throw on the event insert if the `user` row were gone,
 * after the status change it was meant to record had already been written.
 * Looking the row up makes such an event land with no actor rather than not at
 * all. Every server action that records an event should get its actor from here.
 */
export const actorId = cache(async (userId: string): Promise<string | null> => {
	const [row] = await db()
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);
	return row?.id ?? null;
});

/** The Role assignment actor for a signed-in session. */
export function actorFromSession(session: Session): Actor {
	return {
		userId: session.user.id,
		name: session.user.name || session.user.email,
	};
}
