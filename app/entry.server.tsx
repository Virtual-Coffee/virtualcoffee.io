import type { EntryContext } from '@remix-run/node';
import { renderToString } from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import { cacheControlValues } from './util/http';

if (process.env.NETLIFY_DEV) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

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
		responseHeaders.set('Cache-Control', cacheControlValues.standard);
	}

	return new Response('<!DOCTYPE html>' + markup, {
		status: responseStatusCode,
		headers: responseHeaders,
	});
}

export function handleDataRequest(
	response: Response,
	// same args that get passed to the action or loader that was called
	// { request, params, context },
) {
	// this may change in the future, but for now, default to caching all data requests.
	// this can be overwritten in any loader by setting a Cache-Control header
	if (!response.headers.get('Cache-Control')) {
		response.headers.set('Cache-Control', cacheControlValues.standard);
	}

	return response;
}
