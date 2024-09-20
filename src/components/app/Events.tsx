import type { PolymorphicComponentPropsWithRef } from '~/util/types';
import type { Event } from '~/api/types';
import { DateTime } from 'luxon';
import classNames from 'classnames';
import { Button } from '~/components/app/Button';
import DisplayHtml from '~/components/DisplayHtml';
import { Fragment, useCallback, useState } from 'react';
import {
	CalendarIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisHorizontalIcon,
	ChevronDownIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition, Popover } from '@headlessui/react';

export type EventsWithCheck = Event & {
	isCurrent: boolean;
};

type DateDetailsProps<C extends React.ElementType> =
	PolymorphicComponentPropsWithRef<
		C,
		{
			event: EventsWithCheck;
			showDescription?: boolean;
		}
	>;

export const DateDetails = <T extends React.ElementType = 'div'>({
	event,
	showDescription = true,
	as,
	className,
}: DateDetailsProps<T>) => {
	const Component = as || 'div';
	const eventDate = DateTime.fromISO(event.startDateLocalized);

	return (
		<Component
			className={classNames('relative flex gap-6 py-3 xl:static', className)}
		>
			<div className="flex-auto">
				<div className="flex gap-4 justify-between items-center">
					<h3 className="text-lg pr-10 font-semibold text-gray-900 xl:pr-0">
						{event.title}
					</h3>

					<div>
						{event.isCurrent && (
							<Button
								as="a"
								href={event.eventLink}
								className="mb-4"
								target="_blank"
								rel="nofollow"
							>
								Join Now
							</Button>
						)}
					</div>
				</div>
				{showDescription && event.eventCalendarDescription && (
					<DisplayHtml
						html={event.eventCalendarDescription}
						className="text-gray-500"
					/>
				)}
				<dl className="mt-2 flex flex-col text-gray-500 xl:flex-row">
					<div className="flex items-start space-x-3">
						<dt className="mt-0.5">
							<span className="sr-only">Date</span>
							<CalendarIcon
								className="h-5 w-5 text-gray-400"
								aria-hidden="true"
							/>
						</dt>
						<dd>
							<time dateTime={event.startDateLocalized}>
								{eventDate.toLocaleString(DateTime.DATE_MED)} at{' '}
								{eventDate.toLocaleString({
									...DateTime.TIME_SIMPLE,

									timeZoneName: 'short',
								})}
							</time>
						</dd>
					</div>
				</dl>
			</div>
			<Menu
				as="div"
				className="absolute top-6 right-0 xl:relative xl:top-auto xl:right-auto xl:self-center"
			>
				<div>
					<Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
						<span className="sr-only">Open options</span>
						<EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
					</Menu.Button>
				</div>

				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<Menu.Items className="focus:outline-none absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
						<div className="py-1">
							<Menu.Item>
								{({ active }) => (
									<a
										href={event.eventIcsLink}
										download
										className={classNames(
											active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
											'block px-4 py-2 text-sm',
										)}
									>
										Add to Calendar
									</a>
								)}
							</Menu.Item>
							<Menu.Item>
								{({ active }) => (
									<a
										href="#"
										className={classNames(
											active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
											'block px-4 py-2 text-sm',
										)}
									>
										Cancel
									</a>
								)}
							</Menu.Item>
						</div>
					</Menu.Items>
				</Transition>
			</Menu>
		</Component>
	);
};
