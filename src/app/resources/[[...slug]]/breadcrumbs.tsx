import Link from 'next/link';

export function Breadcrumbs() {
	return (
		<div className="py-4">
			<div className="container">
				<nav aria-label="breadcrumb">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">
							<Link href="/resources">Resources</Link>
						</li>
					</ol>
				</nav>
			</div>
		</div>
	);
}
