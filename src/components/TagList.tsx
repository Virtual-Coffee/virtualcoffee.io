import TagBadge from './TagBadge';

interface TagListProps {
	tags: string[];
	variant?: 'default' | 'filter';
	size?: 'sm' | 'md';
	maxTags?: number;
	className?: string;
	onTagClick?: (tag: string) => void;
}

export default function TagList({
	tags,
	variant = 'default',
	size = 'sm',
	maxTags,
	className = '',
	onTagClick,
}: TagListProps) {
	if (!tags || tags.length === 0) {
		return null;
	}

	const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
	const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

	return (
		<div className={`tag-list ${className}`}>
			{displayTags.map((tag) => (
				<TagBadge
					key={tag}
					tag={tag}
					variant={variant}
					size={size}
					onClick={onTagClick ? () => onTagClick(tag) : undefined}
				/>
			))}
			{remainingCount > 0 && (
				<TagBadge
					tag={`+${remainingCount} more`}
					variant={variant}
					size={size}
					disabled
				/>
			)}
		</div>
	);
}