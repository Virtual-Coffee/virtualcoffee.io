'use client';

import { eventLabel } from '@/lib/history/eventLabels';
import type { HistoryEntry, SubmissionSubject } from '@/lib/history/eventLog';
import { formatDateTime } from '../../../presentation';
import { Timeline } from '../../../timeline';
import { submissionStatusLabel } from '../presentation';

export function HistoryTimeline({
	history,
}: {
	history: HistoryEntry<SubmissionSubject>[];
}) {
	return (
		<Timeline
			entries={history}
			renderEntry={(entry) => (
				<>
					<div className="d-flex flex-wrap gap-2 align-items-baseline">
						<span className="badge text-bg-light border">
							{eventLabel(entry.type, 'badge')}
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
