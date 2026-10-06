// Not beside the functions: Netlify bundles every file in netlify/edge-functions/ as an edge function.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

const declaredInToml = [
	...read('netlify.toml').matchAll(
		/\[\[edge_functions\]\][^[]*?function\s*=\s*"([^"]+)"/g,
	),
].map((match) => match[1]);

const dir = fileURLToPath(new URL('netlify/edge-functions/', root));
const exportsConfig = readdirSync(dir)
	.filter((file) => file.endsWith('.ts'))
	.filter((file) =>
		/^export const config\b/m.test(readFileSync(`${dir}${file}`, 'utf8')),
	)
	.map((file) => file.replace(/\.ts$/, ''));

// The local edge bundler drops `method` and `excludedPath` from a route when
// it merges the inline `config` with a netlify.toml block for the same function.
test('a function that declares itself inline is not also declared in netlify.toml', () => {
	expect(declaredInToml).toContain('block-bots');
	expect(exportsConfig.filter((name) => declaredInToml.includes(name))).toEqual(
		[],
	);
});
