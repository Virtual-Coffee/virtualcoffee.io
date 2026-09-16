import type { AdminEvent } from '@/lib/eventsCalendar';
import { dateForDisplay } from '@/util/date';

/** "Tue, Sep 15" — always the display zone. */
export function eventDate(start: string): string {
	return dateForDisplay(start, 'EEE, LLL d');
}

/**
 * "9:00 AM–10:00 AM EDT". An Event that crosses local midnight names the
 * end's day too.
 */
export function eventTime(start: string, end: string): string {
	const sameDay =
		dateForDisplay(start, 'yyyy-LL-dd') === dateForDisplay(end, 'yyyy-LL-dd');
	const endLabel = sameDay
		? dateForDisplay(end, 't ZZZZ')
		: `${eventDate(end)} ${dateForDisplay(end, 't ZZZZ')}`;
	return `${dateForDisplay(start, 't')}–${endLabel}`;
}

/** "Tue, Sep 15 · 9:00 AM–10:00 AM EDT", for a select option or a confirm. */
export function eventWhen(start: string, end: string): string {
	return `${eventDate(start)} · ${eventTime(start, end)}`;
}

/**
 * The same, stacked: the date, the time as subtext, and where the Event was
 * moved from when `originalStart` is given.
 */
export function EventWhen({
	start,
	end,
	struck,
	originalStart,
}: {
	start: string;
	end: string;
	struck?: boolean;
	originalStart?: string | null;
}) {
	const Text = struck ? 's' : 'span';
	return (
		<>
			<Text>{eventDate(start)}</Text>
			<div className="small text-body-secondary">
				<Text>{eventTime(start, end)}</Text>
			</div>
			{originalStart && (
				<div className="small text-body-secondary">
					Was {eventDate(originalStart)} · {dateForDisplay(originalStart, 't')}
				</div>
			)}
		</>
	);
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

export function NotConfigured() {
	return (
		<div className="alert alert-warning" role="status">
			The Events Calendar is not configured here: set{' '}
			<code>GOOGLE_SERVICE_ACCOUNT_KEY</code> and{' '}
			<code>GOOGLE_CALENDAR_ID</code> to see it.
		</div>
	);
}
