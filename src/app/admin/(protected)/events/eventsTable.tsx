'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { AdminEvent } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { cancelEvent, rescheduleEvent, restoreEvent } from './actions';
import { EventStatusBadge, eventWhen } from './presentation';
import { RescheduleDialog } from './rescheduleDialog';

function RowActions({ event }: { event: AdminEvent }) {
	const { run, pending, feedback } = useAction();
	const [rescheduling, setRescheduling] = useState(false);
	const cancelled = event.status === 'cancelled';

	return (
		<>
			<div className="d-flex justify-content-end gap-1">
				{!cancelled && (
					<button
						type="button"
						className="btn btn-sm btn-outline-secondary"
						disabled={pending}
						onClick={() => setRescheduling(true)}
					>
						Reschedule
					</button>
				)}
				<button
					type="button"
					className={`btn btn-sm ${cancelled ? 'btn-outline-primary' : 'btn-outline-danger'}`}
					disabled={pending}
					onClick={() => {
						if (cancelled) {
							run(() => restoreEvent(event.id, event.etag), {
								refresh: 'always',
							});
							return;
						}
						if (
							!window.confirm(
								`Cancel “${event.title}” on ${eventWhen(event.start, event.end)}? It can be restored from here.`,
							)
						) {
							return;
						}
						run(() => cancelEvent(event.id, event.etag), { refresh: 'always' });
					}}
				>
					{pending ? '…' : cancelled ? 'Restore' : 'Cancel'}
				</button>
			</div>
			{feedback}
			{rescheduling && (
				<RescheduleDialog
					event={event}
					open={rescheduling}
					pending={pending}
					onCancel={() => setRescheduling(false)}
					onConfirm={(when) =>
						run(() => rescheduleEvent(event.id, event.etag, when), {
							settle: () => setRescheduling(false),
							refresh: 'always',
						})
					}
				/>
			)}
		</>
	);
}

export function EventsTable({
	rows,
	canManage,
}: {
	rows: AdminEvent[];
	canManage: boolean;
}) {
	if (rows.length === 0) {
		return <p className="text-body-secondary">Nothing in the next 30 days.</p>;
	}
	return (
		<div className="table-responsive">
			<table className="table table-sm align-middle mb-0">
				<thead>
					<tr>
						<th scope="col">When</th>
						<th scope="col">Event</th>
						<th scope="col">
							<span className="visually-hidden">Status</span>
						</th>
						{canManage && (
							<th scope="col">
								<span className="visually-hidden">Actions</span>
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{rows.map((event) => {
						const cancelled = event.status === 'cancelled';
						return (
							<tr
								key={event.id}
								className={cancelled ? 'text-body-tertiary' : ''}
							>
								<td className="small text-nowrap">
									{cancelled ? (
										<s>{eventWhen(event.start, event.end)}</s>
									) : (
										eventWhen(event.start, event.end)
									)}
								</td>
								<td>
									{event.seriesId && canManage ? (
										<Link
											href={`/admin/events/series/${event.seriesId}`}
											className={
												cancelled ? 'text-decoration-line-through' : ''
											}
										>
											{event.title}
										</Link>
									) : cancelled ? (
										<s>{event.title}</s>
									) : (
										event.title
									)}
								</td>
								<td>
									<EventStatusBadge event={event} />
								</td>
								{canManage && (
									<td className="text-end">
										<RowActions event={event} />
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
