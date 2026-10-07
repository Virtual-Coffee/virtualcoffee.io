import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { z } from 'zod';

/**
 * pnpm is pinned twice: `packageManager` (what pnpm and Netlify read) and
 * `mise.toml` (what mise installs). docs/adr/0020.
 */

const read = (file: string) => readFileSync(file, 'utf8');

const packageManager = z
	.object({ packageManager: z.string() })
	.parse(JSON.parse(read('package.json')))
	.packageManager.split('+')[0];

test('mise.toml pins the pnpm in packageManager', () => {
	const pinned = /^\s*pnpm\s*=\s*"([^"]+)"/m.exec(read('mise.toml'))?.[1];

	expect(`pnpm@${pinned}`).toBe(packageManager);
});

test('mise.lock locks that pnpm', () => {
	const version = packageManager.replace('pnpm@', '');

	const locked = /^\[\[tools\.pnpm\]\]\nversion = "([^"]+)"/m.exec(
		read('mise.lock'),
	)?.[1];

	expect(locked).toBe(version);
});
