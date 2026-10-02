import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { cocReport, db, submissionEvent } from '@/db';
import { submitCocReport } from '@/app/report-coc-violation/action';
import { submitCoffeeTableGroupRequest } from '@/app/start-coffee-table-group/action';
import { submitLunchAndLearnIdea } from '@/app/lunch-and-learn-idea/action';
import { submitVolunteerSignup } from '@/app/volunteer-at-virtual-coffee/action';
import type { SlackMessage } from '@/lib/slack/blocks';
import { failInserts } from '@/test/db/fixtures';
import { formDataWith } from '@/test/forms';
import { createLunchAndLearnIssue, notifySlack } from '@/test/mocks/spies';
import { redirectTo } from '@/test/next';
import { buttonLinks, richTextFields } from '@/test/slack';

import { SUBMISSION_KINDS, type SubmissionKind } from './submissions';
import { submit } from './submitSubmission';

const KINDS: {
	kind: SubmissionKind;
	action: (state: null, formData: FormData) => Promise<unknown>;
	thanks: string;
	fields: Record<string, string>;
	row: Record<string, unknown>;
	text: string | ReturnType<typeof expect.stringContaining>;
	slack: Record<string, string>;
	submitted: string;
	announced: string;
}[] = [
	{
		kind: 'coc',
		action: submitCocReport,
		thanks: '/report-coc-violation/thanks',
		fields: {
			reportee_name: 'Someone',
			time_location: 'Tuesday coffee',
			description: 'What happened.',
			agree: 'agree',
		},
		row: { name: null, email: null, reporteeName: 'Someone', status: 'new' },
		text: 'CoC Report Submitted',
		slack: { Name: '(anonymous)', Email: '(anonymous)' },
		submitted: 'Report submitted',
		announced: 'Slack notified of a CoC report',
	},
	{
		kind: 'volunteers',
		action: submitVolunteerSignup,
		thanks: '/volunteer-at-virtual-coffee/thanks',
		fields: {
			name: 'Ada',
			email: 'ada@example.test',
			// The schema reduces a profile URL to the username.
			github_username: 'https://github.com/AdaL/',
			position: 'Maintainer',
			description: 'Happy to help with the site.',
			agree: 'agree',
		},
		row: {
			name: 'Ada',
			email: 'ada@example.test',
			githubUsername: 'AdaL',
			position: 'Maintainer',
		},
		text: expect.stringContaining('New Volunteer Form Submission'),
		slack: { Name: 'Ada' },
		submitted: 'Signup submitted',
		announced: 'Slack notified of a Volunteer signup',
	},
	{
		kind: 'lunch-and-learn',
		action: submitLunchAndLearnIdea,
		thanks: '/lunch-and-learn-idea/thanks',
		fields: {
			Name: 'Ada',
			Email: 'ada@example.test',
			Topic: 'Property testing',
			Description: 'Why and how.',
			Timing: 'Any Friday',
			agree: 'agree',
		},
		row: { topic: 'Property testing', format: null },
		text: 'New Lunch & Learn Idea — Property testing',
		slack: {
			Name: 'Ada',
			Email: 'ada@example.test',
			Title: 'Property testing',
		},
		submitted: 'Idea submitted',
		announced: 'Slack notified of a Lunch & Learn idea',
	},
	{
		kind: 'coffee-tables',
		action: submitCoffeeTableGroupRequest,
		thanks: '/start-coffee-table-group/thanks',
		fields: {
			name: 'Ada',
			email: 'ada@example.test',
			group_name: 'Analytical Engines',
			description: 'Weekly, for people building compilers.',
			agree: 'agree',
		},
		row: {
			name: 'Ada',
			email: 'ada@example.test',
			groupName: 'Analytical Engines',
		},
		text: 'New Coffee Table Group — Analytical Engines',
		slack: { 'Group name': 'Analytical Engines' },
		submitted: 'Request submitted',
		announced: 'Slack notified of a Coffee Table group request',
	},
];

/** The row the form wrote and its History, through the real action. */
async function run(entry: (typeof KINDS)[number]) {
	await expect(
		entry.action(null, formDataWith(entry.fields)),
	).rejects.toMatchObject(redirectTo(entry.thanks));

	const { table, eventColumn } = SUBMISSION_KINDS[entry.kind];
	const [row] = await db().select().from(table);
	const events = await db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(eventColumn, row.id))
		.orderBy(submissionEvent.createdAt, submissionEvent.id);
	return { row, events };
}

describe.each(KINDS)('submit — $kind', (entry) => {
	test('writes the row, then posts it to Slack', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		// Lunch & Learn also opens an issue; a captured one adds no URL.
		createLunchAndLearnIssue.mockResolvedValue({
			ok: true,
			url: null,
			message: 'Captured.',
		});

		const { row, events } = await run(entry);

		expect(row).toMatchObject(entry.row);
		expect(notifySlack).toHaveBeenCalledWith(entry.kind, expect.anything());
		const sent = notifySlack.mock.lastCall?.[1] as SlackMessage;
		expect(sent.text).toEqual(entry.text);
		expect(richTextFields(sent)).toMatchObject(entry.slack);
		expect(buttonLinks(sent)).toEqual({
			'View in admin': expect.stringMatching(
				new RegExp(`/admin/submissions/${entry.kind}/${row.id}$`),
			),
		});
		expect(events[0]).toEqual({ type: 'submitted', body: entry.submitted });
		expect(events).toContainEqual({
			type: 'notification_sent',
			body: expect.stringContaining(entry.announced),
		});
	});

	/** ADR 0005: the row is saved before Slack is asked. */
	test('a Slack failure is recorded on the row, not shown to the submitter', async () => {
		notifySlack.mockResolvedValue({
			ok: false,
			definitelyNotSent: false,
			message: 'Could not reach Slack: fetch failed',
		});
		createLunchAndLearnIssue.mockResolvedValue({
			ok: true,
			url: null,
			message: 'Captured.',
		});

		const { events } = await run(entry);

		expect(events[0]).toEqual({ type: 'submitted', body: entry.submitted });
		expect(events).toContainEqual({
			type: 'notification_failed',
			body: `${entry.announced} failed: Could not reach Slack: fetch failed`,
		});
	});
});

describe('submit', () => {
	const data = {
		reportee_name: 'Someone',
		time_location: 'Slack',
		description: 'x',
		agree: 'agree' as const,
	};

	test('writes the row and its `submitted` event, and returns the id', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });

		const saved = await submit('coc', data);

		expect(saved).toEqual({ id: expect.any(String) });
		if ('error' in saved) throw new Error('unreachable');
		const events = await db()
			.select({ type: submissionEvent.type })
			.from(submissionEvent)
			.where(eq(submissionEvent.cocReportId, saved.id))
			.orderBy(submissionEvent.createdAt, submissionEvent.id);
		expect(events).toEqual([
			{ type: 'submitted' },
			{ type: 'notification_sent' },
		]);
	});

	/**
	 * The submitter is told to try again on failure, so a row that outlived
	 * its failed event would be duplicated by that retry.
	 */
	test('a row whose event fails is rolled back with it, and nothing is announced', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const onFailed = vi.fn(async () => {});
		const fault = await failInserts('submission_event');
		try {
			await expect(submit('coc', data, { onFailed })).resolves.toEqual({
				error: expect.objectContaining({ is_error: true }),
			});
		} finally {
			await fault.remove();
			error.mockRestore();
		}
		expect(onFailed).toHaveBeenCalledOnce();
		expect(notifySlack).not.toHaveBeenCalled();
		await expect(db().select().from(cocReport)).resolves.toEqual([]);
	});
});
