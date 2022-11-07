export enum MessageCode {
	'LoginEmailPrefill' = 'LoginEmailPrefill',
	'message' = 'message',
}

export type LoginEmailPrefillData = { email: string };

export type SessionFlash = {
	message: string;
} & (
	| {
			messageCode: MessageCode.LoginEmailPrefill;
			data: LoginEmailPrefillData;
	  }
	| {
			messageCode: MessageCode.message;
			data?: Record<string, any>;
	  }
);
