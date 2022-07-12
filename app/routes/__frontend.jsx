import styles from '../styles/main.css';
import { Outlet } from '@remix-run/react';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import PostList from '~/components/PostList';
import Root from '~/components/layouts/Root';
import { homePageLinks } from '~/routes/__frontend/index';

export function links() {
	return [{ rel: 'stylesheet', href: styles }];
}

export function CatchBoundary(props) {
	const location = useLocation();

	return (
		<Root>
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
							to: '/about/',
							title: 'Community Events',
							description: 'See our upcoming events!',
						},
						{
							title: 'Member Resources',
							description:
								'A collection of resources for Virtual Coffee members',
							to: '/resources',
						},
						{
							title: 'Virtual Coffee Podcast',
							description: 'Conversations with members of the community',
							to: '/podcast',
						},
						{
							title: 'Virtual Coffee Newsletter',
							description: 'Sign up for the Virtual Coffee Newsletter',
							to: '/newsletter',
						},
						...homePageLinks,
					]}
				/>

				<hr />

				<p className="lead">
					If you want to let us know about this broken link,{' '}
					<a
						href={`https://github.com/Virtual-Coffee/virtualcoffee.io/issues/new?title=Broken+link:+${location.pathname}&body=This+link+resulted+in+a+404:+https://virtualcoffee.io${location.pathname}&labels=bug`}
					>
						please open an issue on GitHub
					</a>
					.
				</p>
			</DefaultLayout>
		</Root>
	);
}

export default function App() {
	return (
		<Root>
			<Outlet />
		</Root>
	);
}
