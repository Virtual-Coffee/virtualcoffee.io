import { requireEnv } from './_shared/env';

export default async (req: Request) => {
	const url = new URL(req.url);
	const day = url.searchParams.get('day');

	if (!(day === 'tuesday' || day === 'thursday')) {
		return new Response('Invalid request.', { status: 401 });
	}

	console.log(`Joining ${day}`);

	const target =
		day === 'tuesday'
			? requireEnv('ZOOM_TUESDAYS')
			: requireEnv('ZOOM_THURSDAYS');

	return Response.redirect(target, 302);
};
