import classNames from 'classnames';

export default function SectionHeader({
	title,
	subtitle,
	actions,
	className,
	...props
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	actions?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={classNames(
				'border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between',
				className,
			)}
			{...props}
		>
			<div className="flex items-start space-x-5">
				{/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
				<div className="pt-1.5">
					<h2 className="text-lg font-medium leading-6 text-gray-900">
						{title}
					</h2>
					{subtitle && (
						<p className="mt-2 max-w-4xl text-sm text-gray-500">{subtitle}</p>
					)}
				</div>
			</div>
			{actions && <div className="mt-3 flex sm:mt-0 sm:ml-4">{actions}</div>}
		</div>
	);
}
