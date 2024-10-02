'use client';

import { Submit, CodeOfConduct } from '@/components/forms';
import { createVolunteer } from '@/util/airtable/action';
import { useAirtableForm } from '@/util/airtable/useAirtableForm';
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

export function Form() {
	const { formAction, errorContent } = useAirtableForm(createVolunteer);

	return (
		<form action={formAction}>
			<fieldset>
				<legend>Your Information:</legend>
				<p className="text-muted">
					Just a couple quick pieces of info that we'll need:
				</p>
				<div className="form-group">
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
				<div className="form-group">
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
				<div className="form-group">
					<label htmlFor="formEmail">GitHub User Name</label>
					<input
						type="text"
						className="form-control"
						id="formEmail"
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
				<div className="form-group">
					<label htmlFor="position">Name of Role/Position</label>
					<Suspense>
						<Position />
					</Suspense>
				</div>
				<div className="form-group">
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
			{errorContent}
			<Submit />
		</form>
	);
}
