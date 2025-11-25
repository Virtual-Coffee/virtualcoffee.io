import { type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const tagParam = searchParams.get('tag');
	const pathParam = searchParams.get('path');

	// Handle tag-based revalidation if provided
	if (tagParam) {
		revalidateTag(tagParam);
	}

	// Handle path-based revalidation if provided
	let path = typeof pathParam === 'string' ? pathParam : '/';
	if (!path.startsWith('/')) {
		path = '/' + path;
	}

	if (pathParam) {
		revalidatePath(path);
	}

	redirect(path);
}
