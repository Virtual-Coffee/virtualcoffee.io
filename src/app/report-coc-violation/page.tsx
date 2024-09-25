import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import { Form } from './form';

export const meta = createMetaData({
	title: 'Report a Code of Conduct Violation',
	description: `If you have experienced or witnessed violations to Virtual Coffee's Code of Conduct, we need to know about it.`,
});

export default function CocForm() {
	return (
		<DefaultLayout
			simple
			heroHeader="Report a Code of Conduct Violation"
			heroSubheader={
				<>
					<p>{meta.description}</p>
					<p>
						Your privacy and security will be respected, but if you wish to
						remain anonymous, we will still accept and review your report.
					</p>
				</>
			}
		>
			<Form />
		</DefaultLayout>
	);
}
