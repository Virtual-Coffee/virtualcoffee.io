import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData, Outlet } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

import SectionHeader from '~/components/app/SectionHeader';
import { Button } from '~/components/app/Button';
import { useEffect } from 'react';

export { metaFromData as meta } from '~/util/remixHelpers';

export const loader = async ({ request }: LoaderArgs) => {
	const auth = await authenticate(request);

	if (!auth) {
		console.log('NOT AUTHENTICATED');
		throw new Error('Not authenticated');
	}

	let api = new CmsActions();
	await api.authenticate(request);

	const posts = await api.getNovemberChallengeEntries({
		authorId: auth.user.id,
	});

	const totalWordCount = posts.reduce((acc, post) => {
		return acc + post.wordCount;
	}, 0);

	return json({
		meta: {
			title: 'Monthly Challenges',
		},
		posts,
		totalWordCount,
	});
};

export default function Page() {
	const { posts, totalWordCount } = useLoaderData<typeof loader>();
	useEffect(() => {
		console.log(posts);
	}, [posts]);

	return (
		<div className="mt-8">
			<SectionHeader
				title="Current Articles for Nov, 2022"
				subtitle={
					<>
						Total word count:{' '}
						<strong className="font-medium text-black">
							{totalWordCount.toLocaleString()}
						</strong>
					</>
				}
				actions={
					<Button as={Link} to="/membership/monthly-challenges/november/new">
						New Post
					</Button>
				}
			/>

			<div className="mt-8 lg:flex lg:h-full lg:flex-col">
				<div className="overflow-hidden bg-white shadow sm:rounded-md">
					<ul className="divide-y divide-gray-200">
						{posts.map((post) => (
							<li key={post.id}>
								<Link to={`${post.id}`} className="block hover:bg-gray-50">
									<div className="flex items-center px-4 py-4 sm:px-6">
										<div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
											<div className="truncate">
												<p className="truncate font-medium text-indigo-600 text-sm">
													{post.title}
												</p>
												<div className="mt-2 text-sm text-gray-500">
													{post.topics}
												</div>
											</div>
											<div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
												<div className="text-right">
													Word count:{' '}
													<strong className="font-medium text-black">
														{post.wordCount.toLocaleString()}
													</strong>
												</div>
												<div className="flex justify-end items-center text-sm text-gray-500">
													<CalendarIcon
														className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
														aria-hidden="true"
													/>
													<p>
														Posted on{' '}
														<time dateTime={post.date}>{post.date}</time>
													</p>
												</div>
											</div>
										</div>
										<div className="ml-5 flex-shrink-0">
											<ChevronRightIcon
												className="h-5 w-5 text-gray-400"
												aria-hidden="true"
											/>
										</div>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
			<Outlet />
		</div>
	);
}
