'use client';

import { Submit, CodeOfConduct } from '@/components/forms';
import { createCoCViolation } from '@/util/airtable/action';
import { useAirtableForm } from '@/util/airtable/useAirtableForm';

export function Form() {
	const { formAction, isPending, errorContent } =
		useAirtableForm(createCoCViolation);
	return (
		<form
			action={formAction}
			// encType="multipart/form-data"
		>
			<input type="hidden" name="form-name" value="coc-violation" />
			<fieldset>
				<div className="form-group">
					<label htmlFor="formName">Your Name</label>
					<input
						type="text"
						className="form-control"
						id="formName"
						name="name"
						aria-describedby="nameHelp"
					/>
					<small id="nameHelp" className="form-text text-muted">
						Optional, skip if you wish to remain anonymous
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
					/>
					<small id="emailHelp" className="form-text text-muted">
						Optional, skip if you wish to remain anonymous
					</small>
				</div>
				<div className="form-group">
					<label htmlFor="reporteeName">
						Slack name of member you're reporting
					</label>
					<input
						type="text"
						className="form-control"
						id="reporteeName"
						name="reportee_name"
						required
						aria-describedby="reporteeNameHelp"
					/>
					<small id="reporteeNameHelp" className="form-text text-muted">
						Required
					</small>
				</div>
				<div className="form-group">
					<label htmlFor="timeLocation">Approximate time/location</label>
					<input
						type="text"
						className="form-control"
						id="timeLocation"
						name="time_location"
						required
						aria-describedby="timeLocationHelp"
					/>
					<small id="timeLocationHelp" className="form-text text-muted">
						Required
					</small>
				</div>
				<div className="form-group">
					<label htmlFor="description">Description of the event:</label>
					<textarea
						className="form-control"
						required
						id="description"
						name="description"
						rows={3}
						aria-describedby="descriptionHelp"
					></textarea>
					<small id="descriptionHelp" className="form-text text-muted">
						Required
					</small>
				</div>
				<div className="form-group">
					<label htmlFor="anyoneElseInvolved">
						Was anyone else involved in this event?
					</label>
					<textarea
						className="form-control"
						id="anyoneElseInvolved"
						name="anyone_else_involved"
						rows={3}
					></textarea>
				</div>

				{/*
				TODO: hook up file upload - probably using Netlify Blob
				<div className="form-group">
					<label htmlFor="uploadedFiles">Screenshot or any other file:</label>
					<input
						type="file"
						className="form-control"
						id="uploadedFiles"
						name="uploadedFiles"
						aria-describedby="uploadedFilesHelp"
					/>
				</div> */}
			</fieldset>

			<CodeOfConduct />
			{errorContent}
			<Submit text={isPending ? 'Submitting...' : 'Submit'} />
		</form>
	);
}
