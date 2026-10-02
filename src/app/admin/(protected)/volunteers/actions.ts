'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db, isUniqueViolation, volunteer } from '@/db';
import { isId } from '@/db/ids';
import { getSlackMembers } from '@/data/slackMembers';
import {
	emailFailed,
	type ActionResult,
	type EmailActionResult,
} from '@/lib/admin/actionResult';
import {
	actorFromSession,
	actorId,
	requirePermission,
} from '@/lib/access/adminAccess';
import { volunteerGrant } from '@/emails/volunteerGrant';
import { sendEmail } from '@/lib/email/transport';
import { recordOutcome } from '@/lib/history/eventLog';
import { adjust, resendClaimLink } from '@/lib/volunteers/invites';
import {
	addVolunteerRole,
	removeVolunteerRole,
	type Outcome,
} from '@/lib/access/roleAssignment';
import { grantDmMessage, sendSlackDm } from '@/lib/slack/dm';
import {
	COMMUNITY_ROLES,
	formatRoleLabels,
} from '@/lib/volunteers/volunteerRoles';
import { volunteerSubject } from '@/lib/volunteers/volunteers';
import { siteUrl } from '@/util/url.server';

function revalidate(volunteerId?: string) {
	revalidatePath('/admin/volunteers');
	revalidatePath('/admin');
	if (volunteerId) revalidatePath(`/admin/volunteers/${volunteerId}`);
}

// The form's input is `type="email"`, but it submits through a button's
// onClick, so the browser never runs that check.
const emailSchema = z
	.email('That doesn’t look like an email address.')
	.max(320);

const roleLabelsSchema = z
	.array(z.enum(COMMUNITY_ROLES, 'That isn’t one of the community roles.'))
	.max(COMMUNITY_ROLES.length);

/** Empty clears the address; anything else has to be one. */
function normaliseEmail(
	email: string,
): { ok: true; value: string | null } | (ActionResult & { ok: false }) {
	const address = email.trim().toLowerCase();
	if (!address) return { ok: true, value: null };
	const checked = emailSchema.safeParse(address);
	if (!checked.success) {
		return {
			ok: false,
			message: checked.error.issues[0]?.message ?? 'Please check the email.',
		};
	}
	return { ok: true, value: address };
}

/**
 * Tell a Volunteer whose Role is waiting on a Pending Grant where to sign in.
 * Best-effort, after the transaction commits: the grant already stands, and a
 * maintainer can retry it with "Resend DM" in /admin/user-management.
 */
async function notifyNewVolunteer(
	slackUserId: string,
	subject: ReturnType<typeof volunteerSubject>,
	actorUserId: string | null,
) {
	const dm = await sendSlackDm(
		slackUserId,
		grantDmMessage({ roles: ['volunteer'] }),
	);
	await recordOutcome(subject, {
		channel: 'slack',
		outbound: dm,
		what: 'Volunteer DM',
		actorUserId,
	});
}

/**
 * Make someone a Volunteer: the `volunteer` row and the Role in one
 * transaction, which is why `/admin/user-management` does not offer
 * `volunteer` (docs/adr/0010). The Role lands directly or as a Pending Grant
 * (docs/adr/0009).
 */
export async function addVolunteer(
	slackUserId: string,
	roleLabels: string[],
	email: string,
): Promise<ActionResult> {
	const session = await requirePermission('volunteers', 'manage');

	const roles = roleLabelsSchema.safeParse(roleLabels);
	if (!roles.success) {
		return {
			ok: false,
			message:
				roles.error.issues[0]?.message ?? 'Please check the community roles.',
		};
	}

	const normalised = normaliseEmail(email);
	if (!normalised.ok) return normalised;
	const address = normalised.value;

	const members = await getSlackMembers();
	const member = members.find((entry) => entry.id === slackUserId);

	if (!member) {
		return {
			ok: false,
			message: 'That Slack member is no longer in the workspace.',
		};
	}

	let created: { volunteerId: string; granted: Outcome };
	try {
		created = await db().transaction(async (tx) => {
			// The role first: it takes the lock, and a person who has already
			// signed in has a user id the row should carry from the start.
			const granted = await addVolunteerRole(
				tx,
				{
					slackUserId: member.id,
					slackDisplayName: member.displayName,
					slackHandle: member.handle,
				},
				actorFromSession(session),
			);

			const [row] = await tx
				.insert(volunteer)
				.values({
					slackUserId: member.id,
					slackDisplayName: member.displayName,
					slackHandle: member.handle,
					roleLabels: formatRoleLabels(roles.data),
					email: address,
					userId: granted.kind === 'applied' ? granted.userId : null,
				})
				.returning({ id: volunteer.id });

			return { volunteerId: row.id, granted };
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

	const subject = volunteerSubject(created.volunteerId);
	const actorUserId = await actorId(session.user.id);

	// Someone who has already signed in is a Volunteer immediately — nobody
	// left to tell to come claim anything.
	if (created.granted.kind === 'pending') {
		await notifyNewVolunteer(member.id, subject, actorUserId);
	}

	// Written first, emailed after: docs/adr/0010.
	if (!address) {
		return {
			ok: true,
			message: `${member.displayName} can now send invites. Add an email address to let us tell them.`,
		};
	}

	const sent = await sendEmail(
		volunteerGrant,
		{
			name: member.displayName,
			balance: 0,
			invitesUrl: `${siteUrl()}/invites`,
		},
		{ to: address },
	);
	await recordOutcome(subject, {
		channel: 'email',
		outbound: sent,
		what: `Volunteer welcome to ${address}`,
		actorUserId,
	});

	return {
		ok: true,
		message: sent.ok
			? `${member.displayName} can now send invites, and we've emailed them.${sent.warning ? ` ${sent.warning}` : ''}`
			: `${member.displayName} can now send invites, but the email didn't send: ${sent.message}`,
	};
}

/** Descriptive only, so no transaction, ledger row or grant — just the column. */
export async function setRoleLabels(
	volunteerId: string,
	roleLabels: string[],
): Promise<ActionResult> {
	await requirePermission('volunteers', 'manage');

	if (!isId(volunteerId)) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	const roles = roleLabelsSchema.safeParse(roleLabels);
	if (!roles.success) {
		return {
			ok: false,
			message:
				roles.error.issues[0]?.message ?? 'Please check the community roles.',
		};
	}

	// Read first: a label the import brought across that is not on the list is
	// not the editor's to drop.
	const [current] = await db()
		.select({ roleLabels: volunteer.roleLabels })
		.from(volunteer)
		.where(eq(volunteer.id, volunteerId));

	if (!current) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	await db()
		.update(volunteer)
		.set({ roleLabels: formatRoleLabels(roles.data, current.roleLabels) })
		.where(eq(volunteer.id, volunteerId));

	revalidate(volunteerId);
	return { ok: true, message: 'Roles updated.' };
}

/**
 * The roster address is what the grant and accrual emails go to, ahead of the
 * linked account's, so a wrong one has to be correctable here. Descriptive
 * only — no event, ledger row or grant.
 */
export async function setEmail(
	volunteerId: string,
	email: string,
): Promise<ActionResult> {
	await requirePermission('volunteers', 'manage');

	if (!isId(volunteerId)) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	const address = normaliseEmail(email);
	if (!address.ok) return address;

	const [row] = await db()
		.update(volunteer)
		.set({ email: address.value })
		.where(eq(volunteer.id, volunteerId))
		.returning({ id: volunteer.id });

	if (!row) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	revalidate(volunteerId);
	return {
		ok: true,
		message: address.value ? 'Email updated.' : 'Email cleared.',
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
 *
 * A restart is the same grant `addVolunteer` makes, so it goes through
 * `addVolunteerRole`: a pause withdraws a Pending Grant that carried only
 * `volunteer`, and someone who never signed in has nothing else to update.
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
		.select({
			slackUserId: volunteer.slackUserId,
			slackDisplayName: volunteer.slackDisplayName,
			slackHandle: volunteer.slackHandle,
		})
		.from(volunteer)
		.where(eq(volunteer.id, volunteerId))
		.limit(1);

	if (!row) {
		return { ok: false, message: 'That volunteer no longer exists.' };
	}

	const outcome = await db().transaction(async (tx) => {
		// The role op first: it takes the lock `claimOnSignIn()` takes before the
		// volunteer write, in the same order.
		const result = active
			? await addVolunteerRole(tx, row, actorFromSession(session))
			: await removeVolunteerRole(tx, row.slackUserId);

		await tx
			.update(volunteer)
			.set({ deactivatedAt: active ? null : new Date() })
			.where(eq(volunteer.id, volunteerId));

		return result;
	});

	if (active && outcome.kind === 'pending') {
		await notifyNewVolunteer(
			row.slackUserId,
			volunteerSubject(volunteerId),
			await actorId(session.user.id),
		);
	}

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

	await adjust({
		slackUserId: row.slackUserId,
		delta,
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
 * simply unread. `resendClaimLink` owns the rest (docs/adr/0011).
 */
export async function resendInvite(
	inviteId: string,
	volunteerId: string,
): Promise<EmailActionResult> {
	const session = await requirePermission('volunteers', 'manage');

	if (!isId(inviteId)) {
		return {
			ok: false,
			message: 'That invite no longer exists.',
			emailSent: false,
		};
	}

	const outcome = await resendClaimLink(inviteId, {
		actorUserId: await actorId(session.user.id),
	});

	if (outcome.kind !== 'refused' && outcome.kind !== 'stale') {
		revalidate(volunteerId);
	}

	switch (outcome.kind) {
		case 'refused':
			return emailFailed({
				message:
					outcome.reason === 'imported'
						? 'This invite was imported from Airtable and has no claim link to re-send.'
						: 'Only an unclaimed invite with an email address can be re-sent.',
				definitelyNotSent: true,
			});
		case 'stale':
			return emailFailed({
				message:
					'That invite was claimed, cancelled or re-sent just now. Reload the page.',
				definitelyNotSent: true,
			});
		case 'not_sent':
			return emailFailed({
				message: `${outcome.message} The previous link has stopped working, so try again or cancel the invite.`,
				definitelyNotSent: true,
			});
		case 'maybe_sent':
			return emailFailed({
				message: `${outcome.message} We can’t confirm whether the email went out, and the previous link has stopped working. Check with the invitee before re-sending, or they may get two links.`,
				definitelyNotSent: false,
			});
		case 'sent':
			return {
				ok: true,
				message: outcome.warning
					? `Invite re-sent to ${outcome.email}. ${outcome.warning}`
					: `Invite re-sent to ${outcome.email}.`,
			};
	}
}
