'use client';

import { useActionState, useMemo } from 'react';

import type { FormState, Action } from './types';

const initialState: FormState = {
	is_error: false,
};

export function useAirtableForm(action: Action) {
	const [state, formAction] = useActionState<FormState, FormData>(
		action,
		initialState,
	);

	return useMemo(() => {
		const errorContent =
			state && state.is_error ? (
				<div className="alert alert-success" role="alert">
					<h4 className="alert-heading">
						There was an issue submitting your form.
					</h4>
					<p>{state.message}</p>
				</div>
			) : null;
		return { formAction, errorContent, state };
	}, [formAction, state]);
}
