'use client';

import { useMemo, useState } from 'react';

import {
	filterSlackMembers,
	type SlackMember,
} from '@/lib/volunteers/slackMemberPicker';
import { useDropdown } from './useDropdown';

/**
 * Pick one person out of the Slack directory: a text input that filters a
 * listbox as you type, and fills with the name once a row is chosen. Shared by
 * the Volunteers and User Management forms so a choice looks the same in both.
 *
 * `unavailable` returns why a row cannot be picked, or `null`. Such rows are
 * shown disabled with the reason rather than omitted: a maintainer searching
 * for a name they know is in Slack should find it and be told why not here.
 * `note` fills the same slot on a row that can be picked, for what picking it
 * will do when that is not the usual thing.
 *
 * The input shows `selected`'s name while there is a selection, so the parent
 * resets the picker by passing `selected={null}` — nothing imperative.
 */
export function SlackMemberCombobox<T extends SlackMember>({
	id,
	label,
	hideLabel = false,
	candidates,
	selected,
	onSelect,
	unavailable,
	note = () => null,
	emptyMessage = 'Nobody in Slack matches that.',
	size,
	disabled = false,
	placeholder = 'Search Slack…',
}: {
	id: string;
	label: string;
	hideLabel?: boolean;
	candidates: readonly T[];
	selected: T | null;
	/** `null` when typing clears the current choice. */
	onSelect: (member: T | null) => void;
	unavailable: (member: T) => string | null;
	note?: (member: T) => string | null;
	emptyMessage?: string;
	size?: 'sm';
	disabled?: boolean;
	placeholder?: string;
}) {
	const [query, setQuery] = useState('');
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLDivElement,
		HTMLInputElement
	>();
	const listboxId = `${id}-listbox`;

	const value = selected ? selected.displayName : query;
	const matches = useMemo(
		() => filterSlackMembers(candidates, value),
		[candidates, value],
	);

	function choose(member: T) {
		onSelect(member);
		setQuery('');
		setOpen(false);
	}

	return (
		<div className="dropdown" ref={wrapperRef}>
			<label
				className={hideLabel ? 'visually-hidden' : 'form-label'}
				htmlFor={id}
			>
				{label}
			</label>
			<input
				id={id}
				ref={toggleRef}
				type="text"
				className={`form-control${size === 'sm' ? ' form-control-sm' : ''}`}
				role="combobox"
				aria-expanded={open}
				aria-controls={listboxId}
				aria-autocomplete="list"
				autoComplete="off"
				placeholder={placeholder}
				disabled={disabled}
				value={value}
				onChange={(event) => {
					setQuery(event.target.value);
					onSelect(null);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
			/>

			{open && (
				<ul
					id={listboxId}
					className="dropdown-menu show py-1"
					role="listbox"
					style={
						{
							maxHeight: '18rem',
							overflowY: 'auto',
							'--bs-dropdown-font-size': '0.8125rem',
						} as React.CSSProperties
					}
				>
					{matches.length === 0 && (
						<li className="px-3 py-1 text-body-secondary small">
							{emptyMessage}
						</li>
					)}

					{matches.map((member) => {
						const reason = unavailable(member);
						const aside = reason ?? note(member);
						return (
							<li key={member.id}>
								<button
									type="button"
									role="option"
									aria-selected={selected?.id === member.id}
									className="dropdown-item d-flex justify-content-between gap-3"
									disabled={reason !== null || disabled}
									onClick={() => choose(member)}
								>
									<span>
										{member.displayName}
										{member.handle && (
											<span className="text-body-secondary">
												{' '}
												@{member.handle}
											</span>
										)}
									</span>
									{aside && (
										<span className="text-body-secondary small text-nowrap">
											{aside}
										</span>
									)}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
