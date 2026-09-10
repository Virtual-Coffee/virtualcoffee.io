'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { Section } from '@/lib/permissions';
import { useDropdown } from './useDropdown';

const WAITLIST_SECTIONS = [
	{ href: '/admin/waitlist', label: 'Queue' },
	{ href: '/admin/waitlist/archive', label: 'Archive' },
] as const;

/**
 * The four Submission kinds, each gated on its own permission. A volunteer who
 * holds one of them sees a dropdown with one item rather than a dropdown that
 * advertises three sections they cannot open.
 */
const SUBMISSION_SECTIONS = [
	{ href: '/admin/submissions/coc', label: 'CoC reports', section: 'coc' },
	{
		href: '/admin/submissions/volunteers',
		label: 'Volunteer signups',
		section: 'volunteerSignups',
	},
	{
		href: '/admin/submissions/lunch-and-learn',
		label: 'Lunch & Learn',
		section: 'lunchAndLearn',
	},
	{
		href: '/admin/submissions/coffee-tables',
		label: 'Coffee Tables',
		section: 'coffeeTables',
	},
] as const satisfies ReadonlyArray<{
	href: string;
	label: string;
	section: Section;
}>;

/**
 * A dropdown whose open/close is hand-rolled — see `useDropdown`.
 *
 * Without Popper there is no `data-bs-popper` attribute and therefore no
 * `top: 100%` rule; the menu lands under the toggle because an absolutely
 * positioned box with `auto` offsets sits at its static position, which is
 * directly below the button it follows in the markup. Nothing clips it here,
 * unlike the User Management table's menu.
 */
function NavDropdown({
	label,
	active,
	items,
}: {
	label: string;
	active: boolean;
	items: readonly { href: string; label: string }[];
}) {
	const pathname = usePathname();
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLLIElement,
		HTMLButtonElement
	>();

	return (
		<li className="nav-item dropdown" ref={wrapperRef}>
			<button
				type="button"
				ref={toggleRef}
				className={`nav-link dropdown-toggle py-1 px-2${active ? ' active' : ''}`}
				aria-expanded={open}
				onClick={() => setOpen((wasOpen) => !wasOpen)}
			>
				{label}
			</button>
			<ul className={`dropdown-menu${open ? ' show' : ''}`}>
				{items.map((item) => {
					const current = pathname === item.href;
					return (
						<li key={item.href}>
							<Link
								className={`dropdown-item${current ? ' active' : ''}`}
								aria-current={current ? 'page' : undefined}
								href={item.href}
								// The outside-click handler cannot do this: the link is
								// inside the menu, so the click never counts as outside.
								onClick={() => setOpen(false)}
							>
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</li>
	);
}

/**
 * The section nav is a client component because the layout rendering it is an
 * async server component — it awaits the session — and marking the current
 * section needs `usePathname()`. The layout passes down which sections the
 * viewer may see; this component never decides that for itself.
 */
export function AdminNav({ sections }: { sections: readonly Section[] }) {
	const pathname = usePathname();

	const can = (section: Section) => sections.includes(section);

	// Stays lit on the queue, the archive and an application detail page: a
	// parent tab that goes dark on its own children reads as a broken link.
	const inWaitlist = pathname.startsWith('/admin/waitlist');
	const inSubmissions = pathname.startsWith('/admin/submissions');
	const onUserManagement = pathname.startsWith('/admin/user-management');
	const onDashboard = pathname === '/admin';

	const submissionItems = SUBMISSION_SECTIONS.filter((item) =>
		can(item.section),
	);

	return (
		<nav aria-label="Admin sections">
			<ul className="nav nav-pills gap-1">
				<li className="nav-item">
					<Link
						className={`nav-link py-1 px-2${onDashboard ? ' active' : ''}`}
						aria-current={onDashboard ? 'page' : undefined}
						href="/admin"
					>
						Dashboard
					</Link>
				</li>
				{can('waitlist') && (
					<NavDropdown
						label="Waitlist"
						active={inWaitlist}
						items={WAITLIST_SECTIONS}
					/>
				)}
				{submissionItems.length > 0 && (
					<NavDropdown
						label="Submissions"
						active={inSubmissions}
						items={submissionItems}
					/>
				)}
				{can('admins') && (
					<li className="nav-item">
						<Link
							className={`nav-link py-1 px-2${
								onUserManagement ? ' active' : ''
							}`}
							aria-current={onUserManagement ? 'page' : undefined}
							href="/admin/user-management"
						>
							User Management
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
}
