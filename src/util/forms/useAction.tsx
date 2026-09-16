'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { ActionResult, EmailActionResult } from '@/lib/actionResult';

/**
 * Run a server action from a button, keep its result, and refresh the page
 * on success so the server-rendered state catches up.
 *
 * One of these behind every control in /admin and /invites. `feedback` is
 * the default rendering of the result; components with their own layout read
 * `error` or `result` instead. `settle` runs on either outcome before the
 * refresh — for a dialog that should close whatever happened — and `refresh`
 * can be forced on failure too, for a screen whose numbers may have moved.
 */
export function useAction<
	R extends ActionResult | EmailActionResult = ActionResult,
>() {
	const router = useRouter();
	const [result, setResult] = useState<R | null>(null);
	const [pending, startTransition] = useTransition();

	function run(
		action: () => Promise<R>,
		options: {
			onSuccess?: (result: R & { ok: true }) => void;
			settle?: () => void;
			refresh?: 'on-success' | 'always';
		} = {},
	) {
		startTransition(async () => {
			let outcome: R;
			try {
				outcome = await action();
			} catch (error) {
				// A thrown action still closes the dialog, then reaches the error
				// boundary as it would have anyway.
				options.settle?.();
				throw error;
			}
			setResult(outcome);
			options.settle?.();
			if (outcome.ok) {
				options.onSuccess?.(outcome as R & { ok: true });
				router.refresh();
			} else if (options.refresh === 'always') {
				router.refresh();
			}
		});
	}

	const error = result && !result.ok ? result.message : null;

	// Success may carry no message, and an empty status alert is still announced.
	const feedback = result?.message ? (
		<div
			className={`alert ${result.ok ? 'alert-success' : 'alert-danger'} mt-3`}
			role={result.ok ? 'status' : 'alert'}
		>
			{result.message}
		</div>
	) : null;

	return {
		run,
		pending,
		result,
		error,
		feedback,
		clear: () => setResult(null),
	};
}
