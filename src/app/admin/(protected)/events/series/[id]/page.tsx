import { notFound } from 'next/navigation';

import { requirePermission } from '@/lib/adminAccess';
import { connectEventsCalendar, isCalendarEventId } from '@/lib/eventsCalendar';

import { EventsBreadcrumb } from '../../breadcrumb';
import { EndSeriesSection } from '../../endSeriesSection';
import { NotConfigured } from '../../presentation';
import { SeriesChangedEvents } from '../../seriesChangedEvents';
import { SeriesForm } from '../../seriesForm';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Edit Series · Admin',
	robots: { index: false, follow: false },
};

export default async function EditSeriesPage({
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
				<EventsBreadcrumb current="Series" />
				<NotConfigured />
			</div>
		);
	}

	const series = await calendar.getSeries(id).catch((error: unknown) => {
		// Google 404s an id it has never seen or has since purged.
		if ((error as { status?: number }).status === 404) return null;
		throw error;
	});
	if (!series) notFound();
	const events = await calendar.listSeriesEvents(id, { months: 12 });

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<EventsBreadcrumb current={series.title} />
			<div className="d-flex flex-wrap align-items-center gap-3 mb-3">
				<h1 className="h4 mb-0">{series.title}</h1>
				{series.htmlLink && (
					<a
						href={series.htmlLink}
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
					<SeriesForm key={series.etag} series={series} />
					<EndSeriesSection series={series} />
				</div>
				<div className="col-lg-5">
					<SeriesChangedEvents events={events} />
				</div>
			</div>
		</div>
	);
}
