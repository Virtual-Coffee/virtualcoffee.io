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

export const meta = () => {
	return handle.meta;
};

export async function loader() {
	const issues = await getNewsletters();
	return json({ issues });
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
