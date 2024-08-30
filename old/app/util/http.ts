import { redirect, type Request } from '@remix-run/node';

/**
 * If the URL ends with a slash, redirect to the same URL without the slash
 * @param request - The request object.
 */
export function removeTrailingSlash(request: Request) {
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
	// 30 seconds on the browser, 1 minute in the CDN, loading an old one and refetching is ok for 7 days
	short: `max-age=30, s-maxage=${60}, stale-while-revalidate=${
		60 * 60 * 24 * 7
	}`,
	long: `max-age=${60 * 60 * 24 * 7}, s-maxage=${
		60 * 60 * 24 * 7
	}, stale-while-revalidate=${60 * 60 * 24 * 7 * 52}`,
	none: 'no-cache',
};
