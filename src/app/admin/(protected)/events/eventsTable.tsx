'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { AdminEvent } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { cancelEvent, rescheduleEvent, restoreEvent } from './actions';
import { EventStatusBadge, EventWhen, eventWhen } from './presentation';
import { RescheduleDialog } from './rescheduleDialog';

/**
 * Reschedule and Cancel while the Event stands; Restore once it has been
 * Cancelled or Rescheduled.
 */
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
				{(cancelled || event.rescheduled) && (
					<button
						type="button"
						className="btn btn-sm btn-outline-primary"
						disabled={pending}
						onClick={() =>
							run(() => restoreEvent(event.id, event.etag), {
								refresh: 'always',
							})
						}
					>
						{pending ? '…' : 'Restore'}
					</button>
				)}
				{!cancelled && (
					<button
						type="button"
						className="btn btn-sm btn-outline-danger"
						disabled={pending}
						onClick={() => {
							if (
								!window.confirm(
									`Cancel “${event.title}” on ${eventWhen(event.start, event.end)}? It can be restored from here.`,
								)
							) {
								return;
							}
							run(() => cancelEvent(event.id, event.etag), {
								refresh: 'always',
							});
						}}
					>
						{pending ? '…' : 'Cancel'}
					</button>
				)}
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

/**
 * The Events list, and — without `titles`, where every row is of the one
 * Series named above it — the Series page's Changed Events.
 */
export function EventsTable({
	rows,
	canManage,
	titles = true,
	empty = 'Nothing in the next 30 days.',
}: {
	rows: AdminEvent[];
	canManage: boolean;
	titles?: boolean;
	empty?: string;
}) {
	if (rows.length === 0) {
		return <p className="text-body-secondary">{empty}</p>;
	}
	return (
		<div className="table-responsive">
			<table className="table table-sm align-middle mb-0">
				<thead>
					<tr>
						<th scope="col">When</th>
						{titles && <th scope="col">Event</th>}
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
									<EventWhen
										start={event.start}
										end={event.end}
										struck={cancelled}
										originalStart={
											event.rescheduled ? event.originalStart : null
										}
									/>
								</td>
								{titles && (
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
								)}
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
