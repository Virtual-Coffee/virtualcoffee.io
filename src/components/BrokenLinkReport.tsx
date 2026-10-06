'use client';

import { usePathname } from 'next/navigation';

export default function BrokenLinkReport() {
	const pathname = usePathname();
	return (
		<a
			href={`https://github.com/Virtual-Coffee/virtualcoffee.io/issues/new?title=Broken+link:+${pathname}&body=This+link+resulted+in+a+404:+https://virtualcoffee.io${pathname}&labels=bug`}
		>
			please open an issue on GitHub
		</a>
	);
}
