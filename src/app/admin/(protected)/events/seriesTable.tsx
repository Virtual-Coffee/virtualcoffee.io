'use client';

import Link from 'next/link';

import type { Series } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { endSeries } from './actions';
import { eventWhen, sentence } from './presentation';

function EndButton({ series }: { series: Series }) {
	const { run, pending, feedback } = useAction();
	return (
		<>
			<button
				type="button"
				className="btn btn-sm btn-outline-danger"
				disabled={pending}
				onClick={() => {
					if (
						!window.confirm(
							`End “${series.title}”? No more Events will be scheduled. Past ones stay on the calendar.`,
						)
					) {
						return;
					}
					run(() => endSeries(series.id, series.etag), { refresh: 'always' });
				}}
			>
				{pending ? '…' : 'End'}
			</button>
			{feedback}
		</>
	);
}

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
						<th scope="col">Join Link</th>
						{canManage && (
							<th scope="col">
								<span className="visually-hidden">Actions</span>
							</th>
						)}
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
							<td className="small">
								<a
									href={series.joinLink}
									className="text-break"
									target="_blank"
									rel="noreferrer"
								>
									{series.joinLink.replace(/^https?:\/\//, '')}
								</a>
							</td>
							{canManage && (
								<td className="text-end text-nowrap">
									<EndButton series={series} />
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
