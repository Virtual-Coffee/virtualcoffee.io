import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';

export async function generateMetadata() {
	return await createMetaData({
		title: 'Coffee Table Group Idea Received!',
		description: `Thank you for submitting your Coffee Table Group idea!`,
		Hero: 'UndrawConversation',
	});
}

export default function Thanks() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawConversation"
			heroHeader="Coffee Table Group Idea Received!"
		>
			<div className="lead mb-5">
				<h2>Thank you for submitting your Coffee Table Group idea!</h2>
				<p>One of our team members will get back to you shortly.</p>
			</div>
		</DefaultLayout>
	);
}
