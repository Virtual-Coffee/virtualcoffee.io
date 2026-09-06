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

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

export function formatDate(value: Date | null) {
	return value ? DATE_FORMAT.format(value) : '—';
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
});

export function formatDateTime(value: Date | null) {
	return value ? DATE_TIME_FORMAT.format(value) : '—';
}
