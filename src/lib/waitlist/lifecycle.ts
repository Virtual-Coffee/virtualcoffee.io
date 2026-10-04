import { and, inArray, isNull, sql } from 'drizzle-orm';

import { db, membershipApplication, type ApplicationStatus } from '@/db';
import { checkNote } from '@/lib/admin/notes';
import { sendEmail } from '@/lib/email/transport';
import type { EmailTemplate } from '@/lib/email/render';
import { coffeeInvite } from '@/emails/coffeeInvite';
import { slackInvite } from '@/emails/slackInvite';
import { welcome } from '@/emails/welcome';
import {
	recordEvent,
	recordOutcome,
	transitionAndRecord,
	type ApplicationSubject,
	type TransitionEventInput,
} from '@/lib/history/eventLog';
import { reportHandled } from '@/lib/monitoring/reportHandled';
import type { Outbound } from '@/lib/outbound';
import {
	claimInvite,
	completeInvite,
	type ClaimedInvite,
} from '@/lib/volunteers/invites';
import { siteUrl } from '@/util/url.server';

import { suspectSpam } from '@/util/forms/spamHeuristics';

import {
	QUARANTINE_STATUSES,
	QUEUE_STATUSES,
	can,
	type LifecycleAction,
} from './applicationStatuses';
import { applicationSubject, getApplication } from './applications';
import {
	createSlackInviteToken,
	expireSlackInviteToken,
	supersedeSlackInviteTokens,
} from './inviteTokens';

/**
 * The Application lifecycle: every write to a Membership Application's status,
 * and the one place its rules live. The transition table is in
 * `applicationStatuses.ts` (client-safe, so the action panel reads it too);
 * this module refuses anything off it, owns the send-first ordering and the
 * token rollback behind each email, and writes the application `/join` creates.
 * The panel only offers what the table allows, but a server action is
 * reachable without the panel, so `open()` checks it again — closing twice
 * would also write a second event over the first one's timestamp.
 *
 * Authorization is not here. Each admin action opens with its own permission
 * check — docs/adr 0003 and 0006 put it in the action, so a new action that
 * forgets it is refused rather than open to every role — and hands this module
 * the actor. Slack announcements stay with the caller too, after the write
 * (docs/adr/0005).
 */

/** Who is acting: the signed-in user's id (null for a bypass session) and the address a copy goes to. */
export type Actor = { userId: string | null; email: string };

/**
 * `done`: carries the send's `warning`, a rejected cc, when there is one.
 * `wrong-status`: the table does not allow the action from `status`.
 * `changed`: the row moved between the read and the write, and nothing went
 * out. `stranded`: the same, but the email had already gone. `already-recorded`:
 * attendance was already there. `name` is the applicant's, for copy that names them.
 */
export type Outcome =
	| { kind: 'done'; warning?: string }
	| { kind: 'not-found' }
	| { kind: 'wrong-status'; status: ApplicationStatus }
	| { kind: 'changed'; name: string }
	| { kind: 'stranded'; name: string }
	| { kind: 'email-failed'; outbound: Extract<Outbound, { ok: false }> }
	| { kind: 'already-recorded' }
	| { kind: 'invalid-note'; message: string };

type Of<K extends Outcome['kind']> = Extract<Outcome, { kind: K }>;

type SendOptions = { copyMe: boolean };

type Application = NonNullable<Awaited<ReturnType<typeof getApplication>>>;

type Opened = { application: Application; subject: ApplicationSubject };

/**
 * The row and its Subject, or the outcome that ends the operation: the id is
 * unknown, or the table does not allow `action` from the row's status.
 */
async function open(
	applicationId: string,
	action: LifecycleAction,
): Promise<Opened | Of<'not-found' | 'wrong-status'>> {
	const application = await getApplication(applicationId);
	if (!application) return { kind: 'not-found' };
	if (!can(application.status, action)) {
		return { kind: 'wrong-status', status: application.status };
	}
	return { application, subject: applicationSubject(applicationId) };
}

function isOutcome(opened: Opened | Outcome): opened is Outcome {
	return 'kind' in opened;
}

/**
 * One email to the applicant, whose failure is History. `what` is how History
 * names the send — "Coffee invite" — and `rollback` kills anything minted to
 * go in it before the failure is reported.
 */
async function emailApplicant<P extends object>(
	{ application, subject }: Opened,
	actor: Actor,
	{ copyMe }: SendOptions,
	what: string,
	template: EmailTemplate<P>,
	props: P,
	rollback?: () => Promise<unknown>,
): Promise<Outbound> {
	const sent = await sendEmail(template, props, {
		to: application.email,
		cc: copyMe ? actor.email : null,
	});
	if (sent.ok) return sent;

	await rollback?.();
	await recordOutcome(subject, {
		channel: 'email',
		outbound: sent,
		what: `${what} to ${application.email}`,
		actorUserId: actor.userId,
	});
	return sent;
}

/**
 * The status change that follows a send, and never precedes it: reversed, a
 * failed send leaves the applicant marked as invited with no email and the
 * maintainer no way to tell.
 *
 * Null means the row moved and the caller carries on. Otherwise the race was
 * lost — the email has gone regardless, so History says so and `rollback`
 * kills a link this request is no longer entitled to — and the caller hands
 * the answer back. A transition that throws instead is rolled back the same
 * way before the error propagates: the row did not move, so the emailed
 * link would admit someone who is not a member.
 */
async function transitionAfterSend(
	{ application, subject }: Opened,
	actor: Actor,
	from: ApplicationStatus,
	patch: Partial<typeof membershipApplication.$inferInsert>,
	event: Omit<TransitionEventInput<ApplicationSubject>, 'actorUserId'>,
	stranded: string,
	rollback?: () => Promise<unknown>,
): Promise<Of<'stranded'> | null> {
	let moved: boolean;
	try {
		moved = await transitionAndRecord(subject, from, patch, {
			...event,
			actorUserId: actor.userId,
		});
	} catch (error) {
		try {
			await rollback?.();
		} catch (rollbackError) {
			console.error('Failed to roll back after a transition threw', {
				applicationId: subject.id,
				error: rollbackError,
			});
		}
		throw error;
	}
	if (moved) return null;

	await rollback?.();
	await recordEvent(subject, {
		actorUserId: actor.userId,
		type: 'email_sent',
		body: stranded,
	});
	return { kind: 'stranded', name: application.name };
}

export async function coffeeInviteApplicant(
	applicationId: string,
	actor: Actor,
	options: SendOptions,
): Promise<
	Of<'done' | 'not-found' | 'wrong-status' | 'email-failed' | 'stranded'>
> {
	const opened = await open(applicationId, 'coffeeInvite');
	if (isOutcome(opened)) return opened;
	const { application } = opened;

	const sent = await emailApplicant(
		opened,
		actor,
		options,
		'Coffee invite',
		coffeeInvite,
		{},
	);
	if (!sent.ok) return { kind: 'email-failed', outbound: sent };

	const stranded = await transitionAfterSend(
		opened,
		actor,
		'waitlisted',
		{ status: 'coffee_invited', coffeeInvitedAt: new Date() },
		{
			type: 'coffee_invited',
			body: `Coffee invite emailed to ${application.email}`,
		},
		`Coffee invite emailed to ${application.email}, but the application had already left Waitlisted`,
	);
	return stranded ?? { kind: 'done', warning: sent.warning };
}

export async function recordAttendance(
	applicationId: string,
	actor: Actor,
): Promise<
	Of<'done' | 'not-found' | 'wrong-status' | 'already-recorded' | 'changed'>
> {
	const opened = await open(applicationId, 'recordAttendance');
	if (isOutcome(opened)) return opened;
	const { application, subject } = opened;

	// The status does not change when attendance is recorded, so the status
	// fence alone lets two clicks both overwrite the date and each write an
	// event. The write itself requires the date to still be unset; a read
	// beforehand would let two requests both pass it.
	const recorded = await transitionAndRecord(
		subject,
		'coffee_invited',
		{ coffeeAttendedAt: new Date() },
		{
			actorUserId: actor.userId,
			type: 'attendance_recorded',
			body: 'Attended a Coffee',
		},
		isNull(membershipApplication.coffeeAttendedAt),
	);
	if (recorded) return { kind: 'done' };

	const current = await getApplication(applicationId);
	if (current?.coffeeAttendedAt) return { kind: 'already-recorded' };
	return { kind: 'changed', name: application.name };
}

export async function approve(
	applicationId: string,
	actor: Actor,
	options: SendOptions,
): Promise<
	Of<'done' | 'not-found' | 'wrong-status' | 'email-failed' | 'stranded'>
> {
	const opened = await open(applicationId, 'approve');
	if (isOutcome(opened)) return opened;
	const { application, subject } = opened;

	// The token has to exist before the email that carries it, so every exit
	// below that does not make a member expires it: a timed-out send may still
	// have delivered a working link, and /join-slack checks only the token.
	// Another approval may be racing this one, and its link must survive if
	// it wins. The loser expires its own.
	const { id: tokenId, token } = await createSlackInviteToken(applicationId);
	const expireToken = () => expireSlackInviteToken(tokenId, new Date());

	const welcomeSent = await emailApplicant(
		opened,
		actor,
		options,
		'Welcome email',
		welcome,
		{
			name: application.name,
			inviteUrl: `${siteUrl()}/join-slack?code=${token}`,
		},
		expireToken,
	);
	if (!welcomeSent.ok) return { kind: 'email-failed', outbound: welcomeSent };

	const now = new Date();
	const stranded = await transitionAfterSend(
		opened,
		actor,
		'coffee_invited',
		{
			status: 'member',
			approvedAt: now,
			coffeeAttendedAt: application.coffeeAttendedAt ?? now,
		},
		{
			type: 'approved',
			body: `Membership approved; welcome email with Slack invite sent to ${application.email}`,
		},
		`Welcome email with Slack invite sent to ${application.email}, but the application had already left Coffee invited; the Slack link has been invalidated`,
		expireToken,
	);
	if (stranded) return stranded;

	// Complete the Invite that produced this application, if any. After the
	// status change and not fatal: the applicant has already been approved and
	// emailed. A maintainer has to finish it by hand, so it is reported and
	// left in History.
	if (application.inviteId) {
		try {
			await completeInvite(application.inviteId);
		} catch (error) {
			console.error('Failed to complete an invite', {
				applicationId,
				error,
			});
			reportHandled(error, { area: 'waitlist' });
			try {
				await recordEvent(subject, {
					actorUserId: actor.userId,
					type: 'invite_completion_failed',
					body: 'The Invite behind this application could not be marked completed',
				});
			} catch (recordError) {
				reportHandled(recordError, { area: 'waitlist' });
			}
		}
	}

	return { kind: 'done', warning: welcomeSent.warning };
}

/**
 * A fresh Slack invite for someone who is already a member: the first link
 * was consumed by a scanner, expired unread, or went to a spam folder. Once
 * the new link has gone the previous one stops working, so a link that went
 * astray cannot be redeemed by whoever finds it — but only once it has gone:
 * superseding before the send would leave a member whose re-send failed with
 * no working link at all. No status changes, so the send-first rule has
 * nothing to protect; the event is what records that a second link is out.
 */
export async function resendSlackInvite(
	applicationId: string,
	actor: Actor,
	options: SendOptions,
): Promise<Of<'done' | 'not-found' | 'wrong-status' | 'email-failed'>> {
	const opened = await open(applicationId, 'resendSlackInvite');
	if (isOutcome(opened)) return opened;
	const { application, subject } = opened;

	const minted = await createSlackInviteToken(applicationId);
	const sent = await emailApplicant(
		opened,
		actor,
		options,
		'Slack invite re-send',
		slackInvite,
		{
			name: application.name,
			inviteUrl: `${siteUrl()}/join-slack?code=${minted.token}`,
		},
		// Only this request's link: the previous one is still the one the
		// member holds.
		() => expireSlackInviteToken(minted.id, new Date()),
	);
	if (!sent.ok) return { kind: 'email-failed', outbound: sent };

	// The email has gone, so a supersession that fails is not an error page:
	// the send is recorded either way, and History says the old link is still
	// live so a maintainer can re-send once more to retire it.
	let what = `Slack invite re-sent to ${application.email}`;
	try {
		await supersedeSlackInviteTokens(applicationId, minted, new Date());
	} catch (error) {
		console.error('Failed to supersede the previous Slack invite links', {
			applicationId,
			error,
		});
		what += ' — the previous link is still live';
	}
	await recordOutcome(subject, {
		channel: 'email',
		outbound: sent,
		what,
		actorUserId: actor.userId,
	});

	return { kind: 'done', warning: sent.warning };
}

/** Decline or withdraw. */
export async function close(
	applicationId: string,
	actor: Actor,
	{
		status,
		note,
	}: {
		status: Extract<ApplicationStatus, 'declined' | 'withdrawn'>;
		note: string | null;
	},
): Promise<
	Of<'done' | 'not-found' | 'wrong-status' | 'invalid-note' | 'changed'>
> {
	const opened = await open(applicationId, 'close');
	if (isOutcome(opened)) return opened;
	const { application, subject } = opened;

	// The note is optional, but one that is given is held to the same rules
	// as a History note — checked before the status changes, so an over-long
	// reason is refused rather than closing the application without it.
	let body: string | null = null;
	if (note?.trim()) {
		const checked = checkNote(note);
		if (!checked.ok) return { kind: 'invalid-note', message: checked.message };
		body = checked.body;
	}

	const closed = await transitionAndRecord(
		subject,
		application.status,
		{ status, closedAt: new Date() },
		{
			actorUserId: actor.userId,
			type: status === 'declined' ? 'declined' : 'withdrawn',
			body,
		},
	);
	if (!closed) return { kind: 'changed', name: application.name };

	return { kind: 'done' };
}

/**
 * Not spam: move a Quarantined application to the Waitlist. `submittedAt` is
 * kept as the place in the queue, so the applicant loses nothing for the
 * detour. No email goes out; nothing was ever promised.
 */
export async function release(
	applicationId: string,
	actor?: Actor,
): Promise<Of<'done' | 'not-found' | 'wrong-status' | 'changed'>> {
	const opened = await open(applicationId, 'release');
	if (isOutcome(opened)) return opened;
	const { application, subject } = opened;

	const released = await transitionAndRecord(
		subject,
		'suspected_spam',
		{ status: 'waitlisted', waitlistedAt: application.submittedAt },
		{
			actorUserId: actor?.userId ?? null,
			type: 'waitlisted',
			body: 'Not spam — moved to the Waitlist',
		},
	);
	if (!released) return { kind: 'changed', name: application.name };

	return { kind: 'done' };
}

/**
 * What an applicant fills in. Consent is recorded as given at submission, so
 * the caller has validated the agreement before it gets here.
 */
export type Submission = {
	name: string;
	email: string;
	pronouns?: string;
	githubUsername?: string;
	howDidYouHear?: string;
	journey?: string;
	codeInterests?: string;
	virtualCoffee?: string;
};

export type Submitted =
	| {
			kind: 'submitted';
			applicationId: string;
			claimed: ClaimedInvite | null;
			/** Held in Quarantine as suspected spam instead of joining the Waitlist. */
			flagged: boolean;
	  }
	| { kind: 'duplicate' }
	| { kind: 'quarantined-repeat' };

/**
 * A new application from `/join`, on the Waitlist — or in Quarantine when
 * `suspectSpam` flags the name or email, unless a Claim Link was redeemed. The
 * Slack announcement is the caller's, after this returns (docs/adr/0005).
 */
export async function submit(
	input: Submission,
	claimToken: string | null,
): Promise<Submitted> {
	const now = new Date();

	/**
	 * One application per person in the pipeline. Someone who was declined,
	 * withdrew or lapsed can apply again; someone already waiting, invited or
	 * a member gets told so instead of a second row for a reviewer to notice.
	 *
	 * Checked before the transaction, so nothing is written and a Claim Link
	 * is not burned. Deliberately a lookup and not a unique index: the imported
	 * history holds duplicates, and this is a courtesy rather than a boundary —
	 * two submissions racing each other can still both land, and the spam
	 * guard's own scope (drive-by bots, not a determined sender) is unchanged.
	 *
	 * The message does tell a caller whether an address is in the pipeline.
	 * Accepted: this is a community waitlist behind the edge rate limit
	 * (netlify/edge-functions/rate-limit-join.ts), and telling someone they
	 * already applied is worth more than hiding that from a prober.
	 */
	const [existing] = await db()
		.select({ id: membershipApplication.id })
		.from(membershipApplication)
		.where(
			and(
				sql`lower(${membershipApplication.email}) = ${input.email.toLowerCase()}`,
				inArray(membershipApplication.status, [...QUEUE_STATUSES, 'member']),
			),
		)
		.limit(1);
	if (existing) return { kind: 'duplicate' };

	/**
	 * A bot retrying a quarantined address must not pile up rows, and the reply
	 * must not reveal anything (unlike `duplicate`, which names the pipeline):
	 * the caller shows the ordinary thank-you page. Only a submission that is
	 * itself suspect and carries no Claim Link is swallowed — anyone can type
	 * someone else's address, so a quarantined row must not stop the real
	 * person applying, least of all with a Volunteer's Invite.
	 */
	const suspect = suspectSpam(input);
	if (suspect && !claimToken) {
		const [quarantined] = await db()
			.select({ id: membershipApplication.id })
			.from(membershipApplication)
			.where(
				and(
					sql`lower(${membershipApplication.email}) = ${input.email.toLowerCase()}`,
					inArray(membershipApplication.status, QUARANTINE_STATUSES),
				),
			)
			.limit(1);
		if (quarantined) return { kind: 'quarantined-repeat' };
	}

	return db().transaction(async (tx) => {
		let claimed: ClaimedInvite | null = null;
		/**
		 * Redeem the Claim Link and write the application together. A racing
		 * second submission finds nothing to claim and is written as a Waitlist
		 * signup. The shared transaction is what stops a failed insert burning
		 * the Invite: the applicant would lose both their answers and their
		 * friend's invite, having done nothing wrong.
		 */
		if (claimToken) claimed = await claimInvite(claimToken, now, tx);

		/**
		 * A redeemed Invite skips the heuristic: a Volunteer vouched for this
		 * person, and quarantining would burn the Invite while hiding the
		 * application from the queue.
		 */
		const signal = claimed ? null : suspect;
		const status = signal ? 'suspected_spam' : 'waitlisted';

		const [row] = await tx
			.insert(membershipApplication)
			.values({
				name: input.name,
				email: input.email,
				pronouns: input.pronouns ?? null,
				githubUsername: input.githubUsername || null,
				howDidYouHear: input.howDidYouHear ?? null,
				journey: input.journey ?? null,
				codeInterests: input.codeInterests ?? null,
				virtualCoffee: input.virtualCoffee ?? null,
				status,
				/**
				 * An expired or already-used link still produces an application, as
				 * a Waitlist signup. Refusing it would throw away the long answers
				 * they just wrote over a link they had no way to check.
				 */
				source: claimed ? 'volunteer_invite' : 'waitlist_signup',
				isPriority: Boolean(claimed),
				inviteId: claimed ? claimed.id : null,
				referrer: claimed ? claimed.inviterName : null,
				agreedToCocAt: now,
				submittedAt: now,
				waitlistedAt: signal ? null : now,
			})
			.returning({ id: membershipApplication.id });

		await recordEvent(
			applicationSubject(row.id),
			{
				type: 'submitted',
				toStatus: status,
				body: claimed
					? `Application submitted from an invite by ${claimed.inviterName ?? 'a volunteer'}`
					: 'Application submitted',
			},
			tx,
		);
		if (signal) {
			await recordEvent(
				applicationSubject(row.id),
				{
					type: 'flagged_as_spam',
					body:
						signal === 'name'
							? 'Name looks machine-generated'
							: 'Email looks like a Gmail dot-trick address',
				},
				tx,
			);
		}

		return {
			kind: 'submitted',
			applicationId: row.id,
			claimed,
			flagged: signal !== null,
		};
	});
}
