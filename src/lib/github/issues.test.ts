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
	// Live only in production (docs/adr/0013).
	vi.stubEnv('CONTEXT', 'production');
	vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', undefined);
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
	test('outside production: captured, with no client built, credentials or not', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('GITHUB_APP_CLIENT_ID', undefined);
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const { createLunchAndLearnIssue } = await load();

		await expect(createLunchAndLearnIssue(idea)).resolves.toMatchObject({
			ok: true,
			url: null,
			warning: 'Captured, not opened on GitHub (deploy-preview).',
		});
		expect(octokit.constructed).toEqual([]);
		// The shape of a deploy's capture line is outbound.test.ts's; this pins
		// that the issue goes through it, titled.
		expect(info).toHaveBeenCalledWith(
			'[github issue captured] deploy-preview Virtual-Coffee/VC-Community-Docs',
			{ title: 'Lunch & Learn: Property testing' },
			expect.stringMatching(/^\nhttps?:\/\//),
		);
		info.mockRestore();
	});

	test('NOTIFY_LIVE_OUTSIDE_PRODUCTION=true opens it for real from a preview', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', 'true');
		const { createLunchAndLearnIssue } = await load();

		await expect(createLunchAndLearnIssue(idea)).resolves.toMatchObject({
			ok: true,
			url: 'https://github.com/Virtual-Coffee/VC-Community-Docs/issues/9',
		});
	});

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
			message:
				'Opened https://github.com/Virtual-Coffee/VC-Community-Docs/issues/9',
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

	// The issue is public: a submitted `@org/team` would page the team.
	test('a mention in a form value is neutralised in the body; the title is plain text', async () => {
		const { createLunchAndLearnIssue } = await load();

		await createLunchAndLearnIssue({
			...idea,
			name: '@Virtual-Coffee/maintainers',
			topic: 'Ask @octocat',
			description: 'cc @octocat and hello@example.test',
		});

		const [call] = octokit.create.mock.calls;
		expect(call[0].title).toBe('Lunch & Learn: Ask @octocat');
		expect(call[0].body).toContain('@&#8203;Virtual-Coffee/maintainers');
		expect(call[0].body).toContain('Ask @&#8203;octocat');
		expect(call[0].body).toContain(
			'cc @&#8203;octocat and hello@&#8203;example.test',
		);
		expect(call[0].body).not.toMatch(/@(?!&#8203;)/);
	});

	test('the App is identified by appId, the token narrowed to issues on that one repo, and the PEM un-escaped', async () => {
		const { createLunchAndLearnIssue } = await load();
		await createLunchAndLearnIssue(idea);

		expect(octokit.getRepoInstallation).toHaveBeenCalledWith({
			owner: 'Virtual-Coffee',
			repo: 'VC-Community-Docs',
		});
		// `appId` is what `createAppAuth` checks for; it throws without it.
		expect(octokit.constructed[0]).toMatchObject({
			auth: { appId: 'Iv1.test' },
		});
		expect(octokit.constructed[1]).toMatchObject({
			auth: {
				appId: 'Iv1.test',
				privateKey: 'line1\nline2',
				installationId: 4242,
				repositoryNames: ['VC-Community-Docs'],
				permissions: { issues: 'write' },
			},
		});
	});

	test("every request is time-limited through the clients' fetch, a fresh signal each", async () => {
		const fetch = vi.fn().mockResolvedValue(new Response('{}'));
		vi.stubGlobal('fetch', fetch);
		const { createLunchAndLearnIssue } = await load();
		await createLunchAndLearnIssue(idea);

		// Both clients, so the auth hook's token exchange is covered on each.
		const clients = octokit.constructed as {
			request: { fetch: typeof fetch };
		}[];
		expect(clients).toHaveLength(2);
		for (const client of clients) {
			await client.request.fetch('https://api.github.com/a', {
				method: 'POST',
			});
			await client.request.fetch('https://api.github.com/b');
		}

		const signals = fetch.mock.calls.map(([, init]) => init.signal);
		expect(signals).toHaveLength(4);
		expect(signals.every((s) => s instanceof AbortSignal)).toBe(true);
		expect(new Set(signals).size).toBe(4);
		expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
		vi.unstubAllGlobals();
	});

	test('the client is reused across calls, and dropped after a failure', async () => {
		const { createLunchAndLearnIssue } = await load();
		await createLunchAndLearnIssue(idea);
		await createLunchAndLearnIssue(idea);
		expect(octokit.getRepoInstallation).toHaveBeenCalledTimes(1);

		octokit.create.mockRejectedValueOnce(new Error('Not Found'));
		await expect(createLunchAndLearnIssue(idea)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach GitHub: Not Found',
		});

		await createLunchAndLearnIssue(idea);
		expect(octokit.getRepoInstallation).toHaveBeenCalledTimes(2);
	});
});
