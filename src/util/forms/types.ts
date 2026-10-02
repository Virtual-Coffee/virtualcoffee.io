export type FormState = null | {
	is_error: boolean;
	message?: string;
	/** Field name -> first error, so inputs can be marked individually. */
	fieldErrors?: Record<string, string>;
	/**
	 * A fresh spam-guard token to render in place of the one the page issued.
	 * The form stays mounted across an error, so without this the hidden
	 * timestamp would keep ageing from the first render.
	 */
	spamToken?: string;
};

export type Action = (
	state: FormState,
	formData: FormData,
) => Promise<FormState>;
