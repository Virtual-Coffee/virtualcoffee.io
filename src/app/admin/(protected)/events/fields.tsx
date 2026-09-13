'use client';

/** The admin-styled controls the three Events forms share. */

export type TimeDraft = { date: string; startTime: string; endTime: string };

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
	draft: TimeDraft;
	onChange: (draft: TimeDraft) => void;
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
