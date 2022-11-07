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

export enum UserSchema {
	FullMembersSchema = 'Full Members Schema',
	PendingMembersSchema = 'Pending Members Schema',
}

export type UserProfile = {
	id: string | number;
	email: string;
	enabled: boolean;
	status: string;
	trashed: boolean;
	userPronouns?: string;
	userTwitterUserName?: string;
	userGithubusername?: string;
	userAllowSocialSharing?: boolean;
	userPreferredTimeZone?: string;
	userYourName?: string;
};

export type User = {
	jwt: string;
	jwtExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
	schema: UserSchema;
	user: Pick<
		UserProfile,
		'id' | 'email' | 'enabled' | 'status' | 'userYourName'
	>;
};

export type EventLoaderData = {
	message?: string;
	event?: SafeEvent;
	type: 'error' | 'timing' | 'permissions' | 'noLink' | 'success';
};

export type NovemberChallengeEntryAuthor = Pick<
	User['user'],
	'id' | 'userYourName'
>;

export type NovemberChallengeEntry = {
	title: string;
	shortDescriptionMarkDown: string;
	id: number | string;
	urlValue: string;
	wordCount: number;
	topics: string;
	date: string;
	author: NovemberChallengeEntryAuthor;
};
