/** The greeting form of a name: the first word, or "there" for nothing. */
export function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] || 'there';
}
