'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

const ISSUE_URL =
	'https://github.com/Virtual-Coffee/virtualcoffee.io/issues/new';

function issueHref(pathname: string | null) {
	const params = new URLSearchParams({ labels: 'bug' });
	if (pathname) {
		params.set('title', `Broken link: ${pathname}`);
		params.set(
			'body',
			`This link resulted in a 404: https://virtualcoffee.io${pathname}`,
		);
	} else {
		params.set('title', 'Broken link');
	}
	return `${ISSUE_URL}?${params}`;
}

// The prerendered 404 HTML has no request path, so read it after mount.
export default function BrokenLinkReport() {
	// Subscribes to soft navigations so the snapshot below is re-read.
	usePathname();
	const pathname = useSyncExternalStore(
		subscribe,
		() => window.location.pathname,
		() => null,
	);

	return <a href={issueHref(pathname)}>please open an issue on GitHub</a>;
}
