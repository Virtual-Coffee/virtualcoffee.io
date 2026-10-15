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

// Netlify builds with the mise its image ships (2026.9.14 when this was
// written), which rejects a lockfile newer than v2: a v3 mise.lock turns every
// deploy log into an error. Tools that force v3 (pitchfork's forge ids) belong
// in mise.dev.toml, which Netlify never loads. docs/adr/0020.
test('mise.lock stays readable by the mise on Netlify', () => {
	const version = Number(
		/^lockfile_version = (\d+)$/m.exec(read('mise.lock'))?.[1],
	);

	expect(version).toBeLessThanOrEqual(2);
});
