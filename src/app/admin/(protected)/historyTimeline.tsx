'use client';

import type { HistoryEntry, StatusOf, Subject } from '@/lib/history/eventLog';
import { eventLabel } from '@/lib/history/eventLabels';
import { formatDateTime } from './presentation';
import { Timeline } from './timeline';

/**
 * One subject's History, as every detail page renders it: the event as a
 * badge, the status move when the event has one, the date and actor, then the
 * body. `statusLabels` is the Section's own wording for its statuses — a map,
 * not a function, because this is a client component; a subject with no
 * status leaves it off.
 */
export function HistoryTimeline<S extends Subject>({
	history,
	statusLabels,
}: {
	history: HistoryEntry<S>[];
	statusLabels?: Record<StatusOf<S>, string>;
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
						{statusLabels && entry.fromStatus && entry.toStatus && (
							<span className="small text-body-secondary">
								{statusLabels[entry.fromStatus]} →{' '}
								{statusLabels[entry.toStatus]}
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
