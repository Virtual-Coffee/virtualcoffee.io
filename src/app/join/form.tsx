'use client';

import { CodeOfConduct, Submit } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitMembershipApplication } from './action';

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
	const { formAction, errorContent, fieldError, state } = useFormAction(
		submitMembershipApplication,
	);

	return (
		<form action={formAction} noValidate>
			{claimToken && <input type="hidden" name="invite" value={claimToken} />}
			{errorContent}

			<fieldset>
				<legend>About you</legend>

				<Field
					id="joinName"
					name="name"
					label="Your name"
					help="Required."
					error={fieldError('name')}
					defaultValue={defaultName}
					required
				/>
				<Field
					id="joinEmail"
					name="email"
					type="email"
					label="Email"
					help="Required. We’ll never share it."
					error={fieldError('email')}
					defaultValue={defaultEmail}
					required
				/>
				<Field
					id="joinPronouns"
					name="pronouns"
					label="Pronouns"
					error={fieldError('pronouns')}
				/>
				<Field
					id="joinGithub"
					name="githubUsername"
					label="GitHub username"
					error={fieldError('githubUsername')}
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
					error={fieldError('howDidYouHear')}
				/>
				<TextArea
					id="joinJourney"
					name="journey"
					label="Tell us about your coding journey"
					error={fieldError('journey')}
				/>
				<TextArea
					id="joinInterests"
					name="codeInterests"
					label="What are your coding interests?"
					error={fieldError('codeInterests')}
				/>
				<TextArea
					id="joinHoping"
					name="virtualCoffee"
					label="What are you hoping to get from Virtual Coffee?"
					error={fieldError('virtualCoffee')}
				/>
			</fieldset>

			<CodeOfConduct />
			{fieldError('agree') && (
				<p className="text-danger" role="alert">
					{fieldError('agree')}
				</p>
			)}
			<SpamGuardFields token={state?.spamToken ?? spamToken} />

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
