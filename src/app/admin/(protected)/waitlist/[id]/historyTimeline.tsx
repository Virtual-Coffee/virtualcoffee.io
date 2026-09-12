'use client';

import type { HistoryEntry } from '@/lib/applications';
import { EVENT_LABELS, formatDateTime } from '../../presentation';
import { Timeline } from '../../timeline';

export function HistoryTimeline({ history }: { history: HistoryEntry[] }) {
	return (
		<Timeline
			entries={history}
			renderEntry={(entry) => (
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
			)}
		/>
	);
}
