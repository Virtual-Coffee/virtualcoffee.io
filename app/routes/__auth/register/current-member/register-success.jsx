import SingleTask from '~/components/layouts/SingleTask';

export default function Screen() {
	return (
		<SingleTask title="Registration successful!">
			<h1 className="text-lg font-medium">Check your Email!</h1>
			<div className="mt-2 space-y-2">
				<p>Thank you for registering with Virtual Coffee.</p>
				<p>Please check your email to confirm your account.</p>
			</div>
		</SingleTask>
	);
}
