import Link from 'next/link';

import type { Series } from '@/lib/eventsCalendar';

import { eventWhen, sentence } from './presentation';

export function SeriesTable({
	rows,
	canManage,
}: {
	rows: Series[];
	canManage: boolean;
}) {
	if (rows.length === 0) {
		return (
			<p className="text-body-secondary">
				No Series with an Event still to come.
			</p>
		);
	}
	return (
		<div className="table-responsive">
			<table className="table table-sm align-middle mb-0">
				<thead>
					<tr>
						<th scope="col">Series</th>
						<th scope="col">Repeats</th>
						<th scope="col">Next Event</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((series) => (
						<tr key={series.id}>
							<td>
								{canManage ? (
									<Link href={`/admin/events/series/${series.id}`}>
										{series.title}
									</Link>
								) : (
									series.title
								)}
							</td>
							<td className="small">{sentence(series.recurrenceText)}</td>
							<td className="small text-nowrap">
								{series.nextEvent
									? eventWhen(series.nextEvent.start, series.nextEvent.end)
									: '—'}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
