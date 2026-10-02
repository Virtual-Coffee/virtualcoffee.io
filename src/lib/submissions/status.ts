import type { SubmissionStatus } from '@/db';

// Kept apart from submissions.ts: the status control is a client component,
// and that module reaches the database.

export const STATUS_ORDER: SubmissionStatus[] = [
	'new',
	'in_progress',
	'resolved',
	'dismissed',
];

/**
 * The columns a status change writes. `closedAt` records when it stopped
 * needing attention, so reopening clears it rather than leaving a date that is
 * no longer true, and moving between the two closed statuses keeps the
 * original.
 */
export function nextState(
	current: { closedAt: Date | null },
	next: SubmissionStatus,
	now: Date = new Date(),
): { status: SubmissionStatus; closedAt: Date | null } {
	const closed = next === 'resolved' || next === 'dismissed';
	return { status: next, closedAt: closed ? (current.closedAt ?? now) : null };
}
