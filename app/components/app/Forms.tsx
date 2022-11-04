import React from 'react';
import classNames from 'classnames';

const labelClass = 'block text-sm font-medium text-gray-700';
const helpClass = 'text-sm leading-6 text-gray-500';

export function FieldSet({
	legend,
	legendDesc,
	children,
	...rest
}: {
	legend?: React.ReactNode;
	legendDesc?: React.ReactNode;
} & React.HTMLAttributes<HTMLFieldSetElement>) {
	return (
		<fieldset className="space-y-8 py-8" {...rest}>
			{legend && (
				<div>
					<legend className="text-lg leading-6 font-medium text-gray-900">
						{legend}
					</legend>
					{legendDesc && (
						<p className="mt-1 text-sm text-gray-500">{legendDesc}</p>
					)}
				</div>
			)}

			{children}
		</fieldset>
	);
}

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
			<div className="mt-1 relative rounded-md shadow-sm flex">{children}</div>
		</div>
	);
}

export type TextInputProps = {
	id: string;
	label: React.ReactNode;
	help?: React.ReactNode;
	leftAddOn?: React.ReactNode;
	rightAddOn?: React.ReactNode;
} & React.ComponentPropsWithRef<'input'>;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
	(
		{
			id,
			label,
			help,
			className,
			type = 'text',
			leftAddOn,
			rightAddOn,
			...props
		}: TextInputProps,
		ref,
	) => {
		return (
			<FieldGroup inputId={id} label={label} help={help}>
				{leftAddOn && (
					<span
						className={classNames([
							'inline-flex',
							'items-center',
							'rounded-l-md',
							'border',
							'border-r-0',
							'border-gray-300',
							'bg-gray-50',
							'px-3',
							'text-gray-500',
							'sm:text-sm',
						])}
					>
						{leftAddOn}
					</span>
				)}
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
							'min-w-0',
							'flex-1',
							'sm:text-sm',
							'border-gray-300',
						],
						!leftAddOn && !rightAddOn && 'rounded-md',
						leftAddOn && !rightAddOn && 'rounded-none rounded-r-md',
						!leftAddOn && rightAddOn && 'rounded-none rounded-l-md',
						leftAddOn && rightAddOn && 'rounded-none',
						className,
					)}
					{...props}
				/>
				{rightAddOn && (
					<span
						className={classNames([
							'inline-flex',
							'items-center',
							'rounded-r-md',
							'border',
							'border-l-0',
							'border-gray-300',
							'bg-gray-50',
							'px-3',
							'text-gray-500',
							'sm:text-sm',
						])}
					>
						{rightAddOn}
					</span>
				)}
			</FieldGroup>
		);
	},
);

TextInput.displayName = 'TextInput';

export type TextAreaInputProps = {
	id: string;
	label: React.ReactNode;
	help?: React.ReactNode;
} & React.ComponentPropsWithRef<'textarea'>;

export const TextAreaInput = React.forwardRef<
	HTMLTextAreaElement,
	TextAreaInputProps
>(({ id, label, help, className, ...props }: TextAreaInputProps, ref) => {
	return (
		<FieldGroup inputId={id} label={label} help={help}>
			<textarea
				ref={ref}
				name={id}
				id={id}
				className={classNames(
					[
						'block',
						'w-full',
						'rounded-md',
						'border-gray-300',
						'shadow-sm',
						'focus:border-sky-500',
						'focus:ring-sky-500',
						'sm:text-sm',
					],

					className,
				)}
				{...props}
			/>
		</FieldGroup>
	);
});

TextAreaInput.displayName = 'TextAreaInput';
