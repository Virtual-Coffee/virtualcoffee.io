import Link from 'next/link';
import type { ComponentProps } from 'react';

/** A root-relative path to a page, not to a file such as `/assets/x.pdf`. */
function isInternalPage(href: string) {
	if (!href.startsWith('/') || href.startsWith('//')) {
		return false;
	}
	const path = href.split(/[?#]/)[0];
	return !/\.[a-z0-9]+$/i.test(path);
}

/**
 * Every Markdown link in MDX (mapped in `src/mdx-components.tsx`): a page on
 * this site goes through `next/link` for client-side navigation, anything
 * else (anchors, files, other sites) stays a plain `<a>`.
 *
 * The href is runtime text, so typedRoutes cannot check it; the pieces go in
 * as a `UrlObject` and a test checks every link in `src/content` instead.
 */
export default function MdxLink({ href, ...props }: ComponentProps<'a'>) {
	if (href && isInternalPage(href)) {
		const { pathname, search, hash } = new URL(
			href,
			'https://virtualcoffee.io',
		);
		return <Link href={{ pathname, search, hash }} {...props} />;
	}
	return <a href={href} {...props} />;
}
