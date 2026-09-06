'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { applicationEvent, db, membershipApplication } from '@/db';

export type JoinFormState = null | {
	is_error: boolean;
	message?: string;
	/** Field name -> first error, so inputs can be marked individually. */
	fieldErrors?: Record<string, string>;
};

/**
 * Replaces the hand-rolled `isValidRecord` used by the Airtable forms, which
 * built its object from a fixed key list and then checked that the keys were
 * in that list — a condition that is always true. Nothing was ever validated.
 */
const schema = z.object({
	name: z.string().trim().min(1, 'Please tell us your name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
	pronouns: z.string().trim().max(100).optional(),
	githubUsername: z
		.string()
		.trim()
		.max(100)
		// Accept a pasted profile URL or an @handle as well as a bare username.
		.transform((value) =>
			value
				.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
				.replace(/^@/, '')
				.replace(/\/$/, ''),
		)
		.optional(),
	howDidYouHear: z.string().trim().max(5000).optional(),
	journey: z.string().trim().max(5000).optional(),
	codeInterests: z.string().trim().max(5000).optional(),
	virtualCoffee: z.string().trim().max(5000).optional(),
	agree: z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	}),
});

function value(formData: FormData, key: string): string | undefined {
	const raw = formData.get(key);
	if (typeof raw !== 'string') return undefined;
	const trimmed = raw.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export async function submitMembershipApplication(
	_state: JoinFormState,
	formData: FormData,
): Promise<JoinFormState> {
	const parsed = schema.safeParse({
		name: formData.get('name') ?? '',
		email: formData.get('email') ?? '',
		pronouns: value(formData, 'pronouns'),
		githubUsername: value(formData, 'githubUsername'),
		howDidYouHear: value(formData, 'howDidYouHear'),
		journey: value(formData, 'journey'),
		codeInterests: value(formData, 'codeInterests'),
		virtualCoffee: value(formData, 'virtualCoffee'),
		agree: formData.get('agree') ?? '',
	});

	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const key = String(issue.path[0] ?? '');
			fieldErrors[key] ??= issue.message;
		}
		return {
			is_error: true,
			message: 'Please check the highlighted fields.',
			fieldErrors,
		};
	}

	const now = new Date();

	try {
		const [row] = await db()
			.insert(membershipApplication)
			.values({
				name: parsed.data.name,
				email: parsed.data.email,
				pronouns: parsed.data.pronouns ?? null,
				githubUsername: parsed.data.githubUsername || null,
				howDidYouHear: parsed.data.howDidYouHear ?? null,
				journey: parsed.data.journey ?? null,
				codeInterests: parsed.data.codeInterests ?? null,
				virtualCoffee: parsed.data.virtualCoffee ?? null,
				status: 'waitlisted',
				source: 'waitlist_signup',
				// The old form required this checkbox in the browser and then threw
				// the answer away. Now the consent is actually recorded.
				agreedToCocAt: now,
				submittedAt: now,
				waitlistedAt: now,
			})
			.returning({ id: membershipApplication.id });

		await db().insert(applicationEvent).values({
			applicationId: row.id,
			type: 'submitted',
			toStatus: 'waitlisted',
			body: 'Application submitted',
		});
	} catch (error) {
		// Deliberately not surfaced to the applicant: the upstream message can
		// name tables and columns, and there is nothing they could do with it.
		console.error('Membership application failed to save', error);
		return {
			is_error: true,
			message:
				'Something went wrong saving your application. Please try again, or email hello@virtualcoffee.io.',
		};
	}

	redirect('/join/thank-you');
}
