'use client';

import { CodeOfConduct, Field, Submit, TextArea } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitLunchAndLearnIdea } from './action';

export function Form({ spamToken }: { spamToken: string }) {
	const { formProps, errorContent, fieldError, state } = useFormAction(
		submitLunchAndLearnIdea,
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
					name="Name"
					label="Your Name"
					help="Required"
					error={fieldError('Name')}
					required
				/>
				<Field
					id="formEmail"
					name="Email"
					type="email"
					label="Email"
					help="Required. We'll never share your email with anyone else."
					error={fieldError('Email')}
					required
				/>
			</fieldset>
			<fieldset>
				<legend>Your Lunch & Learn Idea:</legend>
				<Field
					id="topicTitle"
					name="Topic"
					label="Title of the Lunch & Learn"
					error={fieldError('Topic')}
					required
				/>
				<TextArea
					id="topicIdea"
					name="Description"
					label="Description we can share on the event page."
					error={fieldError('Description')}
					rows={3}
					required
				/>
				<Field
					id="format"
					name="Format"
					label="What is the format of your talk (question and answer, conference-style, etc.) and will you have slides?"
					error={fieldError('Format')}
				/>
				<Field
					id="date-time"
					name="Timing"
					label="What date and time works for you?"
					error={fieldError('Timing')}
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
