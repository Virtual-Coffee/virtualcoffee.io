import { describe, expect, test } from 'vitest';

import { buttons, clip, fields, notification } from './blocks';

describe('clip', () => {
	test('trims, and cuts to the plain_text cap with an ellipsis inside it', () => {
		expect(clip('  hello  ')).toBe('hello');
		expect(clip('x'.repeat(150))).toBe('x'.repeat(150));
		expect(clip('x'.repeat(151))).toBe(`${'x'.repeat(149)}…`);
		expect(clip('hello world', 6)).toBe('hello…');
	});
});

describe('fields', () => {
	test('is one bold-label paragraph per field, a dash for nothing, values literal', () => {
		expect(
			fields([
				['Name', ' Ada '],
				['Position', null],
				['Email', ''],
				['Note', '<!channel>'],
			]).elements,
		).toEqual([
			{
				type: 'rich_text_section',
				elements: [
					{ type: 'text', text: 'Name: ', style: { bold: true } },
					{ type: 'text', text: 'Ada' },
				],
			},
			{
				type: 'rich_text_section',
				elements: [
					{ type: 'text', text: 'Position: ', style: { bold: true } },
					{ type: 'text', text: '—' },
				],
			},
			{
				type: 'rich_text_section',
				elements: [
					{ type: 'text', text: 'Email: ', style: { bold: true } },
					{ type: 'text', text: '—' },
				],
			},
			{
				type: 'rich_text_section',
				elements: [
					{ type: 'text', text: 'Note: ', style: { bold: true } },
					{ type: 'text', text: '<!channel>' },
				],
			},
		]);
	});
});

describe('buttons', () => {
	test('keeps array order and styles only the primary one', () => {
		expect(
			buttons(
				{ url: 'https://a.test', label: 'A', primary: true },
				{ url: 'https://b.test', label: 'B' },
			).elements,
		).toEqual([
			{
				type: 'button',
				text: { type: 'plain_text', text: 'A' },
				url: 'https://a.test',
				style: 'primary',
			},
			{
				type: 'button',
				text: { type: 'plain_text', text: 'B' },
				url: 'https://b.test',
			},
		]);
	});
});

describe('notification', () => {
	test('is collapsible, expanded unless asked, with fields, note and buttons in that order', () => {
		const block = notification({
			title: 'T',
			subtitle: '  ',
			fields: [['Name', 'Ada']],
			note: '_static_',
			buttons: [{ url: 'https://a.test', label: 'Open' }],
		});
		expect(block).toMatchObject({
			type: 'container',
			title: { type: 'plain_text', text: 'T' },
			is_collapsible: true,
		});
		expect(block).not.toHaveProperty('subtitle');
		expect(block).not.toHaveProperty('default_collapsed');
		expect(block.child_blocks.map((child) => child.type)).toEqual([
			'rich_text',
			'context',
			'actions',
		]);

		expect(
			notification({
				title: 'T',
				subtitle: 'S',
				collapsed: true,
				fields: [],
				buttons: [],
			}),
		).toMatchObject({
			subtitle: { type: 'plain_text', text: 'S' },
			default_collapsed: true,
		});
	});
});
