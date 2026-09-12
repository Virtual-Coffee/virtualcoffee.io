import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Your invites',
	robots: { index: false, follow: false },
};

/**
 * The shell for /invites.
 *
 * Deliberately *not* the admin shell, and deliberately not gated here. Each page
 * calls `requireVolunteer()` for itself — the sign-in page below this must stay
 * reachable by someone who is not yet a Volunteer, so a layout-level check would
 * lock the door from the inside.
 *
 * It is also not wrapped in `DefaultLayout`: that carries the site nav and hero,
 * which belong to the public marketing pages. This is a small signed-in tool.
 * The sign-in page does use `DefaultLayout`, so `<main>` is each page's to
 * render — one here would nest inside that one.
 */
export default function InvitesLayout({ children }: { children: ReactNode }) {
	return (
		<div className="d-flex flex-column min-vh-100">{children}</div>
	);
}
