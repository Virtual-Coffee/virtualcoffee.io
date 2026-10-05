import type { ApplicationStatus } from '@/db';

// No runtime import of `@/db` here: client components read these lists.

export const QUEUE_STATUSES: ApplicationStatus[] = [
	'waitlisted',
	'coffee_invited',
];

/**
 * Applications that are finished. The Waitlist is a working queue, the Archive
 * is its history and Quarantine holds suspected spam (CONTEXT.md), so no two
 * of the three show the same row.
 */
export const ARCHIVE_STATUSES: ApplicationStatus[] = [
	'member',
	'lapsed',
	'declined',
	'withdrawn',
];

/** Held for a human to release to the Waitlist or decline; never in the queue. */
export const QUARANTINE_STATUSES: ApplicationStatus[] = ['suspected_spam'];

export type LifecycleAction =
	| 'coffeeInvite'
	| 'recordAttendance'
	| 'approve'
	| 'resendSlackInvite'
	| 'release'
	| 'close';

/**
 * What an application can have done to it from each status. `lifecycle.ts`
 * refuses anything else, and the action panel offers exactly these. `lapsed`
 * is terminal and only the import writes it; no action enters it, and nothing
 * but the /join heuristic enters `suspected_spam`.
 */
export const ACTIONS_FROM: Record<
	ApplicationStatus,
	readonly LifecycleAction[]
> = {
	waitlisted: ['coffeeInvite', 'close'],
	coffee_invited: ['recordAttendance', 'approve', 'close'],
	member: ['resendSlackInvite'],
	lapsed: [],
	declined: [],
	withdrawn: [],
	suspected_spam: ['release', 'close'],
};

export function can(status: ApplicationStatus, action: LifecycleAction) {
	return ACTIONS_FROM[status].includes(action);
}
