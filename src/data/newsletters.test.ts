import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { getNewsletter, getNewsletters } from './newsletters';

describe('getNewsletter', () => {
	test('loads every listed issue with its own metadata', async () => {
		const issues = await getNewsletters();
		expect(issues.length).toBeGreaterThan(0);

		const titles = new Set<string | undefined>();
		for (const { href } of issues) {
			const newsletter = await getNewsletter(
				href.replace('/newsletter/issues/', ''),
			);
			expect(newsletter?.handle.meta).toEqual(
				expect.schemaMatching(
					z.object({
						title: z.string().min(1),
						description: z.string().min(1),
					}),
				),
			);
			titles.add(newsletter?.handle.meta.title);
		}
		expect(titles.size).toBe(issues.length);
	});

	// The last three resolve to a real issue module, so only the lookup stops them.
	test.each([
		'2099-01',
		'',
		'2024-12.jsx',
		'../newsletters/2024-12',
		'./2024-12',
	])('returns null for %j, which is not a listed issue', async (slug) => {
		expect(await getNewsletter(slug)).toBeNull();
	});
});
