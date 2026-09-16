'use client';

import { useId, useState } from 'react';

import { AdminDialog } from '@/components/AdminDialog';
import type { TimeInput } from '@/lib/eventDraft';
import type { AdminEvent } from '@/lib/eventsCalendar';
import { displayParts } from '@/util/date';
import { useModalDialog } from '@/util/useModalDialog';

import { TimeFields } from './fields';

function draftFrom(event: AdminEvent): TimeInput {
	const start = displayParts(event.start);
	const end = displayParts(event.end);
	return {
		date: start?.date ?? '',
		startTime: start?.time ?? '',
		endTime: end?.time ?? '',
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
	onConfirm: (when: TimeInput) => void;
}) {
	const id = useId();
	const [when, setWhen] = useState<TimeInput>(() => draftFrom(event));
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
