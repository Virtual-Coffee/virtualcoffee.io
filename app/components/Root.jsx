import Nav from '~/components/Nav';

export default function Root({ children }) {
	return (
		<>
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
		</>
	);
}
