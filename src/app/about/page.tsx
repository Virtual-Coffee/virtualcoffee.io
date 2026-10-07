import { SimpleMdxPage, simpleMdxMetadata } from '@/util/simpleMdxPage.server';

export const dynamic = 'force-static';

export const generateMetadata = () => simpleMdxMetadata('about');

export default function Page() {
	return <SimpleMdxPage slug="about" />;
}
