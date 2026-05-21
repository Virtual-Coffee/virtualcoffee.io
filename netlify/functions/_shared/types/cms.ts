export interface CalendarsResponse {
	solspace_calendar: {
		calendars: Array<{ handle: string }>;
	};
}

export interface CalendarEvent {
	id: string;
	title: string;
	startDateLocalized: string;
	endDateLocalized: string;
	eventCalendarDescription: string;
	eventJoinLink?: string;
	eventZoomHostCode?: string;
	eventSlackAnnouncementsChannelId?: string;
}

export interface EventsResponse {
	solspace_calendar: {
		events: CalendarEvent[];
	};
}
