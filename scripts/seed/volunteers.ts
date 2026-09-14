import type { InviteStatus } from '@/db';
import { insertInvite, insertVolunteer, ledgerRow } from '@/test/db/fixtures';

import {
	ADMIN,
	CLAIM_TOKEN,
	FORMER_VOLUNTEER_SLACK_ID,
	VOLUNTEER,
	daysAgo,
	daysAhead,
} from './shared';

/**
 * One Invite per state, including the two nobody can reach by hand: `expired`
 * needs a ninety-day-old Invite and `cancelled` needs a Volunteer to have
 * changed their mind. Without seeds those two renderings only ever get looked
 * at in production.
 */
const INVITE_SEEDS: {
	inviteeName: string;
	inviteeEmail: string;
	status: InviteStatus;
	daysAgo: number;
}[] = [
	{
		inviteeName: 'Rosa Delgado',
		inviteeEmail: 'rosa@example.com',
		status: 'pending',
		daysAgo: 2,
	},
	// The claimed ones each have their application in `applications.ts`, so
	// the chain from Invite to application renders end to end; the dates sit
	// before it.
	{
		inviteeName: 'Priya Raman',
		inviteeEmail: 'priya@example.com',
		status: 'accepted',
		daysAgo: 4,
	},
	{
		inviteeName: 'Sam Whitfield',
		inviteeEmail: 'sam@example.com',
		status: 'accepted',
		daysAgo: 35,
	},
	{
		inviteeName: 'Rowan Hale',
		inviteeEmail: 'rowan@example.com',
		status: 'completed',
		daysAgo: 70,
	},
	{
		inviteeName: 'Hector Ramos',
		inviteeEmail: 'hector@example.com',
		status: 'accepted',
		daysAgo: 730,
	},
	{
		inviteeName: 'Noor Haddad',
		inviteeEmail: 'noor@example.com',
		status: 'expired',
		daysAgo: 120,
	},
	{
		inviteeName: 'Tyop Adress',
		inviteeEmail: 'typo@exmaple.com',
		status: 'cancelled',
		daysAgo: 6,
	},
];

/**
 * Volunteers, their allowance history, and the Invites they have sent.
 *
 * The balance is not stored anywhere — it is the sum of the ledger — so seeding
 * it means seeding the movements that produce it. This adds up to 2 for the dev
 * bypass Volunteer (six imported, one accrued, seven spent, two given back) and
 * 6 for the Volunteer-only user (three imported, two granted, one accrued).
 *
 * Returns the Invite id for each claimed invitee email, for the applications.
 */
export async function seedVolunteers(): Promise<Map<string, string>> {
	const period = new Date().toISOString().slice(0, 7);

	await insertVolunteer({
		slackUserId: ADMIN.slackUserId,
		name: ADMIN.name,
		slackHandle: 'localdev',
		roleLabels: 'VC Host, Coffee Table Group Leader',
		email: 'localdev@example.com',
		// Linked, the way `claimPendingGrant()` leaves it after a Slack sign-in.
		userId: ADMIN.id,
	});
	await insertVolunteer({
		slackUserId: VOLUNTEER.slackUserId,
		name: VOLUNTEER.name,
		slackHandle: 'ayus',
		roleLabels: 'Lunch & Learn Team',
		email: VOLUNTEER.email,
		userId: VOLUNTEER.id,
	});
	await insertVolunteer({
		slackUserId: FORMER_VOLUNTEER_SLACK_ID,
		name: 'Former Volunteer',
		slackHandle: 'former',
		roleLabels: 'Notetaker',
		email: 'former@example.com',
		// Stepped back, so the daily job accrues nothing for them.
		deactivatedAt: daysAgo(60),
	});

	await ledgerRow({
		slackUserId: ADMIN.slackUserId,
		delta: 6,
		reason: 'imported',
		body: 'Balance carried over from Airtable',
		createdAt: daysAgo(200),
	});
	await ledgerRow({
		slackUserId: ADMIN.slackUserId,
		delta: 1,
		reason: 'monthly_accrual',
		periodKey: period,
	});
	await ledgerRow({
		slackUserId: VOLUNTEER.slackUserId,
		delta: 3,
		reason: 'imported',
		body: 'Balance carried over from Airtable',
		createdAt: daysAgo(200),
	});
	await ledgerRow({
		slackUserId: VOLUNTEER.slackUserId,
		delta: 2,
		reason: 'admin_grant',
		actorUserId: ADMIN.id,
		body: 'Extra invites for the hackathon cohort',
		createdAt: daysAgo(30),
	});
	await ledgerRow({
		slackUserId: VOLUNTEER.slackUserId,
		delta: 1,
		reason: 'monthly_accrual',
		periodKey: period,
	});
	await ledgerRow({
		slackUserId: FORMER_VOLUNTEER_SLACK_ID,
		delta: 2,
		reason: 'imported',
		body: 'Balance carried over from Airtable',
		createdAt: daysAgo(200),
	});
	await ledgerRow({
		slackUserId: FORMER_VOLUNTEER_SLACK_ID,
		delta: -2,
		reason: 'admin_revoke',
		actorUserId: ADMIN.id,
		body: 'Stepped back from volunteering',
		createdAt: daysAgo(60),
	});

	const invitesByEmail = new Map<string, string>();

	for (const seed of INVITE_SEEDS) {
		const sentAt = daysAgo(seed.daysAgo);
		const claimed = seed.status === 'accepted' || seed.status === 'completed';

		// Only a pending Invite still has a usable Claim Link. The others have
		// had theirs cleared by redemption, cancellation or the sweep.
		const row = await insertInvite({
			inviterSlackUserId: ADMIN.slackUserId,
			inviterUserId: ADMIN.id,
			inviterName: ADMIN.name,
			inviteeName: seed.inviteeName,
			inviteeEmail: seed.inviteeEmail,
			status: seed.status,
			...(seed.status === 'pending'
				? { token: CLAIM_TOKEN, expiresAt: daysAhead(90 - seed.daysAgo) }
				: { token: null }),
			claimedAt: claimed ? daysAgo(seed.daysAgo - 1) : null,
			createdAt: sentAt,
		});

		// Only an Invite that was actually claimed has an application to link to.
		// Mapping a cancelled or expired one would produce a chain that cannot
		// happen: the application exists, so the Invite was never unclaimed.
		if (claimed) invitesByEmail.set(seed.inviteeEmail, row.id);

		await ledgerRow({
			slackUserId: ADMIN.slackUserId,
			delta: -1,
			reason: 'spend',
			inviteId: row.id,
			actorUserId: ADMIN.id,
			body: `Invited ${seed.inviteeName} <${seed.inviteeEmail}>`,
			createdAt: sentAt,
		});

		// An Invite that will never be claimed gives the allowance back.
		if (seed.status === 'expired' || seed.status === 'cancelled') {
			await ledgerRow({
				slackUserId: ADMIN.slackUserId,
				delta: 1,
				reason:
					seed.status === 'expired' ? 'refund_expired' : 'refund_cancelled',
				inviteId: row.id,
				actorUserId: seed.status === 'cancelled' ? ADMIN.id : null,
				body: seed.status === 'expired' ? 'Expired unclaimed' : 'Cancelled',
				createdAt: daysAgo(Math.max(seed.daysAgo - 90, 1)),
			});
		}
	}

	return invitesByEmail;
}
