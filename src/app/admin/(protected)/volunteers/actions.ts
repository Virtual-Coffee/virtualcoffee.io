'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
	db,
	isUniqueViolation,
	invite,
	pendingGrant,
	user,
	volunteer,
	volunteerInviteLedger,
} from '@/db';
import { isId } from '@/db/ids';
import { getSlackMembers } from '@/data/slackMembers';
import type { ActionResult } from '@/lib/actionResult';
import { actorId, requirePermission } from '@/lib/adminAccess';
import {
	volunteerGrantEmail,
	volunteerInviteEmail,
} from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transport';
import { newClaimToken, hashClaimToken } from '@/lib/invites';
import {
	grantVolunteerRole,
	withVolunteerRole,
	withoutVolunteerRole,
} from '@/lib/pendingGrants';
import { pendingInvite } from '@/lib/volunteers';
import { siteUrl } from '@/util/url.server';

function revalidate(volunteerId?: string) {
	revalidatePath('/admin/volunteers');
	revalidatePath('/admin');
	if (volunteerId) revalidatePath(`/admin/volunteers/${volunteerId}`);
}

/**
 * Make someone a Volunteer.
 *
 * One transaction writing the `volunteer` row *and* the access, because either
 * on its own is a broken state: a row with no role accrues Invites its owner
 * cannot reach, and a role with no row lets someone into /invites to find
 * nothing there. That is also why /admin/user-management does not offer
 * `volunteer` in its picker — see `GRANTABLE_ROLE_NAMES`.
 *
 * The access is granted the way it always is: directly on the user if they have
 * signed in, otherwise as a Pending Grant keyed on the Slack member id, which
 * `claimPendingGrant()` applies at their first sign-in (docs/adr/0009).
 */
export async function addVolunteer(
	slackUserId: string,
	roleLabels: string,
	email: string,
): Promise<ActionResult> {
	const session = await requirePermission('volunteers', 'manage');

	const members = await getSlackMembers();
	const member = members.find((entry) => entry.id === slackUserId);

	if (!member) {
		return {
			ok: false,
			message: 'That Slack member is no longer in the workspace.',
		};
	}

	try {
		await db().transaction(async (tx) => {
			await tx.insert(volunteer).values({
				slackUserId: member.id,
				slackDisplayName: member.displayName,
				slackHandle: member.handle,
				roleLabels: roleLabels.trim() || null,
				email: email.trim().toLowerCase() || null,
			});

			await grantVolunteerRole(
				tx,
				{
					slackUserId: member.id,
					slackDisplayName: member.displayName,
					slackHandle: member.handle,
				},
				session.user.name || session.user.email,
			);
		});
	} catch (error) {
		// The unique index on volunteer.slack_user_id is the authority here, so a
		// race lands in this branch rather than creating a second row.
		if (!isUniqueViolation(error)) throw error;
		return {
			ok: false,
			message: `${member.displayName} is already a volunteer.`,
		};
	}

	revalidate();

	// Tell them, after the writes and not fatal: they are a Volunteer by now,
	// and a failed email must not read as a failed grant.
	const address = email.trim();
	if (!address) {
		return {
			ok: true,
			message: `${member.displayName} can now send invites. Add an email address to let us tell them.`,
		};
	}

	const template = volunteerGrantEmail(
		member.displayName,
		0,
		`${siteUrl()}/invites`,
	);

	const sent = await sendEmail({
		to: address,
		subject: template.subject,
		text: template.text,
	});

	return {
		ok: true,
		message: sent.ok
			? `${member.displayName} can now send invites, and we've emailed them.`
			: `${member.displayName} can now send invites, but the email didn't send: ${sent.message}`,
	};
}

/**
 * Stop or restart someone's volunteering.
 *
 * Both halves move together: `deactivated_at` is what the accrual job reads,
 * and the role is what /invites reads. Deactivating only one of them leaves
 * someone who can spend but never earns, or who banks an Invite every month for
 * years and comes back holding a supply nobody reviewed.
 *
 * The ledger is untouched. It is append-only and it is the record of what
 * happened; a returning Volunteer picks up the balance they left with.
 */
export async function setVolunteerActive(
	volunteerId: string,
	active: boolean,
): Promise<ActionResult> {
	const session = await requirePermission('volunteers', 'manage');

	if (!isId(volunteerId)) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	const [row] = await db()
		.select({ slackUserId: volunteer.slackUserId })
		.from(volunteer)
		.where(eq(volunteer.id, volunteerId))
		.limit(1);

	if (!row) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	await db().transaction(async (tx) => {
		await tx
			.update(volunteer)
			.set({ deactivatedAt: active ? null : new Date() })
			.where(eq(volunteer.id, volunteerId));

		const [account] = await tx
			.select({ id: user.id, role: user.role })
			.from(user)
			.where(eq(user.slackUserId, row.slackUserId))
			.limit(1);

		if (account) {
			await tx
				.update(user)
				.set({
					role: active
						? withVolunteerRole(account.role)
						: withoutVolunteerRole(account.role),
					roleGrantedAt: new Date(),
					roleGrantedBy: session.user.name || session.user.email,
				})
				.where(eq(user.id, account.id));
		}

		const [grant] = await tx
			.select({ id: pendingGrant.id, role: pendingGrant.role })
			.from(pendingGrant)
			.where(
				and(
					eq(pendingGrant.slackUserId, row.slackUserId),
					isNull(pendingGrant.claimedAt),
				),
			)
			.limit(1);

		if (grant) {
			await tx
				.update(pendingGrant)
				.set({
					role: active
						? withVolunteerRole(grant.role)
						: withoutVolunteerRole(grant.role),
				})
				.where(eq(pendingGrant.id, grant.id));
		}
	});

	revalidate(volunteerId);
	return {
		ok: true,
		message: active ? 'Volunteering restarted.' : 'Volunteering paused.',
	};
}

/**
 * Adjust a balance by hand.
 *
 * A ledger row, never an edit — that is the whole point of the table. A reason
 * is required because "why do I have four?" is the question this screen exists
 * to answer, and an unexplained adjustment answers it worse than no adjustment.
 */
export async function adjustBalance(
	volunteerId: string,
	delta: number,
	reason: string,
): Promise<ActionResult> {
	const session = await requirePermission('volunteers', 'manage');

	if (!isId(volunteerId)) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}
	if (!Number.isInteger(delta) || delta === 0) {
		return { ok: false, message: 'Give a whole number of invites, not zero.' };
	}
	if (Math.abs(delta) > 50) {
		return { ok: false, message: 'That is more invites than anyone needs.' };
	}
	if (!reason.trim()) {
		return { ok: false, message: 'Say why — the ledger is the audit trail.' };
	}

	const [row] = await db()
		.select({ slackUserId: volunteer.slackUserId })
		.from(volunteer)
		.where(eq(volunteer.id, volunteerId))
		.limit(1);

	if (!row) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	await db()
		.insert(volunteerInviteLedger)
		.values({
			slackUserId: row.slackUserId,
			delta,
			reason: delta > 0 ? 'admin_grant' : 'admin_revoke',
			actorUserId: await actorId(session.user.id),
			body: reason.trim(),
		});

	revalidate(volunteerId);
	return {
		ok: true,
		message: `${delta > 0 ? 'Added' : 'Removed'} ${Math.abs(delta)} invite${
			Math.abs(delta) === 1 ? '' : 's'
		}.`,
	};
}

/**
 * Re-send a Claim Link that never arrived.
 *
 * Admin-only, deliberately: it re-issues the token, which quietly invalidates
 * whatever the invitee may already have. In the hands of the Volunteer that
 * would be a footgun on the common case where the first email did arrive and is
 * simply unread.
 *
 * No ledger movement — the Invite was already charged and is the same Invite.
 * The expiry restarts, because an Invite nobody has managed to receive has not
 * had its ninety days.
 */
export async function resendInvite(
	inviteId: string,
	volunteerId: string,
): Promise<ActionResult> {
	await requirePermission('volunteers', 'manage');

	if (!isId(inviteId)) {
		return { ok: false, message: 'That invite no longer exists.' };
	}

	const row = await pendingInvite(inviteId);

	if (!row || !row.inviteeEmail) {
		return {
			ok: false,
			message: 'Only an unclaimed invite with an email address can be re-sent.',
		};
	}

	const { token, expiresAt } = newClaimToken();

	// Written before the send on purpose: the link in the email must already
	// redeem, and a failed send is reported as such. See docs/adr/0011.
	await db()
		.update(invite)
		.set({ tokenHash: hashClaimToken(token), tokenExpiresAt: expiresAt })
		.where(and(eq(invite.id, inviteId), eq(invite.status, 'pending')));

	const template = volunteerInviteEmail(
		row.inviterName || 'A Virtual Coffee volunteer',
		row.inviteeName || 'there',
		`${siteUrl()}/join?invite=${token}`,
	);

	const sent = await sendEmail({
		to: row.inviteeEmail,
		subject: template.subject,
		text: template.text,
	});

	revalidate(volunteerId);

	if (!sent.ok) {
		/**
		 * The old link is already dead by this point — the hash was replaced
		 * before the send, because the email cannot carry a token that does not
		 * exist yet. Say so, rather than letting a maintainer believe the invitee
		 * still has a working link.
		 */
		return {
			ok: false,
			message: `${sent.message} The previous link has stopped working, so try again or cancel the invite.`,
		};
	}

	return { ok: true, message: `Invite re-sent to ${row.inviteeEmail}.` };
}
