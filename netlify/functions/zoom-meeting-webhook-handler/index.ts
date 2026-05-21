import Airtable from 'airtable';
import { updateMeetingStatus, updateMeetingAttendance } from './slack';
import { findRoomInstance } from './airtable';
import { requireEnv } from '../_shared/env';
import { verifyZoomSignature, hmacSha256Hex } from '../_shared/verify';
import type { Room } from '../_shared/types/room';

import rooms from '../../../data/rooms.json' with { type: 'json' };
const typedRooms = rooms as Room[];

const EVENT_MEETING_STARTED = 'meeting.started';
const EVENT_MEETING_ENDED = 'meeting.ended';
const EVENT_PARTICIPANT_JOINED = 'meeting.participant_joined';
const EVENT_PARTICIPANT_LEFT = 'meeting.participant_left';

const ZOOM_SECRET =
	process.env.TEST_ZOOM_WEBHOOK_SECRET_TOKEN ||
	requireEnv('ZOOM_WEBHOOK_SECRET_TOKEN');

const ZOOM_AUTH =
	process.env.TEST_ZOOM_WEBHOOK_AUTH || requireEnv('ZOOM_WEBHOOK_AUTH');

export default async (req: Request) => {
	try {
		const rawBody = await req.text();

		/**
		 * verification. zoom will either send an authorization header or a x-zm-signature header
		 */

		const authorized =
			verifyZoomSignature(rawBody, req.headers, ZOOM_SECRET) ||
			req.headers.get('authorization') === ZOOM_AUTH;

		if (!authorized) {
			console.log('Unauthorized');
			return new Response('', { status: 401 });
		}

		const request = JSON.parse(rawBody);

		if (request.event == 'endpoint.url_validation') {
			const hashForValidate = hmacSha256Hex(
				ZOOM_SECRET,
				request.payload.plainToken,
			);
			return new Response(
				JSON.stringify({
					plainToken: request.payload.plainToken,
					encryptedToken: hashForValidate,
				}),
				{ status: 200 },
			);
		}

		// check our meeting ID. The meeting ID never changes, but the uuid is different for each instance

		const room = typedRooms.find(
			(room) => room.ZoomMeetingId === request.payload.object.id,
		);
		console.log('incoming request');
		console.log('request payload');
		console.log(request.payload.object);
		console.log('request event');
		console.log(request.event);

		if (room) {
			const base = new Airtable().base(requireEnv('AIRTABLE_COWORKING_BASE'));

			switch (request.event) {
				case EVENT_PARTICIPANT_JOINED:
				case EVENT_PARTICIPANT_LEFT: {
					const roomInstance = await findRoomInstance(
						room,
						base,
						request.payload.object.uuid,
					);

					if (roomInstance) {
						// create room event record
						console.log(`found room instance ${roomInstance.getId()}`);

						await updateMeetingAttendance(
							room,
							roomInstance.get('slack_thread_timestamp') as string,
							request,
						);
					}

					break;
				}

				case EVENT_MEETING_STARTED: {
					// post message to Slack and get result
					console.log('posting update');
					const result = await updateMeetingStatus(room);
					console.log('done posting update');

					// create new room instance
					const created = await base('room_instances').create({
						instance_uuid: request.payload.object.uuid,
						slack_thread_timestamp: result.ts,
						start_time: request.payload.object.start_time,
						room_record: [room.record_id],
					});

					if (!created) {
						throw new Error('no record created');
					}

					console.log(`room_event created: ${created.getId()}`);

					break;
				}

				case EVENT_MEETING_ENDED: {
					const roomInstanceEnd = await findRoomInstance(
						room,
						base,
						request.payload.object.uuid,
					);

					if (roomInstanceEnd) {
						await updateMeetingStatus(
							room,
							roomInstanceEnd.get('slack_thread_timestamp') as string,
						);

						// update room instance
						const updated = await base('room_instances').update(
							roomInstanceEnd.getId(),
							{
								end_time: request.payload.object.end_time,
							},
						);

						if (!updated) {
							throw new Error('no record updated');
						}

						console.log(`room_event updated: ${updated.getId()}`);
					}

					break;
				}

				default:
					break;
			}
		} else {
			console.log('meeting ID is not co-working meeting');
		}

		return new Response('', { status: 200 });
	} catch (error) {
		// output to netlify function log
		console.log(error);
		return new Response(
			JSON.stringify({
				msg: error instanceof Error ? error.message : String(error),
			}),
			{ status: 500 },
		);
	}
};
