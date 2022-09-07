export class CmsError extends Error {
	data: any;
	constructor(message: string, data?: any) {
		super(message);
		this.data = data;
	}
}

export type CmsErrors = Error | InstanceType<typeof CmsError>;
