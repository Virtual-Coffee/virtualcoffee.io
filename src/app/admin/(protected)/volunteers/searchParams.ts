import { oneOf, type RawSearchParams } from '../searchParams';

export const VOLUNTEER_STATES = ['active', 'paused', 'all'] as const;

export type VolunteerState = (typeof VOLUNTEER_STATES)[number];

/**
 * Active by default: the question a maintainer arrives with is "who can send
 * invites right now?", and most of the roster has stepped back.
 */
export const DEFAULT_VOLUNTEER_STATE: VolunteerState = 'active';

export function parseVolunteerState(params: RawSearchParams): VolunteerState {
	return oneOf(params.state, VOLUNTEER_STATES) ?? DEFAULT_VOLUNTEER_STATE;
}

/** Whether a row belongs in the current view. `deactivated_at` is the state. */
export function matchesState(
	state: VolunteerState,
	deactivatedAt: Date | null,
): boolean {
	if (state === 'all') return true;
	return state === 'active' ? deactivatedAt === null : deactivatedAt !== null;
}
