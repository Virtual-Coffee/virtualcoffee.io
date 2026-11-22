/**
 * What kind of environment is this: Netlify's `CONTEXT` classified once, with
 * an unrecognised value treated as a preview (docs/adr/0018). No imports: the
 * edge function bundles this file for Deno.
 */
export type DeployClass = 'production' | 'preview' | 'local';

/** `production`; `''`, unset and `dev` (netlify dev) are local; the rest, a preview. */
export function classify(raw?: string): DeployClass {
	if (raw === 'production') return 'production';
	if (!raw || raw === 'dev') return 'local';
	return 'preview';
}

type NetlifyGlobal = { context?: { deploy?: { context?: string } } | null };

/**
 * `CONTEXT` is build-scope: `next.config.mjs` inlines it for Next, but a
 * `netlify/functions` bundle never sees it (docs/adr/0007). There the
 * runtime's per-request `Netlify.context` carries the same value.
 */
function rawContext(): string | undefined {
	const netlify = (globalThis as { Netlify?: NetlifyGlobal }).Netlify;
	return process.env.CONTEXT || netlify?.context?.deploy?.context || undefined;
}

export function deployContext(): DeployClass {
	return classify(rawContext());
}

/** For log lines and warnings: which deploy this is, as Netlify names it. */
export function contextLabel(): string {
	return rawContext() || 'local';
}
