import DefaultLayout from '@/components/layouts/DefaultLayout';
import { createMetaData } from '@/util/createMetaData.server';

export const meta = createMetaData({
	title: 'Report received',
	description:
		"If you have experienced or witnessed violations to Virtual Coffee's Code of Conduct, we need to know about it.",
});

export default function Form() {
	return (
		<DefaultLayout>
			<div className="py-5">
				<div className="container bodycopy">
					<h1>Report Received.</h1>
					<div className="lead mb-5">
						<p>Thank you for letting us know.</p>
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
