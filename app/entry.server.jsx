import { renderToString } from 'react-dom/server';
import { RemixServer } from 'remix';

if (process.env.NETLIFY_DEV) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

export default function handleRequest(
	request,
	responseStatusCode,
	responseHeaders,
	remixContext,
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
