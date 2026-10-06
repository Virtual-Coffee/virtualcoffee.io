import { SimpleMdxPage, simpleMdxMetadata } from '@/util/simpleMdxPage.server';

export const dynamic = 'force-static';

export const generateMetadata = () => simpleMdxMetadata('code-of-conduct');

export default function Page() {
	return <SimpleMdxPage slug="code-of-conduct" />;
}
