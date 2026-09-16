'use client';

import type { TimeInput } from '@/lib/eventsCalendar';
import {
	EVENT_TYPE_LABELS,
	EVENT_TYPES,
	isEventType,
	type EventType,
} from '@/lib/eventTypes';

/** The admin-styled controls the three Events forms share. */

export type { TimeInput };

export function TextField({
	id,
	label,
	help,
	value,
	onChange,
	type = 'text',
	required,
	inputMode,
}: {
	id: string;
	label: string;
	help?: string;
	value: string;
	onChange: (value: string) => void;
	type?: 'text' | 'url';
	required?: boolean;
	inputMode?: 'numeric';
}) {
	return (
		<div className="mb-3">
			<label className="form-label small fw-semibold" htmlFor={id}>
				{label}
			</label>
			<input
				id={id}
				type={type}
				className="form-control form-control-sm"
				value={value}
				required={required}
				inputMode={inputMode}
				onChange={(event) => onChange(event.target.value)}
			/>
			{help && <div className="form-text">{help}</div>}
		</div>
	);
}

/**
 * The Zoom host key, kept on the Events Calendar for the Slack bots. The
 * Google UI cannot edit it, so this field is the only place it is set.
 */
export function HostCodeField({
	id,
	value,
	onChange,
}: {
	id: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<TextField
			id={id}
			label="Zoom host code"
			value={value}
			onChange={onChange}
			inputMode="numeric"
			help="Required for a Zoom Join Link. The Slack bots show it to the host; anyone who can read the calendar through the API can see it."
		/>
	);
}

/**
 * The Event Type, kept on the Events Calendar for the planned calendar feed.
 * `''` is no choice yet: a new form, or a legacy entry saved before there
 * were types — either way the actions refuse to save without one.
 */
export function EventTypeField({
	id,
	value,
	onChange,
	legacy,
}: {
	id: string;
	value: EventType | '';
	onChange: (value: EventType | '') => void;
	/** The entry exists and has no type: say so instead of "Choose". */
	legacy?: boolean;
}) {
	return (
		<div className="mb-3">
			<label className="form-label small fw-semibold" htmlFor={id}>
				Event Type
			</label>
			<select
				id={id}
				className="form-select form-select-sm"
				value={value}
				required
				onChange={(event) => {
					const next = event.target.value;
					onChange(isEventType(next) ? next : '');
				}}
			>
				<option value="" disabled>
					{legacy ? 'Untyped — choose one' : 'Choose an Event Type'}
				</option>
				{EVENT_TYPES.map((type) => (
					<option value={type} key={type}>
						{EVENT_TYPE_LABELS[type]}
					</option>
				))}
			</select>
			<div className="form-text">Groups Events for the calendar feed.</div>
		</div>
	);
}

export function TextAreaField({
	id,
	label,
	help,
	value,
	onChange,
}: {
	id: string;
	label: string;
	help?: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="mb-3">
			<label className="form-label small fw-semibold" htmlFor={id}>
				{label}
			</label>
			<textarea
				id={id}
				className="form-control form-control-sm"
				rows={5}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
			{help && <div className="form-text">{help}</div>}
		</div>
	);
}

const MINUTES = [
	'00',
	'05',
	'10',
	'15',
	'20',
	'25',
	'30',
	'35',
	'40',
	'45',
	'50',
	'55',
];
const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/**
 * A clock time as hour, minute and half of the day, in five-minute steps —
 * the browser's own picker offers every minute whatever `step` says. The
 * value stays the `HH:mm` the actions validate; a stray minute from a time
 * Google wrote is kept until the maintainer picks another.
 */
function TimeSelect({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const [hh = '09', mm = '00'] = value.split(':');
	const hour24 = Number(hh);
	const pm = hour24 >= 12;
	const hour12 = String(hour24 % 12 || 12);
	const set = (hour: string, minute: string, isPm: boolean) => {
		const h = (Number(hour) % 12) + (isPm ? 12 : 0);
		onChange(`${String(h).padStart(2, '0')}:${minute}`);
	};
	const minutes = MINUTES.includes(mm) ? MINUTES : [...MINUTES, mm].sort();
	return (
		<div
			className="input-group input-group-sm admin-time-select"
			role="group"
			aria-label={label}
		>
			<select
				id={id}
				className="form-select"
				aria-label={`${label} hour`}
				value={hour12}
				onChange={(event) => set(event.target.value, mm, pm)}
			>
				{HOURS.map((hour) => (
					<option value={hour} key={hour}>
						{hour}
					</option>
				))}
			</select>
			<span className="input-group-text px-1">:</span>
			<select
				className="form-select"
				aria-label={`${label} minute`}
				value={mm}
				onChange={(event) => set(hour12, event.target.value, pm)}
			>
				{minutes.map((minute) => (
					<option value={minute} key={minute}>
						{minute}
					</option>
				))}
			</select>
			<select
				className="form-select"
				aria-label={`${label} AM or PM`}
				value={pm ? 'PM' : 'AM'}
				onChange={(event) => set(hour12, mm, event.target.value === 'PM')}
			>
				<option value="AM">AM</option>
				<option value="PM">PM</option>
			</select>
		</div>
	);
}

/** Date and clock times, always Eastern — the zone the community runs in. */
export function TimeFields({
	id,
	dateLabel,
	draft,
	onChange,
}: {
	id: string;
	dateLabel: string;
	draft: TimeInput;
	onChange: (draft: TimeInput) => void;
}) {
	return (
		<div className="row g-2 mb-3">
			<div className="col-sm-12 col-md-4">
				<label className="form-label small fw-semibold" htmlFor={`${id}-date`}>
					{dateLabel}
				</label>
				<input
					id={`${id}-date`}
					type="date"
					className="form-control form-control-sm"
					value={draft.date}
					required
					onChange={(event) => onChange({ ...draft, date: event.target.value })}
				/>
			</div>
			<div className="col-6 col-md-4">
				<label className="form-label small fw-semibold" htmlFor={`${id}-start`}>
					Starts
				</label>
				<TimeSelect
					id={`${id}-start`}
					label="Starts"
					value={draft.startTime}
					onChange={(startTime) => onChange({ ...draft, startTime })}
				/>
			</div>
			<div className="col-6 col-md-4">
				<label className="form-label small fw-semibold" htmlFor={`${id}-end`}>
					Ends
				</label>
				<TimeSelect
					id={`${id}-end`}
					label="Ends"
					value={draft.endTime}
					onChange={(endTime) => onChange({ ...draft, endTime })}
				/>
			</div>
			<div className="form-text col-12 mt-1">Eastern time.</div>
		</div>
	);
}
