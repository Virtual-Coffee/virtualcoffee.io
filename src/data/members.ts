import { qualifiedUrl } from '~/util/url.server';
import type { MemberList } from '../content/members/types';

export interface MembersResponse {
	core: MemberList;
	members: MemberList;
}

export default async function getMembers(): Promise<MembersResponse> {
	const response: MembersResponse = await fetch(
		qualifiedUrl(`/.netlify/builders/data-members`),
	).then((res) => res.json());

	return response;
}
