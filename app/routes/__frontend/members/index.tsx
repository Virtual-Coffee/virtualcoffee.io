import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import MemberCards from '~/components/MemberCards';
import UndrawIllustration from '~/components/UndrawIllustration';
import getMembers from '~/data/members';
import type { MembersResponse } from '~/data/members';
import { createMetaData } from '~/util/createMetaData.server';
import type { LoaderArgs, MetaFunction, LinksFunction } from '@remix-run/node';
import type { MappableMember } from 'members/types';

import { lazy } from 'react';
import { ClientOnly } from 'remix-utils';

export const loader = async (args: LoaderArgs) => {
	const { core, members }: MembersResponse = await getMembers();

	const meta = createMetaData({
		title: 'Virtual Coffee Members',
		description: 'Meet our amazing members!',
		Hero: 'UndrawTeamSpirit',
	});

	const mapMembers = [...core, ...members].filter(
		(member): member is MappableMember => {
			return !!(member && member.location);
		},
	);

	return json({ core, members, meta, mapMembers });
};

export const meta: MetaFunction = ({ data: { meta } = {} }) => {
	return meta;
};

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
		crossOrigin: 'anonymous',
		integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
	},
];

let MapLoader = lazy(() => import('~/components/MemberMap'));

export default function EventsIndex() {
	const { core, members, mapMembers } = useLoaderData<typeof loader>();

	return (
		<DefaultLayout
			Hero="UndrawTeamSpirit"
			heroHeader="Virtual Coffee Members"
			heroSubheader="A community is only as awesome as its members!"
		>
			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="mb-sm-3 mb-md-4 display-5">
						We have members all over the world!
					</h2>
				</div>
				<ClientOnly
					fallback={
						<div style={{ aspectRatio: '16/9', minHeight: 400 }}>
							Loading...
						</div>
					}
				>
					{() => <MapLoader members={mapMembers} />}
				</ClientOnly>
			</div>
			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="mb-sm-3 mb-md-4 display-5">Core Team</h2>
					<MemberCards data={core} />
					{/* {{ membercards(members.memberData.core) }} */}

					<h2 className="mb-sm-3 mb-md-5 display-5">Our Members</h2>
					<MemberCards data={members} />
					<div className="member-footer">
						<h2 className="mb-sm-3 mb-md-5 display-4">Go Team!</h2>
						<UndrawIllustration filename="UndrawCelebration" />
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
