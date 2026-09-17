'use client';

import type { ApplicationSubject, HistoryEntry } from '@/lib/history/eventLog';
import { eventLabel } from '@/lib/history/eventLabels';
import { formatDateTime } from '../../presentation';
import { Timeline } from '../../timeline';

export function HistoryTimeline({
	history,
}: {
	history: HistoryEntry<ApplicationSubject>[];
}) {
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
								{eventLabel(entry.type, 'sentence')}
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
