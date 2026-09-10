'use client';

import type { ReactNode } from 'react';
import type { SortDirection } from '@tanstack/react-table';

/**
 * A sortable column header.
 *
 * Takes the resolved sort direction and the table's own toggle handler rather
 * than a `Header` object: the header type is parameterised by the table's
 * feature set, and keeping this component plain avoids threading those
 * generics through every admin table. The caller still renders the header
 * content itself, through its own `table.FlexRender`.
 */
export function SortableHeader({
	sorted,
	label,
	onClick,
	children,
}: {
	sorted: false | SortDirection;
	label: string;
	onClick: ((event: unknown) => void) | undefined;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			className="btn btn-link btn-sm p-0 text-decoration-none text-body"
			onClick={onClick}
			aria-label={`Sort by ${label}`}
		>
			{children}
			<span aria-hidden="true">
				{sorted === 'desc' ? ' ↓' : sorted ? ' ↑' : ''}
			</span>
		</button>
	);
}
