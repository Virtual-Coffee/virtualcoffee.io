import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { SubmissionStatus } from '@/db';
import { requirePermission } from '@/lib/adminAccess';
import {
	isSubmissionKind,
	listSubmissions,
	SUBMISSION_DISPLAY,
	SUBMISSION_KINDS,
	submissionStatusCounts,
} from '@/lib/submissions';
import { formatDateTime } from '../../presentation';
import { STATUS_ORDER, SubmissionStatusBadge } from './presentation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ kind: string }>;
}) {
	const { kind } = await params;
	return {
		title: isSubmissionKind(kind)
			? SUBMISSION_KINDS[kind].label
			: 'Submissions',
		robots: { index: false, follow: false },
	};
}

/**
 * One list screen for all four Submission kinds.
 *
 * A dynamic `[kind]` segment rather than four sibling directories: the URLs are
 * the same either way, the screens differ only in which fields they show, and
 * each kind is still gated on its own permission below. `SUBMISSION_KINDS` is
 * where a fifth kind would be added.
 */
export default async function SubmissionListPage({
	params,
	searchParams,
}: {
	params: Promise<{ kind: string }>;
	searchParams: Promise<{ status?: string }>;
}) {
	const { kind } = await params;

	if (!isSubmissionKind(kind)) notFound();

	// 404 rather than 403: someone who only handles volunteer signups should not
	// learn that the CoC section exists.
	await requirePermission(SUBMISSION_KINDS[kind].section, 'read');

	const { status } = await searchParams;
	const active = STATUS_ORDER.includes(status as SubmissionStatus)
		? (status as SubmissionStatus)
		: null;

	const [{ rows, rowCount }, counts] = await Promise.all([
		listSubmissions(kind, { statuses: active ? [active] : undefined }),
		submissionStatusCounts(kind),
	]);

	const display = SUBMISSION_DISPLAY[kind];
	const base = `/admin/submissions/${kind}`;

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap align-items-baseline gap-3 mb-3">
				<h1 className="h4 mb-0">{SUBMISSION_KINDS[kind].label}</h1>
				<span className="text-body-secondary small">
					{rowCount.toLocaleString()}{' '}
					{rowCount === 1 ? 'submission' : 'submissions'}
					{active ? ` with status “${active}”` : ''}
				</span>
			</div>

			<nav
				className="mb-3 d-flex flex-wrap gap-1"
				aria-label="Filter by status"
			>
				<Link
					href={base}
					className={`btn btn-sm ${active ? 'btn-outline-secondary' : 'btn-secondary'}`}
				>
					All ({counts.all ?? 0})
				</Link>
				{STATUS_ORDER.map((value) => (
					<Link
						key={value}
						href={`${base}?status=${value}`}
						className={`btn btn-sm ${
							active === value ? 'btn-secondary' : 'btn-outline-secondary'
						}`}
					>
						<SubmissionStatusBadge status={value} /> {counts[value] ?? 0}
					</Link>
				))}
			</nav>

			{rows.length === 0 ? (
				<p className="text-body-secondary">Nothing here yet.</p>
			) : (
				<div className="table-responsive">
					<table className="table table-hover align-middle">
						<thead>
							<tr>
								<th scope="col">Submission</th>
								<th scope="col">Status</th>
								<th scope="col">Received</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const summary = display.summary(row);
								return (
									<tr key={row.id}>
										<td>
											<Link href={`${base}/${row.id}`}>{summary.title}</Link>
											<div className="small text-body-secondary">
												{summary.subtitle}
											</div>
										</td>
										<td>
											<SubmissionStatusBadge status={row.status} />
										</td>
										<td className="small text-body-secondary">
											{formatDateTime(row.submittedAt)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
