'use client';

import Link from 'next/link';
import {
	createColumnHelper,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';

import type { ActivityEntry } from '@/lib/dashboard';
import { formatDateTime } from './presentation';

/**
 * Terser than the detail screens' labels: this feed mixes application and
 * submission events, so an entry already carries its subject beside the badge.
 */
const EVENT_LABELS: Record<string, string> = {
	submitted: 'Submitted',
	waitlisted: 'Waitlisted',
	coffee_invited: 'Coffee invited',
	attendance_recorded: 'Attendance recorded',
	approved: 'Approved',
	declined: 'Declined',
	withdrawn: 'Withdrawn',
	lapsed: 'Lapsed',
	note: 'Note',
	email_sent: 'Email sent',
	email_failed: 'Email failed',
	imported: 'Imported',
	status_changed: 'Status changed',
	notification_sent: 'Notified',
	notification_failed: 'Notification failed',
};

/**
 * No sorting, deliberately — do not add it.
 *
 * `recentActivity()` returns the newest `ACTIVITY_LIMIT` entries of a much
 * larger log, merged from the application and submission event tables. A
 * client-side `sortedRowModel` could only reorder the fifteen rows that made
 * it here, so sorting by actor would show "the fifteen most recent events,
 * alphabetised" under a header that claims to be alphabetising the history.
 *
 * The two detail-screen timelines do register sorting, because their queries
 * are unbounded and they really do hold everything they claim to order.
 */
const features = tableFeatures({});

const helper = createColumnHelper<typeof features, ActivityEntry>();

/**
 * One column whose cell is the whole card: an activity entry is a sentence,
 * not a row of fields.
 */
const columns = helper.columns([
	helper.accessor('subject', {
		header: 'Activity',
		cell: ({ row }) => {
			const entry = row.original;
			return (
				<>
					<div className="d-flex flex-wrap gap-2 align-items-baseline">
						<span className="badge text-bg-light border">
							{EVENT_LABELS[entry.type] ?? entry.type}
						</span>
						{entry.href ? (
							<Link href={entry.href}>{entry.subject}</Link>
						) : (
							<span>{entry.subject}</span>
						)}
						<span className="ms-auto small text-body-secondary">
							{formatDateTime(entry.createdAt)}
							{entry.actorName ? ` · ${entry.actorName}` : ''}
						</span>
					</div>
					{entry.body && (
						<p className="small text-body-secondary mb-0 mt-1">{entry.body}</p>
					)}
				</>
			);
		},
	}),
]);

export function ActivityTable({ entries }: { entries: ActivityEntry[] }) {
	const table = useTable({
		features,
		columns,
		data: entries,
		getRowId: (row) => row.key,
	});

	if (entries.length === 0) {
		return <p className="text-body-secondary">Nothing has happened yet.</p>;
	}

	return (
		<ul className="list-group">
			{table.getRowModel().rows.map((row) => (
				<li className="list-group-item" key={row.id}>
					{row.getAllCells().map((cell) => (
						<table.FlexRender key={cell.id} cell={cell} />
					))}
				</li>
			))}
		</ul>
	);
}
