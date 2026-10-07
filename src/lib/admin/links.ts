/**
 * Paths of the `/admin` detail pages, for everything that links back to one:
 * the dashboard's activity feed and the notifications that announce a new row.
 * Relative, so a sender prefixes `siteUrl()` and a `<Link>` uses it as is.
 */

import type { Route } from 'next';

import type { SubmissionKind } from '@/lib/submissions/submissions';

export type SubmissionListHref = `/admin/submissions/${SubmissionKind}`;
type ApplicationHref = `/admin/waitlist/${string}`;
type SubmissionHref = `${SubmissionListHref}/${string}`;
type DynamicAdminHref = SubmissionListHref | ApplicationHref | SubmissionHref;

/**
 * An `/admin` href kept in data rather than written at the `<Link>`: the
 * static admin pages, the detail pages above, and a list page with a query.
 * typedRoutes checks a literal where it is written; this is what lets an
 * href travel through a prop, a table row or a `Record` still checked.
 */
export type AdminHref = Route<
	DynamicAdminHref | `${DynamicAdminHref}?${string}`
>;

export function applicationPath(id: string): ApplicationHref {
	return `/admin/waitlist/${id}`;
}

export function submissionPath(
	kind: SubmissionKind,
	id: string,
): SubmissionHref {
	return `/admin/submissions/${kind}/${id}`;
}
