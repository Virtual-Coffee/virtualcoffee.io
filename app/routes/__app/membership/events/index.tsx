import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';
import { Fragment, useCallback, useState } from 'react';
import {
	CalendarIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	EllipsisHorizontalIcon,
	ChevronDownIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition, Popover, Disclosure } from '@headlessui/react';

import classNames from 'classnames';
import { DateTime } from 'luxon';
import { Button } from '~/components/app/Button';
import { PolymorphicComponentPropsWithRef } from '~/util/types';
import { DateDetails } from '~/components/app/Events';
import type { EventsWithCheck } from '~/components/app/Events';
import { sanitizeHtml } from '~/util/sanitizeCmsData';

export { metaFromData as meta } from '~/util/remixHelpers';

type CalendarDate = {
	date: string;
	isCurrentMonth: boolean;
	isCurrentWeek: boolean;
	isToday: boolean;
	isSelected?: boolean;
	events: EventsWithCheck[];
};

type CalendarView = 'month' | 'week';

export const loader = async ({ request }: LoaderArgs) => {
	await authenticate(request);

	let api = new CmsActions();
	await api.authenticate(request);

	const calendars = await api.getCalendars();

	const url = new URL(request.url);
	const currentMonth = new Date().getMonth() + 1;

	let monthParam = parseInt(url.searchParams.get('month') || '');
	let dayParam = parseInt(url.searchParams.get('day') || '');
	let view: CalendarView =
		url.searchParams.get('view') === 'week' ? 'week' : 'month';

	const month = isNaN(monthParam) ? currentMonth : monthParam;

	const day = isNaN(dayParam) ? new Date().getDate() : dayParam;

	const weekStart = DateTime.now().set({
		month,
		day,
		hour: 0,
		minute: 0,
		second: 0,
	});
	const weekEnd = weekStart.plus({ days: 6 }).set({
		hour: 23,
		minute: 59,
		second: 59,
	});

	// first day of the month
	let loopDate: DateTime = DateTime.now().set({
		month,
		day: 1,
		hour: 0,
		minute: 0,
		second: 0,
	});

	// find the first sunday before that
	while (loopDate.weekday !== 7) {
		loopDate = loopDate.minus({ days: 1 });
	}

	// load events for that range
	const events = await api.getEventsInRange({
		rangeStart: loopDate.toISO(),
		rangeEnd: loopDate.plus({ days: 42 }).toISO(),
		// calendars: calendars.map((c) => c.handle),
	});

	// return json({
	// 	meta: {
	// 		title: 'Events',
	// 	},
	// });

	const eventsWithCheck: EventsWithCheck[] = await Promise.all(
		events.map(async (event) => {
			if (
				DateTime.fromISO(event.startDateLocalized).hasSame(
					DateTime.now(),
					'day',
				)
			) {
				const jl = await api.getEventJoinLink(event, request);
				return { ...event, isCurrent: jl.type === 'success' };
			}

			return { ...event, isCurrent: false };
		}),
	);

	let dates: CalendarDate[] = [];
	for (let i = 0; i < 42; i++) {
		let dateEvents = eventsWithCheck.filter((event) => {
			return loopDate.hasSame(
				DateTime.fromISO(event.startDateLocalized),
				'day',
			);
		});

		const dateObj = {
			date: loopDate.toISO(),
			isCurrentMonth: loopDate.month === month,
			isCurrentWeek: loopDate >= weekStart && loopDate <= weekEnd,
			isToday: loopDate.hasSame(DateTime.now(), 'day'),
			isSelected: loopDate.day === day && loopDate.month === month,
			events: dateEvents,
		};

		dates = [...dates, dateObj];

		loopDate = loopDate.plus({ days: 1 });
	}

	const selectedDate = dates.find((day) => day.isSelected);

	const weeklyEvents = eventsWithCheck.filter((event) => {
		return (
			DateTime.fromISO(event.startDateLocalized) >= weekStart &&
			DateTime.fromISO(event.endDateLocalized) <= weekEnd
		);
	});

	return json({
		meta: {
			title: 'Events',
		},
		calendars,
		weeklyEvents,
		dates,
		selectedDate,
		settings: {
			month,
			day,
			view,
			weekStart,
			weekEnd,
		},
	});
};

export function MonthDay({
	day,
	isActive,
	setActiveDate,
}: {
	day: CalendarDate;
	isActive?: boolean;
	setActiveDate: React.Dispatch<
		React.SetStateAction<CalendarDate['date'] | undefined>
	>;
}) {
	const dayDate = new Date(day.date);

	const setDate = useCallback(() => {
		setActiveDate(day.date);
	}, []);

	return (
		<div
			className={classNames(
				day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-500',
				'relative py-2 px-3',
				isActive ? 'z-10' : 'z-0',
			)}
		>
			<time
				dateTime={day.date}
				className={
					day.isToday
						? 'flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 font-semibold text-white'
						: undefined
				}
			>
				{dayDate.getDate()}
			</time>
			{day.events.length > 0 && (
				<ol className="mt-2">
					{day.events.map((event) => (
						<Popover key={event.id} as="li">
							{({ open }) => (
								<>
									<Popover.Button
										className="group flex max-w-full"
										onClick={setDate}
									>
										<p className="flex-auto truncate font-medium text-gray-900 group-hover:text-sky-600">
											{event.title}
										</p>
										<time
											dateTime={event.startDateLocalized}
											className="ml-3 hidden flex-none text-gray-500 group-hover:text-sky-600 2xl:block"
										>
											{DateTime.fromISO(
												event.startDateLocalized,
											).toLocaleString({
												hour: 'numeric',
												minute: '2-digit',
												timeZoneName: 'short',
											})}
										</time>
									</Popover.Button>
									<Transition
										show={open}
										enter="transition duration-100 ease-out"
										enterFrom="transform scale-95 opacity-0"
										enterTo="transform scale-100 opacity-100"
										leave="transition duration-75 ease-out"
										leaveFrom="transform scale-100 opacity-100"
										leaveTo="transform scale-95 opacity-0"
									>
										<Popover.Panel
											static
											className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl"
										>
											<div
												className={classNames(
													'overflow-hidden rounded-lg shadow-lg',
													event.isCurrent
														? 'ring-8 ring-sky-600 ring-opacity-100'
														: 'ring-1 ring-black ring-opacity-5',
												)}
											>
												<div className="relative bg-white p-7">
													<DateDetails event={event} />
												</div>
											</div>
										</Popover.Panel>
									</Transition>
								</>
							)}
						</Popover>
					))}
				</ol>
			)}
		</div>
	);
}

export function getCalendarUrl({
	day,
	month,
	view,
}: {
	day?: string | number;
	month?: string | number;
	view?: CalendarView;
}) {
	return `/membership/events?day=${day}&month=${month}&view=${view}`;
}

// export default function Page() {
// 	return <div>Hello!</div>;
// }

export default function Page() {
	const { weeklyEvents, dates, selectedDate, settings, calendars } =
		useLoaderData<typeof loader>();

	const today = DateTime.now();

	const calDate = DateTime.now().set({
		month: settings.month,
		day: settings.day,
	});

	const [activeDate, setActiveDate] = useState<
		CalendarDate['date'] | undefined
	>();

	return (
		<>
			<div className="lg:h-0 lg:min-h-[768px]">
				<div className="lg:flex lg:h-full lg:flex-col">
					<header className="relative z-20 flex items-center justify-between border-b border-gray-200 py-4 lg:flex-none">
						<h1 className="text-lg font-semibold text-gray-900">
							<time dateTime={calDate.toFormat('y-MM')}>
								{calDate.toLocaleString({
									month: 'long',
									year: 'numeric',
								})}
							</time>
						</h1>
						<div className="flex items-center">
							<div className="flex items-center rounded-md shadow-sm md:items-stretch">
								<Link
									to={getCalendarUrl(
										settings.view === 'month'
											? {
													month: calDate.minus({ month: 1 }).month,
													view: settings.view,
											  }
											: {
													month: calDate.minus({ weeks: 1 }).month,
													day: calDate.minus({ weeks: 1 }).day,
													view: settings.view,
											  },
									)}
									className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
								>
									<span className="sr-only">Previous month</span>
									<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
								</Link>
								<Link
									to={getCalendarUrl({
										month: today.month,
										day: today.day,
										view: settings.view,
									})}
									className="hidden border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:flex items-center"
								>
									Today
								</Link>
								<span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
								<Link
									to={getCalendarUrl(
										settings.view === 'month'
											? {
													month: calDate.plus({ month: 1 }).month,
													view: settings.view,
											  }
											: {
													month: calDate.plus({ weeks: 1 }).month,
													day: calDate.plus({ weeks: 1 }).day,
													view: settings.view,
											  },
									)}
									className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
								>
									<span className="sr-only">Next month</span>
									<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
								</Link>
							</div>
							<div className="hidden md:ml-4 md:flex md:items-center">
								<Menu as="div" className="relative">
									<Menu.Button
										type="button"
										className="flex items-center rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
									>
										{settings.view === 'month' ? 'Month view' : 'Week View'}
										<ChevronDownIcon
											className="ml-2 h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</Menu.Button>

									<Transition
										as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="focus:outline-none absolute right-0 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
											<div className="py-1">
												<Menu.Item>
													{({ active }) => (
														<Link
															to={getCalendarUrl({
																month: settings.month,
																day: settings.day,
																view: 'week',
															})}
															className={classNames(
																active
																	? 'bg-gray-100 text-gray-900'
																	: 'text-gray-700',
																'block px-4 py-2 text-sm',
															)}
														>
															Week view
														</Link>
													)}
												</Menu.Item>
												<Menu.Item>
													{({ active }) => (
														<Link
															to={getCalendarUrl({
																month: settings.month,
																day: settings.day,
																view: 'month',
															})}
															className={classNames(
																active
																	? 'bg-gray-100 text-gray-900'
																	: 'text-gray-700',
																'block px-4 py-2 text-sm',
															)}
														>
															Month view
														</Link>
													)}
												</Menu.Item>
											</div>
										</Menu.Items>
									</Transition>
								</Menu>
							</div>
							<Menu as="div" className="relative ml-6 md:hidden">
								<Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
									<span className="sr-only">Open menu</span>
									<EllipsisHorizontalIcon
										className="h-5 w-5"
										aria-hidden="true"
									/>
								</Menu.Button>

								<Transition
									as={Fragment}
									enter="transition ease-out duration-100"
									enterFrom="transform opacity-0 scale-95"
									enterTo="transform opacity-100 scale-100"
									leave="transition ease-in duration-75"
									leaveFrom="transform opacity-100 scale-100"
									leaveTo="transform opacity-0 scale-95"
								>
									<Menu.Items className="focus:outline-none absolute right-0 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
										<div className="py-1">
											<Menu.Item>
												{({ active }) => (
													<a
														href="#"
														className={classNames(
															active
																? 'bg-gray-100 text-gray-900'
																: 'text-gray-700',
															'block px-4 py-2 text-sm',
														)}
													>
														Create event
													</a>
												)}
											</Menu.Item>
										</div>
										<div className="py-1">
											<Menu.Item>
												{({ active }) => (
													<Link
														to={getCalendarUrl({
															month: today.month,
															day: today.day,
														})}
														className={classNames(
															active
																? 'bg-gray-100 text-gray-900'
																: 'text-gray-700',
															'block px-4 py-2 text-sm',
														)}
													>
														Go to today
													</Link>
												)}
											</Menu.Item>
										</div>
										<div className="py-1">
											<Menu.Item>
												{({ active }) => (
													<Link
														to={getCalendarUrl({
															month: settings.month,
															day: settings.day,
															view: 'week',
														})}
														className={classNames(
															active
																? 'bg-gray-100 text-gray-900'
																: 'text-gray-700',
															'block px-4 py-2 text-sm',
														)}
													>
														Week view
													</Link>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<Link
														to={getCalendarUrl({
															month: settings.month,
															day: settings.day,
															view: 'month',
														})}
														className={classNames(
															active
																? 'bg-gray-100 text-gray-900'
																: 'text-gray-700',
															'block px-4 py-2 text-sm',
														)}
													>
														Month view
													</Link>
												)}
											</Menu.Item>
										</div>
									</Menu.Items>
								</Transition>
							</Menu>
						</div>
					</header>
					<Disclosure>
						{({ open }) => (
							<>
								<div className="py-4 text-right">
									<Disclosure.Button as={Button} color="white">
										<span>Calendars</span>
										<ChevronUpIcon
											className={`${
												open ? 'rotate-180 transform' : ''
											} h-5 w-5 ml-2 text-gray-400`}
										/>
									</Disclosure.Button>
								</div>

								<Disclosure.Panel className="p-4 bg-white">
									<h2 className="text-lg font-semibold text-gray-900">
										Calendars
									</h2>
									<ul role="list" className="divide-y divide-gray-200">
										{calendars.map((calendar) => (
											<li
												key={calendar.id}
												className="py-4 flex items-center space-x-4"
											>
												{/* <div className="flex-shrink-0">
                  	checkbox
                	</div> */}
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium text-gray-900">
														{calendar.name}
													</p>
												</div>
												<div>
													<Button
														size="xs"
														color="black"
														as="a"
														href={`/membership/events/calendar-subscribe/${calendar.handle}`}
														target="_blank"
														rel="nofollow"
													>
														Subscribe (iCal link)
													</Button>
												</div>
											</li>
										))}
									</ul>
								</Disclosure.Panel>
							</>
						)}
					</Disclosure>
					{settings.view === 'month' ? (
						<>
							<div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
								<div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
									<div className="bg-white py-2">
										S<span className="sr-only sm:not-sr-only">un</span>
									</div>
									<div className="bg-white py-2">
										M<span className="sr-only sm:not-sr-only">on</span>
									</div>
									<div className="bg-white py-2">
										T<span className="sr-only sm:not-sr-only">ue</span>
									</div>
									<div className="bg-white py-2">
										W<span className="sr-only sm:not-sr-only">ed</span>
									</div>
									<div className="bg-white py-2">
										T<span className="sr-only sm:not-sr-only">hu</span>
									</div>
									<div className="bg-white py-2">
										F<span className="sr-only sm:not-sr-only">ri</span>
									</div>
									<div className="bg-white py-2">
										S<span className="sr-only sm:not-sr-only">at</span>
									</div>
								</div>
								<div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
									<div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
										{dates.map((day) => (
											<MonthDay
												key={day.date}
												day={day}
												setActiveDate={setActiveDate}
												isActive={day.date === activeDate}
											/>
										))}
									</div>
									<div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
										{dates.map((day) => {
											const dayDate = new Date(day.date);
											return (
												<Link
													key={day.date}
													to={getCalendarUrl({
														day: dayDate.getDate(),
														month: dayDate.getMonth() + 1,
													})}
													className={classNames(
														day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
														(day.isSelected || day.isToday) && 'font-semibold',
														day.isSelected && 'text-white',
														!day.isSelected && day.isToday && 'text-sky-600',
														!day.isSelected &&
															day.isCurrentMonth &&
															!day.isToday &&
															'text-gray-900',
														!day.isSelected &&
															!day.isCurrentMonth &&
															!day.isToday &&
															'text-gray-500',
														'flex h-14 flex-col py-2 px-3 hover:bg-gray-100 focus:z-10',
													)}
												>
													<time
														dateTime={day.date}
														className={classNames(
															day.isSelected &&
																'flex h-6 w-6 items-center justify-center rounded-full',
															day.isSelected && day.isToday && 'bg-sky-600',
															day.isSelected && !day.isToday && 'bg-gray-900',
															'ml-auto',
														)}
													>
														{dayDate.getDate()}
													</time>
													<span className="sr-only">
														{day.events.length} events
													</span>
													{day.events.length > 0 && (
														<span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
															{day.events.map((event) => (
																<span
																	key={event.id}
																	className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
																/>
															))}
														</span>
													)}
												</Link>
											);
										})}
									</div>
								</div>
							</div>
							{selectedDate && selectedDate?.events.length > 0 && (
								<div className="py-10 px-4 sm:px-6 lg:hidden">
									<ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
										{selectedDate.events.map((event) => (
											<li
												key={event.id}
												className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
											>
												<div className="flex-auto">
													<p className="font-semibold text-gray-900">
														{event.title}
													</p>
													<time
														dateTime={event.startDateLocalized}
														className="mt-2 flex items-center text-gray-700"
													>
														<ClockIcon
															className="mr-2 h-5 w-5 text-gray-400"
															aria-hidden="true"
														/>
														{DateTime.fromISO(
															event.startDateLocalized,
														).toLocaleString({
															hour: 'numeric',
															minute: '2-digit',
															timeZoneName: 'short',
														})}
													</time>
												</div>
												<a
													href="#"
													className="ml-6 flex-none self-center rounded-md border border-gray-300 bg-white py-2 px-3 font-semibold text-gray-700 opacity-0 shadow-sm hover:bg-gray-50 focus:opacity-100 group-hover:opacity-100"
												>
													Edit<span className="sr-only">, {event.title}</span>
												</a>
											</li>
										))}
									</ol>
								</div>
							)}
						</>
					) : (
						<>
							<div className="w-full max-w-7xl mx-auto px-6 py-6">
								<h2 className="text-lg font-semibold text-gray-900">
									{DateTime.fromISO(settings.weekStart).toLocaleString({
										month: 'short',
										day: 'numeric',
									})}{' '}
									-{' '}
									{DateTime.fromISO(settings.weekEnd).toLocaleString({
										month: 'short',
										day: 'numeric',
									})}
								</h2>
								<div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
									<div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
										<div className="flex items-center text-gray-900">
											<div className="flex-auto font-semibold">
												{calDate.toLocaleString({
													month: 'long',
													year: 'numeric',
												})}
											</div>
										</div>
										<div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
											<div>S</div>
											<div>M</div>
											<div>T</div>
											<div>W</div>
											<div>T</div>
											<div>F</div>
											<div>S</div>
										</div>
										<div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
											{dates.map((day, dayIdx) => {
												const dayDate = new Date(day.date);

												return (
													<Link
														to={getCalendarUrl({
															view: 'week',
															day: dayDate.getDate(),
															month: dayDate.getMonth() + 1,
														})}
														key={day.date}
														type="button"
														className={classNames(
															'py-1.5 hover:bg-gray-100 focus:z-10',
															day.isCurrentWeek
																? 'bg-orange-100'
																: day.isCurrentMonth
																? 'bg-white'
																: 'bg-gray-50',
															day.events.length
																? 'font-bold'
																: day.isToday && 'font-semibold',
															day.isCurrentMonth &&
																!day.isToday &&
																'text-gray-900',
															!day.isCurrentMonth &&
																!day.isToday &&
																'text-gray-400',
															day.isToday && 'text-sky-600',
															dayIdx === 0 && 'rounded-tl-lg',
															dayIdx === 6 && 'rounded-tr-lg',
															dayIdx === dates.length - 7 && 'rounded-bl-lg',
															dayIdx === dates.length - 1 && 'rounded-br-lg',
														)}
													>
														<time
															dateTime={day.date}
															className={classNames(
																'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
																// day.isSelected && day.isToday && 'bg-sky-600',
																// day.isSelected && !day.isToday && 'bg-gray-900',
															)}
														>
															{dayDate.getDate()}
														</time>
													</Link>
												);
											})}
										</div>
									</div>
									<ol className="mt-4 divide-y divide-white text-sm leading-6 lg:col-span-7 xl:col-span-8">
										{weeklyEvents.map((event) => {
											return (
												<DateDetails
													as="li"
													event={event}
													key={`${event.id}${event.startDateLocalized}`}
													className={
														event.isCurrent
															? 'bg-white px-3 -mx-3 rounded outline outline-blue-500 my-6'
															: 'my-3'
													}
												/>
											);
										})}
									</ol>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
}
