/**
 * A Draft is a Series or an Event as an admin form holds it before a save:
 * strings as they were typed, so not necessarily a Series or an Event at all.
 * Nothing on the Events Calendar is ever a Draft — `toEventInput` and
 * `toSeriesInput` either turn one into what the actions write or name the
 * first thing wrong with it.
 *
 * The shape is declared once, here: the schemas `events/actions.ts` parses
 * against, the types inferred from them, and the conversions both forms use.
 * So the form withholds a save for exactly what the action would refuse,
 * rather than the maintainer finding out afterwards. The rules are ADR 0014's
 * — a Zoom Join Link needs its Host Code, every save needs an Event Type.
 *
 * Client components import this, so nothing server-only belongs here:
 * `EventDetails` and `Series` come in as types alone, which keeps the Google
 * client out of the browser bundle.
 */
import { DateTime } from 'luxon';
import { z } from 'zod';

import type { EventDetails, Series } from '@/lib/eventsCalendar';
import { EVENT_TYPES, type EventType } from '@/lib/eventTypes';
import {
	dateSchema,
	draftFromRecurrence,
	draftToForm,
	EMPTY_DRAFT,
	endsBeforeStart,
	firstOccurrenceMatches,
	recurrenceSchema,
	type RecurrenceDraft,
	type RecurrenceForm,
} from '@/lib/recurrence';

/**
 * The same test the bots apply (`src/zoom/join-link.ts` in vc-bots): a Zoom
 * join URL is what makes a Host Code mandatory, because the bots refuse to
 * announce a Zoom Event without one.
 */
export function isZoomJoinLink(url: string): boolean {
	return /zoom\.us\/j\/(\d{9,11})(?:[/?#]|$)/.test(url);
}

const timeSchema = z
	.string()
	.regex(/^\d{2}:\d{2}$/, 'Pick a time.')
	.refine(
		(value) => DateTime.fromFormat(value, 'HH:mm').isValid,
		'Pick a real time.',
	);

export const timeInputSchema = z
	.object({ date: dateSchema, startTime: timeSchema, endTime: timeSchema })
	.refine((value) => value.endTime > value.startTime, {
		message: 'The end has to be after the start, on the same day.',
		path: ['endTime'],
	});

export const eventInputSchema = timeInputSchema
	.safeExtend({
		title: z.string().trim().min(1, 'Give it a title.').max(200),
		description: z.string().max(8000, 'The description is too long.'),
		joinLink: z.url('The Join Link has to be a full URL.').max(2000),
		hostCode: z
			.string()
			.trim()
			.regex(/^(\d{6,10})?$/, 'A Zoom host code is 6–10 digits.'),
		eventType: z.enum(EVENT_TYPES, { message: 'Pick an Event Type.' }),
	})
	// The bots refuse to announce a Zoom Event without its Host Code.
	.refine((value) => !isZoomJoinLink(value.joinLink) || value.hostCode, {
		message:
			'A Zoom Join Link needs its host code, or the Slack bots cannot announce it.',
		path: ['hostCode'],
	});

// A rule the form cannot edit (`custom`) is sent as null and left alone.
export const seriesUpdateSchema = eventInputSchema
	.safeExtend({ recurrence: recurrenceSchema.nullable() })
	.refine(
		(value) =>
			!value.recurrence || firstOccurrenceMatches(value.recurrence, value.date),
		{
			message: 'The first Event has to fall on a day the rule repeats on.',
			path: ['date'],
		},
	)
	.refine(
		(value) =>
			!value.recurrence || !endsBeforeStart(value.recurrence, value.date),
		{ message: 'The rule ends before its first Event.', path: ['recurrence'] },
	);

export type TimeInput = z.infer<typeof timeInputSchema>;
export type EventInput = z.infer<typeof eventInputSchema>;
export type SeriesUpdate = z.infer<typeof seriesUpdateSchema>;

/** A new Series needs a rule; only an update may leave one alone. */
export const seriesInputSchema = seriesUpdateSchema.refine(
	(value): value is SeriesUpdate & { recurrence: RecurrenceForm } =>
		value.recurrence !== null,
	{ message: 'Say how the Series repeats.', path: ['recurrence'] },
);

export type SeriesInput = z.infer<typeof seriesInputSchema>;

/**
 * `rule` is null for a one-off Event and `'custom'` for a Series rule this
 * form cannot edit — sent as `recurrence: null`, which leaves it alone.
 */
export type Draft = {
	title: string;
	joinLink: string;
	hostCode: string;
	/** `''` until an Event Type is picked; no save is allowed without one. */
	eventType: EventType | '';
	description: string;
	date: string;
	startTime: string;
	endTime: string;
	rule: RecurrenceDraft | 'custom' | null;
};

export function emptyDraft(kind: 'event' | 'series'): Draft {
	return {
		title: '',
		joinLink: '',
		hostCode: '',
		eventType: '',
		description: '',
		date: '',
		startTime: '09:00',
		endTime: '10:00',
		rule: kind === 'series' ? EMPTY_DRAFT : null,
	};
}

/** The fields a Series and an Event share, as read from the calendar. */
function draftFrom(entry: EventDetails | Series): Omit<Draft, 'rule'> {
	return {
		title: entry.title,
		joinLink: entry.joinLink,
		hostCode: entry.hostCode,
		eventType: entry.eventType ?? '',
		description: entry.description,
		date: entry.date,
		startTime: entry.startTime,
		endTime: entry.endTime,
	};
}

export function draftFromEvent(event: EventDetails): Draft {
	return { ...draftFrom(event), rule: null };
}

export function draftFromSeries(series: Series): Draft {
	return {
		...draftFrom(series),
		rule:
			series.recurrence.kind === 'custom'
				? 'custom'
				: draftFromRecurrence(series.recurrence),
	};
}

/** The first thing wrong with a Draft: a field path and what to say about it. */
export type DraftIssue = { path: string; message: string };

export type DraftResult<T> =
	{ ok: true; input: T } | { ok: false; issue: DraftIssue };

function parse<S extends z.ZodType>(
	schema: S,
	candidate: unknown,
): DraftResult<z.infer<S>> {
	const parsed = schema.safeParse(candidate);
	if (parsed.success) return { ok: true, input: parsed.data };
	const issue = parsed.error.issues[0];
	return {
		ok: false,
		issue: { path: issue.path.join('.'), message: issue.message },
	};
}

/** The Draft as an Event, less the rule, whether or not it is valid. */
function candidate(draft: Draft) {
	return {
		title: draft.title,
		description: draft.description,
		joinLink: draft.joinLink,
		hostCode: draft.hostCode,
		eventType: draft.eventType,
		date: draft.date,
		startTime: draft.startTime,
		endTime: draft.endTime,
	};
}

export function toEventInput(draft: Draft): DraftResult<EventInput> {
	return parse(eventInputSchema, candidate(draft));
}

export function toSeriesInput(draft: Draft): DraftResult<SeriesUpdate> {
	const { rule } = draft;
	if (rule !== 'custom') {
		// Half a rule is not a rule; the Series form always has one to offer.
		const recurrence = rule && draftToForm(rule);
		if (!recurrence) {
			return {
				ok: false,
				issue: { path: 'recurrence', message: 'Say how the Series repeats.' },
			};
		}
		return parse(seriesUpdateSchema, { ...candidate(draft), recurrence });
	}
	return parse(seriesUpdateSchema, { ...candidate(draft), recurrence: null });
}
