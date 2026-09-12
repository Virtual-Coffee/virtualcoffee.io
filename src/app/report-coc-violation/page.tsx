import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import { Form } from './form';
import { issueTimestamp } from '@/util/forms/spamGuard';

/**
 * Dynamic so the spam guard's signed token is generated per request. Statically
 * prerendering this page would bake one token into the cached HTML, and every
 * submission after it expired would be silently rejected.
 */
export const dynamic = 'force-dynamic';

const DESCRIPTION = `If you have experienced or witnessed violations to Virtual Coffee's Code of Conduct, we need to know about it.`;

export async function generateMetadata() {
	return await createMetaData({
		title: 'Report a Code of Conduct Violation',
		description: DESCRIPTION,
	});
}

export default function CocForm() {
	return (
		<DefaultLayout
			simple
			heroHeader="Report a Code of Conduct Violation"
			heroSubheader={
				<>
					<p>{DESCRIPTION}</p>
					<p>
						Your privacy and security will be respected, but if you wish to
						remain anonymous, we will still accept and review your report.
					</p>
				</>
			}
		>
			<Form spamToken={issueTimestamp()} />
		</DefaultLayout>
	);
}
