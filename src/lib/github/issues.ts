import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

/**
 * Opening the Lunch & Learn issue that the Airtable automation used to open.
 *
 * The issue is the working artefact — the Slack message just links it — so
 * dropping it would have quietly removed two maintainers' workflow.
 *
 * Authenticates as `GITHUB_APP_CLIENT_ID` / `GITHUB_APP_PRIVATE_KEY`.
 *
 * This is the same GitHub App that CI uses, but the names differ by
 * environment: the workflows read it from the Actions secrets `CI_APP_CLIENT_ID`
 * and `CI_APP_PRIVATE_KEY` (`.github/workflows/ci.yml`), while the site's
 * runtime reads the `GITHUB_APP_*` variables above. Same App and same values,
 * two namespaces.
 *
 * The read-only `GITHUB_TOKEN` used by /members and sponsors is deliberately
 * untouched: it is a permission-less PAT that contributors are told to create
 * with every scope box unchecked, and widening it would defeat that.
 */

const OWNER = 'Virtual-Coffee';
const REPO = 'VC-Community-Docs';
const LABEL = 'Lunch & Learn';
const ASSIGNEES = ['shelleymcq', 'meg-gutshall'];

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

	const appOctokit = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			clientId: process.env.GITHUB_APP_CLIENT_ID,
			privateKey: privateKey(),
		},
	});

	const { data: installation } = await appOctokit.rest.apps.getRepoInstallation(
		{
			owner: OWNER,
			repo: REPO,
		},
	);

	cached = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			clientId: process.env.GITHUB_APP_CLIENT_ID,
			privateKey: privateKey(),
			installationId: installation.id,
			repositoryNames: [REPO],
			permissions: { issues: 'write' },
		},
	});

	return cached;
}

function issueBody(idea: {
	name: string;
	email: string;
	topic: string;
	description: string | null;
	format: string | null;
	timing: string | null;
}): string {
	return [
		'## Submitted Info:',
		'**Name:**',
		idea.name,
		'',
		'**Email:**',
		idea.email,
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
	email: string;
	topic: string;
	description: string | null;
	format: string | null;
	timing: string | null;
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
