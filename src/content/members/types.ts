import type teamsData from './teams';

export type Website = `http${'s' | ''}://${string}`;

export type Account =
	| {
			type:
				| 'linkedin'
				| 'dev'
				| 'codenewbie'
				| 'twitter'
				| 'twitch'
				| 'polywork'
				| 'medium'
				| 'hashnode'
				| 'github';
			username: string;
	  }
	| {
			type: 'youtube';
			channelId: string;
	  }
	| {
			type: 'youtube';
			customUrl: Website;
	  }
	| {
			type: 'website';
			url: Website;
			title?: string;
	  }
	| {
			type: 'mastodon';
			title?: string;
			url: Website;
	  };

export type Badge =
	| 'Hacktoberfest2022'
	| 'Hacktoberfest2023'
	| 'Hacktoberfest2024';
export type Flare = {
	profileMask?: string;
};

export type Location = {
	latitude: number;
	longitude: number;
	title?: string;
};

export type MemberObject = {
	github: string;
	name?: string;
	mainUrl?: Website;
	bio?: string;
	accounts?: Account[];
	badges?: Badge[];
	flare?: Flare;
	location?: Location;
};

export type GithubSearchUser = {
	login: string;
	id: string | number;
	url: Website;
	avatarUrl: string;
	name?: string;
	company?: string;
	location?: string;
	isHireable?: boolean;
	bio?: string;
	bioHTML?: string;
	twitterUsername?: string;
	websiteUrl?: Website;
};

export type GithubSearchUserLookup = Record<string, GithubSearchUser>;

export type TeamName = keyof typeof teamsData;
export type TeamsDict = Record<string, TeamName[]>;

export type Icons =
	| 'GitHub'
	| 'LinkedIn'
	| 'Dev'
	| 'Codenewbie'
	| 'Twitter'
	| 'Twitch'
	| 'Polywork'
	| 'Medium'
	| 'HashNode'
	| 'YouTube'
	| 'Website'
	| 'Mastodon';

export type IconProps = {
	ariaHidden?: boolean;
	title?: string;
};
export type FixedUpUserAccount = Account & {
	Icon: Icons;
	url: Website;
	title: string;
};

export type FixedUpUser = Omit<MemberObject, 'accounts'> & {
	avatarUrl?: GithubSearchUser['avatarUrl'];
	teams?: TeamName[];
	accounts: FixedUpUserAccount[];
};

export type MemberList = (FixedUpUser | null)[];

export type MappableMember = FixedUpUser & { location: Location };
