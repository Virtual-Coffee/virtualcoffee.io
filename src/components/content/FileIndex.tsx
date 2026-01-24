import PostList, {
	formatFileListItemsForPostList,
} from '@/components/PostList';

import { loadMdxDirectory } from '@/util/loadMdx.server';

type FileIndexProps = {
	subDirectory?: string;
	depth?: number;
};

export default async function FileIndex({
	subDirectory,
	depth,
}: FileIndexProps) {
	const allFiles = await loadMdxDirectory({
		baseDirectory: 'content' + (subDirectory ? `/${subDirectory}` : ''),
	});

	return <PostList items={formatFileListItemsForPostList(allFiles, depth)} />;
}
