'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { Section } from '@/lib/permissions';
import { useDropdown } from './useDropdown';

const WAITLIST_SECTIONS = [
	{ href: '/admin/waitlist', label: 'Queue' },
	{ href: '/admin/waitlist/archive', label: 'Archive' },
] as const;

// The four Submission kinds, each gated on its own permission.
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
 * A dropdown whose open/close is hand-rolled (`useDropdown`). Without Popper
 * there is no `top: 100%` rule; the menu sits at its static position, which
 * is directly below the toggle.
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

/** Client-side for `usePathname()`; the layout decides which sections to pass. */
export function AdminNav({ sections }: { sections: readonly Section[] }) {
	const pathname = usePathname();

	const can = (section: Section) => sections.includes(section);

	// Stays lit on the queue, the archive and an application detail page: a
	// parent tab that goes dark on its own children reads as a broken link.
	const inWaitlist = pathname.startsWith('/admin/waitlist');
	const inSubmissions = pathname.startsWith('/admin/submissions');
	const onUserManagement = pathname.startsWith('/admin/user-management');
	const inVolunteers = pathname.startsWith('/admin/volunteers');
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
				{can('volunteers') && (
					<li className="nav-item">
						<Link
							className={`nav-link py-1 px-2${inVolunteers ? ' active' : ''}`}
							aria-current={inVolunteers ? 'page' : undefined}
							href="/admin/volunteers"
						>
							Volunteers
						</Link>
					</li>
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
