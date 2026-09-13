import Link from 'next/link';

export function EventsBreadcrumb({ current }: { current: string }) {
	return (
		<nav aria-label="Breadcrumb">
			<ol className="breadcrumb mb-0 small">
				<li className="breadcrumb-item">
					<Link href="/admin/events">Events</Link>
				</li>
				<li className="breadcrumb-item active" aria-current="page">
					{current}
				</li>
			</ol>
		</nav>
	);
}
