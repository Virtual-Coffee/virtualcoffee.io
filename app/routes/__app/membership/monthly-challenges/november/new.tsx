import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import {
	ChallengeForm,
	type ActionData,
} from '~/data/app/monthlychallenges/november';

export { metaFromData as meta } from '~/util/remixHelpers';
export { action } from '~/data/app/monthlychallenges/november';

export const loader = async ({ request }: LoaderArgs) => {
	return json({
		meta: {
			title: 'New Challenge',
		},
	});
};

export default function Page() {
	const actionData = useActionData() as unknown as ActionData;
	const initialValues = actionData?.fields;

	return (
		<ChallengeForm
			initialValues={initialValues}
			fieldErrors={actionData?.fieldErrors}
			formError={actionData?.formError}
		/>
	);
}
