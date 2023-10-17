import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export async function loader() {
	return json({
		meta: {
			title: 'Membership Form Received!',
			description: `You're now on the membership waiting list!`,
		},
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawShowingSupport">
			<div className="prose">
				<div className="lead">
					<h2>Thank you for filling out the New Member Form!</h2>
					<p>
						You've been added to our membership waiting list. You'll get an
						email when you have been added, and that email will contain further
						instructions.
					</p>
					<p>Please direct any questions you have to hello@virtualcoffee.io</p>
					<p>Thanks, and we can't wait to meet you!</p>
				</div>
			</div>
		</DefaultLayout>
	);
}
