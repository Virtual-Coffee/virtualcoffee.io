/**
 * Whether an Event description still carries HTML tags — the shape Craft left
 * behind, until the calendar is migrated (docs/adr/0014). Markdown is the
 * format; this is the one sniff both the public read and the admin page use.
 */
export function looksLikeHtml(raw: string): boolean {
	return /<[a-z][\s\S]*>/i.test(raw);
}
