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
			<div className="col-sm-5">
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
			<div className="col-sm">
				<label className="form-label small fw-semibold" htmlFor={`${id}-start`}>
					Starts
				</label>
				<input
					id={`${id}-start`}
					type="time"
					className="form-control form-control-sm"
					value={draft.startTime}
					required
					onChange={(event) =>
						onChange({ ...draft, startTime: event.target.value })
					}
				/>
			</div>
			<div className="col-sm">
				<label className="form-label small fw-semibold" htmlFor={`${id}-end`}>
					Ends
				</label>
				<input
					id={`${id}-end`}
					type="time"
					className="form-control form-control-sm"
					value={draft.endTime}
					required
					onChange={(event) =>
						onChange({ ...draft, endTime: event.target.value })
					}
				/>
			</div>
			<div className="form-text col-12 mt-1">Eastern time.</div>
		</div>
	);
}
