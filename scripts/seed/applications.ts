import type { ApplicationStatus } from '@/db';
import {
	applicationEventRow,
	insertApplication,
	insertInviteToken,
} from '@/test/db/fixtures';

import { ADMIN, SLACK_TOKEN, daysAgo, daysAhead } from './shared';

/**
 * Membership applications and their History.
 *
 * The prose is written by hand rather than generated. Every screen in
 * /admin is built around reading four long answers, so lorem ipsum (or
 * faker's sentence generator) makes the layout impossible to judge: real
 * answers vary wildly in length, contain line breaks, and are the thing a
 * reviewer is actually looking at. The names are the ones used in the
 * wireframes so a seeded local site matches the design.
 */
type Seed = {
	name: string;
	email: string;
	pronouns: string;
	githubUsername: string;
	status: ApplicationStatus;
	source: 'waitlist_signup' | 'volunteer_invite';
	referrer?: string;
	daysAgo: number;
	howDidYouHear?: string;
	journey: string;
	codeInterests: string;
	virtualCoffee: string;
	/** Set on the one row that came over from Airtable. */
	airtableRecordId?: string;
	note?: string;
	firstEmailFailed?: boolean;
	slackNotificationFailed?: boolean;
	slackInviteResent?: boolean;
};

const SEEDS: Seed[] = [
	{
		name: 'Priya Raman',
		email: 'priya@example.com',
		pronouns: 'she/her',
		githubUsername: 'priyacodes',
		status: 'waitlisted',
		source: 'volunteer_invite',
		referrer: 'Dominic',
		daysAgo: 3,
		// The Slack post about an invited application failed — the warning
		// the History panel shows for a notification that never went out.
		slackNotificationFailed: true,
		howDidYouHear: 'Dominic mentioned it in a thread about career switching.',
		journey:
			'Career-switched out of hospital lab work about eighteen months ago. Did a part-time bootcamp at night, now six months into a junior backend role at a logistics company writing mostly Python and a bit of Go.\n\nThe isolation of being the only junior on a team of eight is the thing I am trying to fix.',
		codeInterests:
			'Backend and data plumbing. I have been reading about queueing and back-pressure because our nightly job keeps falling over and nobody can tell me why.',
		virtualCoffee:
			'Honestly, people to ask dumb questions to. I have nobody to sanity-check a design decision with before I put it in a PR.',
	},
	{
		name: 'Tomás Aguilar',
		email: 'tomas@example.com',
		pronouns: 'he/him',
		githubUsername: 'taguilar',
		status: 'waitlisted',
		source: 'waitlist_signup',
		referrer: 'Podcast',
		daysAgo: 7,
		note: 'Met them at the Thursday coffee — keen, follow up next week.',
		howDidYouHear: 'The podcast — the episode about maintainer burnout.',
		journey:
			'Twelve years of PHP for a regional newspaper group, which is a sentence that explains a lot. Lately I have been dragged into a TypeScript rewrite and I am enjoying it more than I expected.',
		codeInterests:
			'Accessibility, mostly. I got pulled into an audit last year and it rearranged how I think about the front end.',
		virtualCoffee:
			'I have been the most senior person in the room for a long time and I would like to not be, for an hour a week.',
	},
	{
		name: 'Nia Okafor',
		email: 'nia@example.com',
		pronouns: 'they/them',
		githubUsername: 'niaokafor',
		status: 'waitlisted',
		source: 'waitlist_signup',
		daysAgo: 9,
		howDidYouHear: 'A friend from a local meetup kept recommending it.',
		journey:
			'I taught myself Ruby in 2019 while working as a paralegal, and spent two years building small internal tools nobody asked for. That eventually turned into a real job maintaining a Rails monolith for a nonprofit.',
		codeInterests:
			'Legacy code, refactoring, and the social side of large rewrites. Also slowly learning Elixir on weekends.',
		virtualCoffee:
			'Peers. I want to be in a room where someone will tell me my approach is wrong before production does.',
	},
	{
		name: 'Marek Dvořák',
		email: 'marek@example.com',
		pronouns: 'he/him',
		githubUsername: 'mdvorak',
		status: 'waitlisted',
		source: 'waitlist_signup',
		referrer: 'A friend',
		daysAgo: 12,
		howDidYouHear: 'A friend on my course is already a member.',
		journey:
			'Second year CS student, doing a placement at a small agency over summer. Wrote my first real thing — a Discord bot for my climbing club — and it is still running, which surprises me daily.',
		codeInterests:
			'Web stuff, and I want to understand databases properly rather than copying whatever the ORM suggests.',
		virtualCoffee:
			'A sense of what working in this industry is actually like, from people who are not trying to sell me a course.',
	},
	{
		name: 'Ada Nwosu',
		email: 'ada@example.com',
		pronouns: 'she/her',
		githubUsername: 'adanwosu',
		status: 'waitlisted',
		source: 'waitlist_signup',
		daysAgo: 18,
		howDidYouHear: 'Found the members page while reading someone else’s blog.',
		journey:
			'Three years in QA, moving toward automation and then toward development proper. I write more Playwright than anything else right now.',
		codeInterests:
			'Testing, obviously, but I am curious about what makes a codebase testable in the first place.',
		virtualCoffee:
			'To meet developers who take testing seriously. In my company it is treated as a phase rather than a practice.',
	},
	{
		name: 'Chidi Balogun',
		email: 'chidi@example.com',
		pronouns: 'he/him',
		githubUsername: 'chidib',
		status: 'coffee_invited',
		source: 'waitlist_signup',
		daysAgo: 24,
		// The first send bounced; the invite went out on the retry a day later.
		firstEmailFailed: true,
		howDidYouHear:
			'A colleague who left for a startup would not stop talking about it. She sent me the newsletter and I read about four issues before applying.',
		journey:
			'I started in support at a fintech and talked my way into an internal-tools role after automating a chunk of my own job with some very questionable Python. That was four years ago.\n\nI have since done a proper stint on a platform team â Terraform, a lot of YAML, some Go â and I am now the person people come to for CI problems, which is either a promotion or a trap.',
		codeInterests:
			'Developer experience, build tooling, and making the slow bits of a workflow less slow. I have been reading about incremental compilation lately without much of a plan for it.',
		virtualCoffee:
			'A group that is not all from one company. My whole professional network is people I have worked with, and I would like a wider read on how other teams actually do things.\n\nAlso, I want to speak at something eventually and I need lower-stakes practice.',
	},
	{
		name: 'Sam Whitfield',
		email: 'sam@example.com',
		pronouns: 'he/him',
		githubUsername: 'samwhitfield',
		status: 'coffee_invited',
		source: 'volunteer_invite',
		referrer: 'Ayu',
		daysAgo: 31,
		howDidYouHear: 'Ayu invited me after we paired on an open source issue.',
		journey:
			'Started with Excel macros, honestly. Ended up automating enough of a finance team’s month-end that they made me a developer on paper too. Mostly C# and SQL since.',
		codeInterests:
			'Data modelling and reporting. I like the part where a messy business rule becomes a clean schema.',
		virtualCoffee:
			'I have never worked anywhere with a real code review culture and I would like to see one up close.',
	},
	{
		name: 'Rowan Hale',
		email: 'rowan@example.com',
		pronouns: 'they/them',
		githubUsername: 'rowanhale',
		status: 'member',
		source: 'volunteer_invite',
		referrer: 'Bekah',
		daysAgo: 63,
		howDidYouHear: 'Bekah invited me after a conference hallway conversation.',
		journey:
			'Design background, moved into front-end four years ago and never went back. I mostly build design systems now.',
		codeInterests:
			'CSS architecture, component APIs, and the endless argument about where design tokens should live.',
		virtualCoffee:
			'I want to talk to engineers who are not designers about design decisions, and find out where the handoff actually hurts.',
	},
	{
		name: 'Jo Bergström',
		email: 'jo@example.com',
		pronouns: 'she/her',
		githubUsername: 'jobergstrom',
		status: 'member',
		source: 'waitlist_signup',
		daysAgo: 88,
		// Asked for the Slack link again: the old token is superseded and the
		// live one is the join link the CLI prints.
		slackInviteResent: true,
		howDidYouHear: 'Someone shared the handbook in a Slack I am in.',
		journey:
			'I run a tiny agency with my sister â two developers, one designer, a lot of WordPress we are slowly escaping.',
		codeInterests:
			'Getting off WordPress, mainly. Also interested in what "good enough" architecture looks like for very small teams.',
		virtualCoffee:
			'Perspective from people who work at a scale I will never see, so I can steal the parts that apply.',
	},
	{
		name: 'Kwame Boateng',
		email: 'kwame@example.com',
		pronouns: 'he/him',
		githubUsername: 'kwameb',
		status: 'withdrawn',
		source: 'waitlist_signup',
		daysAgo: 140,
		howDidYouHear: 'The podcast.',
		journey:
			'Android developer, eight years, mostly Kotlin. Recently started managing two people and I am finding it harder than the code ever was.',
		codeInterests: 'Mobile architecture, and lately, engineering management.',
		virtualCoffee:
			'A place to think out loud about the management transition with people who have done it.',
	},
	{
		name: 'Iris Fontaine',
		email: 'iris@example.com',
		pronouns: 'she/her',
		githubUsername: 'irisfontaine',
		status: 'lapsed',
		source: 'waitlist_signup',
		daysAgo: 560,
		howDidYouHear: 'Twitter, back when that was a sentence people said.',
		journey:
			'Data engineer, five years, mostly Spark and Airflow. Considering a move toward platform work.',
		codeInterests: 'Pipelines, orchestration, and data quality tooling.',
		virtualCoffee: 'Community, and a break from talking only to data people.',
	},
	{
		name: 'Hector Ramos',
		email: 'hector@example.com',
		pronouns: 'he/him',
		githubUsername: 'hectorramos',
		status: 'lapsed',
		source: 'volunteer_invite',
		referrer: 'Saramccombs',
		daysAgo: 720,
		howDidYouHear: 'An invite from a volunteer I met at a hackathon.',
		journey:
			'Self-taught, freelance, mostly building sites for local businesses. Trying to move into product work.',
		codeInterests:
			'JavaScript, and figuring out what I do not know that I do not know.',
		virtualCoffee: 'Mentorship, or at least proximity to people further along.',
	},
];

/** The two states the queue and the archive can show that the list above lacks. */
const MORE_SEEDS: Seed[] = [
	{
		// Came over from Airtable, so its History starts with the import.
		name: 'Beatriz Moreno',
		email: 'beatriz@example.com',
		pronouns: 'she/her',
		githubUsername: 'bmoreno',
		status: 'waitlisted',
		source: 'waitlist_signup',
		daysAgo: 400,
		airtableRecordId: 'recSEEDb3atr1zM',
		howDidYouHear: 'Twitter, back when it was Twitter.',
		journey:
			'Bootcamp in 2021, then a support engineering role that slowly became a real engineering role. I still answer tickets on Fridays.',
		codeInterests:
			'Python and data pipelines. I would like to understand what a well-run one looks like.',
		virtualCoffee:
			'I applied ages ago and forgot. Still interested, if the offer stands.',
	},
	{
		name: 'Victor Lindgren',
		email: 'victor@example.com',
		pronouns: 'he/him',
		githubUsername: 'vlindgren',
		status: 'declined',
		source: 'waitlist_signup',
		daysAgo: 45,
		howDidYouHear: 'A recruiter mentioned it.',
		journey: 'CTO. Twenty years. Looking to hire.',
		codeInterests: 'Whatever my team is using.',
		virtualCoffee:
			'To source candidates for three open senior positions at my company.',
	},
];

const ALL_SEEDS = [...SEEDS, ...MORE_SEEDS];

/**
 * Insert every application with the History the real actions would have
 * written, in the order they would have written it: the join action's
 * `submitted` (or the import's `imported`), the Slack notification for an
 * invited application, then each maintainer action with the dev bypass as
 * its actor.
 *
 * Returns the live Slack join token for the member whose invite was re-sent.
 */
export async function seedApplications(
	invitesByEmail: Map<string, string>,
): Promise<{ slackToken: string }> {
	let slackToken: string | undefined;

	for (const seed of ALL_SEEDS) {
		const submittedAt = daysAgo(seed.daysAgo);
		const past = seed.status !== 'waitlisted';
		const invitedAt =
			seed.status === 'coffee_invited' ||
			seed.status === 'member' ||
			seed.status === 'withdrawn'
				? daysAgo(Math.max(seed.daysAgo - 10, 1))
				: null;
		const attendedAt =
			seed.status === 'member' ? daysAgo(Math.max(seed.daysAgo - 17, 1)) : null;
		// Terminal states close the row and get the event that closed it. A
		// withdrawal is recent by construction, a decline follows a review, and
		// a lapse is an application that went cold with nobody deciding on it,
		// months after it came in.
		const closedAt =
			seed.status === 'withdrawn'
				? daysAgo(1)
				: seed.status === 'declined'
					? daysAgo(Math.max(seed.daysAgo - 3, 1))
					: seed.status === 'lapsed'
						? daysAgo(Math.max(seed.daysAgo - 90, 1))
						: null;
		const inviteId = invitesByEmail.get(seed.email) ?? null;

		const { id } = await insertApplication({
			name: seed.name,
			email: seed.email,
			pronouns: seed.pronouns,
			githubUsername: seed.githubUsername,
			status: seed.status,
			source: seed.source,
			isPriority: seed.source === 'volunteer_invite',
			// Links each volunteer-invited application back to the Invite that
			// produced it, so /admin/waitlist shows a real chain rather than an
			// orphaned "Volunteer invite" badge.
			inviteId,
			referrer: seed.referrer ?? null,
			howDidYouHear: seed.howDidYouHear,
			journey: seed.journey,
			codeInterests: seed.codeInterests,
			virtualCoffee: seed.virtualCoffee,
			agreedToCocAt: submittedAt,
			submittedAt,
			waitlistedAt: submittedAt,
			coffeeInvitedAt: invitedAt,
			coffeeAttendedAt: attendedAt,
			approvedAt: attendedAt,
			closedAt,
			airtableRecordId: seed.airtableRecordId ?? null,
		});

		const event = (
			fields: Omit<Parameters<typeof applicationEventRow>[0], 'applicationId'>,
		) => applicationEventRow({ applicationId: id, ...fields });
		const by = (fields: Parameters<typeof event>[0]) =>
			event({ actorUserId: ADMIN.id, ...fields });

		if (seed.airtableRecordId) {
			await event({
				type: 'imported',
				toStatus: 'waitlisted',
				body: `Imported from Airtable (${seed.airtableRecordId})`,
				createdAt: submittedAt,
			});
			await event({
				type: 'waitlisted',
				toStatus: 'waitlisted',
				body: 'Waitlisted on import',
				createdAt: submittedAt,
			});
		} else {
			await event({
				type: 'submitted',
				toStatus: 'waitlisted',
				body: inviteId
					? `Application submitted from an invite by ${ADMIN.name}`
					: 'Application submitted',
				createdAt: submittedAt,
			});
		}

		if (inviteId) {
			await event(
				seed.slackNotificationFailed
					? {
							type: 'notification_failed',
							body: 'Slack notification failed: channel not found',
							createdAt: submittedAt,
						}
					: {
							type: 'notification_sent',
							body: 'Slack notified of an invited application',
							createdAt: submittedAt,
						},
			);
		}

		if (seed.note) {
			await by({
				type: 'note',
				body: seed.note,
				createdAt: daysAgo(Math.max(seed.daysAgo - 1, 1)),
			});
		}

		if (invitedAt) {
			if (seed.firstEmailFailed) {
				await by({
					type: 'email_failed',
					body: `Coffee invite to ${seed.email} failed: SMTP connection refused`,
					createdAt: daysAgo(Math.max(seed.daysAgo - 9, 1)),
				});
			}
			await by({
				type: 'coffee_invited',
				fromStatus: 'waitlisted',
				toStatus: 'coffee_invited',
				body: `Coffee invite emailed to ${seed.email}`,
				createdAt: invitedAt,
			});
		}

		if (attendedAt) {
			// Two actions, minutes apart, so the History keeps their order.
			const approvedAt = new Date(attendedAt.getTime() + 5 * 60 * 1000);
			await by({
				type: 'attendance_recorded',
				body: 'Attended a Coffee',
				createdAt: attendedAt,
			});
			await by({
				type: 'approved',
				fromStatus: 'coffee_invited',
				toStatus: 'member',
				body: `Membership approved; welcome and Slack invite emailed to ${seed.email}`,
				createdAt: approvedAt,
			});

			// The Slack join link minted at approval. A re-send supersedes it and
			// the live replacement is what the CLI prints; otherwise it was used.
			if (seed.slackInviteResent) {
				const resentAt = daysAgo(Math.max(seed.daysAgo - 20, 1));
				await insertInviteToken({
					applicationId: id,
					token: `seed-slack-superseded-${seed.githubUsername}`,
					createdAt: attendedAt,
					expiresAt: resentAt,
				});
				await insertInviteToken({
					applicationId: id,
					token: SLACK_TOKEN,
					createdAt: resentAt,
					expiresAt: daysAhead(28),
				});
				await by({
					type: 'email_sent',
					body: `Slack invite re-sent to ${seed.email}`,
					createdAt: resentAt,
				});
				slackToken = SLACK_TOKEN;
			} else {
				await insertInviteToken({
					applicationId: id,
					token: `seed-slack-used-${seed.githubUsername}`,
					createdAt: attendedAt,
					expiresAt: daysAgo(Math.max(seed.daysAgo - 47, 1)),
					usedAt: daysAgo(Math.max(seed.daysAgo - 18, 1)),
				});
			}
		}

		if (closedAt && past) {
			const from = invitedAt ? 'coffee_invited' : 'waitlisted';
			if (seed.status === 'withdrawn') {
				await by({
					type: 'withdrawn',
					fromStatus: from,
					toStatus: 'withdrawn',
					body: 'Withdrawn at the applicant’s request',
					createdAt: closedAt,
				});
			} else if (seed.status === 'declined') {
				await by({
					type: 'declined',
					fromStatus: from,
					toStatus: 'declined',
					body: 'Applying to recruit, not to join',
					createdAt: closedAt,
				});
			} else if (seed.status === 'lapsed') {
				await event({
					type: 'lapsed',
					fromStatus: from,
					toStatus: 'lapsed',
					body: 'Went cold with no decision',
					createdAt: closedAt,
				});
			}
		}
	}

	if (!slackToken)
		throw new Error('No application carries the live Slack token.');
	return { slackToken };
}

export const APPLICATION_COUNT = ALL_SEEDS.length;
