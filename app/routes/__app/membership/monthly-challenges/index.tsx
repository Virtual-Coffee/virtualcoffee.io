import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

import DisplayHtml from '~/components/DisplayHtml';

export { metaFromData as meta } from '~/util/remixHelpers';

export const loader = async ({ request }: LoaderArgs) => {
	await authenticate(request);

	let api = new CmsActions();
	await api.authenticate(request);

	const challenges = await api.getMonthlyChallenges();

	return json({
		meta: {
			title: 'Monthly Challenges',
		},
		challenges,
	});
};

export default function Page() {
	const { challenges } = useLoaderData<typeof loader>();

	console.log(challenges);

	return (
		<>
			<div className="lg:h-0 lg:min-h-[768px]">
				<div className="lg:flex lg:h-full lg:flex-col">
					<div className="flex flex-col gap-8 my-8">
						{challenges.map((challenge) => (
							<Link
								to={`/membership/monthly-challenges/${challenge.month}`}
								className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow shadow-sky-300"
								key={challenge.id}
							>
								<div className="px-4 py-5 sm:px-6 text-sky-600 text-lg font-medium leading-6">
									{challenge.title}
								</div>
								<DisplayHtml
									className="px-4 py-5 sm:p-6"
									html={challenge.shortDescription}
								/>
							</Link>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
