import { eq } from 'drizzle-orm';
import type { z } from 'zod';

import { cocReport, db, lunchAndLearnIdea } from '@/db';
import { submissionPath } from '@/lib/admin/links';
import { createLunchAndLearnIssue } from '@/lib/github/issues';
import { notifyAndRecord, recordEvent } from '@/lib/history/eventLog';
import { reportHandled } from '@/lib/monitoring/reportHandled';
import {
	cocReportMessage,
	coffeeTableGroupMessage,
	lunchAndLearnMessage,
	notifySlack,
	volunteerSignupMessage,
	type NotifyChannel,
} from '@/lib/slack/notify';
import type { SlackMessage } from '@/lib/slack/blocks';
import {
	cocSchema,
	coffeeTablesSchema,
	lunchAndLearnSchema,
	volunteersSchema,
} from '@/lib/submissions/formSchemas';
import {
	SUBMISSION_KINDS,
	submissionSubject,
	type SubmissionKind,
} from '@/lib/submissions/submissions';
import { savingFailed } from '@/util/forms/intake';
import { formError } from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';
import { siteUrl } from '@/util/url.server';

/** Columns the action supplies that the form data cannot: CoC's attachment. */
type Extra = Partial<typeof cocReport.$inferInsert>;

type Intake<Data, Insert> = {
	toRow: (data: Data) => Insert;
	copy: { submitted: string; failed: string };
	announce: (
		id: string,
		data: Data,
		adminUrl: string,
		extra: Extra,
	) => Promise<void>;
};

/** A Slack post on its own line of History. */
function slackAnnouncer<Data>(
	kind: SubmissionKind,
	channel: NotifyChannel,
	builder: (data: Data, adminUrl: string, extra: Extra) => SlackMessage,
	what: string,
): Intake<Data, never>['announce'] {
	return (id, data, adminUrl, extra) =>
		notifyAndRecord(
			submissionSubject(kind, id),
			{ channel: 'slack', what },
			() => notifySlack(channel, builder(data, adminUrl, extra)),
		);
}

/**
 * Everything that varies between the four public forms, once: the insert
 * values, the History and failure wording, and the announcement.
 */
const SUBMISSION_INTAKE = {
	coc: {
		toRow: (data: z.infer<typeof cocSchema>) => ({
			name: data.name ?? null,
			email: data.email ?? null,
			reporteeName: data.reportee_name,
			timeLocation: data.time_location,
			description: data.description,
			anyoneElseInvolved: data.anyone_else_involved ?? null,
		}),
		copy: { submitted: 'Report submitted', failed: savingFailed('report') },
		announce: slackAnnouncer<z.infer<typeof cocSchema>>(
			'coc',
			'coc',
			(data, adminUrl, extra) =>
				cocReportMessage({
					name: data.name ?? null,
					email: data.email ?? null,
					reporteeName: data.reportee_name,
					timeLocation: data.time_location,
					hasAttachment: Boolean(extra.attachmentBlobKey),
					adminUrl,
				}),
			'Slack notified of a CoC report',
		),
	},
	volunteers: {
		toRow: (data: z.infer<typeof volunteersSchema>) => ({
			name: data.name,
			email: data.email,
			githubUsername: data.github_username,
			position: data.position,
			description: data.description,
		}),
		copy: { submitted: 'Signup submitted', failed: savingFailed() },
		announce: slackAnnouncer<z.infer<typeof volunteersSchema>>(
			'volunteers',
			'volunteers',
			(data, adminUrl) =>
				volunteerSignupMessage({
					name: data.name,
					email: data.email,
					position: data.position,
					adminUrl,
				}),
			'Slack notified of a Volunteer signup',
		),
	},
	'lunch-and-learn': {
		toRow: (data: z.infer<typeof lunchAndLearnSchema>) => ({
			name: data.Name,
			email: data.Email,
			topic: data.Topic,
			description: data.Description,
			format: data.Format ?? null,
			timing: data.Timing,
		}),
		copy: { submitted: 'Idea submitted', failed: savingFailed() },
		announce: async (
			id: string,
			data: z.infer<typeof lunchAndLearnSchema>,
			adminUrl: string,
		) => {
			const idea = SUBMISSION_INTAKE['lunch-and-learn'].toRow(data);

			// The issue is opened first so the Slack message can link it. Each channel
			// is its own line of History, so a Slack outage is never written up as a
			// GitHub failure; neither failing loses the idea.
			let issueUrl: string | null = null;
			await notifyAndRecord(
				submissionSubject('lunch-and-learn', id),
				{
					channel: 'github issue',
					what: 'Lunch & Learn issue opened on GitHub',
				},
				async () => {
					const issue = await createLunchAndLearnIssue({
						...idea,
						adminUrl,
					});

					// A captured issue has no URL to keep (docs/adr/0013).
					if (!issue.ok || !issue.url) return issue;
					issueUrl = issue.url;

					// Slack does not depend on the row carrying the URL, so a failed update is
					// noted in the event (whose body already names the issue) rather than
					// allowed to skip the announcement.
					try {
						await db()
							.update(lunchAndLearnIdea)
							.set({ githubIssueUrl: issue.url })
							.where(eq(lunchAndLearnIdea.id, id));
					} catch (error) {
						console.error(
							`Could not save the issue URL on Lunch & Learn idea ${id}`,
							error,
						);
						return {
							...issue,
							warning: `${issue.message}. The issue link could not be saved to the submission.`,
						};
					}
					return issue;
				},
			);

			await notifyAndRecord(
				submissionSubject('lunch-and-learn', id),
				{ channel: 'slack', what: 'Slack notified of a Lunch & Learn idea' },
				() =>
					notifySlack(
						'lunch-and-learn',
						lunchAndLearnMessage({
							name: idea.name,
							email: idea.email,
							topic: idea.topic,
							issueUrl,
							adminUrl,
						}),
					),
			);
		},
	},
	'coffee-tables': {
		toRow: (data: z.infer<typeof coffeeTablesSchema>) => ({
			name: data.name,
			email: data.email,
			groupName: data.group_name,
			description: data.description,
		}),
		copy: { submitted: 'Request submitted', failed: savingFailed() },
		announce: slackAnnouncer<z.infer<typeof coffeeTablesSchema>>(
			'coffee-tables',
			'coffee-tables',
			(data, adminUrl) =>
				coffeeTableGroupMessage({
					name: data.name,
					email: data.email,
					groupName: data.group_name,
					adminUrl,
				}),
			'Slack notified of a Coffee Table group request',
		),
	},
} as const satisfies Record<SubmissionKind, unknown>;

export type SubmissionData<K extends SubmissionKind> = Parameters<
	(typeof SUBMISSION_INTAKE)[K]['toRow']
>[0];

/**
 * A public form's write and announcement: insert the row, log `submitted`,
 * turn a failure into the form state to hand back, then announce. Persist
 * first, notify second — see docs/adr/0005 — so nothing is announced that is
 * not already committed. The caller redirects on `{ id }`.
 *
 * Row and event commit together. The submitter is told to try again on any
 * failure, so a row that made it without its event would be duplicated by
 * the retry.
 *
 * The upstream error is deliberately not surfaced: its message can name
 * tables and columns, and there is nothing the submitter could do with it.
 *
 * `extra` is columns the form data cannot supply (CoC's attachment);
 * `onFailed` cleans up whatever `extra` points at when nothing was saved.
 */
export async function submit<K extends SubmissionKind>(
	kind: K,
	data: SubmissionData<K>,
	opts: { extra?: Extra; onFailed?: () => Promise<void> } = {},
): Promise<{ id: string } | { error: FormState }> {
	const intake = SUBMISSION_INTAKE[kind] as unknown as Intake<
		SubmissionData<K>,
		Record<string, unknown>
	>;
	const { table } = SUBMISSION_KINDS[kind];

	let id: string;

	try {
		id = await db().transaction(async (tx) => {
			const [row] = await tx
				.insert(table)
				.values({ ...intake.toRow(data), ...opts.extra } as never)
				.returning({ id: table.id });

			await recordEvent(
				submissionSubject(kind, row.id),
				{ type: 'submitted', body: intake.copy.submitted },
				tx,
			);

			return row.id;
		});
	} catch (error) {
		console.error(`${SUBMISSION_KINDS[kind].singular} failed to save`, error);
		reportHandled(error, { area: 'submissions', tags: { submission: kind } });
		await opts.onFailed?.();
		return { error: formError(intake.copy.failed) };
	}

	await intake.announce(
		id,
		data,
		`${siteUrl()}${submissionPath(kind, id)}`,
		opts.extra ?? {},
	);

	return { id };
}
