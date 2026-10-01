'use client';

import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react';

/**
 * A native `<dialog>` driven by a boolean, that also closes on a backdrop
 * click — `showModal()` gives Escape, focus trapping and an inert page, but
 * deliberately not light dismissal.
 *
 * `locked` refuses every dismissal the platform offers (Escape, and the
 * backdrop here) for as long as it is true — for a dialog whose action is in
 * flight, where closing would only hide the outcome. The caller still has to
 * disable its own buttons.
 */
export function useModalDialog(
	open: boolean,
	onClose: () => void,
	locked = false,
) {
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
		// Escape fires `cancel` before `close`; preventing it keeps the dialog
		// open. Browsers may still honour a repeated Escape, so `onClose` is
		// the caller's to guard as well.
		onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
			if (locked) event.preventDefault();
		},
		onMouseDown: (event: MouseEvent<HTMLDialogElement>) => {
			pressedBackdrop.current = isBackdrop(event);
		},
		onClick: (event: MouseEvent<HTMLDialogElement>) => {
			const dismissed = pressedBackdrop.current && isBackdrop(event);
			pressedBackdrop.current = false;

			// Close the element, not the caller's state: the platform then fires
			// `close` and `onClose` runs once, the same path Escape takes.
			if (dismissed && !locked) ref.current?.close();
		},
	};
}
