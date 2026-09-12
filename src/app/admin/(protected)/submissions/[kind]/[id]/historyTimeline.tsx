'use client';

import type { SubmissionEventEntry } from '@/lib/submissions';
import { formatDateTime } from '../../../presentation';
import { Timeline } from '../../../timeline';
import {
	SUBMISSION_EVENT_LABELS,
	submissionStatusLabel,
} from '../presentation';

export function HistoryTimeline({
	history,
}: {
	history: SubmissionEventEntry[];
}) {
	return (
		<Timeline
			entries={history}
			renderEntry={(entry) => (
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
			)}
		/>
	);
}
