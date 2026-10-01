'use client';

import { useId } from 'react';

import {
	describeRecurrence,
	draftToForm,
	ORDINAL_LABELS,
	ORDINALS,
	WEEKDAY_LABELS,
	WEEKDAYS,
	type RecurrenceDraft,
	type Weekday,
} from '@/lib/events/recurrence';

function toggle<T>(list: T[], value: T, on: boolean): T[] {
	return on ? [...list, value] : list.filter((entry) => entry !== value);
}

export function RecurrenceFields({
	draft,
	onChange,
	disabled,
}: {
	draft: RecurrenceDraft;
	onChange: (draft: RecurrenceDraft) => void;
	disabled: boolean;
}) {
	const id = useId();
	const form = draftToForm(draft);
	const unit = draft.kind === 'weekly' ? 'week' : 'month';

	return (
		<fieldset disabled={disabled} className="mb-3">
			<legend className="form-label small fw-semibold">Repeats</legend>

			<div className="d-flex flex-wrap align-items-center gap-2 mb-2">
				<span className="small">Every</span>
				<input
					type="number"
					min={1}
					max={52}
					className="form-control form-control-sm"
					style={{ width: '5rem' }}
					aria-label={`Every how many ${unit}s`}
					value={draft.interval}
					onChange={(event) =>
						onChange({ ...draft, interval: event.target.value })
					}
				/>
				<select
					className="form-select form-select-sm w-auto"
					aria-label="Repeats weekly or monthly"
					value={draft.kind}
					onChange={(event) =>
						onChange({
							...draft,
							kind: event.target.value as RecurrenceDraft['kind'],
						})
					}
				>
					<option value="weekly">
						{draft.interval === '1' ? 'week' : 'weeks'}
					</option>
					<option value="monthly">
						{draft.interval === '1' ? 'month' : 'months'}
					</option>
				</select>
			</div>

			{draft.kind === 'weekly' ? (
				<div
					className="d-flex flex-wrap gap-2 mb-2"
					role="group"
					aria-label="On days"
				>
					{WEEKDAYS.map((day) => (
						<div className="form-check form-check-inline me-0" key={day}>
							<input
								className="form-check-input"
								type="checkbox"
								id={`${id}-${day}`}
								checked={draft.weekdays.includes(day)}
								onChange={(event) =>
									onChange({
										...draft,
										weekdays: toggle(draft.weekdays, day, event.target.checked),
									})
								}
							/>
							<label
								className="form-check-label small"
								htmlFor={`${id}-${day}`}
							>
								{WEEKDAY_LABELS[day].slice(0, 3)}
							</label>
						</div>
					))}
				</div>
			) : (
				<div className="d-flex flex-wrap align-items-center gap-2 mb-2">
					<span className="small">On the</span>
					<div
						className="d-flex flex-wrap gap-2"
						role="group"
						aria-label="Which weeks"
					>
						{ORDINALS.map((n) => (
							<div className="form-check form-check-inline me-0" key={n}>
								<input
									className="form-check-input"
									type="checkbox"
									id={`${id}-n${n}`}
									checked={draft.ordinals.includes(n)}
									onChange={(event) =>
										onChange({
											...draft,
											ordinals: toggle(draft.ordinals, n, event.target.checked),
										})
									}
								/>
								<label
									className="form-check-label small"
									htmlFor={`${id}-n${n}`}
								>
									{ORDINAL_LABELS[n]}
								</label>
							</div>
						))}
					</div>
					<select
						className="form-select form-select-sm w-auto"
						aria-label="Weekday"
						value={draft.weekday}
						onChange={(event) =>
							onChange({ ...draft, weekday: event.target.value as Weekday })
						}
					>
						{WEEKDAYS.map((day) => (
							<option value={day} key={day}>
								{WEEKDAY_LABELS[day]}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="d-flex flex-wrap align-items-center gap-2">
				<span className="small">Ends</span>
				<select
					className="form-select form-select-sm w-auto"
					aria-label="Ends"
					value={draft.endsKind}
					onChange={(event) =>
						onChange({
							...draft,
							endsKind: event.target.value as RecurrenceDraft['endsKind'],
						})
					}
				>
					<option value="never">never</option>
					<option value="until">on a date</option>
					<option value="count">after a number of Events</option>
				</select>
				{draft.endsKind === 'until' && (
					<input
						type="date"
						className="form-control form-control-sm w-auto"
						aria-label="Last day"
						value={draft.untilDate}
						onChange={(event) =>
							onChange({ ...draft, untilDate: event.target.value })
						}
					/>
				)}
				{draft.endsKind === 'count' && (
					<input
						type="number"
						min={1}
						max={999}
						className="form-control form-control-sm"
						style={{ width: '5rem' }}
						aria-label="Number of Events"
						value={draft.count}
						onChange={(event) =>
							onChange({ ...draft, count: event.target.value })
						}
					/>
				)}
			</div>

			<p className="form-text mb-0" aria-live="polite">
				{form
					? describeRecurrence(form)
					: 'Pick the days for a rule to appear here.'}
			</p>
		</fieldset>
	);
}
