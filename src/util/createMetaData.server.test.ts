import { expect, test } from 'vitest';

import { createMetaData } from './createMetaData.server';

const socialImage = async (args: Parameters<typeof createMetaData>[0]) =>
	decodeURIComponent(
		String((await createMetaData(args)).openGraph?.images?.toString()),
	);

test('`hero` alone names the hero SVG', async () => {
	const image = await socialImage({ title: 'T', hero: 'UndrawTeamSpirit' });
	expect(image).toContain('/assets/svg/UndrawTeamSpirit.svg');
	expect(image).not.toContain('undefined');
});

test('`Hero` names the hero SVG', async () => {
	expect(await socialImage({ title: 'T', Hero: 'UndrawArrived' })).toContain(
		'/assets/svg/UndrawArrived.svg',
	);
});

test('no hero means no hero layer', async () => {
	expect(await socialImage({ title: 'T' })).not.toContain('/assets/svg/');
});
