// app/services/session.server.ts
import { createCookieSessionStorage } from '@remix-run/node';

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '_session', // use any name you want here
		sameSite: 'lax', // this helps with CSRF
		path: '/', // remember to add this so the cookie will work in all routes
		httpOnly: true, // for security reasons, make this cookie http only
		secrets: ['1B754E497FD4B7DDBDD846D9BEF98'], // replace this with an actual secret
		secure: process.env.NODE_ENV === 'production', // enable this in prod only
	},
});
