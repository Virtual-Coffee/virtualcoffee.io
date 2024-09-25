import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import { Form } from './form';
import LeadText from '@/components/content/LeadText';
import Link from 'next/link';

export const meta = createMetaData({
	title: 'Volunteer at Virtual Coffee',
	description: `Part of Virtual Coffee's mission is to make safe, supportive spaces for pursuing leadership and roles in community building. We currently have a few initiatives where we'd love to have more volunteers in helping make this community great!`,
	Hero: 'UndrawPowerful',
});

export default function VolunteerForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawPowerful"
			heroHeader="Volunteer at Virtual Coffee"
			heroSubheader="Give back to this amazing community!"
		>
			<LeadText>
				<p>
					Part of Virtual Coffee's mission is to make safe, supportive spaces
					for pursuing leadership and roles in community building. We currently
					have a few initiatives where we'd love to have more volunteers in
					helping make this community great!
				</p>
				<p>
					To read more and to see some roles available, read our{' '}
					<Link href="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
						Paths to Leadership &amp; Roles guide
					</Link>
					.
				</p>
			</LeadText>

			<Form />
		</DefaultLayout>
	);
}
