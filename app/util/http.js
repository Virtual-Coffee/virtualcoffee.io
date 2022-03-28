import { redirect } from 'remix';

export function removeTrailingSlash(request) {
	const url = new URL(request.url);
	if (url.pathname.endsWith('/') && url.pathname !== '/') {
		throw redirect(url.pathname.slice(0, -1), {
			status: 308,
		});
	}
}
