import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	json,
} from 'remix';
import Nav from './components/Nav';
import styles from './styles/main.css';
import { useLocation } from 'react-router-dom';
import { qualifiedUrl } from '~/util/url.server';

export async function loader() {
	const fullUrl = qualifiedUrl();

	return json({ fullUrl });
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

export function meta({ data: { fullUrl } }) {
	const title = 'Virtual Coffee IO';
	const description = 'An intimate community for all devs, optimized for you';
	return {
		title: title,
		description: description,
		charSet: 'utf-8',
		viewport: 'width=device-width,initial-scale=1',
		'og:type': 'website',
		'og:image': `${fullUrl}/assets/images/vc-social-card.png`,
		'twitter:card': 'summary_large_image',
		'twitter:image': `${fullUrl}/assets/images/vc-social-card.png`,
		'msapplication-TileColor': '#d9376e',
		'msapplication-config': '/assets/favicon/browserconfig.xml',
		'theme-color': '#ffffff',
	};
}

export default function App() {
	const location = useLocation();

	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body className={location.pathname === '/' ? 'vc-home' : ''}>
				<a
					href="#maincontent"
					className={`text-assistive display-at-top-on-focus`}
				>
					Skip to main content.
				</a>
				<Nav />
				<Outlet />

				<footer
					className="
				py-5
				text-center text-muted
				bg-white
				border-top border-secondary
				main-footer
			"
				>
					<ul>
						<li>&copy; {new Date().getFullYear()} Virtual Coffee</li>
						<li>
							<a href="mailto:hello@virtualcoffee.io">Contact Us</a>
						</li>
						{/* <li>
					<a
						href="https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/{{ page.inputPath }}"
						>Edit this page</a
					>
				</li> */}
						<li>
							<a href="/uses">Uses</a>
						</li>
						<li className="py-0">
							<a
								href="https://www.netlify.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src="https://www.netlify.com/img/global/badges/netlify-dark.svg"
									alt="Deploys by Netlify"
									loading="lazy"
								/>
							</a>
						</li>
					</ul>
				</footer>

				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
