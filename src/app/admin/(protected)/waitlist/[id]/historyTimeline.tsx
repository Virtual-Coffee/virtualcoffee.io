'use client';

import {
	createColumnHelper,
	createSortedRowModel,
	rowSortingFeature,
	sortFn_datetime,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';

import type { HistoryEntry } from '@/lib/applications';
import { EVENT_LABELS, formatDateTime } from '../../presentation';

/**
 * `getApplicationHistory()` is unbounded — it returns every event on the
 * application, not a page of them — so the component holds the whole log and
 * reversing it here reverses all of it. That is what makes the toggle honest,
 * and it is the only reason this feed is worth running through the table
 * engine at all.
 */
const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { datetime: sortFn_datetime },
});

const helper = createColumnHelper<typeof features, HistoryEntry>();

/**
 * One column, whose cell is the whole card.
 *
 * A timeline entry is a sentence, not a row of fields; splitting it into four
 * columns to reassemble them in a `<li>` would be ceremony that buys nothing.
 * The column that does exist is the one the sort acts on.
 */
const columns = helper.columns([
	helper.accessor('createdAt', {
		header: 'Newest first',
		sortFn: 'datetime',
		cell: ({ row }) => {
			const entry = row.original;
			return (
				<>
					<div className="small">
						{entry.type === 'note' ? (
							<>
								<strong>{entry.actorName ?? 'Someone'}</strong> added a note:{' '}
								<em>&ldquo;{entry.body}&rdquo;</em>
							</>
						) : (
							<>
								{entry.actorName ? <strong>{entry.actorName} </strong> : null}
								{EVENT_LABELS[entry.type] ?? entry.type}
								{entry.body ? (
									<span className="text-body-secondary"> — {entry.body}</span>
								) : null}
							</>
						)}
					</div>
					<div className="text-body-secondary small">
						{formatDateTime(entry.createdAt)}
					</div>
				</>
			);
		},
	}),
]);

export function HistoryTimeline({ history }: { history: HistoryEntry[] }) {
	const table = useTable({
		features,
		columns,
		data: history,
		getRowId: (row) => row.id,
		// The rows arrive newest first from SQL; this matches so the first render
		// does not reorder them.
		initialState: { sorting: [{ id: 'createdAt', desc: true }] },
		enableSortingRemoval: false,
	});

	if (history.length === 0) {
		return (
			<p className="text-body-secondary small mb-0">
				Nothing has happened yet.
			</p>
		);
	}

	const [column] = table.getAllColumns();
	const oldestFirst = column?.getIsSorted() === 'asc';

	return (
		<>
			<button
				type="button"
				className="btn btn-link btn-sm p-0 text-decoration-none"
				onClick={column?.getToggleSortingHandler()}
			>
				{oldestFirst ? 'Oldest first' : 'Newest first'}
				<span aria-hidden="true">{oldestFirst ? ' ↑' : ' ↓'}</span>
			</button>
			<ol className="list-unstyled mt-2 mb-0">
				{table.getRowModel().rows.map((row) => (
					<li key={row.id} className="border-bottom py-2">
						{row.getAllCells().map((cell) => (
							<table.FlexRender key={cell.id} cell={cell} />
						))}
					</li>
				))}
			</ol>
		</>
	);
}
