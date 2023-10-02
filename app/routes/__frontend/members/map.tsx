import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';

import getMembers from '~/data/members';
import type { MembersResponse } from '~/data/members';
import { createMetaData } from '~/util/createMetaData.server';
import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { type MemberList } from 'members/types';

import { lazy } from 'react';
import { ClientOnly } from 'remix-utils';

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
		crossOrigin: 'anonymous',
		integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
	},
];

let MapLoader = lazy(() => import('~/components/MemberMap'));

export const loader = async (args: LoaderArgs) => {
	const { core, members }: MembersResponse = await getMembers();

	const membersWithLocation: MemberList = [
		...core.filter((member) => !!member?.location),
		...members.filter((member) => !!member?.location),
	];

	const meta = createMetaData({
		title: 'Virtual Coffee Members',
		description: 'Meet our amazing members!',
		Hero: 'UndrawTeamSpirit',
	});

	return json({ members: membersWithLocation, meta });
};

export const meta: MetaFunction = ({ data: { meta } = {} }) => {
	return meta;
};

export default function EventsIndex() {
	const { members } = useLoaderData<typeof loader>();

	return (
		<DefaultLayout
			Hero="UndrawTeamSpirit"
			heroHeader="Virtual Coffee Members"
			heroSubheader="A community is only as awesome as its members!"
		>
			<div className="bg-light py-5">
				<div className="container-xl">
					<ClientOnly>{() => <MapLoader members={members} />}</ClientOnly>
				</div>
			</div>
		</DefaultLayout>
	);
}
