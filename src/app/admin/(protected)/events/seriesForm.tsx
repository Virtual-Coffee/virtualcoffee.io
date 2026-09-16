'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import type { EventType, Series } from '@/lib/eventsCalendar';
import {
	draftFromRecurrence,
	draftToForm,
	EMPTY_DRAFT,
	type RecurrenceDraft,
} from '@/lib/recurrence';
import { useAction } from '@/util/forms/useAction';

import { createSeries, endSeries, updateSeries } from './actions';
import { DescriptionField } from './descriptionField';
import {
	EventTypeField,
	HostCodeField,
	TextField,
	TimeFields,
	type TimeInput,
} from './fields';
import { RecurrenceFields } from './recurrenceFields';

/**
 * One form for a new Series and for editing one. An edit sends the etag the
 * page loaded, so a change made in Google's UI meanwhile comes back as a
 * conflict rather than being overwritten (docs/adr/0014). A rule the form
 * cannot edit is shown as text and sent as null — left alone.
 */
export function SeriesForm({ series }: { series?: Series }) {
	const id = useId();
	const { run, pending, result, feedback } = useAction();

	const [title, setTitle] = useState(series?.title ?? '');
	const [joinLink, setJoinLink] = useState(series?.joinLink ?? '');
	const [hostCode, setHostCode] = useState(series?.hostCode ?? '');
	const [eventType, setEventType] = useState<EventType | ''>(
		series?.eventType ?? '',
	);
	const [description, setDescription] = useState(series?.description ?? '');
	const [when, setWhen] = useState<TimeInput>({
		date: series?.date ?? '',
		startTime: series?.startTime ?? '09:00',
		endTime: series?.endTime ?? '10:00',
	});
	const custom =
		series?.recurrence.kind === 'custom' ? series.recurrence : null;
	const [rule, setRule] = useState<RecurrenceDraft>(() =>
		series && series.recurrence.kind !== 'custom'
			? draftFromRecurrence(series.recurrence)
			: EMPTY_DRAFT,
	);

	const recurrence = custom ? null : draftToForm(rule);
	const ready =
		title.trim() &&
		joinLink &&
		eventType &&
		when.date &&
		(custom || recurrence);
	const created = !series && result?.ok;

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const input = {
					title,
					joinLink,
					hostCode,
					eventType,
					description,
					...when,
					recurrence,
				};
				run(() =>
					series
						? updateSeries(series.id, series.etag, input)
						: createSeries(input),
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
				<TimeFields
					id={id}
					dateLabel="First Event"
					draft={when}
					onChange={setWhen}
				/>
				{custom ? (
					<div className="mb-3">
						<div className="form-label small fw-semibold mb-1">Repeats</div>
						<p className="mb-1">{custom.text}</p>
						<div className="form-text">
							This rule is one this form can’t edit. Change it in Google
							Calendar; everything else here can be saved.
						</div>
					</div>
				) : (
					<RecurrenceFields
						draft={rule}
						onChange={setRule}
						disabled={pending}
					/>
				)}
				<TextField
					id={`${id}-join`}
					label="Join Link"
					type="url"
					value={joinLink}
					onChange={setJoinLink}
					help="Where people go to attend. The same for every Event of the Series."
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
					legacy={Boolean(series) && series?.eventType === null}
				/>
				<DescriptionField
					id={`${id}-description`}
					label="Description"
					value={description}
					onChange={setDescription}
					disabled={pending || Boolean(created)}
					help="Shown on /events under every Event of the Series."
				/>
			</fieldset>

			{series && (
				<p className="small text-body-secondary">
					Saving applies to every Event of this Series, past ones included.
					Cancelled and rescheduled Events keep their changes.
				</p>
			)}

			<div className="d-flex flex-wrap gap-2 align-items-center">
				{!created && (
					<button
						type="submit"
						className="btn btn-primary btn-sm"
						disabled={pending || !ready}
					>
						{pending ? 'Saving…' : series ? 'Save Series' : 'Create Series'}
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

/**
 * Leaves for the list on success: a Series that never ran is deleted rather
 * than Ended, and this page would 404 on refresh.
 */
export function EndSeriesSection({ series }: { series: Series }) {
	const router = useRouter();
	const { run, pending, feedback } = useAction();
	return (
		<section className="border rounded p-3 mt-4" aria-labelledby="end-series">
			<h2 className="h6" id="end-series">
				End this Series
			</h2>
			<p className="small mb-3">
				No more Events will be scheduled. Past ones stay on the calendar.
			</p>
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
					run(() => endSeries(series.id, series.etag), {
						onSuccess: () => router.push('/admin/events'),
						refresh: 'always',
					});
				}}
			>
				{pending ? '…' : 'End Series'}
			</button>
			{feedback}
		</section>
	);
}
