import { createMetaData } from '~/util/createMetaData.server';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import NewsletterSubscribe from '~/components/NewslettterSubscribe';
import PostList from '~/components/PostList';
import getNewsletters from '~/data/newsletters';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter',
		description: 'Sign up for the Virtual Coffee Newsletter.',
	},
	hero: {
		Hero: 'UndrawArrived',
	},
};

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export async function loader() {
	const { title, description } = handle.meta;
	const issues = await getNewsletters();
	return json({
		issues,
		meta: createMetaData({ title, description, Hero: handle.hero.Hero }),
	});
}

export default function Index() {
	const { issues } = useLoaderData();

	return (
		<>
			<p className="lead">
				Keep up to date with all things Virtual Coffee with our monthly
				Newsletter!
			</p>
			<p>
				Since January 2021, our monthly newsletter includes upcoming Virtual
				Coffee events, interesting things our members are doing, job postings
				we've seen, and lots more. Sign up below to join in the fun!
			</p>

			<hr />

			<div className="row">
				<div className="col-sm">
					<h2>Recent Issues:</h2>
					<PostList items={issues} />
					{/* {% displayPostList collections.newsletters | reverse %} */}
				</div>
				<div className="col-sm">
					<NewsletterSubscribe header="Subscribe" />
				</div>
			</div>
		</>
	);
}
