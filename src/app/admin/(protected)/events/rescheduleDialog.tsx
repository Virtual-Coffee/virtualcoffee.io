'use client';

import { useId, useState } from 'react';
import { DateTime } from 'luxon';

import { AdminDialog } from '@/components/AdminDialog';
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
		<AdminDialog
			dialog={dialog}
			title={`Reschedule ${event.title}`}
			pending={pending}
			onCancel={onCancel}
			onSubmit={() => onConfirm(when)}
			confirm={
				<button type="submit" className="btn btn-primary" disabled={pending}>
					{pending ? 'Working…' : 'Reschedule'}
				</button>
			}
		>
			<TimeFields id={id} dateLabel="Date" draft={when} onChange={setWhen} />
			{event.seriesId && (
				<p className="small text-body-secondary mb-0">
					Only this Event moves; the Series keeps its rule.
				</p>
			)}
		</AdminDialog>
	);
}
