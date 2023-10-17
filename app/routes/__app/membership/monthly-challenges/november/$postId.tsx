import type { LoaderArgs } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import {
	ChallengeForm,
	type ActionData,
} from '~/data/app/monthlychallenges/november';

import { json } from '@remix-run/node';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

export { metaFromData as meta } from '~/util/remixHelpers';
export { action } from '~/data/app/monthlychallenges/november';

export const loader = async ({ params, request }: LoaderArgs) => {
	const auth = await authenticate(request);

	if (!auth) {
		throw new Error('Not authenticated');
	}

	let api = new CmsActions();
	await api.authenticate(request);

	const id = params.postId;

	const entry = await api.getNovemberChallengeEntry({ id });

	return json({
		meta: {
			title: 'New Challenge',
		},
		entry,
	});
};

export default function Page() {
	const actionData = useActionData() as unknown as ActionData;
	const { entry } = useLoaderData<typeof loader>() as unknown as {
		entry: ActionData['fields'];
	};
	const initialValues = actionData?.fields
		? {
				...entry,
				...actionData.fields,
		  }
		: entry;

	console.log(initialValues);

	return (
		<ChallengeForm
			initialValues={initialValues}
			fieldErrors={actionData?.fieldErrors}
			formError={actionData?.formError}
		/>
	);
}
