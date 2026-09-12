import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import {
	fieldErrorsFrom,
	formError,
	formValue,
	githubUsername,
	invalidFields,
	staleForm,
} from './parse';
import { checkSpam, TIMESTAMP_FIELD } from './spamGuard';

describe('formValue', () => {
	test('trims, and treats blank, missing and file values as not given', () => {
		const formData = new FormData();
		formData.set('name', '  Ada  ');
		formData.set('blank', '   ');
		formData.set('file', new File(['x'], 'x.txt'));

		expect(formValue(formData, 'name')).toBe('Ada');
		expect(formValue(formData, 'blank')).toBeUndefined();
		expect(formValue(formData, 'missing')).toBeUndefined();
		expect(formValue(formData, 'file')).toBeUndefined();
	});
});

describe('fieldErrorsFrom', () => {
	const schema = z.object({
		name: z.string().min(1, 'Required').max(3, 'Too long'),
		email: z.email('Not an email'),
		nested: z.object({ inner: z.string().min(1, 'Inner required') }),
	});

	test('keeps the first issue per field, keyed by the top-level path', () => {
		const parsed = schema.safeParse({
			name: '',
			email: 'nope',
			nested: { inner: '' },
		});
		if (parsed.success) throw new Error('expected a failure');

		expect(fieldErrorsFrom(parsed.error)).toEqual({
			name: 'Required',
			email: 'Not an email',
			nested: 'Inner required',
		});
	});

	test('a field with two failing checks reports only the first', () => {
		const parsed = z
			.object({ name: z.string().min(5, 'Short').regex(/^\d+$/, 'Digits') })
			.safeParse({ name: 'ab' });
		if (parsed.success) throw new Error('expected a failure');

		expect(fieldErrorsFrom(parsed.error)).toEqual({ name: 'Short' });
	});
});

describe('form error states', () => {
	test('every error carries a token the form can resubmit with straight away', () => {
		for (const state of [
			formError('Nope.'),
			invalidFields({ name: 'Required' }),
			staleForm(),
		]) {
			const formData = new FormData();
			formData.set(TIMESTAMP_FIELD, state.spamToken ?? '');
			expect(state.is_error).toBe(true);
			expect(checkSpam(formData)).toBe('ok');
		}
	});

	test('invalidFields takes a zod error or a ready-made map', () => {
		const parsed = z.object({ name: z.string().min(1, 'Required') }).safeParse({
			name: '',
		});
		if (parsed.success) throw new Error('expected a failure');

		expect(invalidFields(parsed.error).fieldErrors).toEqual({
			name: 'Required',
		});
		expect(invalidFields({ uploadedFiles: 'Too big' }).fieldErrors).toEqual({
			uploadedFiles: 'Too big',
		});
		expect(invalidFields(parsed.error).message).toBe(
			'Please check the highlighted fields.',
		);
	});
});

describe('githubUsername', () => {
	test.each([
		['bare', 'octocat', 'octocat'],
		['@handle', '@octocat', 'octocat'],
		['profile URL', 'https://github.com/octocat', 'octocat'],
		['www and trailing slash', 'https://www.github.com/octocat/', 'octocat'],
		['padded', '  octocat  ', 'octocat'],
	])('normalises a %s', (_label, input, expected) => {
		expect(githubUsername().parse(input)).toBe(expected);
	});

	test('blank is an error only when a message is given', () => {
		expect(githubUsername('Give us one.').safeParse('').success).toBe(false);
		expect(githubUsername().optional().safeParse(undefined).success).toBe(true);
	});
});
