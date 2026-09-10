/**
 * The roster's own search-param parser.
 *
 * A sibling of the waitlist's and the submissions' parsers rather than a
 * generalisation of them — those two say the same thing about each other, and
 * what they actually share is the discipline: every value reaching this screen
 * is whitelisted, and anything unrecognised falls back to the default rather
 * than being passed along.
 */

export const VOLUNTEER_STATES = ['active', 'paused', 'all'] as const;

export type VolunteerState = (typeof VOLUNTEER_STATES)[number];

/**
 * Active is the default, and the reason is what this screen is for: the
 * question a maintainer arrives with is "who can send invites right now?".
 * Two thirds of the roster is people who have stepped back — 66 of the 91 that
 * come across from Airtable — so showing everything by default would bury the
 * answer under people it does not apply to.
 */
export const DEFAULT_VOLUNTEER_STATE: VolunteerState = 'active';

function isState(value: string): value is VolunteerState {
	return (VOLUNTEER_STATES as readonly string[]).includes(value);
}

export function parseVolunteerState(
	params: Record<string, string | string[] | undefined>,
): VolunteerState {
	const raw = params.state;
	const value = Array.isArray(raw) ? raw[0] : raw;

	if (typeof value === 'string' && isState(value)) return value;

	return DEFAULT_VOLUNTEER_STATE;
}

/** Whether a row belongs in the current view. `deactivated_at` is the state. */
export function matchesState(
	state: VolunteerState,
	deactivatedAt: Date | null,
): boolean {
	if (state === 'all') return true;
	return state === 'active' ? deactivatedAt === null : deactivatedAt !== null;
}
