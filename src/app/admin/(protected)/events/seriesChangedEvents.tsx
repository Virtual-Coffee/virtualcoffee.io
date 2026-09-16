'use client';

import { useId, useState } from 'react';

import type { AdminEvent } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { cancelEvent } from './actions';
import { EventsTable } from './eventsTable';
import { eventWhen } from './presentation';

/**
 * The Events of one Series that no longer follow its rule — Cancelled or
 * Rescheduled — and a way to Cancel one that still does, months ahead (a
 * Tuesday on a holiday). Google keeps the exceptions; this lists them.
 */
export function SeriesChangedEvents({ events }: { events: AdminEvent[] }) {
	const changed = events.filter(
		(event) => event.status === 'cancelled' || event.rescheduled,
	);
	const standing = events.filter(
		(event) => event.status === 'confirmed' && !event.rescheduled,
	);

	return (
		<section aria-labelledby="changed-events">
			<h2 className="h6" id="changed-events">
				Changed Events
			</h2>
			<p className="small text-body-secondary">
				Cancelled or rescheduled Events of this Series in the next 12 months.
			</p>
			<EventsTable rows={changed} canManage titles={false} empty="None." />
			<CancelUpcoming events={standing} />
		</section>
	);
}

function CancelUpcoming({ events }: { events: AdminEvent[] }) {
	const id = useId();
	const { run, pending, feedback } = useAction();
	const [selected, setSelected] = useState('');
	const event = events.find((entry) => entry.id === selected);

	if (events.length === 0) return null;

	return (
		<form
			className="mt-4"
			onSubmit={(submit) => {
				submit.preventDefault();
				if (!event) return;
				run(() => cancelEvent(event.id, event.etag), {
					onSuccess: () => setSelected(''),
					refresh: 'always',
				});
			}}
		>
			<label className="form-label small fw-semibold" htmlFor={id}>
				Cancel an upcoming Event
			</label>
			<div className="d-flex flex-wrap gap-2">
				<select
					id={id}
					className="form-select form-select-sm w-auto"
					value={selected}
					onChange={(change) => setSelected(change.target.value)}
					disabled={pending}
				>
					<option value="">Choose an Event…</option>
					{events.map((entry) => (
						<option value={entry.id} key={entry.id}>
							{eventWhen(entry.start, entry.end)}
						</option>
					))}
				</select>
				<button
					type="submit"
					className="btn btn-sm btn-outline-danger"
					disabled={pending || !event}
				>
					{pending ? '…' : 'Cancel'}
				</button>
			</div>
			<div className="form-text">It can be restored from the list above.</div>
			{feedback}
		</form>
	);
}
