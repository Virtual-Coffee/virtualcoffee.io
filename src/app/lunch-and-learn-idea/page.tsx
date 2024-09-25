import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';
import { Form } from './form';

export const meta = createMetaData({
	title: 'Lunch & Learn Talk Submission Form',
	description: `We can't wait to hear your talk!`,
	Hero: 'UndrawPresentation',
});

export default function CocForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawPresentation"
			heroHeader="Virtual Coffee: Lunch &amp; Learns"
			heroSubheader="Submit your idea for a VC Lunch &amp; Learn!"
		>
			<div className="lead mb-5">
				<p>
					Lunch &amp; Learn talks are usually hour-long sessions on one topic.
					It can be a traditional conference-style talk, panel discussion,
					question and answer, or a combination.
				</p>
			</div>
			<Form />
		</DefaultLayout>
	);
}
