import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';

export const metadata = createMetaData({
	title: 'Lunch & Learn Idea Received!',
	description: `We can't wait to hear your talk!`,
	Hero: 'UndrawPresentation',
});

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawPresentation">
			<div className="lead mb-5">
				<h2>Thank you for submitting your Lunch & Learn talk!</h2>
				<p>One of our team members will get back to you shortly.</p>
			</div>
		</DefaultLayout>
	);
}
