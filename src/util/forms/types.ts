export type FormState = null | {
	is_error: boolean;
	message?: string;
	/** Field name -> first error, so inputs can be marked individually. */
	fieldErrors?: Record<string, string>;
};

export type Action = (
	state: FormState,
	formData: FormData,
) => Promise<FormState>;
