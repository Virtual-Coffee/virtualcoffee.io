import type { ApplicationSource, ApplicationStatus } from '@/db';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
	waitlisted: 'Waitlisted',
	coffee_invited: 'Coffee invited',
	member: 'Member',
	declined: 'Declined',
	withdrawn: 'Withdrawn',
	lapsed: 'Lapsed',
};

// `lapsed` is deliberately muted rather than red: nobody decided anything, and
// colouring it like a rejection would misrepresent ~1,378 people.
const STATUS_CLASSES: Record<ApplicationStatus, string> = {
	waitlisted: 'text-bg-warning',
	coffee_invited: 'text-bg-info',
	member: 'text-bg-success',
	declined: 'text-bg-danger',
	withdrawn: 'text-bg-secondary',
	lapsed: 'text-bg-light border',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
	return (
		<span className={`badge ${STATUS_CLASSES[status]}`}>
			{STATUS_LABELS[status]}
		</span>
	);
}

export function SourceBadge({ source }: { source: ApplicationSource }) {
	return source === 'volunteer_invite' ? (
		<span className="badge text-bg-primary">Volunteer invite</span>
	) : (
		<span className="badge text-bg-light border">Waitlist signup</span>
	);
}

export function statusLabel(status: ApplicationStatus) {
	return STATUS_LABELS[status];
}

/**
 * The same words `SourceBadge` uses, without the badge, for details lists.
 */
export function sourceLabel(source: ApplicationSource) {
	return source === 'volunteer_invite' ? 'Volunteer invite' : 'Waitlist signup';
}

/**
 * Why a row on the User Management screen has no user behind it yet.
 *
 * `pending` is the normal case — a Pending Grant waiting for its first
 * sign-in. `stranded` is the rare one: they signed in, but the claim did not
 * apply, so the roles somebody chose for them need setting by hand.
 */
export function AccessStateBadge({ state }: { state: 'pending' | 'stranded' }) {
	return state === 'pending' ? (
		<span className="badge text-bg-light border">
			Hasn&rsquo;t signed in yet
		</span>
	) : (
		<span className="badge text-bg-warning">Grant not applied</span>
	);
}

/**
 * How an application's event log reads on the detail screen. Kept here beside
 * the status labels, and symmetric with `SUBMISSION_EVENT_LABELS` in the
 * submissions section's own presentation module.
 */
export const EVENT_LABELS: Record<string, string> = {
	submitted: 'Application submitted',
	imported: 'Imported from Airtable',
	waitlisted: 'Added to the waitlist',
	coffee_invited: 'Sent a Coffee invite',
	attendance_recorded: 'Recorded attendance',
	approved: 'Approved membership',
	declined: 'Declined',
	withdrawn: 'Marked withdrawn',
	lapsed: 'Marked lapsed',
	note: 'added a note',
	email_sent: 'Email sent',
	email_failed: 'Email failed',
	notification_sent: 'Slack notified',
	notification_failed: 'Slack notification failed',
};

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

export function formatDate(value: Date | null) {
	return value ? DATE_FORMAT.format(value) : '—';
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
});

export function formatDateTime(value: Date | null) {
	return value ? DATE_TIME_FORMAT.format(value) : '—';
}

/** Shown where a control would be, for a viewer who holds `read` but not `manage`. */
export function ReadOnlyNotice() {
	return (
		<p className="small text-body-secondary mb-0">
			You have read-only access to this section.
		</p>
	);
}

/**
 * One free-text answer from a form, or the fact that it was skipped. The
 * heading level follows the screen: the detail page's are h2, the drawer's
 * sit under the drawer's own heading.
 */
export function Answer({
	label,
	value,
	heading: Heading = 'h2',
	spacing = 'mb-4',
}: {
	label: string;
	value: string | null;
	heading?: 'h2' | 'h3';
	spacing?: 'mb-3' | 'mb-4';
}) {
	return (
		<section className={spacing}>
			<Heading className="h6 text-body-secondary">{label}</Heading>
			{value ? (
				<p className="admin-answer mb-0">{value}</p>
			) : (
				<p className="text-body-secondary fst-italic mb-0">No answer given</p>
			)}
		</section>
	);
}
