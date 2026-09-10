'use client';

import {
	createColumnHelper,
	createSortedRowModel,
	rowSortingFeature,
	sortFn_datetime,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';

import type { SubmissionEventEntry } from '@/lib/submissions';
import { formatDateTime } from '../../../presentation';
import {
	SUBMISSION_EVENT_LABELS,
	submissionStatusLabel,
} from '../presentation';

/**
 * As on the waitlist detail screen: `getSubmissionHistory()` is unbounded, so
 * this component holds every event and reversing it reverses all of them.
 */
const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { datetime: sortFn_datetime },
});

const helper = createColumnHelper<typeof features, SubmissionEventEntry>();

const columns = helper.columns([
	helper.accessor('createdAt', {
		header: 'Newest first',
		sortFn: 'datetime',
		cell: ({ row }) => {
			const entry = row.original;
			return (
				<>
					<div className="d-flex flex-wrap gap-2 align-items-baseline">
						<span className="badge text-bg-light border">
							{SUBMISSION_EVENT_LABELS[entry.type] ?? entry.type}
						</span>
						{entry.fromStatus && entry.toStatus && (
							<span className="small text-body-secondary">
								{submissionStatusLabel(entry.fromStatus)} →{' '}
								{submissionStatusLabel(entry.toStatus)}
							</span>
						)}
						<span className="ms-auto small text-body-secondary">
							{formatDateTime(entry.createdAt)}
							{entry.actorName ? ` · ${entry.actorName}` : ''}
						</span>
					</div>
					{entry.body && (
						<p className="small mb-0 mt-1" style={{ whiteSpace: 'pre-wrap' }}>
							{entry.body}
						</p>
					)}
				</>
			);
		},
	}),
]);

export function HistoryTimeline({
	history,
}: {
	history: SubmissionEventEntry[];
}) {
	const table = useTable({
		features,
		columns,
		data: history,
		getRowId: (row) => row.id,
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
			<ul className="list-group list-group-flush">
				{table.getRowModel().rows.map((row) => (
					<li className="list-group-item px-0" key={row.id}>
						{row.getAllCells().map((cell) => (
							<table.FlexRender key={cell.id} cell={cell} />
						))}
					</li>
				))}
			</ul>
		</>
	);
}
