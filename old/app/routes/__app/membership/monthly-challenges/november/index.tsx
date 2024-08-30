import {
	PlusIcon,
	CalendarIcon,
	ChevronRightIcon,
} from '@heroicons/react/20/solid';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

import SectionHeader from '~/components/app/SectionHeader';
import { Button } from '~/components/app/Button';

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

	if (posts.length === 0) {
		return (
			<div className="my-8 mx-auto bg-white max-w-md rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
				<DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />

				<h3 className="mt-2 text-sm font-medium text-gray-900">
					No posts yet!
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					Get started by creating a new post.
				</p>
				<div className="mt-6">
					<Button size="lg" as={Link} to="new">
						<PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
						New Post
					</Button>
				</div>
			</div>
		);
	}

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
					<Button as={Link} to="new">
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
		</div>
	);
}
