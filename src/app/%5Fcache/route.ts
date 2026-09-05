import { type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const tagParam = searchParams.get('tag');
	const pathParam = searchParams.get('path');
	const pathTypeParam = searchParams.get('pathType');

	// Handle tag-based revalidation if provided
	if (tagParam) {
		// Next 16 requires a cache profile. `{ expire: 0 }` keeps the previous
		// behaviour: the next request waits for fresh data instead of serving
		// stale content, which matters because we redirect to `path` below.
		revalidateTag(tagParam, { expire: 0 });
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
