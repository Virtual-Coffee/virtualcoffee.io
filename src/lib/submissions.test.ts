import { getTableColumns } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';

import { SECTIONS } from '@/lib/permissions';

import {
	failedNotifications,
	getSubmission,
	isSubmissionKind,
	SUBMISSION_DISPLAY,
	SUBMISSION_KEYS,
	SUBMISSION_KINDS,
} from './submissions';

describe('isSubmissionKind', () => {
	test('is exactly the four URL segments', () => {
		expect(SUBMISSION_KEYS).toEqual([
			'coc',
			'volunteers',
			'lunch-and-learn',
			'coffee-tables',
		]);
		for (const kind of SUBMISSION_KEYS)
			expect(isSubmissionKind(kind)).toBe(true);
		expect(isSubmissionKind('waitlist')).toBe(false);
		expect(isSubmissionKind('')).toBe(false);
	});
});

describe('the kinds table', () => {
	test('every kind is guarded by a real Section', () => {
		const sections = Object.values(SUBMISSION_KINDS).map((k) => k.section);
		expect(sections.filter((s) => !SECTIONS.includes(s))).toEqual([]);
	});

	test('every detail field names a column on its kind’s table', () => {
		const missing = SUBMISSION_KEYS.flatMap((kind) => {
			const columns = getTableColumns(SUBMISSION_KINDS[kind].table);
			return SUBMISSION_DISPLAY[kind].fields
				.filter(({ key }) => !(key in columns))
				.map(({ key }) => `${kind}.${key}`);
		});
		expect(missing).toEqual([]);
	});
});

describe('summaries', () => {
	test('an anonymous CoC report is labelled, not blank', () => {
		expect(
			SUBMISSION_DISPLAY.coc.summary({ reporteeName: 'Someone', name: null }),
		).toEqual({ title: 'Report about Someone', subtitle: 'Anonymous' });
		expect(
			SUBMISSION_DISPLAY.coc.summary({ reporteeName: 'Someone', name: 'Ada' }),
		).toEqual({ title: 'Report about Someone', subtitle: 'Ada' });
	});

	test('missing values render as a dash or a stated default', () => {
		expect(SUBMISSION_DISPLAY.volunteers.summary({ name: 'Ada' })).toEqual({
			title: 'Ada',
			subtitle: 'No role given',
		});
		expect(SUBMISSION_DISPLAY['lunch-and-learn'].summary({})).toEqual({
			title: '—',
			subtitle: '—',
		});
		expect(
			SUBMISSION_DISPLAY['coffee-tables'].summary({ groupName: 'Rust' }),
		).toEqual({ title: 'Rust', subtitle: '—' });
	});
});

describe('guards that answer before the database', () => {
	test('a malformed id is null, not a 22P02', async () => {
		await expect(getSubmission('coc', 'not-an-id')).resolves.toBeNull();
	});

	test('no kinds, no counts', async () => {
		await expect(failedNotifications([])).resolves.toEqual({});
	});
});
