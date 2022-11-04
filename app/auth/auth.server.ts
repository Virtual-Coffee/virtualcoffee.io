import { Authenticator, AuthorizationError } from 'remix-auth';
import { sessionStorage } from '~/auth/session.server';
import { FormStrategy } from 'remix-auth-form';
import { CmsAuth } from '~/api/cmsauth.server';
import type { User } from '~/api/types';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

function configAuthenticator(authenticator: Authenticator<User>) {
	// Tell the Authenticator to use the form strategy
	authenticator.use(
		new FormStrategy(async ({ form }) => {
			const api = new CmsAuth();

			let email = form.get('email');
			let password = form.get('password');

			invariant(typeof email === 'string', 'email must be a string');
			invariant(email && email.length > 0, 'email must not be empty');

			invariant(typeof password === 'string', 'password must be a string');
			invariant(password.length > 0, 'password must not be empty');

			// try {

			const response = await api.login(email, password);

			// the type of this user must match the type you pass to the Authenticator
			// the strategy will automatically inherit the type if you instantiate
			// directly inside the `use` method
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
	const url = new URL(request.url);
	const search = url.search;
	try {
		// get the auth data from the session
		let user = await getUser(request);

		// if not defiend or expired, redirect to login
		if (!user) {
			if (redirectOnFail) {
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

			let response;

			try {
				console.log('refreshing token');
				// refresh the token somehow using the strategy and the refresh token
				response = await api.refreshToken({
					refreshToken: session.get(authenticator.sessionKey).refreshToken,
				});

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
					throw redirect(request.url, { headers });
				}

				// return the user so you can use it in a POST
				return user;
			} catch (error) {
				console.warn(error);

				session.unset(authenticator.sessionKey);
				// commit the session and append the Set-Cookie header
				headers.append(
					'Set-Cookie',
					await sessionStorage.commitSession(session),
				);

				if (redirectOnFail) {
					if (url.pathname !== '/login') {
						throw redirect(
							`/login?redirectOnSuccess=${encodeURIComponent(
								url.pathname + (search.length > 1 ? search : ''),
							)}`,
							{ headers },
						);
					}
				}

				return null;
			}
		}
		// throw again any unexpected error
		throw error;
	}
}
