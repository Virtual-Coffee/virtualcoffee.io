import { loadMdxDirectory } from '@/util/loadMdx.server';
import { formatFileListItemsForPostList } from '@/components/PostList';
import { extractAllContentTags } from '@/util/extractContentTags';
import TagFilteredResourceListWrapper from './TagFilteredResourceListWrapper';

type FileIndexProps = {
	subDirectory?: string;
	depth?: number;
};

export default function FileIndex({
	subDirectory,
	depth,
}: FileIndexProps) {
	const allFiles = loadMdxDirectory({
		baseDirectory: 'content' + (subDirectory ? `/${subDirectory}` : ''),
	});

	const processedPostListItems = formatFileListItemsForPostList(allFiles, depth);
	const allTags = extractAllContentTags(allFiles);

	return (
		<TagFilteredResourceListWrapper
			allTags={allTags}
			processedPostListItems={processedPostListItems}
		/>
	);
}
