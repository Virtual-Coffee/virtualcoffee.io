/* This example requires Tailwind CSS v2.0+ */
import {
	ExclamationCircleIcon,
	CheckCircleIcon,
	XCircleIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/solid';

export type AlertTypes = 'warning' | 'danger' | 'success' | 'info';

const config = {
	warning: {
		body: 'bg-yellow-50',
		icon: 'text-yellow-400',
		title: 'text-yellow-800',
		content: 'text-yellow-700',
		Icon: ExclamationCircleIcon,
	},
	danger: {
		body: 'bg-red-50',
		icon: 'text-red-400',
		title: 'text-red-800',
		content: 'text-red-700',
		Icon: XCircleIcon,
	},
	success: {
		body: 'bg-green-50',
		icon: 'text-green-400',
		title: 'text-green-800',
		content: 'text-green-700',
		Icon: CheckCircleIcon,
	},
	info: {
		body: 'bg-blue-50',
		icon: 'text-blue-400',
		title: 'text-blue-800',
		content: 'text-blue-700',
		Icon: InformationCircleIcon,
	},
};

export default function Alert({
	title,
	children,
	type = 'warning',
	className = '',
}: {
	title: React.ReactNode;
	children?: React.ReactNode;
	type: AlertTypes;
	className?: String;
}) {
	const Icon = config[type].Icon;
	return (
		<div className={`rounded-md p-4 ${config[type].body} ${className}`}>
			<div className="flex">
				<div className="flex-shrink-0">
					<Icon className={`h-5 w-5 ${config[type].icon}`} aria-hidden="true" />
				</div>
				<div className="ml-3">
					<h3 className={`text-sm font-medium ${config[type].title}`}>
						{title}
					</h3>
					{children && (
						<div className={`mt-2 text-sm ${config[type].content} space-y-2`}>
							{children}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
