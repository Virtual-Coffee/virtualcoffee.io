'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import { useAction } from '@/util/forms/useAction';

import { createEvent } from './actions';
import { TextAreaField, TextField, TimeFields, type TimeDraft } from './fields';

/** A one-off Event: everything a Series has except the rule. */
export function EventForm() {
	const id = useId();
	const { run, pending, result, feedback } = useAction();

	const [title, setTitle] = useState('');
	const [joinLink, setJoinLink] = useState('');
	const [description, setDescription] = useState('');
	const [when, setWhen] = useState<TimeDraft>({
		date: '',
		startTime: '09:00',
		endTime: '10:00',
	});
	const created = result?.ok;

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				run(() => createEvent({ title, joinLink, description, ...when }));
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
				<TextAreaField
					id={`${id}-description`}
					label="Description"
					value={description}
					onChange={setDescription}
					help="Shown on /events. Plain text or HTML."
				/>
			</fieldset>

			<div className="d-flex flex-wrap gap-2 align-items-center">
				{!created && (
					<button
						type="submit"
						className="btn btn-primary btn-sm"
						disabled={pending || !title.trim() || !joinLink || !when.date}
					>
						{pending ? 'Saving…' : 'Create Event'}
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
