import React from 'react';
import classNames from 'classnames';

const labelClass = 'block text-sm font-medium text-gray-700';
const helpClass = 'text-sm leading-6 text-gray-500';

export function FieldGroup({
	inputId,
	label,
	help,
	children,
}: {
	inputId?: string;
	label: React.ReactNode;
	help?: React.ReactNode;
	children?: React.ReactNode;
}) {
	return (
		<div>
			<div className="flex justify-between flex-wrap">
				<label htmlFor={inputId} className={labelClass}>
					{label}
				</label>
				{help && <span className={helpClass}>{help}</span>}
			</div>
			<div className="mt-1 relative rounded-md shadow-sm">{children}</div>
		</div>
	);
}

export type TextInputProps = {
	id: string;
	label: React.ReactNode;
	help?: React.ReactNode;
} & React.ComponentPropsWithRef<'input'>;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
	(
		{ id, label, help, className, type = 'text', ...props }: TextInputProps,
		ref,
	) => {
		return (
			<FieldGroup inputId={id} label={label} help={help}>
				<input
					ref={ref}
					type={type}
					name={id}
					id={id}
					className={classNames(
						[
							'shadow-sm',
							'focus:ring-sky-500',
							'focus:border-sky-500',
							'block',
							'w-full',
							'sm:text-sm',
							'border-gray-300',
							'rounded-md',
						],
						className,
					)}
					{...props}
				/>
			</FieldGroup>
		);
	},
);
