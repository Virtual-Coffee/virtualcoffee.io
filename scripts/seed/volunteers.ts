import { eq } from 'drizzle-orm';

import {
	db,
	volunteerAccrualNotice,
	volunteerInviteLedger,
	type AccrualNoticeOutcome,
	type InviteStatus,
	type VolunteerEventType,
} from '@/db';
import {
	accrue,
	adjust,
	giveBack,
	importBalance,
	spend,
} from '@/lib/volunteers/invites';
import { serialiseRoles } from '@/lib/access/permissions';
import { recordEvent } from '@/lib/history/eventLog';
import {
	insertInvite,
	insertPendingGrant,
	insertVolunteer,
} from '@/test/db/fixtures';

import {
	ADMIN,
	CLAIM_TOKEN,
	FORMER_VOLUNTEER_SLACK_ID,
	NEW_VOLUNTEER,
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
 * it means seeding the movements that produce it, through the same module the
 * site writes them with (`src/lib/volunteers/invites.ts`). This adds up to 2 for the dev
 * bypass Volunteer (six imported, one accrued, seven spent, two given back) and
 * 6 for the Volunteer-only user (three imported, two granted, one accrued). The
 * not-yet-signed-in Volunteer holds only this month's accrual, 1.
 *
 * Returns the Invite id for each claimed invitee email, for the applications.
 */
export async function seedVolunteers(): Promise<Map<string, string>> {
	const admin = await insertVolunteer({
		slackUserId: ADMIN.slackUserId,
		name: ADMIN.name,
		slackHandle: 'localdev',
		roleLabels: 'VC Host, Coffee Table Group Leader',
		email: 'localdev@example.com',
		// Linked, the way `claimPendingGrant()` leaves it after a Slack sign-in.
		userId: ADMIN.id,
	});
	const ayu = await insertVolunteer({
		slackUserId: VOLUNTEER.slackUserId,
		name: VOLUNTEER.name,
		slackHandle: 'ayus',
		roleLabels: 'Lunch & Learn Team',
		email: VOLUNTEER.email,
		userId: VOLUNTEER.id,
	});
	// What /admin/volunteers writes for someone who has never signed in: the
	// roster row and a Pending Grant, no `userId` until the claim.
	const fresh = await insertVolunteer({
		slackUserId: NEW_VOLUNTEER.slackUserId,
		name: NEW_VOLUNTEER.name,
		slackHandle: NEW_VOLUNTEER.slackHandle,
		roleLabels: 'Notetaker',
		email: NEW_VOLUNTEER.email,
	});
	await insertPendingGrant({
		slackUserId: NEW_VOLUNTEER.slackUserId,
		slackDisplayName: NEW_VOLUNTEER.name,
		slackHandle: NEW_VOLUNTEER.slackHandle,
		role: serialiseRoles(['volunteer']),
		grantedBy: ADMIN.name,
		grantedAt: daysAgo(3),
	});
	const former = await insertVolunteer({
		slackUserId: FORMER_VOLUNTEER_SLACK_ID,
		name: 'Former Volunteer',
		slackHandle: 'former',
		roleLabels: 'Notetaker',
		email: 'former@example.com',
		// Stepped back, so the daily job accrues nothing for them.
		deactivatedAt: daysAgo(60),
	});

	// What each Volunteer was sent about their grant, as History: the welcome
	// email on being added, and the DM for someone who had not signed in yet.
	const history = (volunteerId: string, at: number) => ({
		by: (type: VolunteerEventType, body: string) =>
			recordEvent(
				{ kind: 'volunteer', id: volunteerId },
				{ type, body, actorUserId: ADMIN.id, createdAt: daysAgo(at) },
			),
	});
	await history(admin.id, 200).by(
		'email_sent',
		'Volunteer welcome to localdev@example.com',
	);
	await history(ayu.id, 200).by(
		'email_failed',
		`Volunteer welcome to ${VOLUNTEER.email} failed: SMTP connection refused`,
	);
	await history(fresh.id, 3).by('notification_sent', 'Volunteer DM');
	await history(fresh.id, 3).by(
		'email_sent',
		`Volunteer welcome to ${NEW_VOLUNTEER.email}`,
	);
	await history(former.id, 200).by(
		'notification_failed',
		'Volunteer DM failed: Slack said user_not_found',
	);

	await importBalance({
		slackUserId: ADMIN.slackUserId,
		credit: 6,
		airtableRecordId: 'recSEEDADMIN',
		at: daysAgo(200),
	});
	await importBalance({
		slackUserId: VOLUNTEER.slackUserId,
		credit: 3,
		airtableRecordId: 'recSEEDVOLUNTEER',
		at: daysAgo(200),
	});
	await importBalance({
		slackUserId: FORMER_VOLUNTEER_SLACK_ID,
		credit: 2,
		airtableRecordId: 'recSEEDFORMER',
		at: daysAgo(200),
	});
	await adjust({
		slackUserId: VOLUNTEER.slackUserId,
		delta: 2,
		actorUserId: ADMIN.id,
		body: 'Extra invites for the hackathon cohort',
		at: daysAgo(30),
	});
	await adjust({
		slackUserId: FORMER_VOLUNTEER_SLACK_ID,
		delta: -2,
		actorUserId: ADMIN.id,
		body: 'Stepped back from volunteering',
		at: daysAgo(60),
	});
	// This month's row for everyone still active, which is the daily job's own
	// call — so the Volunteer who stepped back gets none.
	await accrue(new Date());

	// The job's record that each accrual was announced, one of each outcome.
	// Nothing renders these yet; they are seeded so the table is never empty.
	const outcomes: Record<string, AccrualNoticeOutcome> = {
		[ADMIN.slackUserId]: 'sent',
		[VOLUNTEER.slackUserId]: 'failed',
		[NEW_VOLUNTEER.slackUserId]: 'no_address',
	};
	const accruals = await db()
		.select({
			id: volunteerInviteLedger.id,
			slackUserId: volunteerInviteLedger.slackUserId,
		})
		.from(volunteerInviteLedger)
		.where(eq(volunteerInviteLedger.reason, 'monthly_accrual'));
	await db()
		.insert(volunteerAccrualNotice)
		.values(
			accruals.map((row) => ({
				ledgerId: row.id,
				outcome: outcomes[row.slackUserId] ?? 'sent',
			})),
		);

	const invitesByEmail = new Map<string, string>();

	for (const seed of INVITE_SEEDS) {
		const sentAt = daysAgo(seed.daysAgo);
		const claimed = seed.status === 'accepted' || seed.status === 'completed';

		// An Invite that will never be claimed is seeded `pending` and then given
		// back below, so the seed reaches those two statuses the way the site
		// does rather than writing them directly.
		const givenBack = seed.status === 'expired' || seed.status === 'cancelled';

		// Only a pending Invite still has a usable Claim Link. The others have
		// had theirs cleared by redemption, cancellation or the sweep.
		const row = await insertInvite({
			inviterSlackUserId: ADMIN.slackUserId,
			inviterUserId: ADMIN.id,
			inviterName: ADMIN.name,
			inviteeName: seed.inviteeName,
			inviteeEmail: seed.inviteeEmail,
			status: givenBack ? 'pending' : seed.status,
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

		await spend({
			slackUserId: ADMIN.slackUserId,
			inviteId: row.id,
			actorUserId: ADMIN.id,
			body: `Invited ${seed.inviteeName} <${seed.inviteeEmail}>`,
			at: sentAt,
		});

		if (givenBack) {
			await giveBack({
				inviteId: row.id,
				reason:
					seed.status === 'expired' ? 'refund_expired' : 'refund_cancelled',
				actorUserId: seed.status === 'cancelled' ? ADMIN.id : null,
				body: seed.status === 'expired' ? 'Expired unclaimed' : 'Cancelled',
				at: daysAgo(Math.max(seed.daysAgo - 90, 1)),
			});
		}
	}

	return invitesByEmail;
}
