'use client';

import { useId, useState } from 'react';
import { DateTime } from 'luxon';

import type { AdminEvent } from '@/lib/eventsCalendar';
import { DISPLAY_ZONE } from '@/util/date';
import { useModalDialog } from '@/util/useModalDialog';

import { TimeFields, type TimeDraft } from './fields';

function draftFrom(event: AdminEvent): TimeDraft {
	const start = DateTime.fromISO(event.start).setZone(DISPLAY_ZONE);
	const end = DateTime.fromISO(event.end).setZone(DISPLAY_ZONE);
	return {
		date: start.toISODate() ?? '',
		startTime: start.toFormat('HH:mm'),
		endTime: end.toFormat('HH:mm'),
	};
}

/** Moves one Event; the Series it belongs to is unchanged. */
export function RescheduleDialog({
	event,
	open,
	pending,
	onCancel,
	onConfirm,
}: {
	event: AdminEvent;
	open: boolean;
	pending: boolean;
	onCancel: () => void;
	onConfirm: (when: TimeDraft) => void;
}) {
	const id = useId();
	const [when, setWhen] = useState<TimeDraft>(() => draftFrom(event));
	const dialog = useModalDialog(
		open,
		() => {
			setWhen(draftFrom(event));
			if (!pending) onCancel();
		},
		pending,
	);

	return (
		<dialog {...dialog} className="admin-dialog">
			<form
				onSubmit={(submit) => {
					submit.preventDefault();
					onConfirm(when);
				}}
			>
				<div className="p-3 border-bottom d-flex justify-content-between align-items-start gap-3">
					<h2 className="h5 mb-0">Reschedule {event.title}</h2>
					<button
						type="button"
						className="btn-close"
						aria-label="Close"
						onClick={onCancel}
						disabled={pending}
					/>
				</div>
				<div className="p-3">
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
				</div>
				<div className="p-3 border-top d-flex justify-content-end gap-2">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={onCancel}
						disabled={pending}
					>
						Cancel
					</button>
					<button type="submit" className="btn btn-primary" disabled={pending}>
						{pending ? 'Working…' : 'Reschedule'}
					</button>
				</div>
			</form>
		</dialog>
	);
}
