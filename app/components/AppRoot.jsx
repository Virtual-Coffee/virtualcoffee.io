import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
	CalendarIcon,
	ChartBarIcon,
	FolderIcon,
	HomeIcon,
	InboxIcon,
	MenuIcon,
	UsersIcon,
	XIcon,
	UserCircleIcon,
} from '@heroicons/react/outline';
import { Link } from '@remix-run/react';
import VirtualCoffeeFullBanner from '~/svg/VirtualCoffeeFullBanner';

const navigation = [
	{ name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
	{ name: 'Team', href: '#', icon: UsersIcon, current: false },
	{ name: 'Projects', href: '#', icon: FolderIcon, current: false },
	{ name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
	{ name: 'Documents', href: '#', icon: InboxIcon, current: false },
	{ name: 'Reports', href: '#', icon: ChartBarIcon, current: false },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const User = ({ user }) => {
	return (
		<div className="flex-shrink-0 flex border-t border-gray-200 p-4  w-full items-center gap-3">
			<Link
				to="/membership/profile"
				className="flex-1 group flex items-center gap-3"
			>
				<div>
					<UserCircleIcon className="w-9 h-9 text-gray-700 group-hover:text-gray-900" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
						{user.userYourName || user.email}
					</p>
					<p className="text-xs font-medium text-sky-600 group-hover:text-sky-900">
						View profile
					</p>
				</div>
			</Link>
			<div>
				<Link
					to="/auth/logout"
					className="text-xs text-sky-600 hover:text-sky-900"
				>
					Sign Out
				</Link>
			</div>
		</div>
	);
};

export default function AppRoot({ children, user }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<>
			<div>
				<Transition.Root show={sidebarOpen} as={Fragment}>
					<Dialog
						as="div"
						className="relative z-40 md:hidden"
						onClose={setSidebarOpen}
					>
						<Transition.Child
							as={Fragment}
							enter="transition-opacity ease-linear duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="transition-opacity ease-linear duration-300"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
						</Transition.Child>

						<div className="fixed inset-0 flex z-40">
							<Transition.Child
								as={Fragment}
								enter="transition ease-in-out duration-300 transform"
								enterFrom="-translate-x-full"
								enterTo="translate-x-0"
								leave="transition ease-in-out duration-300 transform"
								leaveFrom="translate-x-0"
								leaveTo="-translate-x-full"
							>
								<Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
									<Transition.Child
										as={Fragment}
										enter="ease-in-out duration-300"
										enterFrom="opacity-0"
										enterTo="opacity-100"
										leave="ease-in-out duration-300"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<div className="absolute top-0 right-0 -mr-12 pt-2">
											<button
												type="button"
												className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
												onClick={() => setSidebarOpen(false)}
											>
												<span className="sr-only">Close sidebar</span>
												<XIcon
													className="h-6 w-6 text-white"
													aria-hidden="true"
												/>
											</button>
										</div>
									</Transition.Child>
									<div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
										<div className="flex-shrink-0 flex items-center px-4">
											<VirtualCoffeeFullBanner
												title="Virtual Coffee"
												className="h-8 w-auto"
											/>
										</div>
										<nav className="mt-5 px-2 space-y-1">
											{navigation.map((item) => (
												<a
													key={item.name}
													href={item.href}
													className={classNames(
														item.current
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
														'group flex items-center px-2 py-2 text-base font-medium rounded-md',
													)}
												>
													<item.icon
														className={classNames(
															item.current
																? 'text-gray-500'
																: 'text-gray-400 group-hover:text-gray-500',
															'mr-4 flex-shrink-0 h-6 w-6',
														)}
														aria-hidden="true"
													/>
													{item.name}
												</a>
											))}
										</nav>
									</div>
									<User user={user} />
								</Dialog.Panel>
							</Transition.Child>
							<div className="flex-shrink-0 w-14">
								{/* Force sidebar to shrink to fit close icon */}
							</div>
						</div>
					</Dialog>
				</Transition.Root>

				{/* Static sidebar for desktop */}
				<div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
						<div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
							<div className="flex items-center flex-shrink-0 px-4">
								<VirtualCoffeeFullBanner
									title="Virtual Coffee"
									className="h-8 w-auto"
								/>
							</div>
							<nav className="mt-5 flex-1 px-2 bg-white space-y-1">
								{navigation.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className={classNames(
											item.current
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
											'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
										)}
									>
										<item.icon
											className={classNames(
												item.current
													? 'text-gray-500'
													: 'text-gray-400 group-hover:text-gray-500',
												'mr-3 flex-shrink-0 h-6 w-6',
											)}
											aria-hidden="true"
										/>
										{item.name}
									</a>
								))}
							</nav>
						</div>
						<User user={user} />
					</div>
				</div>
				<div className="md:pl-64 flex flex-col flex-1">
					<div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
						<button
							type="button"
							className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
							onClick={() => setSidebarOpen(true)}
						>
							<span className="sr-only">Open sidebar</span>
							<MenuIcon className="h-6 w-6" aria-hidden="true" />
						</button>
					</div>
					<main className="flex-1">{children}</main>
				</div>
			</div>
		</>
	);
}
