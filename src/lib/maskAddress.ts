/** `ada@example.test` → `a•••@example.test`; a Slack channel is left alone. */
export function maskAddress(target: string): string {
	const at = target.indexOf('@');
	if (at < 1) return target;
	return `${target[0]}•••${target.slice(at)}`;
}
