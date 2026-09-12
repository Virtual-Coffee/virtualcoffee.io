'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { CodeOfConduct, Field, Submit, TextArea } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitVolunteerSignup } from './action';

function Position({ error }: { error?: string }) {
	const searchParams = useSearchParams();

	const position = searchParams.get('position');
	return (
		<Field
			id="position"
			name="position"
			label="Name of Role/Position"
			error={error}
			defaultValue={position || ''}
			required
		/>
	);
}

export function Form({ spamToken }: { spamToken: string }) {
	const { formProps, errorContent, fieldError, state } = useFormAction(
		submitVolunteerSignup,
	);

	return (
		<form {...formProps}>
			<fieldset>
				<legend>Your Information:</legend>
				<p className="text-muted">
					Just a couple quick pieces of info that we'll need:
				</p>
				<Field
					id="formName"
					name="name"
					label="Your Name"
					help="Required."
					error={fieldError('name')}
					required
				/>
				<Field
					id="formEmail"
					name="email"
					type="email"
					label="Email"
					help="Required. We'll never share your email with anyone else."
					error={fieldError('email')}
					required
				/>
				<Field
					id="githubUsername"
					name="github_username"
					label="GitHub User Name"
					help="Required."
					error={fieldError('github_username')}
					required
				/>
			</fieldset>
			<fieldset>
				<legend>Role Details:</legend>
				<Suspense>
					<Position error={fieldError('position')} />
				</Suspense>
				<TextArea
					id="description"
					name="description"
					label="Any details or thoughts you may have"
					error={fieldError('description')}
					rows={3}
					required
				/>
			</fieldset>

			<CodeOfConduct error={fieldError('agree')} />
			<SpamGuardFields token={state?.spamToken ?? spamToken} />
			{errorContent}
			<Submit />
		</form>
	);
}
