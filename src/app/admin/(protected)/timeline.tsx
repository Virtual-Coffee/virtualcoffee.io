'use client';

import { useState, type ReactNode } from 'react';

/**
 * An event log with a newest/oldest toggle. The history queries are unbounded,
 * so the component holds every event and reversing it reverses all of them.
 * Rows arrive newest first from SQL.
 */
export function Timeline<T extends { id: string }>({
	entries,
	renderEntry,
}: {
	entries: T[];
	renderEntry: (entry: T) => ReactNode;
}) {
	const [oldestFirst, setOldestFirst] = useState(false);

	if (entries.length === 0) {
		return (
			<p className="text-body-secondary small mb-0">
				Nothing has happened yet.
			</p>
		);
	}

	const ordered = oldestFirst ? [...entries].reverse() : entries;

	return (
		<>
			<button
				type="button"
				className="btn btn-link btn-sm p-0 text-decoration-none"
				onClick={() => setOldestFirst((value) => !value)}
			>
				{oldestFirst ? 'Oldest first' : 'Newest first'}
				<span aria-hidden="true">{oldestFirst ? ' ↑' : ' ↓'}</span>
			</button>
			<ol className="list-unstyled mt-2 mb-0">
				{ordered.map((entry) => (
					<li key={entry.id} className="border-bottom py-2">
						{renderEntry(entry)}
					</li>
				))}
			</ol>
		</>
	);
}
