/**
 * The Series form's view of an RRULE: the two shapes the form edits — weekly
 * on days, monthly on the nth weekday(s) — and a read-only `custom` for
 * anything else Google's picker can produce. `rrule` parses and describes;
 * serialising is by hand so the output matches what Google's own UI writes
 * (no `+1FR`, no `INTERVAL=1`). Google expands the rule; nothing here computes
 * occurrences beyond the one check that a first Event lands on the rule.
 *
 * Also the rule half of a Draft (`src/lib/eventDraft.ts`): `RecurrenceDraft`
 * is what the controls hold while it is being typed, and `recurrenceSchema`
 * is what a save is parsed against. Imported by client components, so nothing
 * server-only belongs here.
 */
import { DateTime } from 'luxon';
import { RRule, type Options } from 'rrule';
import { z } from 'zod';

import { DISPLAY_ZONE } from '@/util/date';

export const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
	MO: 'Monday',
	TU: 'Tuesday',
	WE: 'Wednesday',
	TH: 'Thursday',
	FR: 'Friday',
	SA: 'Saturday',
	SU: 'Sunday',
};

/** Which week of the month; `-1` is the last. */
export const ORDINALS = [1, 2, 3, 4, -1] as const;
export type Ordinal = (typeof ORDINALS)[number];

export const ORDINAL_LABELS: Record<Ordinal, string> = {
	1: 'first',
	2: 'second',
	3: 'third',
	4: 'fourth',
	[-1]: 'last',
};

export type Ends =
	| { kind: 'never' }
	/** The last day an Event may fall on, as a date in the display zone. */
	| { kind: 'until'; date: string }
	| { kind: 'count'; count: number };

export type RecurrenceForm =
	| {
			kind: 'weekly';
			interval: number;
			weekdays: Weekday[];
			ends: Ends;
			/** Carried through from a rule Google wrote; the form never sets it. */
			weekStart?: Weekday;
	  }
	| {
			kind: 'monthly';
			interval: number;
			ordinals: Ordinal[];
			weekday: Weekday;
			ends: Ends;
	  };

/** A rule the form cannot edit: shown as text, changed in Google's UI. */
export type CustomRecurrence = { kind: 'custom'; rrule: string; text: string };

export type Recurrence = RecurrenceForm | CustomRecurrence;

/** The controls' state: strings where the user types, so a half-typed number survives. */
export type RecurrenceDraft = {
	kind: 'weekly' | 'monthly';
	interval: string;
	weekdays: Weekday[];
	ordinals: Ordinal[];
	weekday: Weekday;
	endsKind: 'never' | 'until' | 'count';
	untilDate: string;
	count: string;
	weekStart?: Weekday;
};

export const EMPTY_DRAFT: RecurrenceDraft = {
	kind: 'weekly',
	interval: '1',
	weekdays: [],
	ordinals: [],
	weekday: 'TU',
	endsKind: 'never',
	untilDate: '',
	count: '10',
};

export function draftFromRecurrence(form: RecurrenceForm): RecurrenceDraft {
	const ends = form.ends;
	const shared = {
		interval: String(form.interval),
		endsKind: ends.kind,
		untilDate: ends.kind === 'until' ? ends.date : '',
		count: ends.kind === 'count' ? String(ends.count) : '10',
	};
	return form.kind === 'weekly'
		? {
				...EMPTY_DRAFT,
				...shared,
				kind: 'weekly',
				weekdays: form.weekdays,
				...(form.weekStart ? { weekStart: form.weekStart } : {}),
			}
		: {
				...EMPTY_DRAFT,
				...shared,
				kind: 'monthly',
				ordinals: form.ordinals,
				weekday: form.weekday,
			};
}

/** Null while the draft is not yet a rule; `recurrenceSchema` judges the rest. */
export function draftToForm(draft: RecurrenceDraft): RecurrenceForm | null {
	const interval = Number(draft.interval);
	if (!Number.isInteger(interval) || interval < 1) return null;
	const ends: RecurrenceForm['ends'] | null =
		draft.endsKind === 'never'
			? { kind: 'never' }
			: draft.endsKind === 'until'
				? draft.untilDate
					? { kind: 'until', date: draft.untilDate }
					: null
				: Number.isInteger(Number(draft.count)) && Number(draft.count) > 0
					? { kind: 'count', count: Number(draft.count) }
					: null;
	if (!ends) return null;
	if (draft.kind === 'weekly') {
		if (draft.weekdays.length === 0) return null;
		return {
			kind: 'weekly',
			interval,
			weekdays: WEEKDAYS.filter((day) => draft.weekdays.includes(day)),
			ends,
			...(draft.weekStart ? { weekStart: draft.weekStart } : {}),
		};
	}
	if (draft.ordinals.length === 0) return null;
	return {
		kind: 'monthly',
		interval,
		ordinals: ORDINALS.filter((n) => draft.ordinals.includes(n)),
		weekday: draft.weekday,
		ends,
	};
}

/** A display-zone calendar date, as every date a Draft holds is written. */
export const dateSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date.')
	.refine((value) => DateTime.fromISO(value).isValid, 'Pick a real date.');

const endsSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('never') }),
	z.object({ kind: z.literal('until'), date: dateSchema }),
	z.object({
		kind: z.literal('count'),
		count: z.int().min(1, 'At least one Event.').max(999),
	}),
]);

const intervalSchema = z.int().min(1).max(52);
const weekdaySchema = z.enum(WEEKDAYS);

export const recurrenceSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('weekly'),
		interval: intervalSchema,
		weekdays: z.array(weekdaySchema).min(1, 'Pick at least one day.').max(7),
		ends: endsSchema,
		weekStart: weekdaySchema.optional(),
	}),
	z.object({
		kind: z.literal('monthly'),
		interval: intervalSchema,
		ordinals: z
			.array(z.literal(ORDINALS))
			.min(1, 'Pick at least one week of the month.')
			.max(5),
		weekday: weekdaySchema,
		ends: endsSchema,
	}),
]);

const FORM_OPTION_KEYS = new Set<keyof Options>([
	'freq',
	'interval',
	'byweekday',
	'until',
	'count',
	'wkst',
]);

function weekdayFrom(index: number): Weekday | undefined {
	return WEEKDAYS[index];
}

function isOrdinal(n: number): n is Ordinal {
	return (ORDINALS as readonly number[]).includes(n);
}

/**
 * The `UNTIL` token as Google writes it — `20261231T045959Z` for a timed
 * Series, occasionally a bare `20261231` — read off the line rather than from
 * `rrule`'s Date so a date-only value stays the date it names.
 */
function untilDate(line: string): string | null {
	const match =
		/(?:^|;)UNTIL=(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?/.exec(
			line,
		);
	if (!match) return null;
	const [, y, m, d, hh, mm, ss, z] = match;
	if (!hh) return `${y}-${m}-${d}`;
	const stamp = `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
	const at = z
		? DateTime.fromISO(stamp, { zone: 'utc' }).setZone(DISPLAY_ZONE)
		: DateTime.fromISO(stamp, { zone: DISPLAY_ZONE });
	return at.toISODate();
}

/**
 * `rrule`'s text in sentence case, with `UNTIL` named as the display-zone
 * date. Left to its own devices `toText()` formats the token's UTC
 * components, and `20261231T045959Z` reads "December 31" for a Series that
 * ends the 30th.
 */
function describe(rrule: string): string {
	const until = untilDate(rrule);
	const text = RRule.fromString(rrule).toText(
		undefined,
		undefined,
		until
			? () =>
					DateTime.fromISO(until, { zone: DISPLAY_ZONE }).toFormat(
						'MMMM d, yyyy',
					)
			: undefined,
	);
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The `RRULE:` line of a Google `recurrence` array as the form sees it.
 * Anything the form has no controls for — daily, yearly, by month-day,
 * BYSETPOS, an nth weekday on a weekly rule — comes back as `custom`.
 */
export function parseRecurrence(lines: readonly string[]): Recurrence {
	const line = lines.find((entry) => entry.startsWith('RRULE:'));
	if (!line) return { kind: 'custom', rrule: '', text: 'No repeating rule' };

	let rule: RRule;
	try {
		rule = RRule.fromString(line);
	} catch {
		return { kind: 'custom', rrule: line, text: line };
	}
	const custom = (): CustomRecurrence => ({
		kind: 'custom',
		rrule: line,
		text: describe(line),
	});

	const options = rule.origOptions;
	if (
		Object.keys(options).some(
			(key) => !FORM_OPTION_KEYS.has(key as keyof Options),
		)
	) {
		return custom();
	}

	let ends: Ends = { kind: 'never' };
	if (options.count != null) ends = { kind: 'count', count: options.count };
	else if (options.until) {
		const date = untilDate(line);
		if (!date) return custom();
		ends = { kind: 'until', date };
	}
	const interval = options.interval ?? 1;

	const byweekday = options.byweekday == null ? [] : [options.byweekday].flat();
	// `rrule` gives a Weekday object per BYDAY entry; a plain number is only
	// possible when constructed in code, which a parsed line never is.
	const entries = byweekday.map((entry) =>
		typeof entry === 'number'
			? { weekday: entry, n: undefined }
			: typeof entry === 'string'
				? { weekday: WEEKDAYS.indexOf(entry as Weekday), n: undefined }
				: { weekday: entry.weekday, n: entry.n },
	);

	if (options.freq === RRule.WEEKLY) {
		if (entries.length === 0 || entries.some((entry) => entry.n != null)) {
			return custom();
		}
		const weekdays = entries.map((entry) => weekdayFrom(entry.weekday));
		if (weekdays.some((day) => day == null)) return custom();
		const weekStart =
			typeof options.wkst === 'number'
				? weekdayFrom(options.wkst)
				: options.wkst == null
					? undefined
					: weekdayFrom(options.wkst.weekday);
		return {
			kind: 'weekly',
			interval,
			weekdays: weekdays as Weekday[],
			ends,
			...(weekStart ? { weekStart } : {}),
		};
	}

	if (options.freq === RRule.MONTHLY) {
		if (options.wkst != null || entries.length === 0) return custom();
		const weekday = weekdayFrom(entries[0].weekday);
		if (
			!weekday ||
			entries.some(
				(entry) =>
					entry.weekday !== entries[0].weekday ||
					entry.n == null ||
					!isOrdinal(entry.n),
			)
		) {
			return custom();
		}
		return {
			kind: 'monthly',
			interval,
			ordinals: entries.map((entry) => entry.n as Ordinal),
			weekday,
			ends,
		};
	}

	return custom();
}

/** An iCalendar UTC timestamp, as `UNTIL` and `DTSTART` carry it. */
const ICAL_UTC = "yyyyLLdd'T'HHmmss'Z'";

function untilToken(date: string): string {
	return DateTime.fromISO(date, { zone: DISPLAY_ZONE })
		.endOf('day')
		.toUTC()
		.toFormat(ICAL_UTC);
}

/** The rule with its end replaced by `UNTIL=<now>`, whatever shape it has. */
export function endRule(line: string, now: DateTime): string {
	const stripped = line
		.replace(/;UNTIL=[^;]*/g, '')
		.replace(/;COUNT=[^;]*/g, '')
		.replace(/RRULE:UNTIL=[^;]*;?/, 'RRULE:')
		.replace(/RRULE:COUNT=[^;]*;?/, 'RRULE:');
	return `${stripped};UNTIL=${now.toUTC().toFormat(ICAL_UTC)}`;
}

/** The `RRULE:` line for Google's `recurrence` array. */
export function serializeRecurrence(form: RecurrenceForm): string {
	const parts: string[] = [];
	if (form.kind === 'weekly') {
		parts.push('FREQ=WEEKLY');
		if (form.weekStart) parts.push(`WKST=${form.weekStart}`);
		if (form.interval > 1) parts.push(`INTERVAL=${form.interval}`);
		parts.push(`BYDAY=${form.weekdays.join(',')}`);
	} else {
		parts.push('FREQ=MONTHLY');
		if (form.interval > 1) parts.push(`INTERVAL=${form.interval}`);
		parts.push(
			`BYDAY=${form.ordinals.map((n) => `${n}${form.weekday}`).join(',')}`,
		);
	}
	if (form.ends.kind === 'until')
		parts.push(`UNTIL=${untilToken(form.ends.date)}`);
	if (form.ends.kind === 'count') parts.push(`COUNT=${form.ends.count}`);
	return `RRULE:${parts.join(';')}`;
}

/** "every 2 weeks on Tuesday, Thursday until December 31, 2026" */
export function describeRecurrence(recurrence: Recurrence): string {
	if (recurrence.kind === 'custom') return recurrence.text;
	return describe(serializeRecurrence(recurrence));
}

/**
 * Whether `date` (display-zone `yyyy-MM-dd`) is an occurrence of the rule —
 * the first Event of a Series has to be, or Google adds it as a stray extra.
 * The `rrule` idiom: a "floating" start built from the wall-clock components
 * as UTC, so the check is zone-free.
 */
export function firstOccurrenceMatches(
	form: RecurrenceForm,
	date: string,
): boolean {
	const at = DateTime.fromISO(date, { zone: 'utc' });
	if (!at.isValid) return false;
	if (form.kind === 'weekly' ? !form.weekdays.length : !form.ordinals.length) {
		return false;
	}
	const dtstart = at.toJSDate();
	const rule = RRule.fromString(
		`DTSTART:${at.toFormat(ICAL_UTC)}\n${serializeRecurrence({
			...form,
			ends: { kind: 'never' },
		})}`,
	);
	return rule.after(dtstart, true)?.getTime() === dtstart.getTime();
}

/** A rule that ends before its first Event would create a Series with none. */
export function endsBeforeStart(form: RecurrenceForm, date: string): boolean {
	return form.ends.kind === 'until' && form.ends.date < date;
}
