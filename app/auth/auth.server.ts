import { Authenticator, AuthorizationError } from 'remix-auth';
import { sessionStorage } from '~/auth/session.server';
import { FormStrategy } from 'remix-auth-form';
import { CmsAuth } from '~/api/cms.server';
import type { User } from '~/api/cms.server';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

function configAuthenticator(authenticator: Authenticator<User>) {
	// Tell the Authenticator to use the form strategy
	authenticator.use(
		new FormStrategy(async ({ form }) => {
			console.log('inside form strategy');
			const api = new CmsAuth();
			console.log('api initialized');
			console.log(api.client);

			let email = form.get('email');
			let password = form.get('password');

			invariant(typeof email === 'string', 'email must be a string');
			invariant(email && email.length > 0, 'email must not be empty');

			invariant(typeof password === 'string', 'password must be a string');
			invariant(password.length > 0, 'password must not be empty');

			// try {
			console.log('logging in');
			let response = await api.login(email, password);
			console.log('logged in');
			// the type of this user must match the type you pass to the Authenticator
			// the strategy will automatically inherit the type if you instantiate
			// directly inside the `use` method
			// console.log({ response });

			// console.log(response);

			return response.authenticate;
		}),
		// each strategy has a name and can be changed to use another one
		// same strategy multiple times, especially useful for the OAuth2 strategy.
		'user-pass',
	);
}

let authenticator: InstanceType<typeof Authenticator<User>>;

declare global {
	var __authenticator: typeof authenticator | null;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
	authenticator = new Authenticator<User>(sessionStorage, {
		sessionErrorKey: 'my-error-key',
		// throwOnError: true,
	});
	configAuthenticator(authenticator);
} else {
	if (!global.__authenticator) {
		global.__authenticator = new Authenticator<User>(sessionStorage, {
			sessionErrorKey: 'my-error-key',
			// throwOnError: true,
		});
		configAuthenticator(global.__authenticator);
	}
	authenticator = global.__authenticator;
}

export { authenticator };

export async function getUser(request: Request) {
	let session = await sessionStorage.getSession(request.headers.get('Cookie'));
	let user = session.get(authenticator.sessionKey);

	if (!user || new Date(user.refreshTokenExpiresAt) < new Date()) {
		return null;
	}
	return user;
}

export async function authenticate(
	request: Request,
	{ headers = new Headers(), redirectOnFail = true } = {},
) {
	let session = await sessionStorage.getSession(request.headers.get('Cookie'));
	try {
		// get the auth data from the session

		console.log('checking user!');
		let user = await getUser(request);

		// if not defiend or expired, redirect to login
		if (!user) {
			const url = new URL(request.url);
			const search = url.search;

			console.log('no user found');
			console.log(redirectOnFail);

			if (redirectOnFail) {
				console.log('THROWING');
				if (url.pathname !== '/login') {
					throw redirect(
						`/login?redirectOnSuccess=${encodeURIComponent(
							url.pathname + (search.length > 1 ? search : ''),
						)}`,
					);
				}
			}
			return null;
		}

		// console.log({ oldUser: user });

		// if expired throw an error
		if (new Date(user.jwtExpiresAt) < new Date()) {
			console.log('expired');
			throw new AuthorizationError('Expired');
		}

		console.log('returning user!');
		// return the user data
		return user;
	} catch (error) {
		console.log('in catch state');
		// check if the eror is an AuthorizationError
		if (error instanceof AuthorizationError) {
			console.log('is AuthorizationError');
			const api = new CmsAuth();

			// console.log('currentsession', session.get(authenticator.sessionKey));
			let response;
			try {
				// refresh the token somehow using the strategy and the refresh token
				response = await api.refreshToken({
					refreshToken: session.get(authenticator.sessionKey).refreshToken,
				});

				console.log({ refreshedresponse: response });

				let user = response.refreshToken;

				// update the user data on the sessino
				session.set(authenticator.sessionKey, user);

				// commit the session and append the Set-Cookie header
				headers.append(
					'Set-Cookie',
					await sessionStorage.commitSession(session),
				);

				// redirect to the same URL if the request was a GET
				if (request.method.toLowerCase() === 'get') {
					console.log('redirecting to same url');
					throw redirect(request.url, { headers });
				}

				// return the user so you can use it in a POST
				return user;
			} catch (error) {
				if (redirectOnFail) {
					const url = new URL(request.url);
					const search = url.search;
					console.log('THROWING ABC');

					session.set(authenticator.sessionKey, null);

					headers.append(
						'Set-Cookie',
						await sessionStorage.commitSession(session),
					);

					throw redirect(
						`/login?redirectOnSuccess=${encodeURIComponent(
							url.pathname + (search.length > 1 ? search : ''),
						)}`,
						{ headers },
					);
				}
			}
		}
		// throw again any unexpected error
		throw error;
	}
}
