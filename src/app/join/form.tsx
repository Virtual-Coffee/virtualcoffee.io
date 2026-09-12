'use client';

import { useActionState } from 'react';

import { CodeOfConduct, Submit } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { submitMembershipApplication, type JoinFormState } from './action';

const initialState: JoinFormState = { is_error: false };

/**
 * `claimToken` rides along in a hidden field rather than being read from the URL
 * by the action — a server action gets a FormData, not the page's query string.
 * The name and email are prefilled from the Invite but stay editable: a
 * Volunteer typing a friend's name from memory is not the authority on how they
 * spell it.
 */
export function JoinForm({
	spamToken,
	claimToken,
	defaultName,
	defaultEmail,
}: {
	spamToken: string;
	claimToken?: string;
	defaultName?: string;
	defaultEmail?: string;
}) {
	const [state, formAction] = useActionState<JoinFormState, FormData>(
		submitMembershipApplication,
		initialState,
	);

	const fieldErrors = state?.fieldErrors ?? {};

	return (
		<form action={formAction} noValidate>
			{claimToken && <input type="hidden" name="invite" value={claimToken} />}
			{state?.is_error && (
				<div className="alert alert-danger" role="alert">
					<h2 className="h5 alert-heading">
						There was an issue submitting your form.
					</h2>
					<p className="mb-0">{state.message}</p>
				</div>
			)}

			<fieldset>
				<legend>About you</legend>

				<Field
					id="joinName"
					name="name"
					label="Your name"
					help="Required."
					error={fieldErrors.name}
					defaultValue={defaultName}
					required
				/>
				<Field
					id="joinEmail"
					name="email"
					type="email"
					label="Email"
					help="Required. We’ll never share it."
					error={fieldErrors.email}
					defaultValue={defaultEmail}
					required
				/>
				<Field
					id="joinPronouns"
					name="pronouns"
					label="Pronouns"
					error={fieldErrors.pronouns}
				/>
				<Field
					id="joinGithub"
					name="githubUsername"
					label="GitHub username"
					error={fieldErrors.githubUsername}
				/>
			</fieldset>

			<fieldset className="mt-4">
				<legend>A bit more</legend>
				<p className="text-muted">
					A few sentences each is plenty. A real person reads every one of
					these.
				</p>

				<TextArea
					id="joinHeard"
					name="howDidYouHear"
					label="How did you hear about us?"
					error={fieldErrors.howDidYouHear}
				/>
				<TextArea
					id="joinJourney"
					name="journey"
					label="Tell us about your coding journey"
					error={fieldErrors.journey}
				/>
				<TextArea
					id="joinInterests"
					name="codeInterests"
					label="What are your coding interests?"
					error={fieldErrors.codeInterests}
				/>
				<TextArea
					id="joinHoping"
					name="virtualCoffee"
					label="What are you hoping to get from Virtual Coffee?"
					error={fieldErrors.virtualCoffee}
				/>
			</fieldset>

			<CodeOfConduct />
			{fieldErrors.agree && (
				<p className="text-danger" role="alert">
					{fieldErrors.agree}
				</p>
			)}
			<SpamGuardFields token={spamToken} />

			<Submit />
		</form>
	);
}

function Field({
	id,
	name,
	label,
	help,
	error,
	type = 'text',
	required = false,
	defaultValue,
}: {
	id: string;
	name: string;
	label: string;
	help?: string;
	error?: string;
	type?: string;
	required?: boolean;
	defaultValue?: string;
}) {
	return (
		<div className="mb-form">
			<label htmlFor={id}>{label}</label>
			<input
				type={type}
				id={id}
				name={name}
				className={`form-control${error ? ' is-invalid' : ''}`}
				aria-describedby={`${id}Help`}
				aria-invalid={error ? true : undefined}
				required={required}
				defaultValue={defaultValue}
			/>
			<small id={`${id}Help`} className="form-text text-muted">
				{error ? <span className="text-danger">{error}</span> : help}
			</small>
		</div>
	);
}

function TextArea({
	id,
	name,
	label,
	error,
}: {
	id: string;
	name: string;
	label: string;
	error?: string;
}) {
	return (
		<div className="mb-form">
			<label htmlFor={id}>{label}</label>
			<textarea
				id={id}
				name={name}
				rows={4}
				className={`form-control${error ? ' is-invalid' : ''}`}
				aria-invalid={error ? true : undefined}
			/>
			{error && <small className="form-text text-danger">{error}</small>}
		</div>
	);
}
