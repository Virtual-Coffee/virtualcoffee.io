import React from 'react';
import classNames from 'classnames';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
	LinkIcon,
	PlusIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';

const labelClass = 'block text-sm font-medium text-gray-700';
const helpClass = 'text-sm leading-6 text-gray-500';
const errorHelpClass = 'text-sm leading-6 text-red-600';

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

export function PanelForm({
	legend,
	legendDesc,
	children,
}: {
	legend: React.ReactNode;
	legendDesc?: React.ReactNode;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(true);

	return (
		<Transition.Root show={true} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={setOpen}>
				<div className="fixed inset-0" />

				<div className="fixed inset-0 overflow-hidden">
					<div className="absolute inset-0 overflow-hidden">
						<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
							<Transition.Child
								as={Fragment}
								enter="transform transition ease-in-out duration-500 sm:duration-700"
								enterFrom="translate-x-full"
								enterTo="translate-x-0"
								leave="transform transition ease-in-out duration-500 sm:duration-700"
								leaveFrom="translate-x-0"
								leaveTo="translate-x-full"
							>
								<Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
									<Form className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
										<fieldset className="flex-1">
											{/* Header */}
											<div className="bg-gray-50 px-4 py-6 sm:px-6">
												<div className="flex items-start justify-between space-x-3">
													<div className="space-y-1">
														<Dialog.Title
															as="legend"
															className="text-lg font-medium text-gray-900"
														>
															{legend}
														</Dialog.Title>
														{legendDesc && (
															<p className="text-sm text-gray-500">
																{legendDesc}
															</p>
														)}
													</div>
													<div className="flex h-7 items-center">
														<button
															type="button"
															className="text-gray-400 hover:text-gray-500"
															onClick={() => setOpen(false)}
														>
															<span className="sr-only">Close panel</span>
															<XMarkIcon
																className="h-6 w-6"
																aria-hidden="true"
															/>
														</button>
													</div>
												</div>
											</div>

											{/* Divider container */}
											<div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
												{children}
											</div>
										</fieldset>

										{/* Action buttons */}
										<div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
											<div className="flex justify-end space-x-3">
												<button
													type="button"
													className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
													onClick={() => setOpen(false)}
												>
													Cancel
												</button>
												<button
													type="submit"
													className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
												>
													Create
												</button>
											</div>
										</div>
									</Form>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

export function FieldGroup({
	inputId,
	label,
	help,
	children,
	errorMessage,
}: {
	inputId?: string;
	label: React.ReactNode;
	help?: React.ReactNode;
	children?: React.ReactNode;
	errorMessage?: React.ReactNode;
}) {
	return (
		<div>
			<div
				className="group flex justify-between flex-wrap"
				{...(errorMessage ? { 'data-has-error': true } : {})}
			>
				<label htmlFor={inputId} className={labelClass}>
					{label}
				</label>
				{help && <span className={helpClass}>{help}</span>}
			</div>
			<div className="mt-1 relative rounded-md shadow-sm flex">{children}</div>
			{errorMessage && (
				<p className="mt-2 text-sm text-red-600" id="email-error">
					{errorMessage}
				</p>
			)}
		</div>
	);
}

export type TextInputProps = {
	id: string;
	label: React.ReactNode;
	help?: React.ReactNode;
	leftAddOn?: React.ReactNode;
	rightAddOn?: React.ReactNode;
	errorMessage?: React.ReactNode;
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
			errorMessage,
			...props
		}: TextInputProps,
		ref,
	) => {
		return (
			<FieldGroup
				inputId={id}
				label={label}
				help={help}
				errorMessage={errorMessage}
			>
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
							'group-[[data-has-error]]-border-red-300',
							'group-[[data-has-error]]-text-red-900',
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
							'group-[[data-has-error]]-border-red-300',
							'group-[[data-has-error]]-text-red-900',
							'group-[[data-has-error]]-placeholder-red-300',
							'group-[[data-has-error]]-focus:border-red-500',
							'group-[[data-has-error]]-focus:ring-red-500',
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
							'group-[[data-has-error]]-border-red-300',
							'group-[[data-has-error]]-text-red-900',
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
	errorMessage?: React.ReactNode;
} & React.ComponentPropsWithRef<'textarea'>;

export const TextAreaInput = React.forwardRef<
	HTMLTextAreaElement,
	TextAreaInputProps
>(
	(
		{ id, label, help, className, errorMessage, ...props }: TextAreaInputProps,
		ref,
	) => {
		return (
			<FieldGroup
				inputId={id}
				label={label}
				help={help}
				errorMessage={errorMessage}
			>
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
							'group-[[data-has-error]]-border-red-300',
							'group-[[data-has-error]]-text-red-900',
							'group-[[data-has-error]]-placeholder-red-300',
							'group-[[data-has-error]]-focus:border-red-500',
							'group-[[data-has-error]]-focus:ring-red-500',
						],

						className,
					)}
					{...props}
				/>
			</FieldGroup>
		);
	},
);

TextAreaInput.displayName = 'TextAreaInput';
