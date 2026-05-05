import { requireEnv } from './_shared/env';

export default async (req: Request) => {
	const code = new URL(req.url).searchParams.get('code');

	if (!code) {
		return new Response('Invalid request.', { status: 401 });
	}

	console.log(`Joining slack: ${code}`);

	return Response.redirect(requireEnv('SLACK_JOIN_LINK'), 302);
};
