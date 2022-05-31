import { Form, useActionData, useCatch } from '@remix-run/react';
import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
} from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { sessionStorage } from '~/auth/session.server';
import { AuthorizationError } from 'remix-auth';
import Api from '~/api/cms.server';

function SignUpForm({ errorMessage }) {
	return (
		<Form method="post">
			{errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
			<div className="py-5">
				<div className="container">
					<div className="bodycopy">
						<div className="lead mb-5">
							<p>
								Virtual coffee is, and always will be, a genuine community of
								people who value and prioritize supporting one another. We
								absolutely love the closeness of this community and know its one
								of the many things that sets us apart.
							</p>
							<p>
								We strongly value getting to see each other every
								Tuesday/Thursday and at the many other events we host. Everyone
								here is amazing and we want to continue to be able to support
								your needs and personal growth. In order to support you as a
								community member, we'd love to know a little bit more about you.
							</p>
						</div>

						<input type="hidden" name="formID" value="{{id}}" />
						<h2>Tell us about yourself!</h2>
						<fieldset>
							<legend>Required Information:</legend>
							<p className="text-muted">
								Just a couple quick pieces of info that we'll need:
							</p>
							<div className="form-group">
								<label htmlFor="formName">Your Name</label>
								<input
									type="text"
									className="form-control"
									id="formName"
									name="userYourName"
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
							<div className="form-group">
								<label htmlFor="formPassword">Set a Password</label>
								<input
									type="password"
									className="form-control"
									id="formPassword"
									name="password"
									required
								/>
							</div>
						</fieldset>
						<fieldset>
							<legend>Tell us some more (if you want)!</legend>
							<div className="form-group">
								<label htmlFor="pronouns">Your preferred pronouns</label>
								<input
									type="text"
									className="form-control"
									id="pronouns"
									name="userPronouns"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="githubUsername">
									Your GitHub username (if you have one)
								</label>
								<div className="input-group mb-3">
									<div className="input-group-prepend">
										<span
											className="input-group-text"
											id="githubUsername-addon"
										>
											https://github.com/
										</span>
									</div>
									<input
										type="text"
										className="form-control"
										id="githubUsername"
										name="userGithubusername"
										aria-describedby="githubUsername-addon"
									/>
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="howDidYouHearAboutUs">
									How did you hear about Virtual Coffee?
								</label>
								<textarea
									className="form-control"
									id="howDidYouHearAboutUs"
									name="userHowDidYouHearAboutUs"
									rows="3"
								></textarea>
							</div>
							<div className="form-group">
								<label htmlFor="journey">
									Where are you in your coding journey?
								</label>
								<textarea
									className="form-control"
									id="journey"
									name="userWhereAreYouInYourCodingJourney"
									rows="3"
								></textarea>
							</div>
							<div className="form-group">
								<label htmlFor="codeInterests">
									What sorts of code-related things are you interested in?
								</label>
								<textarea
									className="form-control"
									id="codeInterests"
									name="userCodeInterests"
									rows="3"
								></textarea>
							</div>
							<div className="form-group">
								<label htmlFor="virtualCoffee">
									What are you hoping to get out of joining Virtual Coffee?
								</label>
								<textarea
									className="form-control"
									id="virtualCoffee"
									name="userHopingVirtualCoffee"
									rows="3"
								></textarea>
							</div>
						</fieldset>

						<p className="lead">
							Please take a moment to read our
							<a
								href="/code-of-conduct"
								target="_blank"
								rel="noopener noreferrer"
							>
								Code of Conduct
							</a>
							.
						</p>

						<label className="form-group form-check">
							<input
								type="checkbox"
								name="agree"
								className="form-check-input"
								required
								value="agree"
							/>
							<span className="form-check-label">
								I've read the Code of Conduct and understand my responsibilities
								as a member of the Virtual Coffee community
							</span>
						</label>

						<div className="text-right">
							<button type="submit" className="btn btn-primary btn-lg">
								Submit
							</button>
						</div>
					</div>
				</div>
			</div>
		</Form>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	console.log({ caught });

	return <SignUpForm errorMessage={caught.data} />;
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	const actionData = useActionData();
	console.log({ actionData });

	return <SignUpForm errorMessage={actionData?.error?.message} />;
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export let action = async ({ request }) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure
	try {
		return await authenticator.authenticate('user-register', request, {
			successRedirect: '/membership/dashboard',
		});
	} catch (error) {
		// Because redirects work by throwing a Response, you need to check if the
		// caught error is a response and return it or throw it again
		if (error instanceof Response) {
			console.log('is response', error);
			return error;
		}
		if (error instanceof AuthorizationError) {
			console.log('is AuthorizationError');

			return json({
				error: {
					message: error.message,
				},
			});
			// here the error is related to the authentication process
		}

		// here the error is a generic error that another reason may throw
		console.log('is generic error');
		return json({
			error: {
				message: 'There was a server error.',
			},
		});
	}
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export let loader = async ({ request }) => {
	// If the user is already authenticated redirect to /dashboard directly
	return await authenticator.isAuthenticated(request, {
		successRedirect: '/membership/dashboard',
	});
};
