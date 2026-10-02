import { z } from 'zod';

import { agree, email, name } from '@/util/forms/fields';
import { githubUsername } from '@/util/forms/parse';

/**
 * What each public form accepts. They live here rather than in the action
 * files because a `'use server'` file may export only async functions, and
 * `SUBMISSION_INTAKE` types its `toRow` against them.
 */

/**
 * Name and email are optional by design: the form tells reporters to skip both
 * if they want to remain anonymous, and some historical reports did.
 */
export const cocSchema = z.object({
	name: name({ optional: true }),
	email: email().optional(),
	reportee_name: z
		.string()
		.trim()
		.min(1, 'Please tell us who you’re reporting.')
		.max(200),
	time_location: z
		.string()
		.trim()
		.min(1, 'Please tell us roughly when and where.')
		.max(2000),
	description: z
		.string()
		.trim()
		.min(1, 'Please describe what happened.')
		.max(10000),
	anyone_else_involved: z.string().trim().max(5000).optional(),
	agree: agree(),
});

export const volunteersSchema = z.object({
	name: name(),
	email: email(),
	// Required in the browser, so required here too — server validation that is
	// laxer than the form's own `required` attributes is validation in name only.
	github_username: githubUsername('Please give us your GitHub username.'),
	position: z
		.string()
		.trim()
		.min(1, 'Please tell us which role you’re interested in.')
		.max(300),
	description: z
		.string()
		.trim()
		.min(1, 'Please share any details or thoughts.')
		.max(5000),
	agree: agree(),
});

export const lunchAndLearnSchema = z.object({
	Name: name(),
	Email: email(),
	Topic: z
		.string()
		.trim()
		.min(1, 'Please give your Lunch & Learn a title.')
		.max(300),
	Description: z
		.string()
		.trim()
		.min(1, 'Please give us a description we can share.')
		.max(5000),
	// The only genuinely optional field on this form.
	Format: z.string().trim().max(300).optional(),
	Timing: z
		.string()
		.trim()
		.min(1, 'Please tell us what date and time works for you.')
		.max(300),
	agree: agree(),
});

export const coffeeTablesSchema = z.object({
	name: name(),
	email: email(),
	// Both are `required` in the browser, so they are required here too.
	group_name: z
		.string()
		.trim()
		.min(1, 'Please name your Coffee Table Group.')
		.max(200),
	description: z
		.string()
		.trim()
		.min(1, 'Please describe your group idea.')
		.max(5000),
	agree: agree(),
});
