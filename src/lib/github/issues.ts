import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

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
/** Per request, as `@octokit/request` only honours `request.signal`, not `timeout`. */
const TIMEOUT_MS = 10_000;

export type CreateIssueResult =
	{ ok: true; url: string } | { ok: false; message: string };

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
	});

	const { data: installation } = await appOctokit.rest.apps.getRepoInstallation(
		{
			owner: OWNER,
			repo: REPO,
			request: { signal: AbortSignal.timeout(TIMEOUT_MS) },
		},
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
	});

	return cached;
}

/**
 * The issue is public, and the form promises never to share the email. It
 * lives on the Submission in /admin, which the issue links to instead.
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
		idea.name,
		'',
		'**Contact details:**',
		idea.adminUrl,
		'',
		'**Title of the Lunch & Learn:**',
		idea.topic,
		'',
		'**Description:**',
		idea.description ?? '',
		'',
		'**Format:**',
		idea.format ?? '',
		'',
		'**Timing:**',
		idea.timing ?? '',
	].join('\n');
}

/**
 * Returns rather than throws: the idea is already saved by the time this runs,
 * and a GitHub outage must not lose it. See docs/adr/0005.
 */
export async function createLunchAndLearnIssue(idea: {
	name: string;
	topic: string;
	description: string | null;
	format: string | null;
	timing: string | null;
	/** The Submission's /admin page, where the email lives. */
	adminUrl: string;
}): Promise<CreateIssueResult> {
	if (!githubAppConfigured()) {
		return {
			ok: false,
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
			// The installation-token exchange inside auth-app's hook is not
			// covered by a per-request signal; the two visible requests are.
			request: { signal: AbortSignal.timeout(TIMEOUT_MS) },
		});

		return { ok: true, url: data.html_url };
	} catch (error) {
		// A failed installation lookup means the App is not installed on
		// VC-Community-Docs, or lacks the issues permission. Both are setup
		// problems a maintainer has to fix, so say so rather than swallowing it.
		cached = undefined;
		return {
			ok: false,
			message:
				error instanceof Error
					? `Could not open the GitHub issue: ${error.message}`
					: 'Could not open the GitHub issue.',
		};
	}
}
