import type { SubmissionStatus } from '@/db';
import { recordEvent, type SubmissionEventInput } from '@/lib/eventLog';
import {
	SUBMISSION_KINDS,
	submissionSubject,
	type SubmissionKind,
} from '@/lib/submissions';
import { insertSubmission } from '@/test/db/fixtures';

import { ADMIN, ATTACHMENT, daysAgo } from './shared';

/**
 * The four Submission kinds, one row per status each, with the History the
 * real code would have written: the form's `submitted` (or the import's
 * `imported`), the Slack notification's outcome, then the maintainer's
 * moves. `resolved` rows pass through `in_progress` on the way; `dismissed`
 * ones are closed straight from `new`, so both shapes of timeline render.
 */
type SubmissionSeed = {
	status: SubmissionStatus;
	daysAgo: number;
	note?: string;
	/** Set on a row that came over from Airtable. */
	airtableRecordId?: string;
	/** The Slack post about it failed — the warning banner on the list. */
	notificationFailed?: boolean;
};

type Values<K extends SubmissionKind> = Omit<
	Parameters<typeof insertSubmission<K>>[1],
	'status' | 'submittedAt' | 'closedAt' | 'airtableRecordId'
>;

async function seedKind<K extends SubmissionKind, S extends SubmissionSeed>(
	kind: K,
	seeds: S[],
	toValues: (seed: S) => Values<K>,
) {
	const { singular } = SUBMISSION_KINDS[kind];

	for (const seed of seeds) {
		const submittedAt = daysAgo(seed.daysAgo);
		const step = (n: number) => daysAgo(Math.max(seed.daysAgo - n, 1));
		const closed = seed.status === 'resolved' || seed.status === 'dismissed';
		const closedAt = closed ? step(seed.note ? 3 : 2) : null;

		// `Omit` over a generic loses the link to `K`, so the merged row is
		// asserted back to the kind's insert type; `toValues` is where it is
		// checked.
		const { id } = await insertSubmission(kind, {
			...toValues(seed),
			status: seed.status,
			submittedAt,
			closedAt,
			airtableRecordId: seed.airtableRecordId ?? null,
		} as Parameters<typeof insertSubmission<K>>[1]);

		const subject = submissionSubject(kind, id);
		const event = (fields: SubmissionEventInput) =>
			recordEvent(subject, fields);
		const by = (fields: Parameters<typeof event>[0]) =>
			event({ actorUserId: ADMIN.id, ...fields });

		if (seed.airtableRecordId) {
			await event({
				type: 'imported',
				body: `Imported from Airtable (${seed.airtableRecordId})`,
				createdAt: submittedAt,
			});
		} else {
			await event({
				type: 'submitted',
				body: `${singular} submitted`,
				createdAt: submittedAt,
			});
			await event(
				seed.notificationFailed
					? {
							type: 'notification_failed',
							body: 'Slack notification failed: channel not found.',
							createdAt: submittedAt,
						}
					: {
							type: 'notification_sent',
							body: 'Posted to Slack.',
							createdAt: submittedAt,
						},
			);
		}

		// A note, when present, lands before the status settles — the
		// maintainer talks to someone first.
		if (seed.note) {
			await by({ type: 'note', body: seed.note, createdAt: step(1) });
		}

		if (seed.status === 'in_progress' || seed.status === 'resolved') {
			await by({
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: 'in_progress',
				createdAt: step(seed.note ? 2 : 1),
			});
		}

		if (closedAt) {
			await by({
				type: 'status_changed',
				fromStatus: seed.status === 'resolved' ? 'in_progress' : 'new',
				toStatus: seed.status,
				createdAt: closedAt,
			});
		}
	}
}

/**
 * CoC Reports: one per status. Includes the two states an admin cannot
 * produce by hand — an anonymous report (`name`/`email` both null, a form
 * convention, not a schema constraint) and a failed Slack notification (the
 * warning banner on the CoC list) — plus one maintainer note, so the history
 * timeline has a real note to render, and one attachment, which
 * `attachment.ts` writes to the blob store so the link serves a real file.
 */
type CocReportSeed = SubmissionSeed & {
	name: string | null;
	email: string | null;
	reporteeName: string;
	timeLocation: string;
	description: string;
	anyoneElseInvolved?: string;
	attachment?: boolean;
};

const COC_REPORT_SEEDS: CocReportSeed[] = [
	{
		status: 'resolved',
		daysAgo: 14,
		name: 'Grace Okonkwo',
		email: 'grace@example.com',
		reporteeName: 'A member in the #career-chat channel',
		timeLocation: 'Slack, #career-chat, around 3pm Eastern on a weekday.',
		description:
			'They kept steering an unrelated thread toward unsolicited comments about my appearance on video calls. I asked them to stop twice and they brushed it off as a joke both times.',
		anyoneElseInvolved:
			'A couple of people reacted with the eyes emoji but nobody else said anything in the thread.',
		note: 'Talked to the member privately. They apologized and understood why it landed badly. No further action needed.',
	},
	{
		status: 'dismissed',
		daysAgo: 9,
		name: 'Owen Marsh',
		email: 'owen@example.com',
		reporteeName: 'Someone in a coffee group I do not know well',
		timeLocation: 'During a Thursday coffee session, near the end.',
		description:
			'I misread a blunt comment about my code as an attack, but after re-reading the thread with the host I think it was just terse feedback, not hostility. Flagging in case others read it the same way I did.',
	},
	{
		status: 'in_progress',
		daysAgo: 5,
		name: 'Renata Silva',
		email: 'renata@example.com',
		reporteeName: 'A member who DMed me after a Lunch & Learn',
		timeLocation: 'Direct message, the evening after the March Lunch & Learn.',
		description:
			'The DM started as networking and turned into repeated requests to move the conversation off Slack. I said no each time and they kept asking. Screenshot attached.',
		attachment: true,
	},
	{
		status: 'new',
		daysAgo: 1,
		name: null,
		email: null,
		notificationFailed: true,
		reporteeName: 'Prefer not to say',
		timeLocation:
			'A coffee group this week — I would rather not say which one.',
		description:
			'Someone made a comment that assumed everyone in the group was early-career and dismissed a point I made because of it. I do not want to escalate, I just want it on record.',
	},
];

/** Volunteer Signups: one per status, including one with no `position` given. */
type VolunteerSignupSeed = SubmissionSeed & {
	name: string;
	email: string;
	githubUsername: string | null;
	position: string | null;
	description: string;
};

const VOLUNTEER_SIGNUP_SEEDS: VolunteerSignupSeed[] = [
	{
		status: 'resolved',
		daysAgo: 14,
		name: 'Deshawn Carter',
		email: 'deshawn@example.com',
		githubUsername: 'dcarter',
		position: 'VC Host',
		description:
			'I have hosted a handful of coffee sessions informally at my old job and would like to do it here properly. Mornings work best for my schedule.',
	},
	{
		status: 'dismissed',
		daysAgo: 8,
		name: 'Mei Lin Tan',
		email: 'meilin@example.com',
		githubUsername: 'meilintan',
		position: 'Notetaker',
		description:
			'Realized after submitting that I already signed up for this through a Slack thread last week — apologies for the duplicate.',
	},
	{
		status: 'in_progress',
		daysAgo: 5,
		name: 'Yusuf Demir',
		note: 'Asked which mornings work; waiting to hear back before pairing them with a host.',
		email: 'yusuf@example.com',
		githubUsername: 'yusufdemir',
		position: null,
		description:
			'Not sure which volunteer role fits best yet, but I would like to help somewhere. I am most comfortable with anything code-review adjacent.',
	},
	{
		status: 'new',
		daysAgo: 2,
		name: 'Camille Fontaine',
		email: 'camille@example.com',
		githubUsername: 'cfontaine',
		position: 'Coffee Table Group Leader',
		description:
			'I already run an informal group with three coworkers and would like to bring that structure into a proper Coffee Table Group here.',
	},
];

/**
 * Lunch & Learn Ideas: one per status, including both states of
 * `githubIssueUrl` — set when `createLunchAndLearnIssue()` succeeds, null
 * (the default local state, with no GitHub App credentials) when it doesn't.
 */
type LunchAndLearnIdeaSeed = SubmissionSeed & {
	name: string;
	email: string;
	topic: string;
	description: string;
	format: string | null;
	timing: string | null;
	githubIssueUrl: string | null;
};

const LUNCH_AND_LEARN_IDEA_SEEDS: LunchAndLearnIdeaSeed[] = [
	{
		status: 'resolved',
		daysAgo: 14,
		name: 'Halima Yusuf',
		note: 'Scheduled for the second Tuesday; slides requested a week ahead.',
		email: 'halima@example.com',
		topic: 'Reading a slow query plan without panicking',
		description:
			'A walkthrough of EXPLAIN ANALYZE output on a real query from a side project, and the handful of things I actually check before reaching for an index.',
		format: 'Live demo, 20 minutes plus questions',
		timing: 'A Tuesday evening, after 6pm Eastern',
		githubIssueUrl:
			'https://github.com/Virtual-Coffee/VC-Community-Docs/issues/123',
	},
	{
		status: 'dismissed',
		daysAgo: 9,
		name: 'Bram Janssen',
		email: 'bram@example.com',
		topic: 'My personal Neovim config',
		// Came over from Airtable, so its History starts with the import.
		airtableRecordId: 'recSEEDlunchLrn1',
		description:
			'Realized this is closer to a show-and-tell than a Lunch & Learn topic — happy to bring it back as a lightning talk if that format exists.',
		format: null,
		timing: null,
		githubIssueUrl: null,
	},
	{
		status: 'in_progress',
		daysAgo: 6,
		name: 'Sofia Marchetti',
		email: 'sofia@example.com',
		topic: 'What actually broke when we turned on strict mode',
		description:
			'A postmortem-style talk on enabling TypeScript strict mode on a five-year-old codebase: what caught real bugs, what was just noise, and how we sequenced the rollout.',
		format: 'Talk plus live Q&A',
		timing: 'Weekday lunchtime, any day works',
		githubIssueUrl:
			'https://github.com/Virtual-Coffee/VC-Community-Docs/issues/145',
	},
	{
		status: 'new',
		daysAgo: 1,
		name: 'Theo Bakker',
		email: 'theo@example.com',
		topic: 'Getting comfortable with regular expressions',
		description:
			'A beginner-friendly session building up a few regexes from scratch, aimed at people who currently just copy-paste them from Stack Overflow like I used to.',
		format: null,
		timing: 'Flexible',
		githubIssueUrl: null,
	},
];

/** Coffee Table Group Requests: one per status, including a null `groupName`. */
type CoffeeTableGroupRequestSeed = SubmissionSeed & {
	name: string;
	email: string;
	groupName: string | null;
	description: string | null;
};

const COFFEE_TABLE_GROUP_REQUEST_SEEDS: CoffeeTableGroupRequestSeed[] = [
	{
		status: 'resolved',
		daysAgo: 13,
		name: 'Anders Lindqvist',
		note: 'Channel created and Anders made a Group Leader.',
		email: 'anders@example.com',
		groupName: 'Backend Deep Dives',
		description:
			'A small group focused on backend architecture discussions — queueing, data modeling, that kind of thing. I would like to run it biweekly.',
	},
	{
		status: 'dismissed',
		daysAgo: 7,
		name: 'Fatima Rahman',
		email: 'fatima@example.com',
		groupName: null,
		description:
			'Wanted to start something around accessibility but found out there is already a group covering that — happy to just join theirs instead.',
	},
	{
		status: 'in_progress',
		daysAgo: 4,
		name: 'Lucas Meyer',
		email: 'lucas@example.com',
		groupName: 'Frontend Friday',
		description:
			'A casual weekly group for anyone working on frontend stuff, no fixed agenda beyond bringing whatever you are stuck on.',
	},
	{
		status: 'new',
		daysAgo: 1,
		name: 'Ngozi Eze',
		email: 'ngozi@example.com',
		groupName: 'Career Switchers',
		description:
			'A group specifically for people who changed careers into tech, since that conversation keeps coming up one-on-one and seems worth having a regular space for.',
	},
];

export async function seedSubmissions(attachmentSize: number) {
	await seedKind('coc', COC_REPORT_SEEDS, (seed) => ({
		name: seed.name,
		email: seed.email,
		reporteeName: seed.reporteeName,
		timeLocation: seed.timeLocation,
		description: seed.description,
		anyoneElseInvolved: seed.anyoneElseInvolved ?? null,
		attachmentBlobKey: seed.attachment ? ATTACHMENT.key : null,
		attachmentFilename: seed.attachment ? ATTACHMENT.filename : null,
		attachmentContentType: seed.attachment ? ATTACHMENT.contentType : null,
		attachmentSize: seed.attachment ? attachmentSize : null,
	}));
	await seedKind('volunteers', VOLUNTEER_SIGNUP_SEEDS, (seed) => ({
		name: seed.name,
		email: seed.email,
		githubUsername: seed.githubUsername,
		position: seed.position,
		description: seed.description,
	}));
	await seedKind('lunch-and-learn', LUNCH_AND_LEARN_IDEA_SEEDS, (seed) => ({
		name: seed.name,
		email: seed.email,
		topic: seed.topic,
		description: seed.description,
		format: seed.format,
		timing: seed.timing,
		githubIssueUrl: seed.githubIssueUrl,
	}));
	await seedKind('coffee-tables', COFFEE_TABLE_GROUP_REQUEST_SEEDS, (seed) => ({
		name: seed.name,
		email: seed.email,
		groupName: seed.groupName,
		description: seed.description,
	}));
}

export const SUBMISSION_COUNT =
	COC_REPORT_SEEDS.length +
	VOLUNTEER_SIGNUP_SEEDS.length +
	LUNCH_AND_LEARN_IDEA_SEEDS.length +
	COFFEE_TABLE_GROUP_REQUEST_SEEDS.length;
