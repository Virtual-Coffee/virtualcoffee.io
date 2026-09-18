/**
 * Paths of the `/admin` detail pages, for everything that links back to one:
 * the dashboard's activity feed and the notifications that announce a new row.
 * Relative, so a sender prefixes `siteUrl()` and a `<Link>` uses it as is.
 */

export function applicationPath(id: string): string {
	return `/admin/waitlist/${id}`;
}
