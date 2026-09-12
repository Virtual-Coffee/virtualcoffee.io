import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { fieldErrorsFrom, formValue } from './parse';

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
