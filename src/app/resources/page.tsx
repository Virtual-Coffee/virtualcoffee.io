import { ResourcePage, resourceMetadata } from './resourcePage';

export const dynamic = 'force-static';

export const generateMetadata = () => resourceMetadata('');

export default function Page() {
	return <ResourcePage uri="" />;
}
