import DefaultLayout from '@/components/layouts/DefaultLayout';
import MemberCards from '@/components/MemberCards';
import UndrawIllustration from '@/components/UndrawIllustration';
import { getMembers } from '@/data/members';
import type { MembersResponse } from '@/data/members';
import { createMetaData } from '@/util/createMetaData.server';

import type { MappableMember } from '@/content/members/types';
import 'leaflet/dist/leaflet.css';
import { Suspense } from 'react';
import { MapLoader, MapLoaderDev } from './map-loader';

export const dynamic = 'force-static';

export async function generateMetadata() {
	return await createMetaData({
		title: 'Virtual Coffee Members',
		description: 'Meet our amazing members!',
		Hero: 'UndrawTeamSpirit',
	});
}

export default async function EventsIndex() {
	const data = (await getMembers()) as Partial<MembersResponse> | undefined;
	const core = Array.isArray(data?.core) ? data.core : [];
	const members = Array.isArray(data?.members) ? data.members : [];
	const hasMembers = core.length > 0 || members.length > 0;

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

				{mapMembers.length > 0 && (
					<Suspense>
						{process.env.NODE_ENV === 'development' ? (
							<MapLoaderDev members={mapMembers} />
						) : (
							<MapLoader members={mapMembers} />
						)}
					</Suspense>
				)}
			</div>
			<div className="bg-light py-5">
				<div className="container-xl">
					{hasMembers ? (
						<>
							<h2 className="mb-sm-3 mb-md-4 display-5">Core Team</h2>
							<MemberCards data={core} />

							<h2 className="mb-sm-3 mb-md-5 display-5">Our Members</h2>
							<MemberCards data={members} />
							<div className="member-footer">
								<h2 className="mb-sm-3 mb-md-5 display-4">Go Team!</h2>
								<UndrawIllustration filename="UndrawCelebration" />
							</div>
						</>
					) : (
						<div
							role="status"
							aria-live="polite"
							className="text-center py-5"
						>
							<h2 className="mb-3 display-5">Members list unavailable</h2>
							<p className="lead mb-0">
								Our member directory is temporarily unavailable. Please check
								back soon!
							</p>
						</div>
					)}
				</div>
			</div>
		</DefaultLayout>
	);
}
