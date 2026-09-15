'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import type { EventDetails, EventType } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { createEvent, updateEvent } from './actions';
import { DescriptionField } from './descriptionField';
import {
	EventTypeField,
	HostCodeField,
	TextField,
	TimeFields,
	type TimeInput,
} from './fields';

/**
 * A one-off Event: everything a Series has except the rule. One form for a
 * new Event and for editing one; an edit sends the etag the page loaded, so
 * a change made in Google's UI meanwhile comes back as a conflict rather
 * than being overwritten (docs/adr/0014).
 */
export function EventForm({ event }: { event?: EventDetails }) {
	const id = useId();
	const { run, pending, result, feedback } = useAction();

	const [title, setTitle] = useState(event?.title ?? '');
	const [joinLink, setJoinLink] = useState(event?.joinLink ?? '');
	const [hostCode, setHostCode] = useState(event?.hostCode ?? '');
	const [eventType, setEventType] = useState<EventType | ''>(
		event?.eventType ?? '',
	);
	const [description, setDescription] = useState(event?.description ?? '');
	const [when, setWhen] = useState<TimeInput>({
		date: event?.date ?? '',
		startTime: event?.startTime ?? '09:00',
		endTime: event?.endTime ?? '10:00',
	});
	const ready = title.trim() && joinLink && eventType && when.date;
	const created = !event && result?.ok;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				const input = {
					title,
					joinLink,
					hostCode,
					eventType,
					description,
					...when,
				};
				run(() =>
					event ? updateEvent(event.id, event.etag, input) : createEvent(input),
				);
			}}
		>
			<fieldset disabled={pending || Boolean(created)}>
				<TextField
					id={`${id}-title`}
					label="Title"
					value={title}
					onChange={setTitle}
					required
				/>
				<TimeFields id={id} dateLabel="Date" draft={when} onChange={setWhen} />
				<TextField
					id={`${id}-join`}
					label="Join Link"
					type="url"
					value={joinLink}
					onChange={setJoinLink}
					help="Where people go to attend."
					required
				/>
				<HostCodeField
					id={`${id}-host`}
					value={hostCode}
					onChange={setHostCode}
				/>
				<EventTypeField
					id={`${id}-type`}
					value={eventType}
					onChange={setEventType}
					legacy={Boolean(event) && event?.eventType === null}
				/>
				<DescriptionField
					id={`${id}-description`}
					label="Description"
					value={description}
					onChange={setDescription}
					disabled={pending || Boolean(created)}
					help="Shown on /events."
				/>
			</fieldset>

			<div className="d-flex flex-wrap gap-2 align-items-center">
				{!created && (
					<button
						type="submit"
						className="btn btn-primary btn-sm"
						disabled={pending || !ready}
					>
						{pending ? 'Saving…' : event ? 'Save Event' : 'Create Event'}
					</button>
				)}
				<Link href="/admin/events" className="btn btn-outline-secondary btn-sm">
					{created ? 'Back to Events' : 'Cancel'}
				</Link>
			</div>
			{feedback}
		</form>
	);
}
