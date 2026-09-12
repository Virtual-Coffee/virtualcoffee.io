'use client';

import { Submit, CodeOfConduct } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitVolunteerSignup } from './action';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Position() {
	const searchParams = useSearchParams();

	const position = searchParams.get('position');
	return (
		<input
			type="text"
			className="form-control"
			id="position"
			name="position"
			defaultValue={position || ''}
			required
		/>
	);
}

export function Form({ spamToken }: { spamToken: string }) {
	const { formAction, errorContent, fieldError, state } = useFormAction(
		submitVolunteerSignup,
	);

	return (
		<form action={formAction}>
			<fieldset>
				<legend>Your Information:</legend>
				<p className="text-muted">
					Just a couple quick pieces of info that we'll need:
				</p>
				<div className="mb-form">
					<label htmlFor="formName">Your Name</label>
					<input
						type="text"
						className="form-control"
						id="formName"
						name="name"
						aria-describedby="nameHelp"
						required
					/>
					<small id="nameHelp" className="form-text text-muted">
						Required.
					</small>
				</div>
				<div className="mb-form">
					<label htmlFor="formEmail">Email</label>
					<input
						type="email"
						className="form-control"
						id="formEmail"
						name="email"
						aria-describedby="emailHelp"
						required
					/>
					<small id="emailHelp" className="form-text text-muted">
						Required. We'll never share your email with anyone else.
					</small>
				</div>
				<div className="mb-form">
					<label htmlFor="githubUsername">GitHub User Name</label>
					<input
						type="text"
						className={`form-control${
							fieldError('github_username') ? ' is-invalid' : ''
						}`}
						id="githubUsername"
						name="github_username"
						aria-describedby="githubHelp"
						required
					/>
					<small id="githubHelp" className="form-text text-muted">
						Required.
					</small>
				</div>
			</fieldset>
			<fieldset>
				<legend>Role Details:</legend>
				<div className="mb-form">
					<label htmlFor="position">Name of Role/Position</label>
					<Suspense>
						<Position />
					</Suspense>
				</div>
				<div className="mb-form">
					<label htmlFor="description">
						Any details or thoughts you may have
					</label>
					<textarea
						className="form-control"
						required
						id="description"
						name="description"
						rows={3}
					></textarea>
				</div>
			</fieldset>

			<CodeOfConduct />
			<SpamGuardFields token={state?.spamToken ?? spamToken} />
			{errorContent}
			<Submit />
		</form>
	);
}
