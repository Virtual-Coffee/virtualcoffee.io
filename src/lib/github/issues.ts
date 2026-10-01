import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

import { deliver, type Outbound } from '@/lib/outbound';

/**
 * Opens the Lunch & Learn issue — the working artefact; the Slack message
 * just links it.
 *
 * Authenticates as `GITHUB_APP_CLIENT_ID` / `GITHUB_APP_PRIVATE_KEY`: the
 * same App CI uses as `CI_APP_CLIENT_ID` / `CI_APP_PRIVATE_KEY`, under a
 * different name per environment. Do not widen the read-only `GITHUB_TOKEN`
 * for this — contributors are told to create it with every scope unchecked.
 */

const OWNER = 'Virtual-Coffee';
const REPO = 'VC-Community-Docs';
const LABEL = 'Lunch & Learn';
const ASSIGNEES = ['shelleymcq', 'meg-gutshall'];
/**
 * Applied per request through the client's `fetch`, so it also covers the
 * installation-token exchange inside auth-app's hook, which a `request.signal`
 * on the visible calls never reaches.
 */
const TIMEOUT_MS = 10_000;

const timedFetch: typeof fetch = (input, init) => {
	const timeout = AbortSignal.timeout(TIMEOUT_MS);
	return fetch(input, {
		...init,
		signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
	});
};

export function githubAppConfigured(): boolean {
	return Boolean(
		process.env.GITHUB_APP_CLIENT_ID && process.env.GITHUB_APP_PRIVATE_KEY,
	);
}

/**
 * Netlify's UI collapses a pasted PEM onto one line, so `\n` escapes are
 * restored here. A key with literal backslash-n fails signing with an opaque
 * error, which is not worth rediscovering.
 */
function privateKey(): string {
	return (process.env.GITHUB_APP_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
}

let cached: Octokit | undefined;

/**
 * An Octokit authenticated as the App's installation on VC-Community-Docs.
 *
 * The token is scoped down to `issues: write` on that one repository. Without
 * `permissions` it would inherit everything the installation can do, which
 * today includes `contents: write` on virtualcoffee.io — the same narrowing
 * `.github/workflows/refresh-bot-list.yml` applies, and it matters more here
 * because the site's runtime environment is a broader blast radius than an
 * Actions secret.
 */
async function client(): Promise<Octokit> {
	if (cached) return cached;

	// `appId` is the option auth-app requires; a Client ID string is accepted
	// there, and `clientId` on its own is only for OAuth flows.
	const appOctokit = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: process.env.GITHUB_APP_CLIENT_ID,
			privateKey: privateKey(),
		},
		request: { fetch: timedFetch },
	});

	const { data: installation } = await appOctokit.rest.apps.getRepoInstallation(
		{ owner: OWNER, repo: REPO },
	);

	cached = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: process.env.GITHUB_APP_CLIENT_ID,
			privateKey: privateKey(),
			installationId: installation.id,
			repositoryNames: [REPO],
			permissions: { issues: 'write' },
		},
		request: { fetch: timedFetch },
	});

	return cached;
}

/**
 * A zero-width space after every `@` so a form value cannot mention: `@org/team`
 * in a public issue would notify the team. Renders as typed; the entity is
 * visible in the raw body and in a diff.
 */
function neutralizeMentions(value: string): string {
	return value.replace(/@/g, '@&#8203;');
}

/**
 * The issue is public, and the form promises never to share the email. It
 * lives on the Submission in /admin, which the issue links to instead. The
 * title is plain text on GitHub, never Markdown, so it needs no neutralising.
 */
function issueBody(idea: {
	name: string;
	topic: string;
	description: string | null;
	format: string | null;
	timing: string | null;
	adminUrl: string;
}): string {
	return [
		'## Submitted Info:',
		'**Name:**',
		neutralizeMentions(idea.name),
		'',
		'**Contact details:**',
		idea.adminUrl,
		'',
		'**Title of the Lunch & Learn:**',
		neutralizeMentions(idea.topic),
		'',
		'**Description:**',
		neutralizeMentions(idea.description ?? ''),
		'',
		'**Format:**',
		neutralizeMentions(idea.format ?? ''),
		'',
		'**Timing:**',
		neutralizeMentions(idea.timing ?? ''),
	].join('\n');
}

/**
 * Returns rather than throws: the idea is already saved by the time this runs,
 * and a GitHub outage must not lose it. See docs/adr/0005. `url` is null when
 * the issue was Captured rather than opened (docs/adr/0013).
 */
export function createLunchAndLearnIssue(idea: {
	name: string;
	topic: string;
	description: string | null;
	format: string | null;
	timing: string | null;
	/** The Submission's /admin page, where the email lives. */
	adminUrl: string;
}): Promise<Outbound<{ url: string | null }>> {
	return deliver<'github issue', { url: string | null }>({
		kind: 'github issue',
		target: `${OWNER}/${REPO}`,
		body: issueBody(idea),
		details: { title: `Lunch & Learn: ${idea.topic}` },
		unreachable: 'GitHub',
		captured: { url: null },
		live: async () => {
			if (!githubAppConfigured()) {
				return {
					ok: false,
					definitelyNotSent: true,
					message:
						'GITHUB_APP_CLIENT_ID / GITHUB_APP_PRIVATE_KEY are not set, so no GitHub issue was opened.',
				};
			}

			try {
				const octokit = await client();

				const { data } = await octokit.rest.issues.create({
					owner: OWNER,
					repo: REPO,
					title: `Lunch & Learn: ${idea.topic}`,
					body: issueBody(idea),
					labels: [LABEL],
					assignees: ASSIGNEES,
				});

				return {
					ok: true,
					url: data.html_url,
					message: `Opened ${data.html_url}`,
				};
			} catch (error) {
				// A failed installation lookup means the App is not installed on
				// VC-Community-Docs, or lacks the issues permission — a setup problem
				// a maintainer has to fix, so the next call tries the lookup again.
				cached = undefined;
				throw error;
			}
		},
	});
}
