import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';

export const metadata = createMetaData({
	title: 'Volunteer Application Received!',
	description: `Thank you so much for your willingness to help at VC!`,
	Hero: 'UndrawPowerful',
});

export default function Thanks() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawPowerful"
			heroHeader={metadata.title as string}
		>
			<div className="lead mb-5">
				<h2>Thank you so much for your willingness to help at VC!</h2>
				<p>One of our team members will get back to you shortly.</p>
			</div>
		</DefaultLayout>
	);
}
