import { describe, expect, test } from 'vitest';

import { bool, classify, date, str } from './classify';

const cutoff = new Date('2026-06-01T00:00:00Z');

describe('classify', () => {
	test('approved is a member, whatever else the row says', () => {
		expect(
			classify(
				{
					approved: true,
					'On Waiting List': true,
					from_waitinglist_at: '2026-07-01',
					approved_at: '2026-07-08',
				},
				cutoff,
			),
		).toEqual({
			status: 'member',
			source: 'waitlist_signup',
			coffeeInvitedAt: new Date('2026-07-01'),
			approvedAt: new Date('2026-07-08'),
		});
	});

	test('approved without approved_at is still a member — 553 rows predate the field', () => {
		expect(classify({ approved: true }, cutoff)).toMatchObject({
			status: 'member',
			approvedAt: null,
		});
	});

	test('on the waiting list is waitlisted', () => {
		expect(classify({ 'On Waiting List': true }, cutoff)).toEqual({
			status: 'waitlisted',
			source: 'waitlist_signup',
			coffeeInvitedAt: null,
			approvedAt: null,
		});
	});

	test('invited to coffee since the cutoff is still in progress; before it has lapsed', () => {
		expect(
			classify({ from_waitinglist_at: '2026-06-01T00:00:00Z' }, cutoff),
		).toMatchObject({ status: 'coffee_invited' });
		expect(
			classify({ from_waitinglist_at: '2026-05-31T23:59:59Z' }, cutoff),
		).toMatchObject({
			status: 'lapsed',
			coffeeInvitedAt: new Date('2026-05-31T23:59:59Z'),
		});
	});

	test('a row with nothing set has lapsed', () => {
		expect(classify({}, cutoff)).toMatchObject({
			status: 'lapsed',
			coffeeInvitedAt: null,
		});
	});

	test('the source reads Airtable’s select either as an object or a string', () => {
		expect(
			classify({ Source: { name: 'Volunteer Invite' } }, cutoff).source,
		).toBe('volunteer_invite');
		expect(classify({ Source: 'Volunteer Invite' }, cutoff).source).toBe(
			'volunteer_invite',
		);
		expect(classify({ Source: 'Website' }, cutoff).source).toBe(
			'waitlist_signup',
		);
	});
});

describe('the field readers', () => {
	test('str trims and treats blank or non-string as absent', () => {
		expect(str('  x ')).toBe('x');
		expect(str('   ')).toBeNull();
		expect(str(3)).toBeNull();
	});

	test('date rejects the unparseable rather than passing Invalid Date on', () => {
		expect(date('2026-01-02')).toEqual(new Date('2026-01-02'));
		expect(date('yesterday')).toBeNull();
		expect(date(undefined)).toBeNull();
	});

	test('bool is only ever a literal true', () => {
		expect(bool(true)).toBe(true);
		expect(bool('true')).toBe(false);
		expect(bool(1)).toBe(false);
	});
});
