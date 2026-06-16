import { type NextRequest } from 'next/server';
import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get('code');

	if (!code) {
		return new Response('Invalid request.', { status: 401 });
	}

	console.log(`Joining slack: ${code}`);

	const target = env.SLACK_JOIN_LINK;
	if (!target) {
		return new Response('Invalid request.', { status: 401 });
	}

	return Response.redirect(target, 302);
}
