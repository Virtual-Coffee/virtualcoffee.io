'use client';

import { useEffect, useRef, type MouseEvent } from 'react';

/**
 * A native `<dialog>` driven by a boolean, that also closes when you click
 * outside it.
 *
 * `showModal()` gives us Escape-to-close, focus trapping and an inert page for
 * free — but deliberately *not* light dismissal, so a modal built this way
 * looks finished while ignoring every click on its own backdrop. Two of the
 * three ways out working is what makes the gap easy to miss.
 *
 * Lives in `src/util/` rather than beside the admin screens because
 * `/invites` uses it too and does not depend on the admin tree.
 */
export function useModalDialog(open: boolean, onClose: () => void) {
	const ref = useRef<HTMLDialogElement>(null);

	/**
	 * Whether the press that started this click landed on the backdrop.
	 *
	 * A `click` fires on the dialog when a drag *starts* inside it and *ends*
	 * outside — which is what selecting a paragraph and releasing past the edge
	 * looks like. Closing on that throws away the selection the person was in
	 * the middle of making, and the drawer is mostly long-form answers someone
	 * may well be copying. So the press and the release both have to be on the
	 * backdrop.
	 */
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
	 * A click on a modal dialog's backdrop reports the dialog itself as the
	 * target, which is what makes this one comparison enough.
	 *
	 * It relies on no part of the dialog's own box being clickable: both
	 * `.admin-dialog` and `.admin-drawer` set `border: 0; padding: 0` and their
	 * content fills them (see `src/styles/_admin.scss`). Add padding to either
	 * and a click on that strip starts closing the dialog.
	 *
	 * Comparing the pointer against `getBoundingClientRect()` instead would
	 * survive that, and breaks something worse: a keyboard-activated click
	 * reports `clientX`/`clientY` of `0`, so pressing Enter on a button inside
	 * the dialog reads as a click outside it.
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

			/**
			 * Closes the dialog rather than calling `onClose` directly, which is
			 * how Escape already reaches the caller: the platform fires `close`,
			 * and React's `onClose` carries it out.
			 *
			 * Calling `onClose` from here would instead flip the caller's state,
			 * close the dialog through the effect above, and fire `close` — calling
			 * `onClose` a second time. Every caller's is idempotent, so it would
			 * work, but relying on that is how it stops being true.
			 */
			if (dismissed) ref.current?.close();
		},
	};
}
