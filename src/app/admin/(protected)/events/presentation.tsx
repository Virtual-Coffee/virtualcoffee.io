import type { AdminEvent } from '@/lib/eventsCalendar';
import { dateForDisplay } from '@/util/date';

/** "Tue, Sep 15 · 9:00 AM–10:00 AM EDT" — always the display zone. */
export function eventWhen(start: string, end: string): string {
	return `${dateForDisplay(start, 'EEE, LLL d')} · ${dateForDisplay(start, 't')}–${dateForDisplay(end, 't ZZZZ')}`;
}

export function EventStatusBadge({
	event,
}: {
	event: Pick<AdminEvent, 'status' | 'rescheduled' | 'seriesId'>;
}) {
	if (event.status === 'cancelled') {
		return <span className="badge text-bg-secondary">Cancelled</span>;
	}
	if (event.rescheduled) {
		return <span className="badge text-bg-warning">Rescheduled</span>;
	}
	if (!event.seriesId) {
		return <span className="badge text-bg-light border">One-off</span>;
	}
	return null;
}

/** Sentence case for `rrule`'s lowercase text. */
export function sentence(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function NotConfigured() {
	return (
		<div className="alert alert-warning" role="status">
			The Events Calendar is not configured here: set{' '}
			<code>GOOGLE_SERVICE_ACCOUNT_KEY</code> and{' '}
			<code>GOOGLE_CALENDAR_ID</code> to see it.
		</div>
	);
}
