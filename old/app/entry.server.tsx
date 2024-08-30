import type { EntryContext, HandleDataRequestFunction } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { cacheControlValues } from './util/http';

if (process.env.NETLIFY_DEV) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const cacheNoneRoutes = [
	'/membership',
	'/activate',
	'/forgot-password',
	'/login',
	'/logout',
	'/register',
	'/resend-activation',
	'/set-password',
];

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	const markup = renderToString(
		<RemixServer context={remixContext} url={request.url} />,
	);

	responseHeaders.set('Content-Type', 'text/html');

	// this may change in the future, but for now, default to caching all pages.
	// this can be overwritten in any page by setting a Cache-Control header

	if (!responseHeaders.get('Cache-Control')) {
		const url = new URL(request.url);

		if (cacheNoneRoutes.find((route) => url.pathname.startsWith(route))) {
			responseHeaders.set('Cache-Control', cacheControlValues.none);
		} else {
			responseHeaders.set('Cache-Control', cacheControlValues.standard);
		}
	}

	return new Response('<!DOCTYPE html>' + markup, {
		status: responseStatusCode,
		headers: responseHeaders,
	});
}

export const handleDataRequest: HandleDataRequestFunction = (
	response: Response,
	// same args that get passed to the action or loader that was called
	{ request, params, context },
) => {
	// this may change in the future, but for now, default to caching all data requests.
	// this can be overwritten in any loader by setting a Cache-Control header
	const url = new URL(request.url);

	if (!response.headers.get('Cache-Control')) {
		if (cacheNoneRoutes.find((route) => url.pathname.startsWith(route))) {
			response.headers.set('Cache-Control', cacheControlValues.none);
		} else {
			response.headers.set('Cache-Control', cacheControlValues.standard);
		}
	}

	return response;
};
