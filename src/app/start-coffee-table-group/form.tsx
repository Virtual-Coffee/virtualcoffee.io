'use client';

import { Submit, CodeOfConduct } from '@/components/forms';
import { createCoffeeTableGroup } from '@/util/airtable/action';
import { useAirtableForm } from '@/util/airtable/useAirtableForm';

export function Form() {
	const { formAction, errorContent } = useAirtableForm(createCoffeeTableGroup);

	return (
		<form action={formAction}>
			<input type="hidden" name="form-name" value="start-coffee-table-group" />
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
						Required
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
			</fieldset>
			<fieldset>
				<legend>Group Details:</legend>
				<div className="form-group">
					<label htmlFor="group_name">Name of the Coffee Table Group</label>
					<input
						type="text"
						className="form-control"
						id="group_name"
						name="group_name"
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="description">Group Description</label>
					<textarea
						className="form-control"
						required
						id="description"
						name="description"
						rows={3}
						aria-describedby="descriptionHelp"
					></textarea>
					<small id="descriptionHelp" className="form-text text-muted">
						Tell us all about your group idea!
					</small>
				</div>
			</fieldset>

			<CodeOfConduct />
			{errorContent}
			<Submit />
		</form>
	);
}
