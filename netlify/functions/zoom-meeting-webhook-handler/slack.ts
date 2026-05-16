import { postMessage, updateMessage } from '../_shared/slack';
import type { Room } from '../_shared/types/room';

interface ZoomWebhookRequest {
	event: string;
	payload: {
		object: {
			participant: {
				user_name: string;
			};
		};
	};
}

// timestamp: if we have a timestamp, that means we've ended the meeting and are trying to update the message
// otherwise, post a new message

export async function updateMeetingStatus(room: Room, timestamp?: string) {
	const message = {
		channel: room.SlackChannelId,
		text: timestamp ? room.MessageSessionEnded : room.MessageSessionStarted,
		unfurl_links: false,
		unfurl_media: false,
		blocks: [
			{
				type: 'section' as const,
				text: {
					type: 'mrkdwn' as const,
					text: timestamp
						? room.MessageSessionEnded
						: room.MessageSessionStarted,
				},
				accessory: {
					type: 'button' as const,
					text: {
						type: 'plain_text' as const,
						text: timestamp ? room.ButtonStartNew : room.ButtonJoin,
						emoji: true,
					},
					value: 'join_meeting',
					url: room.ZoomMeetingInviteUrl,
					action_id: 'button-action',
					style: 'primary' as const,
					confirm: {
						title: {
							type: 'plain_text' as const,
							text: room.NoticeTitle,
						},
						text: {
							type: 'mrkdwn' as const,
							text: room.NoticeBody,
						},
						confirm: {
							type: 'plain_text' as const,
							text: room.NoticeConfirm,
						},
						deny: {
							type: 'plain_text' as const,
							text: room.NoticeCancel,
						},
					},
				},
			},
			...(room.ContextBody
				? [
						{
							type: 'context' as const,
							elements: [
								{
									type: 'mrkdwn' as const,
									text: room.ContextBody,
								},
							],
						},
					]
				: []),
		],
	};

	// These calls never use background mode, so the result is always a Slack API response
	const result = timestamp
		? await updateMessage({ ...message, ts: timestamp })
		: await postMessage(message);

	const slackResult = result as { ts?: string };

	console.log(
		`Successfully send message ${slackResult.ts} in conversation ${room.SlackChannelId}`,
	);

	return slackResult;
}

export async function updateMeetingAttendance(
	room: Room,
	thread_ts: string,
	zoomRequest: ZoomWebhookRequest,
) {
	const username = zoomRequest.payload.object.participant.user_name;
	const result = await postMessage({
		thread_ts,
		text:
			zoomRequest.event === 'meeting.participant_joined'
				? `${username} has joined!`
				: `${username} has left. We'll miss you!`,
		channel: room.SlackChannelId,
	});

	const slackResult = result as { ts?: string };

	console.log(
		`Successfully send message ${slackResult.ts} in conversation ${room.SlackChannelId}`,
	);

	return slackResult;
}
