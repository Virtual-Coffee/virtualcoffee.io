import type { SponsorsResponse } from 'netlify/functions/data-sponsors';
import { qualifiedUrl } from '~/util/url.server';

export default async function getSponsors(): Promise<SponsorsResponse> {
	const response = await fetch(
		qualifiedUrl(`/.netlify/builders/data-sponsors`),
	).then((res) => res.json());

	return response;
}
