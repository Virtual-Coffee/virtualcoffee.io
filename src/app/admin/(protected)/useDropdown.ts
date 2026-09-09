'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Open/close state for a hand-rolled dropdown.
 *
 * Bootstrap's dropdown JavaScript is not loaded anywhere in this project, so
 * this mirrors the way the marketing Nav does it, plus Escape to close. Both
 * `/admin` dropdowns share it because the details are easy to get subtly wrong
 * — a second hand-written copy would drift.
 *
 * Positioning is deliberately not handled here. The nav's menu can sit at its
 * static position, while the User Management table's menu has to escape a scroll
 * container; only that one pays for the extra work.
 */
export function useDropdown<
	Wrapper extends HTMLElement,
	Toggle extends HTMLElement,
>() {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<Wrapper>(null);
	const toggleRef = useRef<Toggle>(null);

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

	return { open, setOpen, wrapperRef, toggleRef };
}
