'use client';

import { useActionState, useMemo } from 'react';

import type { FormState, Action } from './types';

const initialState: FormState = {
	is_error: false,
};

export function useFormAction(action: Action) {
	const [state, formAction] = useActionState<FormState, FormData>(
		action,
		initialState,
	);

	return useMemo(() => {
		const errorContent =
			state && state.is_error ? (
				// `alert-danger`, not `alert-success` — the old Airtable version used
				// the success colour for its error banner.
				<div className="alert alert-danger" role="alert">
					<h2 className="h5 alert-heading">
						There was an issue submitting your form.
					</h2>
					<p className="mb-0">{state.message}</p>
				</div>
			) : null;

		const fieldError = (name: string) => state?.fieldErrors?.[name];

		return { formAction, errorContent, fieldError, state };
	}, [formAction, state]);
}
