import { notFound } from 'next/navigation';

import { requirePermission } from '@/lib/access/adminAccess';
import type { SubmissionListHref } from '@/lib/admin/links';
import { neverAnnouncedAmong } from '@/lib/history/eventLog';
import {
	failedNotifications,
	isSubmissionKind,
	listSubmissions,
	SUBMISSION_DISPLAY,
	SUBMISSION_KINDS,
	submissionScope,
	submissionStatusCounts,
} from '@/lib/submissions/submissions';
import { FilterChips } from '../../filterChips';
import { STATUS_ORDER } from '@/lib/submissions/status';
import { SubmissionStatusBadge, submissionStatusLabel } from './presentation';
import { PAGE_SIZE } from '@/util/searchParams';
import { parseSubmissionSearchParams } from './searchParams';
import { SubmissionsTable, type SubmissionListRow } from './submissionsTable';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ kind: string }>;
}) {
	const { kind } = await params;
	if (!isSubmissionKind(kind)) notFound();
	// Metadata resolves independently of the page, so the title is gated the
	// same way — or the 404 would carry the section name it exists to hide.
	await requirePermission(SUBMISSION_KINDS[kind].section, 'read');
	return {
		title: SUBMISSION_KINDS[kind].label,
		robots: { index: false, follow: false },
	};
}

/** One list screen for all four Submission kinds, each gated on its own permission. */
export default async function SubmissionListPage({
	params,
	searchParams,
}: {
	params: Promise<{ kind: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { kind } = await params;

	if (!isSubmissionKind(kind)) notFound();

	// 404 rather than 403: someone who only handles volunteer signups should not
	// learn that the CoC section exists.
	await requirePermission(SUBMISSION_KINDS[kind].section, 'read');

	const filters = parseSubmissionSearchParams(await searchParams);
	const active = filters.status;

	const [{ rows, rowCount }, counts, failures] = await Promise.all([
		listSubmissions(kind, {
			statuses: active ? [active] : undefined,
			failed: filters.failed,
			page: filters.page,
			sort: filters.sort,
			direction: filters.direction,
		}),
		submissionStatusCounts(kind),
		failedNotifications([kind]),
	]);
	const neverAnnouncedIds = new Set(
		await neverAnnouncedAmong(
			submissionScope(kind),
			rows.map((row) => row.id),
		),
	);
	const failedCount = failures[kind] ?? 0;

	const display = SUBMISSION_DISPLAY[kind];
	const base: SubmissionListHref = `/admin/submissions/${kind}`;
	const order = {
		sort: filters.sort === 'submittedAt' ? null : filters.sort,
		dir: filters.direction === 'desc' ? null : filters.direction,
	};

	// Flattened here so the client table never has to reach for
	// `SUBMISSION_DISPLAY`, which lives behind a drizzle import.
	const listRows: SubmissionListRow[] = rows.map((row) => {
		const summary = display.summary(row);
		return {
			id: row.id,
			reference: row.reference,
			title: summary.title,
			subtitle: summary.subtitle,
			status: row.status,
			submittedAt: row.submittedAt,
			neverAnnounced: neverAnnouncedIds.has(row.id),
		};
	});

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap align-items-baseline gap-3 mb-3">
				<h1 className="h4 mb-0">{SUBMISSION_KINDS[kind].label}</h1>
				<span className="text-body-secondary small">
					{rowCount.toLocaleString()}{' '}
					{rowCount === 1 ? 'submission' : 'submissions'}
					{active ? ` with status “${submissionStatusLabel(active)}”` : ''}
					{filters.failed ? ', never announced' : ''}
				</span>
			</div>

			<div className="d-flex flex-wrap gap-3 align-items-center mb-3">
				<FilterChips
					base={base}
					// The chips reset the page but keep the order the maintainer chose.
					keep={{ ...order, failed: filters.failed ? '1' : null }}
					param="status"
					active={active}
					chips={[
						{ value: null, label: 'All', count: counts.all ?? 0 },
						...STATUS_ORDER.map((value) => ({
							value,
							label: <SubmissionStatusBadge status={value} />,
							count: counts[value] ?? 0,
						})),
					]}
					ariaLabel="Filter by status"
				/>
				{/* Stored but never announced; docs/adr/0005. */}
				<FilterChips
					base={base}
					keep={{ ...order, status: active }}
					param="failed"
					active={filters.failed ? '1' : null}
					chips={[
						{ value: null, label: 'Any' },
						{ value: '1', label: 'Not announced', count: failedCount },
					]}
					ariaLabel="Filter by announcement"
				/>
			</div>

			<SubmissionsTable
				rows={listRows}
				rowCount={rowCount}
				basePath={base}
				page={filters.page}
				pageSize={PAGE_SIZE}
				sort={filters.sort}
				direction={filters.direction}
			/>
		</div>
	);
}
