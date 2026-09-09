'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const WAITLIST_SECTIONS = [
	{ href: '/admin/waitlist', label: 'Queue' },
	{ href: '/admin/waitlist/archive', label: 'Archive' },
] as const;

/**
 * The section nav is a client component because the layout rendering it is an
 * async server component — it awaits the session — and marking the current
 * section needs `usePathname()`.
 *
 * Bootstrap's dropdown JavaScript is not loaded anywhere in this project, so
 * open/close is hand-rolled the way the marketing Nav does it, plus Escape to
 * close. Without Popper there is no `data-bs-popper` attribute and therefore no
 * `top: 100%` rule; the menu lands under the toggle because an absolutely
 * positioned box with `auto` offsets sits at its static position, which is
 * directly below the button it follows in the markup.
 */
export function AdminNav() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLLIElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);

	// Stays lit on the queue, the archive and an application detail page: a
	// parent tab that goes dark on its own children reads as a broken link.
	const inWaitlist = pathname.startsWith('/admin/waitlist');
	const onAdmins = pathname.startsWith('/admin/admins');

	useEffect(() => {
		if (!open) return;

		const onDocumentClick = (event: MouseEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			setOpen(false);
			toggleRef.current?.focus();
		};

		document.addEventListener('click', onDocumentClick);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('click', onDocumentClick);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	return (
		<nav aria-label="Admin sections">
			<ul className="nav nav-pills gap-1">
				<li className="nav-item dropdown" ref={wrapperRef}>
					<button
						type="button"
						ref={toggleRef}
						className={`nav-link dropdown-toggle py-1 px-2${
							inWaitlist ? ' active' : ''
						}`}
						aria-expanded={open}
						onClick={() => setOpen((wasOpen) => !wasOpen)}
					>
						Waitlist
					</button>
					<ul className={`dropdown-menu${open ? ' show' : ''}`}>
						{WAITLIST_SECTIONS.map((section) => {
							const current = pathname === section.href;
							return (
								<li key={section.href}>
									<Link
										className={`dropdown-item${current ? ' active' : ''}`}
										aria-current={current ? 'page' : undefined}
										href={section.href}
										// The outside-click handler cannot do this: the link is
										// inside the menu, so the click never counts as outside.
										onClick={() => setOpen(false)}
									>
										{section.label}
									</Link>
								</li>
							);
						})}
					</ul>
				</li>
				<li className="nav-item">
					<Link
						className={`nav-link py-1 px-2${onAdmins ? ' active' : ''}`}
						aria-current={onAdmins ? 'page' : undefined}
						href="/admin/admins"
					>
						Admins
					</Link>
				</li>
			</ul>
		</nav>
	);
}
