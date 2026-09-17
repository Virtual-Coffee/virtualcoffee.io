'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import { ActionDialog } from '@/components/ActionDialog';
import type { TimeInput } from '@/lib/events/eventDraft';
import type { AdminEvent } from '@/lib/events/eventsCalendar';
import { displayParts } from '@/util/date';
import { useAction } from '@/util/forms/useAction';

import { cancelEvent, rescheduleEvent, restoreEvent } from './actions';
import { TimeFields } from './fields';
import { EventStatusBadge, EventWhen, eventWhen } from './presentation';

/** The Event's own time, which is where a reschedule starts from. */
function draftFrom(event: AdminEvent): TimeInput {
	const start = displayParts(event.start);
	const end = displayParts(event.end);
	return {
		date: start?.date ?? '',
		startTime: start?.time ?? '',
		endTime: end?.time ?? '',
	};
}

/**
 * Reschedule and Cancel while the Event stands; Restore once it has been
 * Cancelled or Rescheduled. Restore is the one without a confirmation, so it
 * keeps the `useAction` — and its `pending` is what disables the other two.
 */
function RowActions({ event }: { event: AdminEvent }) {
	const { run, pending, feedback } = useAction();
	const id = useId();
	const [when, setWhen] = useState<TimeInput>(() => draftFrom(event));
	const cancelled = event.status === 'cancelled';

	return (
		<>
			<div className="d-flex justify-content-end gap-1">
				{!cancelled && (
					<ActionDialog
						className="btn btn-sm btn-outline-secondary"
						label="Reschedule"
						title={`Reschedule ${event.title}`}
						submit
						disabled={pending}
						refresh="always"
						// Seeded on open, not on close: a reschedule that succeeds
						// refreshes the row, and the draft has to follow the time the
						// Event now has rather than the one it was moved from.
						onOpen={() => setWhen(draftFrom(event))}
						action={() => rescheduleEvent(event.id, event.etag, when)}
					>
						<TimeFields
							id={id}
							dateLabel="Date"
							draft={when}
							onChange={setWhen}
						/>
						{event.seriesId && (
							<p className="small text-body-secondary mb-0">
								Only this Event moves; the Series keeps its rule.
							</p>
						)}
					</ActionDialog>
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
					<ActionDialog
						className="btn btn-sm btn-outline-danger"
						label="Cancel"
						title={`Cancel “${event.title}” on ${eventWhen(event.start, event.end)}?`}
						// Not "Cancel": the dialog's own dismissal is already that.
						confirmLabel="Cancel Event"
						danger
						disabled={pending}
						refresh="always"
						action={() => cancelEvent(event.id, event.etag)}
					>
						<p className="mb-0">It can be restored from here.</p>
					</ActionDialog>
				)}
			</div>
			{feedback}
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
										{canManage ? (
											<Link
												href={
													event.seriesId
														? `/admin/events/series/${event.seriesId}`
														: `/admin/events/${event.id}`
												}
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
