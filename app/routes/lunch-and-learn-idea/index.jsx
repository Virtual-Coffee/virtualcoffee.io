import { json, redirect, Form, useLoaderData } from 'remix';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { Submit, CodeOfConduct } from '~/components/forms';
import { qualifiedUrl } from '~/util/url.server';

export async function loader() {
	return json({
		meta: {
			title: 'Lunch & Learn Talk Submission Form',
			description: `We can't wait to hear your talk!`,
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

	return redirect(`/lunch-and-learn-idea/thanks`);
}

export default function CocForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawPresentation"
			heroHeader="Virtual Coffee: Lunch &amp; Learns"
			heroSubheader="Submit your idea for a VC Lunch &amp; Learn!"
		>
			<div className="lead mb-5">
				<p>
					Lunch &amp; Learn talks are usually hour-long sessions on one topic.
					It can be a traditional conference-style talk, panel discussion,
					question and answer, or a combination.
				</p>
			</div>
			<Form method="POST" reloadDocument>
				<input
					type="hidden"
					name="form-name"
					value="lunch-and-learn-submissions"
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
					<legend>Your Lunch & Learn Idea:</legend>
					<div className="form-group">
						<label htmlFor="topicTitle">Title of the Lunch & Learn</label>
						<input
							type="text"
							className="form-control"
							id="topicTitle"
							name="topicTitle"
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
							name="topicIdea"
							rows="3"
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
							name="format"
						/>
					</div>
					<div className="form-group">
						<label htmlFor="date-time">What date and time works for you?</label>
						<input
							type="text"
							className="form-control"
							id="date-time"
							name="date-time"
							required
						/>
					</div>
				</fieldset>

				<CodeOfConduct />
				<Submit />
			</Form>
		</DefaultLayout>
	);
}
