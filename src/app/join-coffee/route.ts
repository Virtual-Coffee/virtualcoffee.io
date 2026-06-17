import { type NextRequest } from 'next/server';
import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const code = searchParams.get('code');
	const day = searchParams.get('day');

	if (!code || !(day === 'tuesday' || day === 'thursday')) {
		return new Response('Invalid request.', { status: 401 });
	}

	console.log(`Joining ${day}: ${code}`);

	const target =
		day === 'tuesday' ? env.ZOOM_TUESDAYS : env.ZOOM_THURSDAYS;

	if (!target) {
		return new Response('Invalid request.', { status: 401 });
	}

	return Response.redirect(target, 302);
}
