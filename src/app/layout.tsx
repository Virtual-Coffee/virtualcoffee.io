import Nav from '@/components/Nav';
import Link from 'next/link';
import '@/styles/main.scss';

import type { Metadata } from 'next';
import Image from 'next/image';

import { buildUrls } from '@/util/url.server';

export const metadata: Metadata = {
	title:
		'Virtual Coffee IO - An intimate tech community for all, optimized for you',
	description: `Virtual Coffee is an intimate tech community where friendships are formed and support is given to people at all stages of their journey. Join our laid-back conversations and online events to connect with like-minded individuals who share your passion for technology.`,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<html lang="en" className="h-full bg-gray-100">
				<head>
					{/* @ts-ignore */}
					{buildUrls.NETLIFY && buildUrls.CONTEXT === 'production' && (
						<script
							defer
							data-domain="virtualcoffee.io"
							data-api="/plausible/api/event"
							src="/plausible/js/script.js"
						></script>
					)}
				</head>
				<body className={`h-full `}>
					<a
						href="#maincontent"
						className={`text-assistive display-at-top-on-focus`}
					>
						Skip to main content.
					</a>
					<Nav />
					{children}

					<footer className="py-5 text-center text-muted bg-white border-top border-secondary main-footer">
						<ul>
							<li>&copy; {new Date().getFullYear()} Virtual Coffee</li>
							<li>
								<a href="mailto:hello@virtualcoffee.io">Contact Us</a>
							</li>
							<li>
								<Link href="/code-of-conduct">Code of Conduct</Link>
							</li>
							{/* <li>
      <a
        href="https://github.com/Virtual-Coffee/virtualcoffee.io/blob/main/{{ page.inputPath }}"
        >Edit this page</a
      >
    </li> */}
							<li>
								<Link href="/uses">Uses</Link>
							</li>
							<li className="py-0">
								<a
									href="https://www.netlify.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Image
										width="114"
										height="50"
										src="https://www.netlify.com/img/global/badges/netlify-dark.svg"
										alt="Deploys by Netlify"
									/>
								</a>
							</li>
						</ul>
					</footer>
				</body>
			</html>
		</>
	);
}
