import classNames from 'classnames';
import VirtualCoffeeFullBanner from '~/svg/VirtualCoffeeFullBanner';

export default function SingleTask({
	children,
	title,
	wide,
}: {
	title?: React.ReactNode;
	children?: React.ReactNode;
	wide?: boolean;
}) {
	return (
		<div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div
				className={classNames(
					'sm:mx-auto sm:w-full',
					wide ? 'sm:max-w-2xl' : 'sm:max-w-md',
				)}
			>
				<VirtualCoffeeFullBanner
					className="mx-auto h-12 w-auto"
					title="Virtual Coffee"
				/>
				{title && (
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						{title}
					</h2>
				)}
			</div>
			<div
				className={classNames(
					'mt-8 sm:mx-auto sm:w-full',
					wide ? 'sm:max-w-2xl' : 'sm:max-w-md',
				)}
			>
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{children}
				</div>
			</div>
		</div>
	);
}
