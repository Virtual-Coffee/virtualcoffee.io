export interface Room {
	ZoomMeetingId: number;
	SlackChannelId: string;
	ZoomMeetingInviteUrl: string;
	MessageSessionStarted: string;
	MessageSessionEnded: string;
	ButtonJoin: string;
	ButtonStartNew: string;
	NoticeTitle: string;
	NoticeBody: string;
	NoticeConfirm: string;
	NoticeCancel: string;
	ContextBody?: string;
	record_id: string;
}
