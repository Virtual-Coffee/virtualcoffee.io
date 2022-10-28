import type { HtmlMetaDescriptor } from '@remix-run/node';

export interface NewsletterMetaData extends HtmlMetaDescriptor {
	/** Title of the newsletter's issue */
	title: string;
	/** Description of the newsletter's issue. */
	description: string;
}

/**
 * Metadata for a newsletter issue.
 */
export interface NewsletterHandle {
	meta: NewsletterMetaData;
	/** Date of the newsletter's issue */
	date: string;
	/** Title on the list of newsletters
	 * @see [VC newsletter page](https://virtualcoffee.io/newsletter)
	 */
	listTitle?: string;
}
