import { json, redirect, Form, useLoaderData } from 'remix';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { qualifiedUrl } from '~/util/url.server';

export async function loader() {
	return json({
		meta: {
			title: 'Report a Code of Conduct Violation',
			description: `If you have experienced or witnessed violations to Virtual Coffee's Code of Conduct, we need to know about it.`,
		},
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export async function action({ request }) {
	// netlify-forms
	const body = await request.formData();

	const response = await fetch(qualifiedUrl('/netlify-forms'), {
		method: 'POST',
		body,
	}).then((res) => res.text());

	console.log({ response });

	return redirect(`/report-coc-violation/thanks`);
}

export default function CocForm() {
	const { meta } = useLoaderData();
	return (
		<DefaultLayout
			simple
			heroSubheader={
				<>
					<p>{meta.description}</p>
					<p>
						Your privacy and security will be respected, but if you wish to
						remain anonymous, we will still accept and review your report.
					</p>
				</>
			}
		>
			<Form method="POST" reloadDocument>
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
							name="reporteeName"
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
							name="timeLocation"
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
							rows="3"
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
							name="anyoneElseInvolved"
							rows="3"
						></textarea>
					</div>

					<div className="form-group">
						<label htmlFor="uploadedFiles">Screenshot or any other file:</label>
						<input
							type="file"
							className="form-control"
							id="uploadedFiles"
							name="uploadedFiles"
							aria-describedby="uploadedFilesHelp"
						/>
					</div>
				</fieldset>

				<div className="text-right">
					<button type="submit" className="btn btn-primary btn-lg">
						Submit Report
					</button>
				</div>
			</Form>
		</DefaultLayout>
	);
}
