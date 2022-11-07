// import { Form, Link, useActionData, useCatch } from '@remix-run/react';
import { Link } from '@remix-run/react';
// import {
// 	ActionFunction,
// 	json,
// 	LoaderFunction,
// 	redirect,
// } from '@remix-run/node';
// import { authenticator } from '~/auth/auth.server';
// import { sessionStorage } from '~/auth/session.server';
// import { AuthorizationError } from 'remix-auth';
// import { CmsAuth } from '~/api/cmsauth.server';
// import { CmsError } from '~/api/util';
import SingleTask from '~/components/layouts/SingleTask';
// import Alert from '~/components/app/Alert';
// import { Button } from '~/components/app/Button';
// import { TextInput, FieldSet, TextAreaInput } from '~/components/app/Forms';
// import LeadText from '~/components/content/LeadText';

// function SignUpForm({ errorMessage }) {
// 	return (
// 		<SingleTask title="Join Virtual Coffee" wide>
// 			<Form method="post" reloadDocument className="space-y-6">
// 				{errorMessage && (
// 					<Alert type="danger" title="There was an issue registering you.">
// 						<p>{errorMessage}</p>
// 						{errorMessage.includes('has already been taken.') && (
// 							<>
// 								<p>
// 									Try{' '}
// 									<Link to="/login" className="font-semibold underline">
// 										logging in
// 									</Link>{' '}
// 									instead, or{' '}
// 									<Link
// 										to="/forgot-password"
// 										className="font-semibold underline"
// 									>
// 										resetting your password
// 									</Link>{' '}
// 									if you've forgotten it.
// 								</p>
// 							</>
// 						)}
// 					</Alert>
// 				)}
// 				<div className="prose prose-lg">
// 					<p>
// 						Virtual coffee is, and always will be, a genuine community of people
// 						who value and prioritize supporting one another. We absolutely love
// 						the closeness of this community and know its one of the many things
// 						that sets us apart.
// 					</p>
// 					<p>
// 						We strongly value getting to see each other every Tuesday/Thursday
// 						and at the many other events we host. Everyone here is amazing and
// 						we want to continue to be able to support your needs and personal
// 						growth. In order to support you as a community member, we'd love to
// 						know a little bit more about you.
// 					</p>
// 					<h2>Tell us about yourself!</h2>
// 				</div>

// 				<input type="hidden" name="formID" value="{{id}}" />
// 				<FieldSet
// 					legend="Required Information"
// 					legendDesc="Just a couple quick pieces of info that we'll need:"
// 				>
// 					<TextInput
// 						label="Your Name"
// 						id="userYourName"
// 						help="Required."
// 						type="text"
// 						required
// 					/>

// 					<TextInput
// 						label="Email"
// 						id="email"
// 						help="Required. We'll never share your email with anyone else."
// 						type="email"
// 						autoComplete="email"
// 						required
// 					/>

// 					<TextInput
// 						label="Set a Password"
// 						id="password"
// 						type="password"
// 						autoComplete="current-password"
// 						required
// 					/>
// 				</FieldSet>
// 				<FieldSet legend="Tell us some more (if you want)!">
// 					<TextInput
// 						label="Your preferred pronouns"
// 						id="userPronouns"
// 						type="text"
// 					/>

// 					<TextInput
// 						label="Your GitHub username"
// 						help="(if you have one)"
// 						id="userGithubusername"
// 						type="text"
// 						leftAddOn="https://github.com/"
// 					/>

// 					<TextAreaInput
// 						label="How did you hear about Virtual Coffee?"
// 						name="userHowDidYouHearAboutUs"
// 						rows="3"
// 					/>

// 					<TextAreaInput
// 						label="Where are you in your coding journey?"
// 						name="userWhereAreYouInYourCodingJourney"
// 						rows="3"
// 					/>

// 					<TextAreaInput
// 						label="What sorts of code-related things are you interested in?"
// 						name="userCodeInterests"
// 						rows="3"
// 					/>

// 					<TextAreaInput
// 						label="What are you hoping to get out of joining Virtual Coffee?"
// 						name="userHopingVirtualCoffee"
// 						rows="3"
// 					/>
// 				</FieldSet>

// 				<div className="prose prose-lg">
// 					<p>
// 						Please take a moment to read our{' '}
// 						<a
// 							href="/code-of-conduct"
// 							target="_blank"
// 							rel="noopener noreferrer"
// 						>
// 							Code of Conduct
// 						</a>
// 						.
// 					</p>
// 				</div>

// 				<div className="relative flex items-start">
// 					<div className="flex h-5 items-center">
// 						<input
// 							required
// 							id="agree"
// 							name="agree"
// 							type="checkbox"
// 							className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
// 						/>
// 					</div>
// 					<div className="ml-3 text-sm">
// 						<label htmlFor="agree" className="font-medium text-gray-700">
// 							I've read the Code of Conduct and understand my responsibilities
// 							as a member of the Virtual Coffee community
// 						</label>
// 					</div>
// 				</div>

// 				<div className="text-right">
// 					<Button type="submit" color="primary">
// 						Submit
// 					</Button>
// 				</div>
// 			</Form>
// 		</SingleTask>
// 	);
// }

// export function CatchBoundary() {
// 	const caught = useCatch();

// 	console.log({ caught });

// 	return <SignUpForm errorMessage="There was an unknown error." />;
// }

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
	// return <SignUpForm errorMessage={actionData?.message} />;
	return (
		<SingleTask title="Join Virtual Coffee" wide>
			<div className="prose prose-lg">
				<h2>✨ Coming Soon ✨</h2>
				<p>
					As we move into the third year of Virtual Coffee, the maintainers—with
					the help of a team of invested community members—have decided to pause
					the new membership while we work on finding the best ways to support
					our existing community and define what the new year will look like for
					us all.
				</p>

				<p>
					<a href="https://twitter.com/VirtualCoffeeIO">Follow us on Twitter</a>{' '}
					for the latest update while the new membership is paused.
				</p>

				<p>
					You can find out more about our community and what we offer in our{' '}
					<Link to="/resources/virtual-coffee">Member Resources section</Link>.
				</p>
			</div>
		</SingleTask>
	);
}

// export let xaction = async ({ request }) => {
// 	try {
// 		const form = await request.formData();

// 		const api = new CmsAuth();

// 		const values = {
// 			email: form.get('email'),
// 			password: form.get('password'),
// 			userYourName: form.get('userYourName'),
// 			userPronouns: form.get('userPronouns'),
// 			userGithubusername: form.get('userGithubusername'),
// 			userHowDidYouHearAboutUs: form.get('userHowDidYouHearAboutUs'),
// 			userWhereAreYouInYourCodingJourney: form.get(
// 				'userWhereAreYouInYourCodingJourney',
// 			),
// 			userCodeInterests: form.get('userCodeInterests'),
// 			userHopingVirtualCoffee: form.get('userHopingVirtualCoffee'),
// 		};

// 		// console.log({ values });

// 		const response = await api.register(values);
// 		console.log({ user: response.registerPendingMembers.user });

// 		return redirect(`/register-success`);
// 	} catch (error) {
// 		// Because redirects work by throwing a Response, you need to check if the
// 		// caught error is a response and return it or throw it again
// 		if (error instanceof CmsError) {
// 			console.log('is CmsError', error);
// 			return json({
// 				message: error.message,
// 				errors: error.data,
// 			});
// 		}

// 		// here the error is a generic error that another reason may throw
// 		console.log('is generic error', error);
// 		return json({
// 			message: 'There was a server error.',
// 		});
// 	}
// };

// // Finally, we can export a loader function where we check if the user is
// // authenticated with `authenticator.isAuthenticated` and redirect to the
// // dashboard if it is or return null if it's not
// export let xloader = async ({ request }) => {
// 	// If the user is already authenticated redirect to /dashboard directly
// 	return await authenticator.isAuthenticated(request, {
// 		successRedirect: '/membership',
// 	});
// };
