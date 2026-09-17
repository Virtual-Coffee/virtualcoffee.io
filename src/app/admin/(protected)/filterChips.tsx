import Link from 'next/link';
import type { ReactNode } from 'react';

import { listHref } from '@/util/searchParams';

/**
 * The one filter-chip group every /admin list uses. A section passes the
 * values it has already validated; nothing here reads `searchParams` itself.
 */

/**
 * Where one chip links to: the current view with `param` set to `value`.
 *
 * `keep` carries the other filters, the search and the sort, so a status
 * change does not throw away what the maintainer set. `page` is never in it —
 * a filter changes which rows exist, so page 4 of the old filter is not a
 * place to land.
 */
export function chipHref(
	base: string,
	keep: Record<string, string | null | undefined>,
	param: string,
	value: string | null,
): string {
	return listHref(base, { ...keep, [param]: value });
}

export function FilterChips({
	base,
	keep,
	param,
	active,
	chips,
	ariaLabel,
}: {
	base: string;
	/** Every other validated value; a default is passed as null. */
	keep: Record<string, string | null | undefined>;
	param: string;
	/** null is the default view, whose link carries no `param` at all. */
	active: string | null;
	chips: { value: string | null; label: ReactNode; count?: number }[];
	ariaLabel: string;
}) {
	return (
		<div className="btn-group" role="group" aria-label={ariaLabel}>
			{chips.map((chip) => (
				<Link
					key={chip.value ?? ''}
					href={chipHref(base, keep, param, chip.value)}
					aria-current={active === chip.value ? 'page' : undefined}
					className={`btn btn-sm ${
						active === chip.value ? 'btn-primary' : 'btn-outline-secondary'
					}`}
				>
					{chip.label}
					{chip.count !== undefined && (
						<>
							{' '}
							<span className="badge text-bg-light border ms-1">
								{chip.count}
							</span>
						</>
					)}
				</Link>
			))}
		</div>
	);
}
