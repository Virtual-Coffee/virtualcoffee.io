'use client';

import {
	startTransition,
	useActionState,
	useCallback,
	useMemo,
	type SubmitEvent,
} from 'react';

import type { FormState, Action } from './types';

const initialState: FormState = {
	is_error: false,
};

export function useFormAction(action: Action) {
	const [state, formAction] = useActionState<FormState, FormData>(
		action,
		initialState,
	);

	/**
	 * Submitted through a transition rather than the form's `action` alone:
	 * React resets an uncontrolled form once a native action completes, which
	 * wiped everything the person had typed under a validation error. The
	 * `action` prop stays on the form so it still posts without JavaScript.
	 */
	const onSubmit = useCallback(
		(event: SubmitEvent<HTMLFormElement>) => {
			event.preventDefault();
			const formData = new FormData(event.currentTarget);
			startTransition(() => formAction(formData));
		},
		[formAction],
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

		return {
			formProps: { action: formAction, onSubmit },
			errorContent,
			fieldError,
			state,
		};
	}, [formAction, onSubmit, state]);
}
