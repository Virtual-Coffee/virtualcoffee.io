export type FormState = null | {
	is_error: boolean;
	message?: string;
	error?: unknown;
};

export type Action = (
	state: FormState,
	formData: FormData,
) => Promise<FormState>;
