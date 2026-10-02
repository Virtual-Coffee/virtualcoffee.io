import type { ApplicationStatus } from '@/db';

// No runtime import of `@/db` here: client components read these lists.

export const QUEUE_STATUSES: ApplicationStatus[] = [
	'waitlisted',
	'coffee_invited',
];

/**
 * Everything the queue is not. The Waitlist is a working queue and the Archive
 * is its history (CONTEXT.md), so the two never show the same row.
 */
export const ARCHIVE_STATUSES: ApplicationStatus[] = [
	'member',
	'lapsed',
	'declined',
	'withdrawn',
];

export type LifecycleAction =
	| 'coffeeInvite'
	| 'recordAttendance'
	| 'approve'
	| 'resendSlackInvite'
	| 'close';

/**
 * What an application can have done to it from each status. `lifecycle.ts`
 * refuses anything else, and the action panel offers exactly these. `lapsed`
 * is terminal and only the import writes it; no action enters it.
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
};

export function can(status: ApplicationStatus, action: LifecycleAction) {
	return ACTIONS_FROM[status].includes(action);
}
