import { qualifiedUrl } from '~/util/url.server';

type SponsorResponse = any;

export default async function getSponsors(): Promise<SponsorResponse> {
	const response = await fetch(
		qualifiedUrl(`/.netlify/builders/data-sponsors`),
	).then((res) => res.json());

	return response;
}
