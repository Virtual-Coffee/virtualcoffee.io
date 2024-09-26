import PostList, {
	formatFileListItemsForPostList,
} from '@/components/PostList';

import { loadMdxDirectory } from '@/util/loadMdx.server';

type FileIndexProps = {
	subDirectory?: string;
	depth?: number;
};

export default function FileIndex({ subDirectory, depth }: FileIndexProps) {
	const allFiles = loadMdxDirectory({
		baseDirectory: 'content' + (subDirectory ? `/${subDirectory}` : ''),
	});

	// const result = subDirectory ? findBase(allFiles, subDirectory) : allFiles;
	const result = allFiles;
	return <PostList items={formatFileListItemsForPostList(result, depth)} />;
}
