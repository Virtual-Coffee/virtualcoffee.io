import { Authenticator, AuthorizationError, Strategy } from 'remix-auth';
import { sessionStorage } from '~/auth/session.server';
import { FormStrategy } from 'remix-auth-form';
import Api from '~/api/cms.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage, {
	// throwOnError: true,
});

// Tell the Authenticator to use the form strategy
authenticator.use(
	new FormStrategy(async ({ form }) => {
		const api = new Api();

		let email = form.get('email');
		let password = form.get('password');

		// try {
		let user = await api.login(email, password);
		// the type of this user must match the type you pass to the Authenticator
		// the strategy will automatically inherit the type if you instantiate
		// directly inside the `use` method
		console.log({ user });
		return user;
		// } catch (error) {
		// 	throw new AuthorizationError(error.message, error.data?.errors);
		// }
	}),
	// each strategy has a name and can be changed to use another one
	// same strategy multiple times, especially useful for the OAuth2 strategy.
	'user-pass',
);

authenticator.use(
	new FormStrategy(async ({ form }) => {
		const api = new Api();

		const values = {
			email: form.get('email'),
			password: form.get('password'),
			userYourName: form.get('userYourName'),
			userPronouns: form.get('userPronouns'),
			userGithubusername: form.get('userGithubusername'),
			userHowDidYouHearAboutUs: form.get('userHowDidYouHearAboutUs'),
			userWhereAreYouInYourCodingJourney: form.get(
				'userWhereAreYouInYourCodingJourney',
			),
			userCodeInterests: form.get('userCodeInterests'),
			userHopingVirtualCoffee: form.get('userHopingVirtualCoffee'),
		};

		// console.log({ values });

		let user = await api.register(values);
		// the type of this user must match the type you pass to the Authenticator
		// the strategy will automatically inherit the type if you instantiate
		// directly inside the `use` method
		console.log({ user });
		return user;
	}),
	// each strategy has a name and can be changed to use another one
	// same strategy multiple times, especially useful for the OAuth2 strategy.
	'user-register',
);
