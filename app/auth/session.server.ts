// app/services/session.server.ts
import { createCookieSessionStorage } from '@remix-run/node';

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
