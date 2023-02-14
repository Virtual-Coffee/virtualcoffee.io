import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
	CalendarIcon,
	HomeIcon,
	Bars3Icon,
	XMarkIcon,
	UserCircleIcon,
	CodeBracketSquareIcon,
} from '@heroicons/react/24/outline';
import { Link, NavLink } from '@remix-run/react';
import classNames from 'classnames';
import { UserSchema, type User } from '~/api/types';

const navigation = [
	{ name: 'VC Home', to: '/', end: true },
	{ name: 'Dashboard', to: '/membership', icon: HomeIcon, end: true },
	{
		name: 'Events',
		to: '/membership/events',
		icon: CalendarIcon,
		current: false,
	},
	{
		name: 'Monthly Challenges',
		to: '/membership/monthly-challenges',
		icon: CodeBracketSquareIcon,
		current: false,
		hideFromPending: true,
	},
];

const userNavigation = [
	// { name: 'Your Profile', to: `/membership/profile` },
	// { name: 'Settings', to: '#' },
	{ name: 'Sign out', to: `/logout` },
];

export default function AppRoot({
	children,
	user,
	title,
}: {
	children: React.ReactNode;
	user?: User;
	title?: string;
}) {
	return (
		<div className="min-h-full">
			<Disclosure as="nav" className="bg-gray-800 relative z-10">
				{({ open }) => (
					<>
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex items-center justify-between h-16">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<img
											className="h-8 w-auto"
											src="/assets/images/virtual-coffee-mug-white.png"
											alt="Virtual Coffee"
										/>
									</div>
									<div className="hidden md:block">
										<div className="ml-10 flex items-baseline space-x-4">
											{navigation.map((item) => {
												if (
													item.hideFromPending &&
													user?.schema === UserSchema.PendingMembersSchema
												) {
													return null;
												}
												return (
													<NavLink
														key={item.name}
														to={item.to}
														end={!!item.end}
														className={({ isActive }) =>
															classNames(
																isActive
																	? 'bg-gray-900 text-white'
																	: 'text-white hover:bg-gray-700 hover:bg-opacity-75',
																'px-3 py-2 rounded-md text-sm font-medium',
															)
														}
													>
														{item.name}
													</NavLink>
												);
											})}
										</div>
									</div>
								</div>
								<div className="hidden md:block">
									<div className="ml-4 flex items-center md:ml-6">
										{/* Profile dropdown */}
										{user && (
											<Menu as="div" className="ml-3 relative">
												<div>
													<Menu.Button className="max-w-xs bg-gray-800 text-gray-400 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
														<span className="sr-only">Open user menu</span>
														<UserCircleIcon
															className="h-8 w-8 rounded-full"
															aria-hidden="true"
														/>
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
													<Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
														<div className="px-4 py-2 text-sm text-gray-700">
															{user.user.userYourName}
														</div>
														<div className="px-4 py-2 text-sm text-gray-700">
															{user.user.email}
														</div>
														{userNavigation.map((item) => (
															<Menu.Item key={item.name}>
																{({ active }) => (
																	<Link
																		to={item.to}
																		className={classNames(
																			active ? 'bg-gray-100' : '',
																			'block px-4 py-2 text-sm text-gray-700',
																		)}
																	>
																		{item.name}
																	</Link>
																)}
															</Menu.Item>
														))}
													</Menu.Items>
												</Transition>
											</Menu>
										)}
									</div>
								</div>
								<div className="-mr-2 flex md:hidden">
									{/* Mobile menu button */}
									<Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
										<span className="sr-only">Open main menu</span>
										{open ? (
											<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
										) : (
											<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
										)}
									</Disclosure.Button>
								</div>
							</div>
						</div>
						{user && (
							<Disclosure.Panel className="md:hidden">
								<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
									{navigation.map((item) => (
										<Disclosure.Button
											key={item.name}
											as={NavLink}
											end={!!item.end}
											to={item.to}
											className={({ isActive }: { isActive: boolean }) =>
												classNames(
													isActive
														? 'bg-gray-900 text-white'
														: 'text-white hover:bg-gray-700 hover:bg-opacity-75',
													'block px-3 py-2 rounded-md text-base font-medium',
												)
											}
										>
											{item.name}
										</Disclosure.Button>
									))}
								</div>
								<div className="pt-4 pb-3 border-t border-gray-900">
									<div className="flex items-center px-5">
										<div className="flex-shrink-0">
											<UserCircleIcon
												className="h-10 w-10"
												aria-hidden="true"
											/>
										</div>
										<div className="ml-3">
											<div className="text-base font-medium text-white">
												{user.user.userYourName}
											</div>
											<div className="text-sm font-medium text-gray-300">
												{user.user.email}
											</div>
										</div>
									</div>
									<div className="mt-3 px-2 space-y-1">
										{userNavigation.map((item) => (
											<Disclosure.Button
												key={item.name}
												as={Link}
												to={item.to}
												className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:bg-opacity-75"
											>
												{item.name}
											</Disclosure.Button>
										))}
									</div>
								</div>
							</Disclosure.Panel>
						)}
					</>
				)}
			</Disclosure>

			{title && (
				<header className="bg-white shadow-sm relative z-0">
					<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
						<h1 className="text-lg leading-6 font-semibold text-gray-900">
							{title}
						</h1>
					</div>
				</header>
			)}
			<main className="relative z-0">
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
			</main>
		</div>
	);
}
