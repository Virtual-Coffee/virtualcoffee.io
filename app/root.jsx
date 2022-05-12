import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import styles from './styles/main.css';
import { qualifiedUrl } from '~/util/url.server';
import { removeTrailingSlash } from '~/util/http';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import PostList from '~/components/PostList';
import Root from '~/components/Root';
import { homePageLinks } from '~/routes/index';
import { useLocation } from 'react-router-dom';
import { createMetaData } from '~/util/createMetaData.server';

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

export async function loader({ request }) {
	removeTrailingSlash(request);

	const fullUrl = qualifiedUrl();

	return json({
		fullUrl,
		meta: createMetaData({
			title: 'Virtual Coffee IO',
			description: 'An intimate community for all devs, optimized for you',
		}),
	});
}

export function links() {
	return [
		{ rel: 'stylesheet', href: styles },
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/assets/favicon/apple-touch-icon.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			href: '/assets/favicon/favicon-32x32.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			href: '/assets/favicon/favicon-16x16.png',
		},
		{
			rel: 'manifest',
			href: '/assets/favicon/site.webmanifest',
		},
		{
			rel: 'mask-icon',
			href: '/assets/favicon/safari-pinned-tab.svg',
			color: '#d9376e',
		},
		{
			rel: 'shortcut icon',
			href: '/assets/favicon/favicon.ico',
		},
	];
}

export function meta({ data: { meta } = {} } = {}) {
	const title = 'Virtual Coffee IO';
	const description = 'An intimate community for all devs, optimized for you';
	return {
		...meta,
		charSet: 'utf-8',
		viewport: 'width=device-width,initial-scale=1',
		'og:type': 'website',
		'twitter:card': 'summary_large_image',
		'msapplication-TileColor': '#d9376e',
		'msapplication-config': '/assets/favicon/browserconfig.xml',
		'theme-color': '#ffffff',
	};
}

export default function App() {
	return (
		<Root>
			<Outlet />
		</Root>
	);
}
