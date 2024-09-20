/* This example requires Tailwind CSS v2.0+ */
export default function PageHeader({
	title,
	subtitle,
	actions,
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	actions?: React.ReactNode;
}) {
	return (
		<div className="md:flex md:items-center md:justify-between md:space-x-5 bg-white shadow px-4 py-4 sm:px-6 lg:px-8">
			<div className="flex items-start space-x-5">
				{/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
				<div className="pt-1.5">
					<h1 className="text-2xl font-bold text-gray-900">{title}</h1>
					{subtitle && (
						<p className="text-sm font-medium text-gray-500">{subtitle}</p>
					)}
				</div>
			</div>
			{actions && (
				<div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
					{actions}
				</div>
			)}
		</div>
	);
}
