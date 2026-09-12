'use client';

import { useEffect, useRef, type MouseEvent } from 'react';

/**
 * A native `<dialog>` driven by a boolean, that also closes on a backdrop
 * click — `showModal()` gives Escape, focus trapping and an inert page, but
 * deliberately not light dismissal.
 */
export function useModalDialog(open: boolean, onClose: () => void) {
	const ref = useRef<HTMLDialogElement>(null);

	// Both press and release must be on the backdrop: a drag that starts inside
	// (selecting text) and ends outside also fires `click` on the dialog.
	const pressedBackdrop = useRef(false);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	/**
	 * A backdrop click reports the dialog itself as the target. This relies on
	 * `.admin-dialog`/`.admin-drawer` having no padding of their own — a padded
	 * strip would read as backdrop. Comparing against `getBoundingClientRect()`
	 * instead would break keyboard clicks, which report `clientX`/`clientY` 0.
	 */
	function isBackdrop(event: MouseEvent<HTMLDialogElement>): boolean {
		return event.target === ref.current;
	}

	return {
		ref,
		onClose,
		onMouseDown: (event: MouseEvent<HTMLDialogElement>) => {
			pressedBackdrop.current = isBackdrop(event);
		},
		onClick: (event: MouseEvent<HTMLDialogElement>) => {
			const dismissed = pressedBackdrop.current && isBackdrop(event);
			pressedBackdrop.current = false;

			// Close the element, not the caller's state: the platform then fires
			// `close` and `onClose` runs once, the same path Escape takes.
			if (dismissed) ref.current?.close();
		},
	};
}
