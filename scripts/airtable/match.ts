import type { SlackMember } from '../../src/data/slackMembers';

/**
 * Scoring an Airtable volunteer against the Slack directory.
 *
 * Apart from `importVolunteers.ts` because that script runs on import. The
 * output only orders a list a maintainer reads — see docs/adr/0012.
 */

export type Candidate = {
	slackUserId: string;
	displayName: string;
	handle: string;
	score: number;
	why: string[];
};

/** The fields of a mapping entry the scorer reads. */
export type MatchInput = {
	name: string;
	profileName: string | null;
	githubUsername: string | null;
	email: string | null;
};

/** Trim, lowercase, strip punctuation — one username really does end in a space. */
export function normalise(value: string | null): string {
	return (value ?? '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '');
}

/**
 * Score one Slack member against one Airtable volunteer.
 *
 * Weighted so that an identifier beats a name: two people can share "Meg", but
 * a GitHub handle and an email local-part are close to unique. Nothing here
 * decides anything — the score only orders the list a human reads.
 *
 * ADR 0009 says access matching is never on email. That rule is about
 * *authorisation at sign-in*, where the address is whatever Slack happens to
 * return and a mismatch fails silently. This is a one-off migration where every
 * row is confirmed by a person before it is written, which is a different act;
 * the email is simply the highest-signal field available and ignoring it would
 * mean more ambiguous rows to resolve by hand.
 */
export function score(
	member: SlackMember,
	entry: MatchInput,
): Candidate | null {
	const why: string[] = [];
	let total = 0;

	const github = normalise(entry.githubUsername);
	if (github && github === normalise(member.handle)) {
		total += 50;
		why.push('github matches slack handle');
	}

	const emailLocal = normalise(entry.email?.split('@')[0] ?? null);
	if (emailLocal && emailLocal === normalise(member.handle)) {
		total += 30;
		why.push('email local-part matches slack handle');
	}

	const profile = normalise(entry.profileName);
	if (
		profile &&
		(profile === normalise(member.name) ||
			profile === normalise(member.displayName))
	) {
		total += 40;
		why.push('full name matches');
	}

	const short = normalise(entry.name);
	if (short && short.length > 2) {
		if (
			short === normalise(member.displayName) ||
			short === normalise(member.name)
		) {
			total += 20;
			why.push('name matches');
		} else if (
			normalise(member.name).startsWith(short) ||
			normalise(member.displayName).startsWith(short)
		) {
			total += 8;
			why.push('name is a prefix');
		}
	}

	if (total === 0) return null;

	return {
		slackUserId: member.id,
		displayName: member.displayName,
		handle: member.handle,
		score: total,
		why,
	};
}

/** A single candidate this strong is almost certainly right; anything else waits. */
export const CONFIDENT_SCORE = 50;
