import type { ActionResult } from '@/lib/actionResult';

/**
 * A maintainer's note, as every section's "add a note" action accepts it.
 * One place for the two rules — not blank, not unbounded — so the
 * `NoteComposer` and the actions behind it agree on what a note is.
 */
export const MAX_NOTE_LENGTH = 5000;

export function checkNote(
	body: string,
): { ok: true; body: string } | Extract<ActionResult, { ok: false }> {
	const trimmed = body.trim();
	if (!trimmed) return { ok: false, message: 'A note needs some text.' };
	if (trimmed.length > MAX_NOTE_LENGTH) {
		return {
			ok: false,
			message: `A note can be at most ${MAX_NOTE_LENGTH.toLocaleString('en-US')} characters.`,
		};
	}
	return { ok: true, body: trimmed };
}
