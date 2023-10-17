import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { Submit, CodeOfConduct } from '~/components/forms';
import { qualifiedUrl } from '~/util/url.server';
import LeadText from '~/components/content/LeadText';

export async function loader() {
	return json({
		meta: {
			title: 'Start a Coffee Table Group',
			description: `Submit your idea for a new Coffee Table Group at Virtual Coffee`,
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

	return redirect(`/start-coffee-table-group/thanks`);
}

export default function VolunteerForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawConversation"
			heroHeader="Start a Coffee Table Group"
			heroSubheader="Submit your idea for a new Coffee Table Group at Virtual Coffee!"
		>
			<LeadText>
				<p>
					Our Coffee Table Groups have been one of the most popular and valuable
					features for members of our community. Coffee Table Groups are small,
					special interest groups created and run by members. They can involve
					Zoom meetings, async Slack hangouts, or anything else that the members
					would like to do.
				</p>
				<p>
					To learn more about leading a Coffee Table Group, read our{' '}
					<Link to="/resources/virtual-coffee-handbook/get-involved/leading-coffee-table-groups">
						Leading Coffee Table Groups
					</Link>{' '}
					guide. See the list of our existing Coffee Table Groups in the{' '}
					<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups">
						Coffee Table Groups
					</Link>{' '}
					guide.
				</p>
			</LeadText>

			<Form method="POST" reloadDocument>
				<input
					type="hidden"
					name="form-name"
					value="start-coffee-table-group"
				/>
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
							rows="3"
							aria-describedby="descriptionHelp"
						></textarea>
						<small id="descriptionHelp" className="form-text text-muted">
							Tell us all about your group idea!
						</small>
					</div>
				</fieldset>

				<CodeOfConduct />
				<Submit />
			</Form>
		</DefaultLayout>
	);
}
