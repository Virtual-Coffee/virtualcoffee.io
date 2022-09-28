export type CalendarVisibility = 'membersOnly' | 'pendingMembers' | 'public';
export type EventVisibility = CalendarVisibility | 'default';

export type Event = {
	id: string;
	uid: string;
	title: string;
	rrule?: string;
	calendarId: string | number;
	startDateLocalized: string;
	endDateLocalized: string;
	eventVisibility?: EventVisibility;
	eventJoinLink?: string;
	eventLink?: string;
	eventCalendarDescription?: string;
	eventIcsLink?: string;
};

export type SafeEvent = Omit<Event, 'eventJoinLink'>;

export type Calendar = {
	id: number;
	title: string;
	calendarVisibility: CalendarVisibility;
};

export type User = {
	jwt: string;
	jwtExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
	schema: 'Pending Members Schema' | 'Full Members Schema';
	user: {
		id: string | number;
		email: string;
		enabled: boolean;
		status: string;
		userYourName?: string;
	};
};

export type EventLoaderData = {
	message?: string;
	event?: SafeEvent;
	type: 'error' | 'timing' | 'permissions' | 'noLink' | 'success';
};
