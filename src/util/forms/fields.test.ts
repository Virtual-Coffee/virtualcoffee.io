import { describe, expect, test } from 'vitest';

import { agree, email, name } from './fields';

describe('shared form fields', () => {
	test('a name is required, trimmed and capped', () => {
		expect(name().parse('  Ada  ')).toBe('Ada');
		expect(name().safeParse('   ').error?.issues[0].message).toBe(
			'Please tell us your name.',
		);
		expect(name().safeParse('x'.repeat(201)).success).toBe(false);
	});

	test('an optional name accepts nothing at all', () => {
		expect(name({ optional: true }).safeParse(undefined).success).toBe(true);
		expect(name({ optional: true }).parse('  Ada  ')).toBe('Ada');
		expect(name({ optional: true }).safeParse('x'.repeat(201)).success).toBe(
			false,
		);
	});

	test('an email must look like one and fit the column', () => {
		expect(email().parse('ada@example.test')).toBe('ada@example.test');
		expect(email().safeParse('nope').error?.issues[0].message).toBe(
			'That doesn’t look like an email address.',
		);
		expect(email().safeParse(`${'a'.repeat(310)}@example.test`).success).toBe(
			false,
		);
	});

	test('the Code of Conduct box must actually be ticked', () => {
		expect(agree().parse('agree')).toBe('agree');
		expect(agree().safeParse('on').error?.issues[0].message).toBe(
			'Please confirm you’ve read the Code of Conduct.',
		);
	});
});
