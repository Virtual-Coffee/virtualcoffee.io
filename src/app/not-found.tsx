import BrokenLinkReport from '@/components/BrokenLinkReport';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import PostList from '@/components/PostList';
import { homePageLinks } from '@/util/homePageLinks';

export default function NotFound() {
	return (
		<DefaultLayout
			Hero="Undraw404"
			heroHeader="Page Not Found"
			heroSubheader="We weren't able to find that content."
			simple
		>
			<p className="lead">
				Perhaps we can interest you some of the other awesome things going on
				here at Virtual Coffee:
			</p>

			<PostList
				items={[
					{
						href: '/events',
						title: 'Community Events',
						description: 'See our upcoming events!',
					},
					{
						title: 'Member Resources',
						description: 'A collection of resources for Virtual Coffee members',
						href: '/resources',
					},
					{
						title: 'Virtual Coffee Podcast',
						description: 'Conversations with members of the community',
						href: '/podcast',
					},
					{
						title: 'Virtual Coffee Newsletter',
						description: 'Sign up for the Virtual Coffee Newsletter',
						href: '/newsletter',
					},
					...homePageLinks,
				]}
			/>

			<hr />

			<p className="lead">
				If you want to let us know about this broken link, <BrokenLinkReport />.
			</p>
		</DefaultLayout>
	);
}
