'use client';

import dynamic from 'next/dynamic';
import { PostListItem } from '../PostList';

const TagFilteredResourceList = dynamic(
	() => import('@/components/TagFilteredResourceList'),
	{ ssr: false }
);

interface TagFilteredResourceListWrapperProps {
	allTags: string[];
	processedPostListItems: PostListItem[] | null;
}

export default function TagFilteredResourceListWrapper({
	allTags,
	processedPostListItems,
}: TagFilteredResourceListWrapperProps) {
	return (
		<TagFilteredResourceList
			allTags={allTags}
			processedPostListItems={processedPostListItems}
		/>
	);
}
