// app/services/session.server.ts
import { createCookieSessionStorage } from '@remix-run/node';
import { MessageCode, SessionFlash } from './types';

function configSessionStorage() {
	return createCookieSessionStorage({
		cookie: {
			name: '_session', // use any name you want here
			sameSite: 'lax', // this helps with CSRF
			path: '/', // remember to add this so the cookie will work in all routes
			httpOnly: true, // for security reasons, make this cookie http only
			secrets: ['1B754E497FD4B7DDBDD846D9BEF98'], // replace this with an actual secret
			secure: process.env.NODE_ENV === 'production', // enable this in prod only
		},
	});
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
let sessionStorage: ReturnType<typeof createCookieSessionStorage>;

declare global {
	var __sessionStorage: typeof sessionStorage | null;
}

if (process.env.NODE_ENV === 'production') {
	// export the whole sessionStorage object
	sessionStorage = configSessionStorage();
} else {
	if (!global.__sessionStorage) {
		global.__sessionStorage = configSessionStorage();
	}
	sessionStorage = global.__sessionStorage;
}

export { sessionStorage };

export const createFlashCookie = async (
	request: Request,
	{ message, messageCode, data }: SessionFlash = {
		message: '',
		messageCode: MessageCode.message,
	},
) => {
	const session = await sessionStorage.getSession(
		request.headers.get('Cookie'),
	);

	session.flash(
		'sessionFlash',
		JSON.stringify({
			message,
			messageCode,
			data,
		}),
	);

	return await sessionStorage.commitSession(session);
};

export const readFlashCookie = async (request: Request) => {
	const session = await sessionStorage.getSession(
		request.headers.get('Cookie'),
	);
	const sessionFlashString: string | undefined = session.get('sessionFlash');

	if (sessionFlashString) {
		try {
			const sessionFlash: SessionFlash = JSON.parse(sessionFlashString);

			return {
				cookie: await sessionStorage.commitSession(session),
				sessionFlash,
			};
		} catch (error) {
			console.warn('Error parsing session flash cookie', error);

			return {
				cookie: await sessionStorage.commitSession(session),
				sessionFlash: null,
			};
		}
	}
	return null;
};
