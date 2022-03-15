import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'remix';
import Nav from './components/Nav';
import styles from './styles/main.css';
import { useLocation } from 'react-router-dom';

export const links = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export function meta() {
	return { title: 'Virtual Coffee IO' };
}

export default function App() {
	const location = useLocation();

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
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
