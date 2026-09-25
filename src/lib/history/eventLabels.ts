import type {
	ApplicationEventType,
	SubmissionEventType,
	VolunteerEventType,
} from '@/db';

/**
 * History's labels, apart from the writes in `eventLog.ts` because the
 * timelines and the dashboard feed are client components and must not pull
 * the database in.
 */

/**
 * How an event type reads. `sentence` follows the actor's name on an
 * application's History ("Ada Sent a Coffee invite"); `badge` stands alone on
 * a Submission's History and on the dashboard feed, which already shows the
 * subject beside it. Keyed by the three enums together, so a new type without
 * a label is a type error.
 */
export const EVENT_LABELS: Record<
	ApplicationEventType | SubmissionEventType | VolunteerEventType,
	{ sentence: string; badge: string }
> = {
	submitted: { sentence: 'Application submitted', badge: 'Submitted' },
	imported: {
		sentence: 'Imported from Airtable',
		badge: 'Imported from Airtable',
	},
	waitlisted: { sentence: 'Added to the waitlist', badge: 'Waitlisted' },
	coffee_invited: { sentence: 'Sent a Coffee invite', badge: 'Coffee invited' },
	attendance_recorded: {
		sentence: 'Recorded attendance',
		badge: 'Attendance recorded',
	},
	approved: { sentence: 'Approved membership', badge: 'Approved' },
	declined: { sentence: 'Declined', badge: 'Declined' },
	withdrawn: { sentence: 'Marked withdrawn', badge: 'Withdrawn' },
	lapsed: { sentence: 'Marked lapsed', badge: 'Lapsed' },
	status_changed: { sentence: 'Changed the status', badge: 'Status changed' },
	note: { sentence: 'added a note', badge: 'Note' },
	email_sent: { sentence: 'Email sent', badge: 'Email sent' },
	email_failed: { sentence: 'Email failed', badge: 'Email failed' },
	// Channel-neutral: a Lunch & Learn idea is also announced as a GitHub issue,
	// and the body names which.
	notification_sent: { sentence: 'Notified', badge: 'Notified' },
	notification_failed: {
		sentence: 'Notification failed',
		badge: 'Notification failed',
	},
};

/** The label for a type read back from the database, or the type itself if it has none. */
export function eventLabel(type: string, form: 'sentence' | 'badge'): string {
	return (
		(EVENT_LABELS as Record<string, { sentence: string; badge: string }>)[
			type
		]?.[form] ?? type
	);
}
