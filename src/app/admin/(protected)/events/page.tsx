import Link from 'next/link';

import { requirePermission, sessionCan } from '@/lib/adminAccess';
import { connectEventsCalendar } from '@/lib/eventsCalendar';

import { ReadOnlyNotice } from '../presentation';
import { EventsTable } from './eventsTable';
import { NotConfigured } from './presentation';
import { SeriesTable } from './seriesTable';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Events · Admin',
	robots: { index: false, follow: false },
};

export default async function EventsPage() {
	const session = await requirePermission('events', 'read');
	// The actions re-check; this only spares a read-only viewer the controls.
	const canManage = sessionCan(session, 'events', 'manage');

	const calendar = connectEventsCalendar();
	// Reads are live, not cached: a maintainer here wants the calendar as it
	// is, and each row's etag is what its Cancel or Reschedule will present.
	const [series, events] = calendar
		? await Promise.all([
				calendar.listSeries(),
				calendar.listUpcomingEvents({ days: 30 }),
			])
		: [[], []];

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
				<h1 className="h4 mb-0">Events</h1>
				{canManage ? (
					<div className="d-flex gap-2">
						<Link
							href="/admin/events/series/new"
							className="btn btn-sm btn-primary"
						>
							New Series
						</Link>
						<Link
							href="/admin/events/new"
							className="btn btn-sm btn-outline-primary"
						>
							New Event
						</Link>
					</div>
				) : (
					<ReadOnlyNotice />
				)}
			</div>
			<p className="text-body-secondary">
				The Events Calendar, as it is right now. Changes made here and in Google
				Calendar both land on it; /events catches up within a moment.
			</p>

			{!calendar && <NotConfigured />}

			<h2 className="h6 text-uppercase text-body-secondary mt-4">Series</h2>
			<SeriesTable rows={series} canManage={canManage} />

			<h2 className="h6 text-uppercase text-body-secondary mt-4">
				Next 30 days
			</h2>
			<EventsTable rows={events} canManage={canManage} />
		</div>
	);
}
