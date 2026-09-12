'use client';

import { Submit, CodeOfConduct } from '@/components/forms';
import { SpamGuardFields } from '@/util/forms/SpamGuardFields';
import { useFormAction } from '@/util/forms/useFormAction';
import { submitCocReport } from './action';

export function Form({ spamToken }: { spamToken: string }) {
	const { formAction, errorContent, fieldError, state } =
		useFormAction(submitCocReport);

	return (
		<form action={formAction} encType="multipart/form-data">
			<fieldset>
				<div className="mb-form">
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
				<div className="mb-form">
					<label htmlFor="formEmail">Email</label>
					<input
						type="email"
						className={`form-control${fieldError('email') ? ' is-invalid' : ''}`}
						id="formEmail"
						name="email"
						aria-describedby="emailHelp"
					/>
					{fieldError('email') && (
						<div className="invalid-feedback">{fieldError('email')}</div>
					)}
					<small id="emailHelp" className="form-text text-muted">
						Optional, skip if you wish to remain anonymous
					</small>
				</div>
				<div className="mb-form">
					<label htmlFor="reporteeName">
						Slack name of member you&apos;re reporting
					</label>
					<input
						type="text"
						className={`form-control${
							fieldError('reportee_name') ? ' is-invalid' : ''
						}`}
						id="reporteeName"
						name="reportee_name"
						required
						aria-describedby="reporteeNameHelp"
					/>
					{fieldError('reportee_name') && (
						<div className="invalid-feedback">
							{fieldError('reportee_name')}
						</div>
					)}
					<small id="reporteeNameHelp" className="form-text text-muted">
						Required
					</small>
				</div>
				<div className="mb-form">
					<label htmlFor="timeLocation">Approximate time/location</label>
					<input
						type="text"
						className={`form-control${
							fieldError('time_location') ? ' is-invalid' : ''
						}`}
						id="timeLocation"
						name="time_location"
						required
						aria-describedby="timeLocationHelp"
					/>
					{fieldError('time_location') && (
						<div className="invalid-feedback">
							{fieldError('time_location')}
						</div>
					)}
					<small id="timeLocationHelp" className="form-text text-muted">
						Required
					</small>
				</div>
				<div className="mb-form">
					<label htmlFor="description">Description of the event:</label>
					<textarea
						className={`form-control${
							fieldError('description') ? ' is-invalid' : ''
						}`}
						required
						id="description"
						name="description"
						rows={3}
						aria-describedby="descriptionHelp"
					></textarea>
					{fieldError('description') && (
						<div className="invalid-feedback">{fieldError('description')}</div>
					)}
					<small id="descriptionHelp" className="form-text text-muted">
						Required
					</small>
				</div>
				<div className="mb-form">
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

				<div className="mb-form">
					<label htmlFor="uploadedFiles">Screenshot or any other file:</label>
					<input
						type="file"
						className={`form-control${
							fieldError('uploadedFiles') ? ' is-invalid' : ''
						}`}
						id="uploadedFiles"
						name="uploadedFiles"
						accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
						aria-describedby="uploadedFilesHelp"
					/>
					{fieldError('uploadedFiles') && (
						<div className="invalid-feedback">
							{fieldError('uploadedFiles')}
						</div>
					)}
					<small id="uploadedFilesHelp" className="form-text text-muted">
						Optional. One image or PDF, up to 10MB.
					</small>
				</div>
			</fieldset>

			<CodeOfConduct />
			<SpamGuardFields token={state?.spamToken ?? spamToken} />
			{errorContent}
			<Submit />
		</form>
	);
}
