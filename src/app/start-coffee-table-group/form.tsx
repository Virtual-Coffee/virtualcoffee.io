'use client';

import { CodeOfConduct, Field, Submit, TextArea } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitCoffeeTableGroupRequest } from './action';

export function Form({ spamToken }: { spamToken: string }) {
	const { formProps, errorContent, fieldError, state } = useFormAction(
		submitCoffeeTableGroupRequest,
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
					help="Required"
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
			</fieldset>
			<fieldset>
				<legend>Group Details:</legend>
				<Field
					id="group_name"
					name="group_name"
					label="Name of the Coffee Table Group"
					error={fieldError('group_name')}
					required
				/>
				<TextArea
					id="description"
					name="description"
					label="Group Description"
					help="Tell us all about your group idea!"
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
