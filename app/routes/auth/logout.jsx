import { authenticator } from '~/auth/auth.server';

export let action = async ({ request }) => {
	await authenticator.logout(request, { redirectTo: '/auth/login' });
};

export default function Page() {
	return null;
}
