import { Authenticator, AuthorizationError } from 'remix-auth';
import { sessionStorage } from '~/auth/session.server';
import { FormStrategy } from 'remix-auth-form';
import { CmsAuth } from '~/api/cms.server';
import { redirect } from '@remix-run/node';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage, {
	sessionErrorKey: 'my-error-key',
	// throwOnError: true,
});

// Tell the Authenticator to use the form strategy
authenticator.use(
	new FormStrategy(async ({ form }) => {
		const api = new CmsAuth();

		let email = form.get('email');
		let password = form.get('password');

		// try {
		let response = await api.login(email, password);
		// the type of this user must match the type you pass to the Authenticator
		// the strategy will automatically inherit the type if you instantiate
		// directly inside the `use` method
		// console.log({ response });

		return response.authenticate;
	}),
	// each strategy has a name and can be changed to use another one
	// same strategy multiple times, especially useful for the OAuth2 strategy.
	'user-pass',
);

export async function authenticate(request, headers = new Headers()) {
	let session = await sessionStorage.getSession(request.headers.get('Cookie'));
	try {
		// get the auth data from the session
		let user = session.get(authenticator.sessionKey);

		// if not defiend, redirect to login
		if (!user) {
			const url = new URL(request.url);
			const search = url.search;

			throw redirect(
				`/auth/login?redirectOnSuccess=${encodeURIComponent(
					url.pathname + (search.length > 1 ? search : ''),
				)}`,
			);
		}

		// console.log({ oldUser: user });

		// if expired throw an error
		if (new Date(user.jwtExpiresAt) < new Date()) {
			throw new AuthorizationError('Expired');
		}

		// return the user data
		return user;
	} catch (error) {
		// check if the eror is an AuthorizationError
		if (error instanceof AuthorizationError) {
			const api = new CmsAuth();

			// console.log('currentsession', session.get(authenticator.sessionKey));

			// refresh the token somehow using the strategy and the refresh token
			let response = await api.refreshToken({
				refreshToken: session.get(authenticator.sessionKey).refreshToken,
			});

			// console.log({ refreshedresponse: response });

			let user = response.refreshToken;

			// update the user data on the sessino
			session.set(authenticator.sessionKey, user);

			// commit the session and append the Set-Cookie header
			headers.append('Set-Cookie', await sessionStorage.commitSession(session));

			// redirect to the same URL if the request was a GET
			if (request.method.toLowerCase() === 'get') {
				throw redirect(request.url, { headers });
			}

			// return the user so you can use it in a POST
			return user;
		}
		// throw again any unexpected error
		throw error;
	}
}
