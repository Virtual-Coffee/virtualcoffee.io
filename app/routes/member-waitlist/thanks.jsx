import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { createMetaData } from '~/util/createMetaData.server';

export async function loader() {
	return json({
		meta: createMetaData({
			title: 'Membership waitlist submission received!',
			description: `We can't wait to meet you!`,
			Hero: 'UndrawPresentation',
		}),
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawPresentation">
			<div class="lead mb-5">
				<h2>Thank you for joining our waitlist!</h2>
				<p>
					When a spot becomes available, you'll be notified by email. We can't
					wait to meet you!
				</p>
			</div>
		</DefaultLayout>
	);
}
