import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import { Form } from './form';
import LeadText from '@/components/content/LeadText';
import Link from 'next/link';

export const metadata = createMetaData({
	title: 'Start a Coffee Table Group',
	description: `Submit your idea for a new Coffee Table Group at Virtual Coffee`,
});

export default function CoffeeTableGroupForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawConversation"
			heroHeader="Start a Coffee Table Group"
			heroSubheader="Submit your idea for a new Coffee Table Group at Virtual Coffee!"
		>
			<LeadText>
				<p>
					Our Coffee Table Groups have been one of the most popular and valuable
					features for members of our community. Coffee Table Groups are small,
					special interest groups created and run by members. They can involve
					Zoom meetings, async Slack hangouts, or anything else that the members
					would like to do.
				</p>
				<p>
					To learn more about leading a Coffee Table Group, read our{' '}
					<Link href="/resources/virtual-coffee-handbook/get-involved/leading-coffee-table-groups">
						Leading Coffee Table Groups
					</Link>{' '}
					guide. See the list of our existing Coffee Table Groups in the{' '}
					<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups">
						Coffee Table Groups
					</Link>{' '}
					guide.
				</p>
			</LeadText>
			<Form />
		</DefaultLayout>
	);
}
