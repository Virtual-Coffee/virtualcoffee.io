'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, isUniqueViolation, pendingGrant } from '@/db';
import { getSlackMembers } from '@/data/slackMembers';
import { actorFromSession, requirePermission } from '@/lib/access/adminAccess';
import {
	grantToSlackMember,
	replaceRoles,
	setGrantRoles,
	withdrawGrant,
	type Outcome,
} from '@/lib/access/roleAssignment';
import { grantDmMessage, sendSlackDm } from '@/lib/slack/dm';
import { isId } from '@/db/ids';
import {
	GRANTABLE_ROLE_NAMES,
	isRoleName,
	parseRoles,
	type RoleName,
} from '@/lib/access/permissions';
import type { ActionResult } from '@/lib/admin/actionResult';

/**
 * Whitelist the requested roles, or say so. Shared by every action here, since
 * all four accept the same array off the same dropdown.
 *
 * A role that exists but is not grantable here (`volunteer`) is dropped rather
 * than refused: whether someone keeps it is decided from what is stored, by
 * `preserveUngrantedRoles` in roleAssignment, so sending it grants nothing —
 * but refusing it would make the dropdown unusable for anyone who already
 * holds it.
 */
function validateRoles(
	next: string[],
): { ok: true; roles: RoleName[] } | { ok: false; message: string } {
	const known = next.filter(isRoleName);

	if (known.length !== next.length) {
		return { ok: false, message: 'That is not a role we recognise.' };
	}

	return {
		ok: true,
		roles: known.filter((role) => GRANTABLE_ROLE_NAMES.has(role)),
	};
}

function revalidate() {
	revalidatePath('/admin/user-management');
	revalidatePath('/admin');
}

const GRANT_GONE = {
	ok: false,
	message: 'That grant no longer exists. Reload the page.',
} as const;

const GRANT_CLAIMED = {
	ok: false,
	message: 'That grant has already been claimed. Reload the page.',
} as const;

/** Replace someone's roles outright; `replaceRoles` owns the rules and the encoding. */
export async function setUserRoles(
	userId: string,
	next: string[],
): Promise<ActionResult> {
	const session = await requirePermission('admins', 'manage');

	const validated = validateRoles(next);
	if (!validated.ok) return validated;

	const outcome = await db().transaction((tx) =>
		replaceRoles(tx, userId, validated.roles, actorFromSession(session)),
	);

	switch (outcome.kind) {
		case 'applied':
			revalidate();
			return { ok: true };
		case 'refused':
			return { ok: false, message: 'You cannot revoke your own admin access.' };
		case 'changed':
			return {
				ok: false,
				message: 'Their roles changed while you were editing. Reload the page.',
			};
		default:
			return {
				ok: false,
				message: 'That person no longer exists. Reload the page.',
			};
	}
}

/**
 * Give roles to a Slack member: directly on their user row if they have signed
 * in holding nothing, otherwise as a Pending Grant keyed on their Slack member
 * id. See `docs/adr/0009`.
 *
 * Someone already holding a role is in the table, and is edited there — a
 * one-role picker is the wrong control for changing an existing set.
 */
export async function grantPendingAccess(
	slackUserId: string,
	next: string[],
): Promise<ActionResult> {
	const session = await requirePermission('admins', 'manage');

	const validated = validateRoles(next);
	if (!validated.ok) return validated;
	const requested = validated.roles;

	if (requested.length === 0) {
		return { ok: false, message: 'Choose at least one role to grant.' };
	}

	const member = (await getSlackMembers()).find(
		(candidate) => candidate.id === slackUserId,
	);

	if (!member) {
		return {
			ok: false,
			message: 'That is not someone in the Virtual Coffee Slack workspace.',
		};
	}

	const alreadyPending: ActionResult = {
		ok: false,
		message: `${member.displayName} already has access pending. Edit it in the table below.`,
	};

	let outcome: Outcome;
	try {
		outcome = await db().transaction((tx) =>
			grantToSlackMember(
				tx,
				{
					slackUserId: member.id,
					slackDisplayName: member.displayName,
					slackHandle: member.handle,
				},
				requested,
				actorFromSession(session),
			),
		);
	} catch (error) {
		// The partial unique index is still the authority on one-unclaimed-grant
		// each; the lock in `grantToSlackMember` is what makes the check reliable.
		if (!isUniqueViolation(error)) throw error;
		return alreadyPending;
	}

	if (outcome.kind === 'refused') {
		if (outcome.reason === 'already-has-roles') {
			return {
				ok: false,
				message: `${outcome.name} has already signed in — set their roles in the table below.`,
			};
		}
		return outcome.reason === 'empty'
			? { ok: false, message: 'Choose at least one role to grant.' }
			: alreadyPending;
	}

	const applied = outcome.kind === 'applied';

	/**
	 * Best-effort: the grant already stands regardless of whether the DM lands.
	 * A Pending Grant's DM says where to sign in and can be re-sent from the
	 * table; a direct grant's says the access is live, and its outcome rides
	 * on the "has access now" line since there is no row action to retry it.
	 */
	const dm = await sendSlackDm(
		member.id,
		grantDmMessage({ roles: requested, active: applied }),
	);

	revalidate();
	return {
		ok: true,
		message: [
			outcome.kind === 'applied'
				? `${outcome.name} has access now.`
				: undefined,
			dm.message,
		]
			.filter(Boolean)
			.join(' '),
	};
}

/** Change the roles on a Grant nobody has claimed yet. */
export async function setPendingGrantRoles(
	grantId: string,
	next: string[],
): Promise<ActionResult> {
	await requirePermission('admins', 'manage');

	if (!isId(grantId)) return GRANT_GONE;

	const validated = validateRoles(next);
	if (!validated.ok) return validated;

	const outcome = await db().transaction((tx) =>
		setGrantRoles(tx, grantId, validated.roles),
	);

	switch (outcome.kind) {
		case 'pending':
			revalidate();
			return { ok: true };
		case 'refused':
			return {
				ok: false,
				message: 'Revoke the grant instead of leaving it with no roles.',
			};
		default:
			return GRANT_CLAIMED;
	}
}

/** Re-send the "you've been given access" DM for a Grant nobody has claimed. */
export async function resendPendingGrantDm(
	grantId: string,
): Promise<ActionResult> {
	await requirePermission('admins', 'manage');

	if (!isId(grantId)) {
		return GRANT_GONE;
	}

	const [grant] = await db()
		.select({ slackUserId: pendingGrant.slackUserId, role: pendingGrant.role })
		.from(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)))
		.limit(1);

	if (!grant) {
		return GRANT_CLAIMED;
	}

	const sent = await sendSlackDm(
		grant.slackUserId,
		grantDmMessage({ roles: parseRoles(grant.role) }),
	);

	return sent.ok
		? { ok: true, message: sent.message }
		: { ok: false, message: sent.message };
}

/**
 * Withdraw a Grant nobody has claimed. See `withdrawGrant` for why it is a
 * hard delete.
 */
export async function revokePendingGrant(
	grantId: string,
): Promise<ActionResult> {
	await requirePermission('admins', 'manage');

	if (!isId(grantId)) return GRANT_GONE;

	const outcome = await db().transaction((tx) => withdrawGrant(tx, grantId));

	switch (outcome.kind) {
		case 'pending':
			revalidate();
			return { ok: true };
		case 'refused':
			return {
				ok: false,
				message:
					'This grant includes Volunteer access. Remove it in Admin → Volunteers.',
			};
		default:
			return GRANT_CLAIMED;
	}
}
