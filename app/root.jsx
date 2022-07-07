import { json } from '@remix-run/node';
import {
	Outlet,
	Links,
	LiveReload,
	Meta,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import { qualifiedUrl } from '~/util/url.server';
import { removeTrailingSlash } from '~/util/http';
import { useLocation } from 'react-router-dom';
import { createMetaData } from '~/util/createMetaData.server';

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
	const location = useLocation();

	return (
		<html lang="en" className="h-full bg-gray-100">
			<head>
				<Meta />
				<Links />
			</head>
			<body className={`h-full ${location.pathname === '/' ? 'vc-home' : ''}`}>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
