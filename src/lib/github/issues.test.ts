import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const octokit = vi.hoisted(() => {
	const getRepoInstallation = vi.fn();
	const create = vi.fn();
	const constructed: unknown[] = [];
	class Octokit {
		rest = { apps: { getRepoInstallation }, issues: { create } };
		constructor(options: unknown) {
			constructed.push(options);
		}
	}
	return { Octokit, getRepoInstallation, create, constructed };
});

vi.mock('@octokit/rest', () => ({ Octokit: octokit.Octokit }));
vi.mock('@octokit/auth-app', () => ({ createAppAuth: () => () => ({}) }));

const idea = {
	name: 'Ada',
	topic: 'Property testing',
	description: 'Why and how.',
	format: null,
	timing: 'Any Friday',
	adminUrl: 'https://virtualcoffee.io/admin/submissions/lunch-and-learn/abc',
};

/** `client()` caches its Octokit in module state, so each case loads afresh. */
async function load() {
	vi.resetModules();
	return import('./issues');
}

beforeEach(() => {
	vi.stubEnv('GITHUB_APP_CLIENT_ID', 'Iv1.test');
	vi.stubEnv('GITHUB_APP_PRIVATE_KEY', 'line1\\nline2');
	octokit.getRepoInstallation.mockReset();
	octokit.create.mockReset();
	octokit.constructed.length = 0;
	octokit.getRepoInstallation.mockResolvedValue({ data: { id: 4242 } });
	octokit.create.mockResolvedValue({
		data: {
			html_url: 'https://github.com/Virtual-Coffee/VC-Community-Docs/issues/9',
		},
	});
});

afterEach(() => vi.unstubAllEnvs());

describe('githubAppConfigured', () => {
	test('needs both halves of the App credential', async () => {
		const { githubAppConfigured } = await load();
		expect(githubAppConfigured()).toBe(true);
		vi.stubEnv('GITHUB_APP_PRIVATE_KEY', undefined);
		expect(githubAppConfigured()).toBe(false);
	});
});

describe('createLunchAndLearnIssue', () => {
	test('unconfigured: a skip, with no client built', async () => {
		vi.stubEnv('GITHUB_APP_CLIENT_ID', undefined);
		const { createLunchAndLearnIssue } = await load();

		await expect(createLunchAndLearnIssue(idea)).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('not set'),
		});
		expect(octokit.constructed).toEqual([]);
	});

	test('opens the issue in VC-Community-Docs with the label and assignees', async () => {
		const { createLunchAndLearnIssue } = await load();

		await expect(createLunchAndLearnIssue(idea)).resolves.toEqual({
			ok: true,
			url: 'https://github.com/Virtual-Coffee/VC-Community-Docs/issues/9',
		});
		expect(octokit.create).toHaveBeenCalledWith({
			owner: 'Virtual-Coffee',
			repo: 'VC-Community-Docs',
			title: 'Lunch & Learn: Property testing',
			body: [
				'## Submitted Info:',
				'**Name:**',
				'Ada',
				'',
				// The issue is public; the email stays in /admin.
				'**Contact details:**',
				'https://virtualcoffee.io/admin/submissions/lunch-and-learn/abc',
				'',
				'**Title of the Lunch & Learn:**',
				'Property testing',
				'',
				'**Description:**',
				'Why and how.',
				'',
				'**Format:**',
				'',
				'',
				'**Timing:**',
				'Any Friday',
			].join('\n'),
			labels: ['Lunch & Learn'],
			assignees: ['shelleymcq', 'meg-gutshall'],
		});
	});

	test('the installation token is narrowed to issues on that one repo, and the PEM is un-escaped', async () => {
		const { createLunchAndLearnIssue } = await load();
		await createLunchAndLearnIssue(idea);

		expect(octokit.getRepoInstallation).toHaveBeenCalledWith({
			owner: 'Virtual-Coffee',
			repo: 'VC-Community-Docs',
		});
		expect(octokit.constructed[1]).toMatchObject({
			auth: {
				clientId: 'Iv1.test',
				privateKey: 'line1\nline2',
				installationId: 4242,
				repositoryNames: ['VC-Community-Docs'],
				permissions: { issues: 'write' },
			},
		});
	});

	test('the client is reused across calls, and dropped after a failure', async () => {
		const { createLunchAndLearnIssue } = await load();
		await createLunchAndLearnIssue(idea);
		await createLunchAndLearnIssue(idea);
		expect(octokit.getRepoInstallation).toHaveBeenCalledTimes(1);

		octokit.create.mockRejectedValueOnce(new Error('Not Found'));
		await expect(createLunchAndLearnIssue(idea)).resolves.toEqual({
			ok: false,
			message: 'Could not open the GitHub issue: Not Found',
		});

		await createLunchAndLearnIssue(idea);
		expect(octokit.getRepoInstallation).toHaveBeenCalledTimes(2);
	});
});
