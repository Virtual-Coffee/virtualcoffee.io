'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId } from 'react';

import { ActionDialog } from '@/components/ActionDialog';
import {
	draftFromSeries,
	emptyDraft,
	toSeriesInput,
} from '@/lib/events/eventDraft';
import type { Series } from '@/lib/events/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { createSeries, endSeries, updateSeries } from './actions';
import { DraftIssueText, EventFields } from './fields';
import { RecurrenceFields } from './recurrenceFields';
import { useEventDraft } from './useEventDraft';

/**
 * One form for a new Series and for editing one. An edit sends the etag the
 * page loaded, so a change made in Google's UI meanwhile comes back as a
 * conflict rather than being overwritten (docs/adr/0014). A rule the form
 * cannot edit is shown as text and sent as null — left alone.
 */
export function SeriesForm({ series }: { series?: Series }) {
	const id = useId();
	const { run, pending, result, feedback } = useAction();
	const { draft, set, touched } = useEventDraft(
		series ? draftFromSeries(series) : emptyDraft('series'),
	);

	const parsed = toSeriesInput(draft);
	const created = !series && result?.ok;
	const disabled = pending || Boolean(created);

	// A rule this form has no controls for is shown as the text Google's own
	// wording gives it; everything else on the Series is still editable.
	const rule =
		draft.rule === 'custom' ? (
			<div className="mb-3">
				<div className="form-label small fw-semibold mb-1">Repeats</div>
				<p className="mb-1">{series?.recurrenceText}</p>
				<div className="form-text">
					This rule is one this form can’t edit. Change it in Google Calendar;
					everything else here can be saved.
				</div>
			</div>
		) : (
			draft.rule && (
				<RecurrenceFields
					draft={draft.rule}
					onChange={(next) => set({ rule: next })}
					disabled={pending}
				/>
			)
		);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				if (!parsed.ok) return;
				const input = parsed.input;
				run(() =>
					series
						? updateSeries(series.id, series.etag, input)
						: createSeries(input),
				);
			}}
		>
			<fieldset disabled={disabled}>
				<EventFields
					id={id}
					draft={draft}
					set={set}
					dateLabel="First Event"
					joinHelp="Where people go to attend. The same for every Event of the Series."
					descriptionHelp="Shown on /events under every Event of the Series."
					legacy={Boolean(series) && series?.eventType === null}
					disabled={disabled}
					rule={rule}
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
						disabled={pending || !parsed.ok}
					>
						{pending ? 'Saving…' : series ? 'Save Series' : 'Create Series'}
					</button>
				)}
				<Link href="/admin/events" className="btn btn-outline-secondary btn-sm">
					{created ? 'Back to Events' : 'Cancel'}
				</Link>
				{!created && (
					<DraftIssueText
						issue={parsed.ok ? undefined : parsed.issue}
						touched={touched}
					/>
				)}
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
	return (
		<section className="border rounded p-3 mt-4" aria-labelledby="end-series">
			<h2 className="h6" id="end-series">
				End this Series
			</h2>
			<p className="small mb-3">
				No more Events will be scheduled. Past ones stay on the calendar.
			</p>
			<ActionDialog
				className="btn btn-sm btn-outline-danger"
				label="End Series"
				title={`End “${series.title}”?`}
				danger
				refresh="always"
				onSuccess={() => router.push('/admin/events')}
				action={() => endSeries(series.id, series.etag)}
			>
				<p className="mb-0">
					No more Events will be scheduled. Past ones stay on the calendar.
				</p>
			</ActionDialog>
		</section>
	);
}
