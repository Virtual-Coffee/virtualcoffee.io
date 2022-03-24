import { json, useLoaderData } from 'remix';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import MemberCards from '~/components/MemberCards';
import UndrawCelebration from '~/svg/UndrawCelebration';
import { loadUserData } from '~/data/members';
import generatedMemberData from '~/_generatedData/members.json';

export const loader = async () => {
	if (generatedMemberData) {
		return json(generatedMemberData);
	}

	const members = await loadUserData();

	return json(members);
};

export function meta() {
	return {
		title: 'Virtual Coffee Members',
		description: 'Meet our amazing members!',
	};
}

export default function EventsIndex() {
	const { core, members } = useLoaderData();

	return (
		<DefaultLayout
			Hero="UndrawTeamSpirit"
			heroHeader="Virtual Coffee Members"
			heroSubheader="A community is only as awesome as its members!"
		>
			<div className="bg-light py-5">
				<div className="container-xl">
					<h2 className="mb-sm-3 mb-md-4 display-5">Core Team</h2>
					<MemberCards data={core} />
					{/* {{ membercards(members.memberData.core) }} */}

					<h2 className="mb-sm-3 mb-md-5 display-5">Our Members</h2>
					<MemberCards data={members} />
					<div className="member-footer">
						<h2 className="mb-sm-3 mb-md-5 display-4">Go Team!</h2>
						<UndrawCelebration />
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
