import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';

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

	return new Response('<!DOCTYPE html>' + markup, {
		status: responseStatusCode,
		headers: responseHeaders,
	});
}
