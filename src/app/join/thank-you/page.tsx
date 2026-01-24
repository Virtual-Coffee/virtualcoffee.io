import DefaultLayout from '@/components/layouts/DefaultLayout';

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

export const metadata = {
	title: 'Membership Form Received!',
	description: `You're now on the membership waiting list!`,
};

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawShowingSupport">
			<div className="prose">
				<div className="lead">
					<h2>Thank you for filling out the New Member Form!</h2>
					<p>
						You&apos;ve been added to our membership waiting list. You&apos;ll
						get an email when you have been added, and that email will contain
						further instructions.
					</p>
					<p>Please direct any questions you have to hello@virtualcoffee.io</p>
					<p>Thanks, and we can&apos;t wait to meet you!</p>
				</div>
			</div>
		</DefaultLayout>
	);
}
