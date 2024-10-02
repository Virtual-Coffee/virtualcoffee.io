'use client';

import { Submit, CodeOfConduct } from '@/components/forms';
import { createLunchAndLearnSubmission } from '@/util/airtable/action';
import { useAirtableForm } from '@/util/airtable/useAirtableForm';

export function Form() {
	const { formAction, errorContent } = useAirtableForm(
		createLunchAndLearnSubmission,
	);

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
						name="Name"
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
						name="Email"
						aria-describedby="emailHelp"
						required
					/>
					<small id="emailHelp" className="form-text text-muted">
						Required. We'll never share your email with anyone else.
					</small>
				</div>
			</fieldset>
			<fieldset>
				<legend>Your Lunch & Learn Idea:</legend>
				<div className="form-group">
					<label htmlFor="topicTitle">Title of the Lunch & Learn</label>
					<input
						type="text"
						className="form-control"
						id="topicTitle"
						name="Topic"
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="topicIdea">
						Description we can share on the event page.
					</label>
					<textarea
						className="form-control"
						required
						id="topicIdea"
						name="Description"
						rows={3}
					></textarea>
				</div>
				<div className="form-group">
					<label htmlFor="format">
						What is the format of your talk (question and answer,
						conference-style, etc.) and will you have slides?
					</label>
					<input
						type="text"
						className="form-control"
						id="format"
						name="Format"
					/>
				</div>
				<div className="form-group">
					<label htmlFor="date-time">What date and time works for you?</label>
					<input
						type="text"
						className="form-control"
						id="date-time"
						name="Timing"
						required
					/>
				</div>
			</fieldset>

			<CodeOfConduct />
			{errorContent}
			<Submit />
		</form>
	);
}
