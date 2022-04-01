import { useState } from 'react';
import { Link } from 'remix';
import VirtualCoffeeFull from '~/svg/VirtualCoffeeFull';

export default function Nav() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="navbar navbar-expand-lg navbar-dark fixed-top w-100">
			<Link className="navbar-brand" to="/" aria-label="Virtual Coffee">
				<VirtualCoffeeFull title="Virtual Coffee" />
			</Link>
			<button
				className="navbar-toggler"
				type="button"
				aria-controls="navbarNav"
				aria-expanded={isOpen ? 'true' : 'false'}
				aria-label="Toggle navigation"
				onClick={() => {
					setIsOpen((isOpen) => !isOpen);
				}}
			>
				<span className="navbar-toggler-icon"></span>
			</button>
			<div
				className={`collapse navbar-collapse justify-content-end mt-2 mt-lg-0${
					isOpen ? ' show' : ''
				}`}
				id="navbarNav"
			>
				<ul className="navbar-nav">
					<li className="nav-item">
						<Link className="nav-link" to="/about">
							About
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/events">
							Events
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/podcast">
							Podcast
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/resources">
							Resources
						</Link>
					</li>
					<li className="nav-item">
						<a className="nav-link" href="https://store.virtualcoffee.io/">
							Store
						</a>
					</li>
				</ul>

				<ul className="navbar-nav">
					<li className="nav-item d-flex justify-content-end">
						<a
							href="https://github.com/Virtual-Coffee"
							aria-label="GitHub"
							className="nav-link d-inline-block px-2"
						>
							<svg
								role="img"
								viewBox="0 0 24 24"
								height="24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>GitHub</title>
								<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
							</svg>
						</a>
						<a
							href="https://twitter.com/VirtualCoffeeIO"
							aria-label="Twitter"
							className="nav-link d-inline-block px-2"
						>
							<svg
								role="img"
								viewBox="0 0 24 24"
								height="24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>Twitter</title>
								<path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
							</svg>
						</a>
						<a
							href="https://youtube.com/c/virtualcoffeeio"
							aria-label="YouTube"
							className="nav-link d-inline-block px-2"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 16 16"
							>
								<title>YouTube</title>
								<path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" />
							</svg>
						</a>
					</li>
				</ul>
			</div>
		</nav>
	);
}
