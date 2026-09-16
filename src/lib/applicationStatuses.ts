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
