import { faker } from '@faker-js/faker';
import { getStore } from '@netlify/blobs';
import { and, eq, isNotNull, like, ne, not, or, sql } from 'drizzle-orm';

import {
	db,
	type Database,
	user,
	session,
	account,
	verification,
	invite,
	inviteToken,
	membershipApplication,
	applicationEvent,
	cocReport,
	volunteerSignup,
	lunchAndLearnIdea,
	coffeeTableGroupRequest,
	submissionEvent,
	pendingGrant,
	volunteer,
	volunteerInviteLedger,
} from '../src/db';
import { ATTACHMENT_STORE } from '../src/lib/attachments';
import {
	FAKE_EMAIL_DOMAIN,
	fakeEmail,
	fakeSlackId,
	seedFor,
} from './lib/previewFakes';

/**
 * Scrub a deploy-preview database branch down to fake data.
 *
 * Netlify forks every deploy preview's Postgres branch from production, so
 * without this, real applicant emails, CoC report contents and maintainers'
 * Slack OAuth tokens all land on a preview build. This runs as the last step
 * of the build (see netlify.toml) and is the thing that makes it safe for
 * `PREVIEW_ADMIN_BYPASS` to unblock /admin on a preview at all — see
 * docs/adr/0007. It is a no-op everywhere except CONTEXT=deploy-preview or
 * branch-deploy.
 *
 * The verification pass at the end is deliberate: rather than a separate
 * runtime check queried on every /admin request, this script re-checks its
 * own work and exits non-zero if anything still looks real. A non-zero exit
 * fails the whole Netlify build, so a preview that didn't actually get
 * sanitized never publishes.
 */

const PLACEHOLDER_ATTACHMENT_KEY = 'preview-sanitized-placeholder';
const BATCH_SIZE = 20;

// A 1x1 transparent PNG. Real content doesn't matter — this only exists so
// the attachment UI (filename, download link, content type) stays testable
// without keeping a real CoC attachment reachable from a preview.
//
// `@netlify/blobs`'s `BlobInput` only accepts a real ArrayBuffer, not a
// Buffer/Uint8Array view, hence the copy rather than `Buffer.from(...).buffer`.
function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const bytes = Buffer.from(base64, 'base64');
	const buffer = new ArrayBuffer(bytes.length);
	new Uint8Array(buffer).set(bytes);
	return buffer;
}

const PLACEHOLDER_PNG = base64ToArrayBuffer(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
);

async function inBatches<T>(
	items: readonly T[],
	fn: (item: T) => Promise<void>,
): Promise<void> {
	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		await Promise.all(items.slice(i, i + BATCH_SIZE).map(fn));
	}
}

/* -------------------------------------------------------------------------- */
/* Membership pipeline                                                       */
/* -------------------------------------------------------------------------- */

async function sanitizeMembershipApplications(
	database: Database,
): Promise<Map<string, string>> {
	const rows = await database
		.select({
			id: membershipApplication.id,
			pronouns: membershipApplication.pronouns,
			githubUsername: membershipApplication.githubUsername,
			twitterUsername: membershipApplication.twitterUsername,
			howDidYouHear: membershipApplication.howDidYouHear,
			journey: membershipApplication.journey,
			codeInterests: membershipApplication.codeInterests,
			virtualCoffee: membershipApplication.virtualCoffee,
			referrer: membershipApplication.referrer,
		})
		.from(membershipApplication);

	const emailById = new Map<string, string>();

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));
		const email = fakeEmail(row.id);
		emailById.set(row.id, email);

		await database
			.update(membershipApplication)
			.set({
				name: faker.person.fullName(),
				email,
				pronouns: row.pronouns ? faker.person.sexType() : null,
				githubUsername: row.githubUsername
					? faker.internet.username().toLowerCase()
					: null,
				twitterUsername: row.twitterUsername
					? faker.internet.username().toLowerCase()
					: null,
				howDidYouHear: row.howDidYouHear ? faker.lorem.sentence() : null,
				journey: row.journey ? faker.lorem.paragraphs(2) : null,
				codeInterests: row.codeInterests ? faker.lorem.paragraph() : null,
				virtualCoffee: row.virtualCoffee ? faker.lorem.paragraph() : null,
				referrer: row.referrer ? faker.person.firstName() : null,
			})
			.where(eq(membershipApplication.id, row.id));
	});

	return emailById;
}

/** "Note text, or a summary of what was emailed and to whom" — regenerated
 * wholesale from the event's own type rather than edited in place, so no
 * fragment of the real sentence can survive a missed pattern. */
async function sanitizeApplicationEvents(
	database: Database,
	emailById: Map<string, string>,
): Promise<void> {
	const rows = await database
		.select({
			id: applicationEvent.id,
			applicationId: applicationEvent.applicationId,
			type: applicationEvent.type,
			body: applicationEvent.body,
		})
		.from(applicationEvent);

	await inBatches(rows, async (row) => {
		if (row.body === null) return;

		faker.seed(seedFor(row.id));
		const email = emailById.get(row.applicationId) ?? fakeEmail(row.id);
		const body = ((): string => {
			switch (row.type) {
				case 'submitted':
					return 'Application submitted';
				case 'waitlisted':
					return 'Added to the waitlist';
				case 'coffee_invited':
					return `Coffee invite emailed to ${email}`;
				case 'attendance_recorded':
					return 'Coffee chat attendance recorded';
				case 'approved':
					return `Membership approved; Slack invite emailed to ${email}`;
				case 'declined':
					return 'Application declined';
				case 'withdrawn':
					return 'Applicant withdrew';
				case 'lapsed':
					return 'Marked lapsed';
				case 'email_sent':
					return `Email sent to ${email}`;
				case 'email_failed':
					return `Email delivery failed for ${email}`;
				case 'imported':
					return 'Imported from Airtable';
				case 'note':
				default:
					return faker.lorem.sentence({ min: 6, max: 14 });
			}
		})();

		await database
			.update(applicationEvent)
			.set({ body })
			.where(eq(applicationEvent.id, row.id));
	});
}

async function sanitizeInvites(database: Database): Promise<void> {
	const rows = await database
		.select({
			id: invite.id,
			inviterName: invite.inviterName,
			inviterSlackUserId: invite.inviterSlackUserId,
			inviteeName: invite.inviteeName,
			inviteeEmail: invite.inviteeEmail,
		})
		.from(invite);

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));

		await database
			.update(invite)
			.set({
				inviterName: row.inviterName ? faker.person.fullName() : null,
				// Kept consistent with `volunteer` and the ledger — this is what
				// attributes an Invite to a Volunteer.
				inviterSlackUserId: row.inviterSlackUserId
					? fakeSlackId(row.inviterSlackUserId)
					: null,
				inviteeName: row.inviteeName ? faker.person.fullName() : null,
				inviteeEmail: row.inviteeEmail ? fakeEmail(row.id) : null,
				/**
				 * Claim Links do not survive into a preview. Only the hash is stored
				 * so a leak hands out nothing on its own, but a preview has no
				 * business holding a credential for a real person's invitation, and
				 * an expiry with no token is just confusing.
				 */
				tokenHash: null,
				tokenExpiresAt: null,
			})
			.where(eq(invite.id, row.id));
	});
}

/* -------------------------------------------------------------------------- */
/* Submissions                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Volunteers, their allowance history, and the Slack ids that tie the two
 * together.
 *
 * `volunteer_invite_ledger.body` is the sharpest edge here: a spend records
 * `Invited {name} <{email}>` verbatim, so leaving it alone would publish real
 * invitees' email addresses on a public preview URL. It is rewritten from the
 * already-faked Invite rather than blanked, so the ledger still reads like a
 * ledger.
 */
async function sanitizeVolunteers(database: Database): Promise<void> {
	const rows = await database
		.select({
			id: volunteer.id,
			slackUserId: volunteer.slackUserId,
			slackHandle: volunteer.slackHandle,
			email: volunteer.email,
		})
		.from(volunteer);

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));

		await database
			.update(volunteer)
			.set({
				slackUserId: fakeSlackId(row.slackUserId),
				slackDisplayName: faker.person.fullName(),
				slackHandle: row.slackHandle ? faker.internet.username() : null,
				email: row.email ? fakeEmail(row.id) : null,
				// Community role labels ("VC Host", "Notetaker") are generic and
				// carry no identity once the name beside them is fake.
			})
			.where(eq(volunteer.id, row.id));
	});

	const entries = await database
		.select({
			id: volunteerInviteLedger.id,
			slackUserId: volunteerInviteLedger.slackUserId,
			body: volunteerInviteLedger.body,
			inviteeName: invite.inviteeName,
			inviteeEmail: invite.inviteeEmail,
		})
		.from(volunteerInviteLedger)
		.leftJoin(invite, eq(volunteerInviteLedger.inviteId, invite.id));

	await inBatches(entries, async (row) => {
		await database
			.update(volunteerInviteLedger)
			.set({
				slackUserId: fakeSlackId(row.slackUserId),
				body: row.body
					? row.inviteeEmail
						? `Invited ${row.inviteeName ?? 'someone'} <${row.inviteeEmail}>`
						: 'Sanitized for preview'
					: null,
			})
			.where(eq(volunteerInviteLedger.id, row.id));
	});
}

/**
 * Pending Grants carry a snapshot of a real person's Slack name and handle, and
 * are the one place a Slack member id is stored for someone who has never
 * signed in. Never sanitized before this — the table shipped after the script.
 */
async function sanitizePendingGrants(database: Database): Promise<void> {
	const rows = await database
		.select({
			id: pendingGrant.id,
			slackUserId: pendingGrant.slackUserId,
			slackHandle: pendingGrant.slackHandle,
		})
		.from(pendingGrant);

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));

		await database
			.update(pendingGrant)
			.set({
				slackUserId: fakeSlackId(row.slackUserId),
				slackDisplayName: faker.person.fullName(),
				slackHandle: row.slackHandle ? faker.internet.username() : null,
				// Same reasoning as `user.roleGrantedBy`: an audit nicety, and
				// simpler to clear than to resolve to the matching fake identity.
				grantedBy: 'sanitized',
			})
			.where(eq(pendingGrant.id, row.id));
	});
}

async function sanitizeCocReports(
	database: Database,
): Promise<Map<string, string>> {
	const rows = await database
		.select({
			id: cocReport.id,
			name: cocReport.name,
			email: cocReport.email,
			anyoneElseInvolved: cocReport.anyoneElseInvolved,
		})
		.from(cocReport);

	const emailById = new Map<string, string>();

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));
		// Name/email are nullable — reporters can stay anonymous. Only fake
		// what was actually collected, so a sanitized report doesn't claim an
		// identity the real reporter deliberately withheld.
		const email = row.email ? fakeEmail(row.id) : null;
		if (email) emailById.set(row.id, email);

		await database
			.update(cocReport)
			.set({
				name: row.name ? faker.person.fullName() : null,
				email,
				reporteeName: faker.person.fullName(),
				timeLocation: faker.lorem.sentence(),
				description: faker.lorem.paragraphs(2),
				anyoneElseInvolved: row.anyoneElseInvolved
					? faker.lorem.sentence()
					: null,
			})
			.where(eq(cocReport.id, row.id));
	});

	return emailById;
}

async function sanitizeVolunteerSignups(
	database: Database,
): Promise<Map<string, string>> {
	const rows = await database
		.select({
			id: volunteerSignup.id,
			githubUsername: volunteerSignup.githubUsername,
			position: volunteerSignup.position,
			description: volunteerSignup.description,
		})
		.from(volunteerSignup);

	const emailById = new Map<string, string>();

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));
		const email = fakeEmail(row.id);
		emailById.set(row.id, email);

		await database
			.update(volunteerSignup)
			.set({
				name: faker.person.fullName(),
				email,
				githubUsername: row.githubUsername
					? faker.internet.username().toLowerCase()
					: null,
				position: row.position ? faker.lorem.words(3) : null,
				description: row.description ? faker.lorem.paragraph() : null,
			})
			.where(eq(volunteerSignup.id, row.id));
	});

	return emailById;
}

async function sanitizeLunchAndLearnIdeas(
	database: Database,
): Promise<Map<string, string>> {
	const rows = await database
		.select({
			id: lunchAndLearnIdea.id,
			description: lunchAndLearnIdea.description,
			format: lunchAndLearnIdea.format,
			timing: lunchAndLearnIdea.timing,
		})
		.from(lunchAndLearnIdea);

	const emailById = new Map<string, string>();

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));
		const email = fakeEmail(row.id);
		emailById.set(row.id, email);

		await database
			.update(lunchAndLearnIdea)
			.set({
				name: faker.person.fullName(),
				email,
				topic: faker.lorem.words(5),
				description: row.description ? faker.lorem.paragraph() : null,
				format: row.format ? faker.lorem.words(2) : null,
				timing: row.timing ? faker.lorem.words(3) : null,
				// githubIssueUrl is left alone: it points at an already-public
				// GitHub issue in Virtual-Coffee/VC-Community-Docs. Sanitizing the
				// row can't retroactively un-publish that issue, so there is no
				// privacy gained by touching this column.
			})
			.where(eq(lunchAndLearnIdea.id, row.id));
	});

	return emailById;
}

async function sanitizeCoffeeTableGroupRequests(
	database: Database,
): Promise<Map<string, string>> {
	const rows = await database
		.select({
			id: coffeeTableGroupRequest.id,
			groupName: coffeeTableGroupRequest.groupName,
			description: coffeeTableGroupRequest.description,
		})
		.from(coffeeTableGroupRequest);

	const emailById = new Map<string, string>();

	await inBatches(rows, async (row) => {
		faker.seed(seedFor(row.id));
		const email = fakeEmail(row.id);
		emailById.set(row.id, email);

		await database
			.update(coffeeTableGroupRequest)
			.set({
				name: faker.person.fullName(),
				email,
				groupName: row.groupName ? faker.lorem.words(3) : null,
				description: row.description ? faker.lorem.paragraph() : null,
			})
			.where(eq(coffeeTableGroupRequest.id, row.id));
	});

	return emailById;
}

async function sanitizeSubmissionEvents(
	database: Database,
	emailByKind: {
		coc: Map<string, string>;
		volunteer: Map<string, string>;
		lunchAndLearn: Map<string, string>;
		coffeeTable: Map<string, string>;
	},
): Promise<void> {
	const rows = await database
		.select({
			id: submissionEvent.id,
			type: submissionEvent.type,
			body: submissionEvent.body,
			cocReportId: submissionEvent.cocReportId,
			volunteerSignupId: submissionEvent.volunteerSignupId,
			lunchAndLearnIdeaId: submissionEvent.lunchAndLearnIdeaId,
			coffeeTableGroupRequestId: submissionEvent.coffeeTableGroupRequestId,
		})
		.from(submissionEvent);

	await inBatches(rows, async (row) => {
		if (row.body === null) return;

		faker.seed(seedFor(row.id));
		const email =
			(row.cocReportId !== null
				? emailByKind.coc.get(row.cocReportId)
				: undefined) ??
			(row.volunteerSignupId !== null
				? emailByKind.volunteer.get(row.volunteerSignupId)
				: undefined) ??
			(row.lunchAndLearnIdeaId !== null
				? emailByKind.lunchAndLearn.get(row.lunchAndLearnIdeaId)
				: undefined) ??
			(row.coffeeTableGroupRequestId !== null
				? emailByKind.coffeeTable.get(row.coffeeTableGroupRequestId)
				: undefined) ??
			fakeEmail(row.id);

		const body = ((): string => {
			switch (row.type) {
				case 'submitted':
					return 'Submitted';
				case 'status_changed':
					return 'Status changed';
				case 'notification_sent':
					return `Notification sent to ${email}`;
				case 'notification_failed':
					return `Notification delivery failed for ${email}`;
				case 'imported':
					return 'Imported from Airtable';
				case 'note':
				default:
					return faker.lorem.sentence({ min: 6, max: 14 });
			}
		})();

		await database
			.update(submissionEvent)
			.set({ body })
			.where(eq(submissionEvent.id, row.id));
	});
}

/**
 * CoC attachments live in Netlify Blobs (`src/lib/attachments.ts`), not
 * Postgres, and that store is shared globally rather than scoped per deploy
 * — a SQL scrub can't reach it. Every report that had a real attachment gets
 * repointed at one shared placeholder blob instead, so the attachment route
 * still has something to serve.
 */
async function sanitizeCocAttachments(database: Database): Promise<void> {
	const rows = await database
		.select({ id: cocReport.id })
		.from(cocReport)
		.where(isNotNull(cocReport.attachmentBlobKey));

	if (rows.length === 0) return;

	await getStore(ATTACHMENT_STORE).set(
		PLACEHOLDER_ATTACHMENT_KEY,
		PLACEHOLDER_PNG,
		{
			metadata: { filename: 'placeholder.png', contentType: 'image/png' },
		},
	);

	await inBatches(rows, async (row) => {
		await database
			.update(cocReport)
			.set({
				attachmentBlobKey: PLACEHOLDER_ATTACHMENT_KEY,
				attachmentFilename: 'placeholder.png',
				attachmentContentType: 'image/png',
				attachmentSize: PLACEHOLDER_PNG.byteLength,
			})
			.where(eq(cocReport.id, row.id));
	});
}

/* -------------------------------------------------------------------------- */
/* Better Auth                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Real Slack OAuth tokens and session data get forked into every preview
 * regardless of /admin — this runs whether or not the preview bypass is even
 * enabled. `role` is preserved so permission-gated sections stay testable;
 * everything identifying or secret is not.
 */
async function sanitizeAuthTables(database: Database): Promise<void> {
	const users = await database
		.select({
			id: user.id,
			banReason: user.banReason,
			roleGrantedBy: user.roleGrantedBy,
			slackUserId: user.slackUserId,
		})
		.from(user);

	await inBatches(users, async (row) => {
		faker.seed(seedFor(row.id));

		await database
			.update(user)
			.set({
				name: faker.person.fullName(),
				email: fakeEmail(row.id),
				image: null,
				// Duplicates `account.account_id`, which is rewritten below — and was
				// being left behind, so the real Slack member id survived every
				// sanitize. It is also what links a user to their `volunteer` row.
				slackUserId: row.slackUserId ? fakeSlackId(row.slackUserId) : null,
				banReason: row.banReason ? faker.lorem.sentence() : null,
				// Who granted a role is an audit nicety, not something /admin's
				// permission checks depend on — clearing it is simpler and safer
				// than resolving it to the corresponding fake identity.
				roleGrantedBy: null,
			})
			.where(eq(user.id, row.id));
	});

	const accounts = await database.select({ id: account.id }).from(account);

	await inBatches(accounts, async (row) => {
		await database
			.update(account)
			.set({
				accountId: `sanitized-${row.id}`,
				accessToken: null,
				refreshToken: null,
				idToken: null,
				password: null,
				scope: null,
			})
			.where(eq(account.id, row.id));
	});

	// Nothing needs a preview to carry over real sessions, invite tokens, or
	// pending verification codes — the preview admin bypass mints its own.
	await database.delete(session);
	await database.delete(verification);
	await database.delete(inviteToken);
}

/* -------------------------------------------------------------------------- */
/* Verification                                                              */
/* -------------------------------------------------------------------------- */

async function countWhere(
	database: Database,
	...args: Parameters<typeof database.$count>
): Promise<number> {
	return database.$count(...args);
}

async function verify(database: Database): Promise<string[]> {
	const failures: string[] = [];

	const realEmail = (column: Parameters<typeof like>[0]) =>
		and(isNotNull(column), not(like(column, `%@${FAKE_EMAIL_DOMAIN}`)));

	// `fakeSlackId()` is `U` plus ten upper-case hex digits. A real id starts
	// with `U` too, so the check has to be on the whole derived shape.
	const realSlackId = (column: Parameters<typeof like>[0]) =>
		and(isNotNull(column), sql`${column} !~ '^U[0-9A-F]{10}$'`);

	const checks: Array<[string, () => Promise<number>]> = [
		[
			'membership_application has a non-fake email',
			() =>
				countWhere(
					database,
					membershipApplication,
					realEmail(membershipApplication.email),
				),
		],
		[
			'invite has a non-fake invitee_email',
			() => countWhere(database, invite, realEmail(invite.inviteeEmail)),
		],
		[
			'coc_report has a non-fake email',
			() => countWhere(database, cocReport, realEmail(cocReport.email)),
		],
		[
			'volunteer_signup has a non-fake email',
			() =>
				countWhere(database, volunteerSignup, realEmail(volunteerSignup.email)),
		],
		[
			'lunch_and_learn_idea has a non-fake email',
			() =>
				countWhere(
					database,
					lunchAndLearnIdea,
					realEmail(lunchAndLearnIdea.email),
				),
		],
		[
			'coffee_table_group_request has a non-fake email',
			() =>
				countWhere(
					database,
					coffeeTableGroupRequest,
					realEmail(coffeeTableGroupRequest.email),
				),
		],
		[
			'user has a non-fake email',
			() => countWhere(database, user, realEmail(user.email)),
		],
		[
			'user.slack_user_id was not sanitized',
			() => countWhere(database, user, realSlackId(user.slackUserId)),
		],
		[
			'pending_grant.slack_user_id was not sanitized',
			() =>
				countWhere(
					database,
					pendingGrant,
					realSlackId(pendingGrant.slackUserId),
				),
		],
		[
			'volunteer.slack_user_id was not sanitized',
			() => countWhere(database, volunteer, realSlackId(volunteer.slackUserId)),
		],
		[
			'invite.inviter_slack_user_id was not sanitized',
			() =>
				countWhere(database, invite, realSlackId(invite.inviterSlackUserId)),
		],
		[
			'volunteer_invite_ledger.slack_user_id was not sanitized',
			() =>
				countWhere(
					database,
					volunteerInviteLedger,
					realSlackId(volunteerInviteLedger.slackUserId),
				),
		],
		[
			'volunteer has a non-fake email',
			() => countWhere(database, volunteer, realEmail(volunteer.email)),
		],
		[
			'pending_grant still names a real grantor',
			() =>
				countWhere(
					database,
					pendingGrant,
					ne(pendingGrant.grantedBy, 'sanitized'),
				),
		],
		[
			'volunteer_invite_ledger body has a non-fake email',
			() =>
				countWhere(
					database,
					volunteerInviteLedger,
					and(
						isNotNull(volunteerInviteLedger.body),
						like(volunteerInviteLedger.body, '%@%'),
						not(like(volunteerInviteLedger.body, `%@${FAKE_EMAIL_DOMAIN}%`)),
					),
				),
		],
		[
			'invite still carries a claim token',
			() => countWhere(database, invite, isNotNull(invite.tokenHash)),
		],
		[
			'account still has an OAuth secret',
			() =>
				countWhere(
					database,
					account,
					or(
						isNotNull(account.accessToken),
						isNotNull(account.refreshToken),
						isNotNull(account.idToken),
						isNotNull(account.password),
					),
				),
		],
		['session rows were not cleared', () => countWhere(database, session)],
		[
			'verification rows were not cleared',
			() => countWhere(database, verification),
		],
		[
			'invite_token rows were not cleared',
			() => countWhere(database, inviteToken),
		],
		[
			'coc_report has an attachment key other than the placeholder',
			() =>
				countWhere(
					database,
					cocReport,
					and(
						isNotNull(cocReport.attachmentBlobKey),
						ne(cocReport.attachmentBlobKey, PLACEHOLDER_ATTACHMENT_KEY),
					),
				),
		],
	];

	for (const [label, check] of checks) {
		const count = await check();
		if (count > 0) {
			failures.push(`${label} (${count} row${count === 1 ? '' : 's'})`);
		}
	}

	return failures;
}

/* -------------------------------------------------------------------------- */

async function main() {
	const context = process.env.CONTEXT;

	if (context === 'production') {
		throw new Error(
			'Refusing to run: db:sanitize-preview must never touch the production database.',
		);
	}

	if (context !== 'deploy-preview' && context !== 'branch-deploy') {
		console.log(
			`db:sanitize-preview: CONTEXT=${context ?? '(unset)'}, nothing to do.`,
		);
		return;
	}

	const database = db();

	const applicationEmailById = await sanitizeMembershipApplications(database);
	await sanitizeApplicationEvents(database, applicationEmailById);
	await sanitizeInvites(database);

	const cocEmailById = await sanitizeCocReports(database);
	const volunteerEmailById = await sanitizeVolunteerSignups(database);
	const lunchEmailById = await sanitizeLunchAndLearnIdeas(database);
	const coffeeEmailById = await sanitizeCoffeeTableGroupRequests(database);
	await sanitizeSubmissionEvents(database, {
		coc: cocEmailById,
		volunteer: volunteerEmailById,
		lunchAndLearn: lunchEmailById,
		coffeeTable: coffeeEmailById,
	});

	await sanitizeCocAttachments(database);
	await sanitizeVolunteers(database);
	await sanitizePendingGrants(database);
	await sanitizeAuthTables(database);

	const failures = await verify(database);

	if (failures.length > 0) {
		console.error('db:sanitize-preview: verification failed:');
		for (const failure of failures) console.error(`  - ${failure}`);
		process.exitCode = 1;
		return;
	}

	console.log('db:sanitize-preview: preview branch sanitized successfully.');
}

main().catch((error) => {
	console.error('db:sanitize-preview: failed:', error);
	process.exitCode = 1;
});
