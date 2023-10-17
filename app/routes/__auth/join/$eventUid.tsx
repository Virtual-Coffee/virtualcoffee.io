import { json, redirect } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { CmsActions } from '~/api/cms.server';
import type { Event, EventLoaderData } from '~/api/types';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';

export const loader: LoaderFunction = async ({ request, params }) => {
	let api = new CmsActions();
	let returnJson: EventLoaderData | null = null;

	if (!params.eventUid) {
		returnJson = {
			type: 'error',
			message: 'Event not found. Please check your event link and try again.',
		};
		return json(returnJson);
	}

	try {
		const event: Event = await api.getEventByUid({ uid: params.eventUid });

		const eventCheck = await api.getEventJoinLink(event, request);

		if (eventCheck.type === 'success') {
			return redirect(event.eventJoinLink as string);
		}

		return json(eventCheck);
	} catch (error) {
		if (error instanceof Response) {
			return error;
		}

		console.log(error);
		returnJson = {
			type: 'error',
			message:
				'There was an error loading the event. Please check your event link and try again.',
		};
		return json(returnJson);
	}
};

export default function Screen() {
	const loaderData: EventLoaderData = useLoaderData();
	console.log({ loaderData });
	return (
		<SingleTask>
			<Alert
				type={loaderData.type === 'timing' ? 'info' : 'warning'}
				title="There was an error joining this event:"
				className="-my-8 -mx-4 sm:-mx-10"
			>
				<div>{loaderData.message}</div>
			</Alert>
		</SingleTask>
	);
}
