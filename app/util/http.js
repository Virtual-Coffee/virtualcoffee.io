import { redirect } from '@remix-run/node';

export function removeTrailingSlash(request) {
	const url = new URL(request.url);
	if (url.pathname.endsWith('/') && url.pathname !== '/') {
		throw redirect(url.pathname.slice(0, -1), {
			status: 308,
		});
	}
}

export const cacheControlValues = {
	// 60 seconds on the browser, 5 minutes in the CDN, loading an old one and refetching is ok for 7 days
	standard: `max-age=60, s-maxage=${60 * 5}, stale-while-revalidate=${
		60 * 60 * 24 * 7
	}`,
	long: `max-age=${60 * 60 * 24 * 7}, s-maxage=${
		60 * 60 * 24 * 7
	}, stale-while-revalidate=${60 * 60 * 24 * 7 * 52}`,
	none: 'no-cache',
};
