'use client';

import { CodeOfConduct, Field, Submit, TextArea } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitCocReport } from './action';

export function Form({ spamToken }: { spamToken: string }) {
	const { formProps, errorContent, fieldError, state } =
		useFormAction(submitCocReport);

	return (
		<form {...formProps} encType="multipart/form-data">
			<fieldset>
				<Field
					id="formName"
					name="name"
					label="Your Name"
					help="Optional, skip if you wish to remain anonymous"
					error={fieldError('name')}
				/>
				<Field
					id="formEmail"
					name="email"
					type="email"
					label="Email"
					help="Optional, skip if you wish to remain anonymous"
					error={fieldError('email')}
				/>
				<Field
					id="reporteeName"
					name="reportee_name"
					label="Slack name of member you’re reporting"
					help="Required"
					error={fieldError('reportee_name')}
					required
				/>
				<Field
					id="timeLocation"
					name="time_location"
					label="Approximate time/location"
					help="Required"
					error={fieldError('time_location')}
					required
				/>
				<TextArea
					id="description"
					name="description"
					label="Description of the event:"
					help="Required"
					error={fieldError('description')}
					rows={3}
					required
				/>
				<TextArea
					id="anyoneElseInvolved"
					name="anyone_else_involved"
					label="Was anyone else involved in this event?"
					error={fieldError('anyone_else_involved')}
					rows={3}
				/>
				<Field
					id="uploadedFiles"
					name="uploadedFiles"
					type="file"
					label="Screenshot or any other file:"
					help="Optional. One image or PDF, up to 10MB."
					error={fieldError('uploadedFiles')}
					accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
				/>
			</fieldset>

			<CodeOfConduct error={fieldError('agree')} />
			<SpamGuardFields token={state?.spamToken ?? spamToken} />
			{errorContent}
			<Submit />
		</form>
	);
}
