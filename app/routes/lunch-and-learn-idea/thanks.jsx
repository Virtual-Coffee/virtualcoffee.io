import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export async function loader() {
	return json({
		meta: {
			title: 'Lunch & Learn Idea Received!',
			description: `We can't wait to hear your talk!`,
		},
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawPresentation">
			<div class="lead mb-5">
				<h2>Thank you for submitting your Lunch & Learn talk!</h2>
				<p>One of our team members will get back to you shortly.</p>
			</div>
		</DefaultLayout>
	);
}
