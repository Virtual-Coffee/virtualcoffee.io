'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function QueueSearch({ initialValue }: { initialValue: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [value, setValue] = useState(initialValue);

	return (
		<form
			role="search"
			className="d-flex gap-2"
			onSubmit={(event) => {
				event.preventDefault();
				const next = new URLSearchParams(searchParams.toString());
				if (value.trim()) next.set('q', value.trim());
				else next.delete('q');
				// A new search always restarts at page one; staying on page 4 of a
				// different result set shows an empty table for no obvious reason.
				next.delete('page');
				router.push(`${pathname}?${next.toString()}`);
			}}
		>
			<label className="visually-hidden" htmlFor="admin-search">
				Search applications
			</label>
			<input
				id="admin-search"
				type="search"
				className="form-control form-control-sm"
				placeholder="Name, email or GitHub"
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
			<button type="submit" className="btn btn-sm btn-outline-secondary">
				Search
			</button>
		</form>
	);
}
