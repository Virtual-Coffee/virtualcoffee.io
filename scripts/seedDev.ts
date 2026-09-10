import {
	db,
	applicationEvent,
	invite,
	membershipApplication,
	volunteer,
	volunteerInviteLedger,
} from '../src/db';
import type { InviteStatus } from '../src/db/schema';

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
 * Safe to re-run: it clears the membership tables first. Never point this at
 * anything but a local database.
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
		},
		{
			slackUserId: 'U_DEV_FORMER',
			slackDisplayName: 'Former Volunteer',
			slackHandle: 'former',
			roleLabels: 'Notetaker',
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

	console.log(
		`Seeded ${SEEDS.length} membership applications, 2 volunteers and ${INVITE_SEEDS.length} invites.`,
	);
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
