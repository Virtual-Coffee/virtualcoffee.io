'use client';

import { useActionState } from 'react';

import type { FormState } from '@/util/forms/types';

import { joinSlack } from './action';

/**
 * One button. The token rides in a hidden field so the redemption is a POST;
 * the page that renders this only looked the token up.
 */
export function JoinSlackForm({ code }: { code: string }) {
	const [state, formAction, pending] = useActionState<FormState, FormData>(
		joinSlack,
		null,
	);

	return (
		<form action={formAction}>
			<input type="hidden" name="code" value={code} />
			{state?.is_error && (
				<p className="text-danger" role="alert">
					{state.message}
				</p>
			)}
			<button type="submit" className="btn btn-primary" disabled={pending}>
				{pending ? 'Opening Slack…' : 'Join the Virtual Coffee Slack'}
			</button>
		</form>
	);
}
