'use client';

import Link from 'next/link';
import { useId } from 'react';

import { draftFromEvent, emptyDraft, toEventInput } from '@/lib/eventDraft';
import type { EventDetails } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { createEvent, updateEvent } from './actions';
import { DraftIssueText, EventFields } from './fields';
import { useEventDraft } from './useEventDraft';

/**
 * A one-off Event: everything a Series has except the rule. One form for a
 * new Event and for editing one; an edit sends the etag the page loaded, so
 * a change made in Google's UI meanwhile comes back as a conflict rather
 * than being overwritten (docs/adr/0014).
 */
export function EventForm({ event }: { event?: EventDetails }) {
	const id = useId();
	const { run, pending, result, feedback } = useAction();
	const { draft, set, touched } = useEventDraft(
		event ? draftFromEvent(event) : emptyDraft('event'),
	);

	const parsed = toEventInput(draft);
	const created = !event && result?.ok;
	const disabled = pending || Boolean(created);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (!parsed.ok) return;
				const input = parsed.input;
				run(() =>
					event ? updateEvent(event.id, event.etag, input) : createEvent(input),
				);
			}}
		>
			<fieldset disabled={disabled}>
				<EventFields
					id={id}
					draft={draft}
					set={set}
					dateLabel="Date"
					joinHelp="Where people go to attend."
					descriptionHelp="Shown on /events."
					legacy={Boolean(event) && event?.eventType === null}
					disabled={disabled}
				/>
			</fieldset>

			<div className="d-flex flex-wrap gap-2 align-items-center">
				{!created && (
					<button
						type="submit"
						className="btn btn-primary btn-sm"
						disabled={pending || !parsed.ok}
					>
						{pending ? 'Saving…' : event ? 'Save Event' : 'Create Event'}
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
