import { createMetaData } from '@/util/createMetaData.server';
import NewsletterSubscribe from '@/components/NewslettterSubscribe';
import PostList from '@/components/PostList';
import { getNewsletters } from '@/data/newsletters';
import DefaultLayout from '@/components/layouts/DefaultLayout';

const mdata = {
	title: 'Virtual Coffee Newsletter',
	description: 'Sign up for the Virtual Coffee Newsletter.',
	Hero: 'UndrawArrived',
};

export const metadata = createMetaData(mdata);

export default async function Index() {
	const issues = await getNewsletters();

	return (
		<DefaultLayout
			simple={true}
			Hero="UndrawArrived"
			heroHeader={mdata.title}
			heroSubheader={mdata.description}
		>
			<p className="lead">
				Keep up to date with all things Virtual Coffee with our monthly
				Newsletter!
			</p>
			<p>
				Since January 2021, our monthly newsletter includes upcoming Virtual
				Coffee events, interesting things our members are doing, job postings
				we&apos;ve seen, and lots more. Sign up below to join in the fun!
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
		</DefaultLayout>
	);
}
