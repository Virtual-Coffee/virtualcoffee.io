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

export function deployContext(): DeployClass {
	return classify(process.env.CONTEXT);
}

/** For log lines and warnings: which deploy this is, as Netlify names it. */
export function contextLabel(): string {
	return process.env.CONTEXT || 'local';
}
