export type NextSearchParams = Promise<{
	[key: string]: string | string[] | undefined;
}>;

export type NextParams<
	ParamsKeys extends string = never,
	IsOptional extends boolean = false,
	IsCatchall extends boolean = false,
> = ParamsKeys extends never
	? never
	: IsOptional extends true
		? Promise<{
				[key in ParamsKeys]?: IsCatchall extends true ? string[] : string;
			}>
		: Promise<{
				[key in ParamsKeys]: IsCatchall extends true ? string[] : string;
			}>;

export type NextPageProps<
	ParamsKeys extends string = never,
	IsOptional extends boolean = false,
	IsCatchall extends boolean = false,
> = {
	params: NextParams<ParamsKeys, IsOptional, IsCatchall>;
	searchParams: NextSearchParams;
};
