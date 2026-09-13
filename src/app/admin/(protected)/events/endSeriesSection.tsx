'use client';

import { useRouter } from 'next/navigation';

import type { Series } from '@/lib/eventsCalendar';
import { useAction } from '@/util/forms/useAction';

import { endSeries } from './actions';

/**
 * Leaves for the list on success: a Series that never ran is deleted rather
 * than Ended, and this page would 404 on refresh.
 */
export function EndSeriesSection({ series }: { series: Series }) {
	const router = useRouter();
	const { run, pending, feedback } = useAction();
	return (
		<section className="border rounded p-3 mt-4" aria-labelledby="end-series">
			<h2 className="h6" id="end-series">
				End this Series
			</h2>
			<p className="small mb-3">
				No more Events will be scheduled. Past ones stay on the calendar.
			</p>
			<button
				type="button"
				className="btn btn-sm btn-outline-danger"
				disabled={pending}
				onClick={() => {
					if (
						!window.confirm(
							`End “${series.title}”? No more Events will be scheduled. Past ones stay on the calendar.`,
						)
					) {
						return;
					}
					run(() => endSeries(series.id, series.etag), {
						onSuccess: () => router.push('/admin/events'),
						refresh: 'always',
					});
				}}
			>
				{pending ? '…' : 'End Series'}
			</button>
			{feedback}
		</section>
	);
}
