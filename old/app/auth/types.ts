export enum MessageCode {
	'LoginEmailPrefill' = 'LoginEmailPrefill',
	'RegisterSlackUserFound' = 'RegisterSlackUserFound',
	'message' = 'message',
}

export type SlackUser = {
	userSlackId?: string;
	email: string;
	userYourName?: string;
	userPronouns?: string;
};

export type LoginEmailPrefillData = { email: string };

export type RegisterSlackUserData = { slackUser: SlackUser };

export type SessionFlash = {
	message: string;
} & (
	| {
			messageCode: MessageCode.LoginEmailPrefill;
			data: LoginEmailPrefillData;
	  }
	| {
			messageCode: MessageCode.RegisterSlackUserFound;
			data: RegisterSlackUserData;
	  }
	| {
			messageCode: MessageCode.message;
			data?: Record<string, any>;
	  }
);
