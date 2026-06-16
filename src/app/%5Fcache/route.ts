import { type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

// Constant-time string compare to avoid leaking secret length/contents via
// timing. Plain `===` is almost certainly fine for an endpoint behind variable
// network latency, but the cost of doing it right is negligible.
function safeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

function extractProvidedSecret(request: NextRequest): string | null {
	const auth = request.headers.get('authorization');
	if (auth) {
		const match = auth.match(/^Bearer\s+(.+)$/i);
		if (match) return match[1].trim();
	}
	return request.nextUrl.searchParams.get('secret');
}

export async function GET(request: NextRequest) {
	const expected = env.REVALIDATE_SECRET;
	if (!expected) {
		// Fail closed: no secret configured means nobody can revalidate.
		return new Response('Revalidation not configured', { status: 401 });
	}

	const provided = extractProvidedSecret(request);
	if (!provided || !safeEqual(provided, expected)) {
		return new Response('Unauthorized', { status: 401 });
	}

	const searchParams = request.nextUrl.searchParams;
	const tagParam = searchParams.get('tag');
	const pathParam = searchParams.get('path');
	const pathTypeParam = searchParams.get('pathType');

	// Handle tag-based revalidation if provided
	if (tagParam) {
		revalidateTag(tagParam, 'max');
	}

	if (!pathParam) {
		// If no path is provided, redirect to home
		redirect('/');
	}

	// Handle path-based revalidation if provided
	let path = typeof pathParam === 'string' ? pathParam : '/';
	if (!path.startsWith('/')) {
		path = '/' + path;
	}

	if (pathParam) {
		revalidatePath(path, pathTypeParam === 'layout' ? 'layout' : 'page');
	}

	redirect(path);
}
