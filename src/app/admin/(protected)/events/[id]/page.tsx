import { notFound, redirect } from 'next/navigation';

import { requirePermission } from '@/lib/access/adminAccess';
import {
	connectEventsCalendar,
	isCalendarEventId,
} from '@/lib/events/eventsCalendar';

import { Breadcrumb } from '../../presentation';
import { EventForm } from '../eventForm';
import { EventStatusBadge, NotConfigured } from '../presentation';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Edit Event · Admin',
	robots: { index: false, follow: false },
};

export default async function EditEventPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requirePermission('events', 'manage');
	const { id } = await params;
	if (!isCalendarEventId(id)) notFound();

	const calendar = connectEventsCalendar();
	if (!calendar) {
		return (
			<div className="container-fluid px-3 px-lg-4 py-4">
				<Breadcrumb
					parent={{ href: '/admin/events', label: 'Events' }}
					current="Event"
				/>
				<NotConfigured />
			</div>
		);
	}

	const event = await calendar.getEvent(id);
	if (!event) notFound();
	// A Series, or an Event of one, is edited as its Series.
	if ('seriesId' in event) redirect(`/admin/events/series/${event.seriesId}`);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<Breadcrumb
				parent={{ href: '/admin/events', label: 'Events' }}
				current={event.title}
			/>
			<div className="d-flex flex-wrap align-items-center gap-3 mb-3">
				<h1 className="h4 mb-0">{event.title}</h1>
				<EventStatusBadge
					event={{ status: event.status, rescheduled: false, seriesId: null }}
				/>
				{event.htmlLink && (
					<a
						href={event.htmlLink}
						className="small"
						target="_blank"
						rel="noreferrer"
					>
						Open in Google Calendar
					</a>
				)}
			</div>
			<div className="row g-4">
				<div className="col-lg-7">
					{/* Keyed on the etag so a refresh after a save resets the draft. */}
					<EventForm key={event.etag} event={event} />
				</div>
			</div>
		</div>
	);
}
