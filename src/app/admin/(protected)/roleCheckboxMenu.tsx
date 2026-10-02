'use client';

import { useDropdown } from './useDropdown';

export type CheckboxMenuOption<Value extends string> = {
	value: Value;
	label: React.ReactNode;
	description?: React.ReactNode;
	disabled?: boolean;
};

/**
 * A list of roles as a dropdown of checkboxes.
 *
 * Presentational: the caller owns the selection, and `footer` is where a caller
 * that needs its own Save step puts it. A caller whose enclosing form already
 * commits the change omits it. `id` prefixes every element id, so two on one
 * page do not collide.
 */
export function RoleCheckboxMenu<Value extends string>({
	id,
	menuId = `${id}-menu`,
	label,
	labelledBy,
	size,
	disabled,
	scrollable,
	options,
	selected,
	onToggle,
	onOpen,
	footer,
	children,
}: {
	id: string;
	menuId?: string;
	label: React.ReactNode;
	labelledBy?: string;
	size?: 'sm';
	disabled?: boolean;
	scrollable?: boolean;
	options: ReadonlyArray<CheckboxMenuOption<Value>>;
	selected: readonly Value[];
	onToggle: (value: Value) => void;
	onOpen?: () => void;
	footer?: (close: () => void) => React.ReactNode;
	children?: React.ReactNode;
}) {
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLDivElement,
		HTMLButtonElement
	>();

	const close = () => setOpen(false);

	return (
		<div className="dropdown" ref={wrapperRef}>
			<button
				type="button"
				ref={toggleRef}
				className={`btn btn-outline-secondary dropdown-toggle${
					size === 'sm' ? ' btn-sm' : ''
				}`}
				aria-labelledby={labelledBy}
				aria-expanded={open}
				aria-haspopup="true"
				aria-controls={menuId}
				disabled={disabled}
				onClick={() => {
					if (!open) onOpen?.();
					setOpen((wasOpen) => !wasOpen);
				}}
			>
				{label}
			</button>

			{open && (
				<ul
					id={menuId}
					className={`dropdown-menu show py-1${
						scrollable ? ' overflow-auto' : ''
					}`}
					style={
						{
							// `.small` loses to `.dropdown-menu`'s own font-size; the variable wins.
							'--bs-dropdown-font-size': '0.8125rem',
							...(scrollable ? { maxHeight: '18rem' } : null),
						} as React.CSSProperties
					}
				>
					{options.map((option) => {
						const inputId = `${id}-${option.value.replace(
							/[^a-z0-9_]+/gi,
							'-',
						)}`;

						return (
							// Inset on the `li`: `.form-check`'s padding pairs with a negative
							// margin on the input, so a `px-*` there pushes the box outside.
							<li key={option.value} className="px-3">
								<div className="form-check py-1 mb-0 lh-sm">
									<input
										className="form-check-input"
										type="checkbox"
										id={inputId}
										checked={selected.includes(option.value)}
										disabled={option.disabled}
										onChange={() => onToggle(option.value)}
									/>
									<label className="form-check-label" htmlFor={inputId}>
										{option.label}
										{option.description && (
											<span className="d-block small text-body-secondary">
												{option.description}
											</span>
										)}
									</label>
								</div>
							</li>
						);
					})}

					{footer?.(close)}
				</ul>
			)}

			{children}
		</div>
	);
}
