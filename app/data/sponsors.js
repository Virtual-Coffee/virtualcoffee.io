import { qualifiedUrl } from '~/util/url.server';

export default async function getSponsors() {
	const response = await fetch(
		qualifiedUrl(`/.netlify/builders/data-sponsors`),
	).then((res) => res.json());

	return response;
}
