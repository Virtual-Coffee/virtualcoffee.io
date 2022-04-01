import { qualifiedUrl } from '~/util/url.server';

export default async function getMembers() {
	const response = await fetch(
		qualifiedUrl(`/.netlify/builders/data-members`),
	).then((res) => res.json());

	return response;
}
