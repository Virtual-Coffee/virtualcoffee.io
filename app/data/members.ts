import { qualifiedUrl } from '~/util/url.server';

export interface MembersResponse {
	core: [];
	members: [];
}

export default async function getMembers(): Promise<MembersResponse> {
	const response: MembersResponse = await fetch(
		qualifiedUrl(`/.netlify/builders/data-members`),
	).then((res) => res.json());

	return response;
}
