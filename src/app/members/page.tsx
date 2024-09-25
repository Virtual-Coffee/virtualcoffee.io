import DefaultLayout from '@/components/layouts/DefaultLayout';
import MemberCards from '@/components/MemberCards';
import UndrawIllustration from '@/components/UndrawIllustration';
import { getMembers } from '@/data/members';
import type { MembersResponse } from '@/data/members';
import { createMetaData } from '@/util/createMetaData.server';

import type { MappableMember } from '@/content/members/types';
import 'leaflet/dist/leaflet.css';

import dynamic from 'next/dynamic';

export const metadata = createMetaData({
	title: 'Virtual Coffee Members',
	description: 'Meet our amazing members!',
	Hero: 'UndrawTeamSpirit',
});

const MapLoader = dynamic(() => import('@/components/MemberMap'), {
	loading: () => (
		<div style={{ aspectRatio: '16/9', minHeight: 400 }}>Loading...</div>
	),
	ssr: false,
});

export default async function EventsIndex() {
	const { core, members }: MembersResponse = await getMembers();

	const mapMembers = [...core, ...members].filter(
		(member): member is MappableMember => {
			return !!(member && member.location);
		},
	);

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
				<MapLoader members={mapMembers} />
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
