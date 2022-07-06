import { authenticator } from '~/auth/auth.server';

export let loader = async ({ request }) => {
	await authenticator.logout(request, { redirectTo: '/auth/login' });
};
