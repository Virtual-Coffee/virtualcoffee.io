import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isId } from '@/db/ids';
import { requirePermission, sessionCan } from '@/lib/adminAccess';
import {
	getSubmission,
	getSubmissionHistory,
	isSubmissionKind,
	SUBMISSION_DISPLAY,
	SUBMISSION_KINDS,
} from '@/lib/submissions';
import { formatDateTime } from '../../../presentation';
import { NoteComposer } from '../../../noteComposer';
import { addSubmissionNote } from '../actions';
import { SubmissionStatusBadge } from '../presentation';
import { StatusControl } from '../statusControl';
import { HistoryTimeline } from './historyTimeline';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Submission',
	robots: { index: false, follow: false },
};

function formatValue(value: unknown): string {
	if (value === null || value === undefined || value === '') return '—';
	if (value instanceof Date) return formatDateTime(value);
	return String(value);
}

export default async function SubmissionDetailPage({
	params,
}: {
	params: Promise<{ kind: string; id: string }>;
}) {
	const { kind, id } = await params;

	if (!isSubmissionKind(kind)) notFound();

	const session = await requirePermission(
		SUBMISSION_KINDS[kind].section,
		'read',
	);
	const canManage = sessionCan(
		session,
		SUBMISSION_KINDS[kind].section,
		'manage',
	);

	if (!isId(id)) notFound();

	const [submission, history] = await Promise.all([
		getSubmission(kind, id),
		getSubmissionHistory(kind, id),
	]);

	if (!submission) notFound();

	const display = SUBMISSION_DISPLAY[kind];
	const attachmentKey = submission.attachmentBlobKey as string | null;

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<nav aria-label="Breadcrumb" className="small mb-2">
				<Link href={`/admin/submissions/${kind}`}>
					{SUBMISSION_KINDS[kind].label}
				</Link>
			</nav>

			<div className="d-flex flex-wrap align-items-baseline gap-3 mb-4">
				<h1 className="h4 mb-0">
					{SUBMISSION_KINDS[kind].singular} {submission.reference}
				</h1>
				<SubmissionStatusBadge status={submission.status} />
				<span className="small text-body-secondary">
					Received {formatDateTime(submission.submittedAt)}
				</span>
			</div>

			<div className="row g-4">
				<div className="col-lg-7">
					<dl className="row">
						{display.fields.map((field) => (
							<div className="col-12 mb-3" key={field.key}>
								<dt className="small text-body-secondary">{field.label}</dt>
								<dd
									className={`mb-0${field.long ? ' text-break' : ''}`}
									style={field.long ? { whiteSpace: 'pre-wrap' } : undefined}
								>
									{formatValue(submission[field.key])}
								</dd>
							</div>
						))}

						{kind === 'coc' && (
							<div className="col-12 mb-3">
								<dt className="small text-body-secondary">Attachment</dt>
								<dd className="mb-0">
									{attachmentKey ? (
										// Served through an authorized route, never a public
										// blob URL.
										<a
											href={`/admin/submissions/${kind}/${submission.id}/attachment`}
											rel="noopener noreferrer"
											target="_blank"
										>
											{formatValue(submission.attachmentFilename)}
										</a>
									) : (
										'—'
									)}
								</dd>
							</div>
						)}
					</dl>

					<h2 className="h6">Status</h2>
					<StatusControl
						kind={kind}
						id={submission.id}
						status={submission.status}
						canManage={canManage}
					/>
				</div>

				<div className="col-lg-5">
					<h2 className="h6">History</h2>
					<HistoryTimeline history={history} />

					{canManage && (
						<NoteComposer
							onSubmit={addSubmissionNote.bind(null, kind, submission.id)}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
