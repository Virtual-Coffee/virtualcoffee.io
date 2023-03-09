import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { Submit, CodeOfConduct } from '~/components/forms';
import { qualifiedUrl } from '~/util/url.server';
import LeadText from '~/components/content/LeadText';
import { createMetaData } from '~/util/createMetaData.server';

export async function loader({ request }) {
	const url = new URL(request.url);
	const position = url.searchParams.get('position');

	return json({
		position,
		meta: createMetaData({
			title: 'Volunteer at Virtual Coffee',
			description: `Part of Virtual Coffee's mission is to make safe, supportive spaces for pursuing leadership and roles in community building. We currently have a few initiatives where we'd love to have more volunteers in helping make this community great!`,
			Hero: 'UndrawPowerful',
		}),
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

	return redirect(`/volunteer-at-virtual-coffee/thanks`);
}

export default function VolunteerForm() {
	const { position } = useLoaderData();
	return (
		<DefaultLayout
			simple
			Hero="UndrawPowerful"
			heroHeader="Volunteer at Virtual Coffee"
			heroSubheader="Give back to this amazing community!"
		>
			<LeadText>
				<p>
					Part of Virtual Coffee's mission is to make safe, supportive spaces
					for pursuing leadership and roles in community building. We currently
					have a few initiatives where we'd love to have more volunteers in
					helping make this community great!
				</p>
				<p>
					To read more and to see some roles available, read our{' '}
					<Link to="/resources/virtual-coffee/get-involved/paths-to-leadership">
						Paths to Leadership &amp; Roles guide
					</Link>
					.
				</p>
			</LeadText>

			<Form method="POST" reloadDocument>
				<input type="hidden" name="form-name" value="volunteer-form" />
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
							name="githubUsername"
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
						<input
							type="text"
							className="form-control"
							id="position"
							name="position"
							defaultValue={position || ''}
							required
						/>
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
							rows="3"
						></textarea>
					</div>
				</fieldset>

				<CodeOfConduct />
				<Submit />
			</Form>
		</DefaultLayout>
	);
}
