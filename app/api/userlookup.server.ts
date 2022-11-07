import Airtable from 'airtable';

var base = new Airtable({ apiKey: process.env.POWERFUL_AIRTABLE_KEY }).base(
	'appGHm8ztVWug6UxH',
);

type Profile = {
	Name?: string;
	Email?: string;
	GitHubUsername?: string;
	TwitterUsername?: string;
	Pronouns?: string;
	AllowSocialSharing?: boolean;
	PreferredTimeZone?: string;
};

export const findMemberProfile = async (email: string) => {
	const results = await base<Profile>('member_profiles')
		.select({
			filterByFormula: `FIND("${email}", {Email})`,
			fields: [
				'Name',
				'Email',
				'GitHubUsername',
				'TwitterUsername',
				'Pronouns',
				'AllowSocialSharing',
				'PreferredTimeZone',
			],
		})
		.firstPage();

	// get the latest defined value for each field
	return results.reduce((acc, curr) => {
		return {
			...acc,
			...curr.fields,
		};
	}, {} as Profile);
};

type SignUpFormResponse = {
	email?: string;
	pronouns?: string;
	githubUsername?: string;
	twitterUsername?: string;
	howDidYouHearAboutUs?: string;
	journey?: string;
	codeInterests?: string;
	virtualCoffee?: string;
	approved?: boolean;
};

export const findMemberSignInForm = async (email: string) => {
	const results = await base<SignUpFormResponse>('membership_form')
		.select({
			filterByFormula: `FIND("${email}", {email})`,
			fields: [
				'email',
				'pronouns',
				'githubUsername',
				'twitterUsername',
				'howDidYouHearAboutUs',
				'journey',
				'codeInterests',
				'virtualCoffee',
				'approved',
			],
		})
		.firstPage();

	// get the latest defined value for each field
	return results.reduce((acc, curr) => {
		return {
			...acc,
			...curr.fields,
		};
	}, {} as SignUpFormResponse);
};
