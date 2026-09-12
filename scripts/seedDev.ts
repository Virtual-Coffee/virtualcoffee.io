import { eq, inArray } from 'drizzle-orm';

import {
	db,
	applicationEvent,
	cocReport,
	coffeeTableGroupRequest,
	invite,
	lunchAndLearnIdea,
	membershipApplication,
	pendingGrant,
	submissionEvent,
	user,
	volunteer,
	volunteerInviteLedger,
	volunteerSignup,
} from '../src/db';
import type { InviteStatus, SubmissionStatus } from '../src/db/schema';
import { serialiseRoles } from '../src/lib/permissions';

/**
 * Seed the local development database.
 *
 * The prose below is written by hand rather than generated. Every screen in
 * /admin is built around reading four long answers, so lorem ipsum (or faker's
 * sentence generator) makes the layout impossible to judge: real answers vary
 * wildly in length, contain line breaks, and are the thing a reviewer is
 * actually looking at. The names are the ones used in the wireframes so a
 * seeded local site matches the design.
 *
 * Safe to re-run: it clears the membership, submission and (a scoped subset
 * of) user-management tables first. Never point this at anything but a local
 * database.
 */

type Seed = {
	name: string;
	email: string;
	pronouns: string;
	githubUsername: string;
	status:
		| 'waitlisted'
		| 'coffee_invited'
		| 'member'
		| 'declined'
		| 'withdrawn'
		| 'lapsed';
	source: 'waitlist_signup' | 'volunteer_invite';
	referrer?: string;
	daysAgo: number;
	howDidYouHear: string;
	journey: string;
	codeInterests: string;
	virtualCoffee: string;
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
		howDidYouHear:
			'A colleague who left for a startup would not stop talking about it. She sent me the newsletter and I read about four issues before applying.',
		journey:
			'I started in support at a fintech and talked my way into an internal-tools role after automating a chunk of my own job with some very questionable Python. That was four years ago.\n\nI have since done a proper stint on a platform team — Terraform, a lot of YAML, some Go — and I am now the person people come to for CI problems, which is either a promotion or a trap.',
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
		howDidYouHear: 'Someone shared the handbook in a Slack I am in.',
		journey:
			'I run a tiny agency with my sister — two developers, one designer, a lot of WordPress we are slowly escaping.',
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

function daysAgo(days: number) {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * The Slack member id the dev bypass acts as by default, so
 * `ADMIN_DEV_BYPASS_ROLES=volunteer` lands on a working /invites with no
 * further setup. Keep in step with `devBypassSession()` in
 * `src/lib/adminAccess.ts`.
 */
const DEV_BYPASS_SLACK_ID = 'U_DEV_BYPASS';

/**
 * Slack ids for the User Management seeds below. Chosen to collide with
 * neither the hardcoded volunteer ids above nor the 40 faker-generated
 * `U`-prefixed ids in `createSlackMembers()` (`src/data/mocks/slackMembers.ts`),
 * so the grant picker's mock directory stays untouched by this script.
 */
const PENDING_GRANT_SLACK_ID = 'U_DEV_PENDING_1';
const STRANDED_SLACK_ID = 'U_DEV_PENDING_2';
const STRANDED_USER_ID = 'dev-seed-stranded-user';

/**
 * The `user` and `pending_grant` rows this script owns. Both tables can also
 * hold rows from a contributor's own real local Slack sign-in or hand-testing
 * of the grant flow, and `session`/`account`/`devtools_user` all cascade from
 * `user.id` — so, unlike the membership tables above, these are cleared by id
 * rather than wholesale, to avoid silently signing someone out.
 */
const SEEDED_USER_IDS = ['dev-bypass', STRANDED_USER_ID];
const SEEDED_PENDING_GRANT_SLACK_IDS = [
	PENDING_GRANT_SLACK_ID,
	STRANDED_SLACK_ID,
];

/**
 * A `user` row for the identity `ADMIN_DEV_BYPASS` actually logs in as, plus
 * one ordinary and one "stranded" Pending Grant, so `/admin/user-management`
 * shows something real locally.
 *
 * `devBypassSession()` synthesizes its session in memory and never touches the
 * database, so without this the dev-bypass identity — the one every local
 * admin action is actually performed as — never appears in User Management no
 * matter what `ADMIN_DEV_BYPASS_ROLES` is set to. The seeded `role` here is
 * cosmetic: `requirePermission()` authorizes off `ADMIN_DEV_BYPASS_ROLES`, not
 * off this row, so changing it has no effect on what the dev bypass can do —
 * it only affects what the User Management screen displays.
 */
async function seedUserManagement(database: ReturnType<typeof db>) {
	await database.insert(user).values([
		{
			id: 'dev-bypass',
			name: 'Local dev',
			email: 'dev@localhost',
			emailVerified: true,
			// `volunteer` as well, because `seedVolunteers()` gives this identity a
			// `volunteer` row and a row without the role is the broken state
			// /admin/volunteers exists to prevent.
			role: serialiseRoles(['admin', 'volunteer']),
			slackUserId: DEV_BYPASS_SLACK_ID,
			roleGrantedBy: 'Seed script',
			roleGrantedAt: daysAgo(30),
		},
		{
			// Signed in once (hence the `user` row) but the claim wrote no roles,
			// and the grant below is still unclaimed — the edge case
			// `listAccessRows()` flags with `stranded: true`.
			id: STRANDED_USER_ID,
			name: 'Jordan Lee',
			email: 'jordan.lee@example.com',
			emailVerified: true,
			role: serialiseRoles([]),
			slackUserId: STRANDED_SLACK_ID,
		},
	]);

	await database.insert(pendingGrant).values([
		{
			slackUserId: PENDING_GRANT_SLACK_ID,
			slackDisplayName: 'Priya Fernandez',
			slackHandle: 'priyaf',
			role: serialiseRoles(['coc_reviewer', 'volunteer_coordinator']),
			grantedBy: 'Local dev',
			grantedAt: daysAgo(5),
		},
		{
			slackUserId: STRANDED_SLACK_ID,
			slackDisplayName: 'Jordan Lee',
			slackHandle: 'jlee',
			role: serialiseRoles(['admin']),
			grantedBy: 'Local dev',
			grantedAt: daysAgo(20),
		},
	]);
}

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
	{
		inviteeName: 'Priya Raman',
		inviteeEmail: 'priya@example.com',
		status: 'accepted',
		daysAgo: 4,
	},
	{
		inviteeName: 'Ade Balogun',
		inviteeEmail: 'ade@example.com',
		status: 'completed',
		daysAgo: 40,
	},
	{
		inviteeName: 'Sam Whitfield',
		inviteeEmail: 'sam@example.com',
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
 * it means seeding the movements that produce it. This adds up to 4 for the dev
 * bypass Volunteer: six imported, one accrued, five spent, two given back.
 */
async function seedVolunteers(database: ReturnType<typeof db>) {
	const period = new Date().toISOString().slice(0, 7);

	await database.insert(volunteer).values([
		{
			slackUserId: DEV_BYPASS_SLACK_ID,
			slackDisplayName: 'Local dev',
			slackHandle: 'localdev',
			roleLabels: 'VC Host, Coffee Table Group Leader',
			email: 'localdev@example.com',
			// Matches the `user` row seeded by `seedUserManagement()`, which runs
			// first — representing the identity as already linked, the way
			// `claimPendingGrant()` would leave it after a real Slack sign-in.
			userId: 'dev-bypass',
		},
		{
			slackUserId: 'U_DEV_FORMER',
			slackDisplayName: 'Former Volunteer',
			slackHandle: 'former',
			roleLabels: 'Notetaker',
			email: 'former@example.com',
			// Stepped back, so the daily job accrues nothing for them.
			deactivatedAt: daysAgo(60),
		},
	]);

	await database.insert(volunteerInviteLedger).values([
		{
			slackUserId: DEV_BYPASS_SLACK_ID,
			delta: 6,
			reason: 'imported',
			body: 'Balance carried over from Airtable',
			createdAt: daysAgo(200),
		},
		{
			slackUserId: DEV_BYPASS_SLACK_ID,
			delta: 1,
			reason: 'monthly_accrual',
			periodKey: period,
		},
		{
			slackUserId: 'U_DEV_FORMER',
			delta: 2,
			reason: 'imported',
			body: 'Balance carried over from Airtable',
			createdAt: daysAgo(200),
		},
		{
			slackUserId: 'U_DEV_FORMER',
			delta: -2,
			reason: 'admin_revoke',
			body: 'Stepped back from volunteering',
			createdAt: daysAgo(60),
		},
	]);

	const invitesByEmail = new Map<string, string>();

	for (const seed of INVITE_SEEDS) {
		const sentAt = daysAgo(seed.daysAgo);
		const live = seed.status === 'pending';

		const [row] = await database
			.insert(invite)
			.values({
				inviterSlackUserId: DEV_BYPASS_SLACK_ID,
				inviterName: 'Local dev',
				inviteeName: seed.inviteeName,
				inviteeEmail: seed.inviteeEmail,
				status: seed.status,
				// Only a pending Invite still has a usable Claim Link. The others
				// have had theirs cleared by redemption, cancellation or the sweep.
				tokenHash: live ? `seed-${seed.inviteeEmail}` : null,
				tokenExpiresAt: live ? daysAgo(seed.daysAgo - 90) : null,
				claimedAt:
					seed.status === 'accepted' || seed.status === 'completed'
						? daysAgo(seed.daysAgo - 1)
						: null,
				createdAt: sentAt,
			})
			.returning({ id: invite.id });

		// Only an Invite that was actually claimed has an application to link to.
		// Mapping a cancelled or expired one would produce a chain that cannot
		// happen: the application exists, so the Invite was never unclaimed.
		if (seed.status === 'accepted' || seed.status === 'completed') {
			invitesByEmail.set(seed.inviteeEmail, row.id);
		}

		await database.insert(volunteerInviteLedger).values({
			slackUserId: DEV_BYPASS_SLACK_ID,
			delta: -1,
			reason: 'spend',
			inviteId: row.id,
			body: `Invited ${seed.inviteeName} <${seed.inviteeEmail}>`,
			createdAt: sentAt,
		});

		// An Invite that will never be claimed gives the allowance back.
		if (seed.status === 'expired' || seed.status === 'cancelled') {
			await database.insert(volunteerInviteLedger).values({
				slackUserId: DEV_BYPASS_SLACK_ID,
				delta: 1,
				reason:
					seed.status === 'expired' ? 'refund_expired' : 'refund_cancelled',
				inviteId: row.id,
				body: seed.status === 'expired' ? 'Expired unclaimed' : 'Cancelled',
				createdAt: daysAgo(Math.max(seed.daysAgo - 90, 1)),
			});
		}
	}

	return invitesByEmail;
}

/**
 * CoC Reports: one per status. Includes the two states an admin cannot
 * produce by hand — an anonymous report (`name`/`email` both null, a form
 * convention, not a schema constraint) and a failed Slack notification (the
 * warning banner on the CoC list) — plus one maintainer note, so the history
 * timeline has a real note to render, and one attachment, so the "has
 * attachment" link renders (it 404s locally with no real blob behind it —
 * accepted, not a bug to chase).
 */
type CocReportSeed = {
	status: SubmissionStatus;
	daysAgo: number;
	name: string | null;
	email: string | null;
	reporteeName: string;
	timeLocation: string;
	description: string;
	anyoneElseInvolved?: string;
	attachment?: {
		blobKey: string;
		filename: string;
		contentType: string;
		size: number;
	};
	note?: string;
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
		attachment: {
			blobKey: 'seed/coc-report-screenshot.png',
			filename: 'screenshot.png',
			contentType: 'image/png',
			size: 245_678,
		},
	},
	{
		status: 'new',
		daysAgo: 1,
		name: null,
		email: null,
		reporteeName: 'Prefer not to say',
		timeLocation:
			'A coffee group this week — I would rather not say which one.',
		description:
			'Someone made a comment that assumed everyone in the group was early-career and dismissed a point I made because of it. I do not want to escalate, I just want it on record.',
	},
];

async function seedCocReports(database: ReturnType<typeof db>) {
	for (const seed of COC_REPORT_SEEDS) {
		const submittedAt = daysAgo(seed.daysAgo);

		const [row] = await database
			.insert(cocReport)
			.values({
				status: seed.status,
				submittedAt,
				name: seed.name,
				email: seed.email,
				reporteeName: seed.reporteeName,
				timeLocation: seed.timeLocation,
				description: seed.description,
				anyoneElseInvolved: seed.anyoneElseInvolved ?? null,
				attachmentBlobKey: seed.attachment?.blobKey ?? null,
				attachmentFilename: seed.attachment?.filename ?? null,
				attachmentContentType: seed.attachment?.contentType ?? null,
				attachmentSize: seed.attachment?.size ?? null,
			})
			.returning({ id: cocReport.id });

		await database.insert(submissionEvent).values({
			cocReportId: row.id,
			type: 'submitted',
			toStatus: 'new',
			createdAt: submittedAt,
		});

		// A note, when present, happens before the status settles — the
		// maintainer talks to the reportee first, then closes it out.
		if (seed.note) {
			await database.insert(submissionEvent).values({
				cocReportId: row.id,
				actorUserId: 'dev-bypass',
				type: 'note',
				body: seed.note,
				createdAt: daysAgo(Math.max(seed.daysAgo - 1, 1)),
			});
		}

		if (seed.status === 'in_progress') {
			await database.insert(submissionEvent).values({
				cocReportId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: 'in_progress',
				createdAt: daysAgo(Math.max(seed.daysAgo - 1, 1)),
			});
		}

		if (seed.status === 'resolved' || seed.status === 'dismissed') {
			const closedAt = daysAgo(Math.max(seed.daysAgo - (seed.note ? 2 : 1), 1));
			await database.insert(submissionEvent).values({
				cocReportId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: seed.status,
				createdAt: closedAt,
			});
			await database
				.update(cocReport)
				.set({ closedAt })
				.where(eq(cocReport.id, row.id));
		}

		// Anonymous report: the Slack post to the private CoC channel failed —
		// the state that lights up the failed-notification warning banner.
		if (seed.status === 'new' && seed.name === null) {
			await database.insert(submissionEvent).values({
				cocReportId: row.id,
				type: 'notification_failed',
				body: 'Slack notification failed: channel not found.',
				createdAt: submittedAt,
			});
		}
	}
}

/** Volunteer Signups: one per status, including one with no `position` given. */
type VolunteerSignupSeed = {
	status: SubmissionStatus;
	daysAgo: number;
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

async function seedVolunteerSignups(database: ReturnType<typeof db>) {
	for (const seed of VOLUNTEER_SIGNUP_SEEDS) {
		const submittedAt = daysAgo(seed.daysAgo);

		const [row] = await database
			.insert(volunteerSignup)
			.values({
				status: seed.status,
				submittedAt,
				name: seed.name,
				email: seed.email,
				githubUsername: seed.githubUsername,
				position: seed.position,
				description: seed.description,
			})
			.returning({ id: volunteerSignup.id });

		await database.insert(submissionEvent).values({
			volunteerSignupId: row.id,
			type: 'submitted',
			toStatus: 'new',
			createdAt: submittedAt,
		});

		if (seed.status === 'in_progress') {
			await database.insert(submissionEvent).values({
				volunteerSignupId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: 'in_progress',
				createdAt: daysAgo(Math.max(seed.daysAgo - 1, 1)),
			});
		}

		if (seed.status === 'resolved' || seed.status === 'dismissed') {
			const closedAt = daysAgo(Math.max(seed.daysAgo - 1, 1));
			await database.insert(submissionEvent).values({
				volunteerSignupId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: seed.status,
				createdAt: closedAt,
			});
			await database
				.update(volunteerSignup)
				.set({ closedAt })
				.where(eq(volunteerSignup.id, row.id));
		}
	}
}

/**
 * Lunch & Learn Ideas: one per status, including both states of
 * `githubIssueUrl` — set when `createLunchAndLearnIssue()` succeeds, null
 * (the default local state, with no GitHub App credentials) when it doesn't.
 */
type LunchAndLearnIdeaSeed = {
	status: SubmissionStatus;
	daysAgo: number;
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

async function seedLunchAndLearnIdeas(database: ReturnType<typeof db>) {
	for (const seed of LUNCH_AND_LEARN_IDEA_SEEDS) {
		const submittedAt = daysAgo(seed.daysAgo);

		const [row] = await database
			.insert(lunchAndLearnIdea)
			.values({
				status: seed.status,
				submittedAt,
				name: seed.name,
				email: seed.email,
				topic: seed.topic,
				description: seed.description,
				format: seed.format,
				timing: seed.timing,
				githubIssueUrl: seed.githubIssueUrl,
			})
			.returning({ id: lunchAndLearnIdea.id });

		await database.insert(submissionEvent).values({
			lunchAndLearnIdeaId: row.id,
			type: 'submitted',
			toStatus: 'new',
			createdAt: submittedAt,
		});

		if (seed.status === 'in_progress') {
			await database.insert(submissionEvent).values({
				lunchAndLearnIdeaId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: 'in_progress',
				createdAt: daysAgo(Math.max(seed.daysAgo - 1, 1)),
			});
		}

		if (seed.status === 'resolved' || seed.status === 'dismissed') {
			const closedAt = daysAgo(Math.max(seed.daysAgo - 1, 1));
			await database.insert(submissionEvent).values({
				lunchAndLearnIdeaId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: seed.status,
				createdAt: closedAt,
			});
			await database
				.update(lunchAndLearnIdea)
				.set({ closedAt })
				.where(eq(lunchAndLearnIdea.id, row.id));
		}
	}
}

/** Coffee Table Group Requests: one per status, including a null `groupName`. */
type CoffeeTableGroupRequestSeed = {
	status: SubmissionStatus;
	daysAgo: number;
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

async function seedCoffeeTableGroupRequests(database: ReturnType<typeof db>) {
	for (const seed of COFFEE_TABLE_GROUP_REQUEST_SEEDS) {
		const submittedAt = daysAgo(seed.daysAgo);

		const [row] = await database
			.insert(coffeeTableGroupRequest)
			.values({
				status: seed.status,
				submittedAt,
				name: seed.name,
				email: seed.email,
				groupName: seed.groupName,
				description: seed.description,
			})
			.returning({ id: coffeeTableGroupRequest.id });

		await database.insert(submissionEvent).values({
			coffeeTableGroupRequestId: row.id,
			type: 'submitted',
			toStatus: 'new',
			createdAt: submittedAt,
		});

		if (seed.status === 'in_progress') {
			await database.insert(submissionEvent).values({
				coffeeTableGroupRequestId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: 'in_progress',
				createdAt: daysAgo(Math.max(seed.daysAgo - 1, 1)),
			});
		}

		if (seed.status === 'resolved' || seed.status === 'dismissed') {
			const closedAt = daysAgo(Math.max(seed.daysAgo - 1, 1));
			await database.insert(submissionEvent).values({
				coffeeTableGroupRequestId: row.id,
				actorUserId: 'dev-bypass',
				type: 'status_changed',
				fromStatus: 'new',
				toStatus: seed.status,
				createdAt: closedAt,
			});
			await database
				.update(coffeeTableGroupRequest)
				.set({ closedAt })
				.where(eq(coffeeTableGroupRequest.id, row.id));
		}
	}
}

async function main() {
	if (process.env.CONTEXT === 'production') {
		throw new Error('Refusing to seed a production database.');
	}

	const database = db();

	// Events cascade from applications, so one delete is enough there. The
	// ledger and the invites do not cascade — both foreign keys are ON DELETE
	// SET NULL, which is right in production and would leave orphans here — so
	// they are cleared explicitly, ledger first because it points at invites.
	await database.delete(membershipApplication);
	await database.delete(volunteerInviteLedger);
	await database.delete(invite);
	await database.delete(volunteer);

	// submission_event cascades from all four tables below (ON DELETE CASCADE),
	// so clearing the parents is enough — no separate ledger-style delete.
	await database.delete(cocReport);
	await database.delete(volunteerSignup);
	await database.delete(lunchAndLearnIdea);
	await database.delete(coffeeTableGroupRequest);

	// Scoped by id/slackUserId rather than wholesale — see the comment on
	// SEEDED_USER_IDS above.
	await database
		.delete(pendingGrant)
		.where(inArray(pendingGrant.slackUserId, SEEDED_PENDING_GRANT_SLACK_IDS));
	await database.delete(user).where(inArray(user.id, SEEDED_USER_IDS));

	// Runs before seedVolunteers(), which links the dev-bypass Volunteer to the
	// `user` row seeded here.
	await seedUserManagement(database);

	const invitesByEmail = await seedVolunteers(database);

	for (const seed of SEEDS) {
		const submittedAt = daysAgo(seed.daysAgo);
		const invitedAt =
			seed.status === 'coffee_invited' ||
			seed.status === 'member' ||
			seed.status === 'withdrawn'
				? daysAgo(Math.max(seed.daysAgo - 10, 1))
				: null;
		const attendedAt =
			seed.status === 'member' ? daysAgo(Math.max(seed.daysAgo - 17, 1)) : null;

		const [row] = await database
			.insert(membershipApplication)
			.values({
				name: seed.name,
				email: seed.email,
				pronouns: seed.pronouns,
				githubUsername: seed.githubUsername,
				status: seed.status,
				source: seed.source,
				isPriority: seed.source === 'volunteer_invite',
				// Links the two invited applications back to the Invite that produced
				// them, so /admin/waitlist shows a real chain rather than an orphaned
				// "Volunteer invite" badge.
				inviteId: invitesByEmail.get(seed.email) ?? null,
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
				closedAt: seed.status === 'withdrawn' ? daysAgo(1) : null,
			})
			.returning({ id: membershipApplication.id });

		await database.insert(applicationEvent).values({
			applicationId: row.id,
			type: 'submitted',
			toStatus: 'waitlisted',
			body: 'Application submitted',
			createdAt: submittedAt,
		});

		if (invitedAt) {
			await database.insert(applicationEvent).values({
				applicationId: row.id,
				type: 'coffee_invited',
				fromStatus: 'waitlisted',
				toStatus: 'coffee_invited',
				body: `Coffee invite emailed to ${seed.email}`,
				createdAt: invitedAt,
			});
		}

		if (attendedAt) {
			await database.insert(applicationEvent).values({
				applicationId: row.id,
				type: 'approved',
				fromStatus: 'coffee_invited',
				toStatus: 'member',
				body: `Membership approved; Slack invite emailed to ${seed.email}`,
				createdAt: attendedAt,
			});
		}
	}

	await seedCocReports(database);
	await seedVolunteerSignups(database);
	await seedLunchAndLearnIdeas(database);
	await seedCoffeeTableGroupRequests(database);

	const totalSubmissions =
		COC_REPORT_SEEDS.length +
		VOLUNTEER_SIGNUP_SEEDS.length +
		LUNCH_AND_LEARN_IDEA_SEEDS.length +
		COFFEE_TABLE_GROUP_REQUEST_SEEDS.length;

	console.log(
		`Seeded ${SEEDS.length} membership applications, 2 volunteers, ${INVITE_SEEDS.length} invites, ` +
			`${totalSubmissions} submissions across 4 kinds, 2 users and 2 pending grants.`,
	);
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
