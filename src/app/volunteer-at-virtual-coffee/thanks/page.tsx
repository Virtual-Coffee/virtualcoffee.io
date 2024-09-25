import DefaultLayout from '@/components/layouts/DefaultLayout';

export const meta = {
	title: 'Volunteer Application Received!',
	description: `Thank you so much for your willingness to help at VC!`,
};

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawPowerful" heroHeader={meta.title}>
			<div className="lead mb-5">
				<h2>Thank you so much for your willingness to help at VC!</h2>
				<p>One of our team members will get back to you shortly.</p>
			</div>
		</DefaultLayout>
	);
}
