export class CmsError extends Error {
	data: any;
	constructor(message: string, data?: any) {
		super(message);
		this.data = data;
	}
}
