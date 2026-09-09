import { redirect } from 'next/navigation';

export const metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

/**
 * /admin has no screen of its own. Keeping the default section in exactly one
 * place means the sign-in redirect, Better Auth's `callbackURL` and the header
 * wordmark can all keep pointing at `/admin` and still land somewhere useful —
 * and a real landing page can replace this later without touching any of them.
 */
export default function AdminIndexPage() {
	redirect('/admin/waitlist');
}
