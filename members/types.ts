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
			title: string;
	  };

export type MemberObject = {
	github: string;
	name?: string;
	mainUrl?: Website;
	bio?: string;
	accounts?: Account[];
};
