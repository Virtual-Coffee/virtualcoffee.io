'use client';

import { useState, useMemo, useCallback } from 'react';
import PostList, { PostListItem } from '@/components/PostList';
import TagBadge from '@/components/TagBadge';
import { organizeTagsByCategories, TagGrouping } from '@/util/tagCategories';

interface TagFilteredResourceListProps {
	allTags: string[];
	processedPostListItems: PostListItem[] | null;
}

export default function TagFilteredResourceList({
	allTags,
	processedPostListItems,
}: TagFilteredResourceListProps) {
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

	const tagGrouping = useMemo(() => {
		return organizeTagsByCategories(allTags);
	}, [allTags]);

	const filteredPostListItems = useMemo(() => {
		if (selectedTags.size === 0 || !processedPostListItems) {
			return processedPostListItems;
		}

		const filterPostListItems = (items: PostListItem[]): PostListItem[] => {
			const requiredTags = Array.from(selectedTags);
			return items
				.map((item): PostListItem | null => {
					const itemTags = item.contentTags ?? [];
					const itemMatches = requiredTags.every((tag) => itemTags.includes(tag));

					// Filter children recursively
					const filteredChildren = item.children
						? filterPostListItems(item.children)
						: undefined;

					// Include item if it matches or has matching children
					if (itemMatches || (filteredChildren && filteredChildren.length > 0)) {
						return {
							...item,
							children: filteredChildren,
						};
					}

					return null;
				})
				.filter((item): item is PostListItem => item !== null);
		};

		return filterPostListItems(processedPostListItems);
	}, [selectedTags, processedPostListItems]);

	const handleTagToggle = useCallback((tag: string, selected: boolean) => {
		setSelectedTags((prev) => {
			const newSet = new Set(prev);
			if (selected) {
				newSet.add(tag);
			} else {
				newSet.delete(tag);
			}
			return newSet;
		});
	}, []);

	const handleClearAll = useCallback(() => {
		setSelectedTags(new Set());
	}, []);

	const resourceCount = useMemo(() => {
		const countRecursive = (items: PostListItem[]): number => {
			return items.reduce((count, item) => {
				return count + 1 + (item.children ? countRecursive(item.children) : 0);
			}, 0);
		};
		return filteredPostListItems ? countRecursive(filteredPostListItems) : 0;
	}, [filteredPostListItems]);

	const totalResourceCount = useMemo(() => {
		const countRecursive = (items: PostListItem[]): number => {
			return items.reduce((count, item) => {
				return count + 1 + (item.children ? countRecursive(item.children) : 0);
			}, 0);
		};
		return processedPostListItems ? countRecursive(processedPostListItems) : 0;
	}, [processedPostListItems]);


	return (
		<div className="tag-filtered-resource-list">
			{allTags.length > 0 && (
				<div className="resource-tag-filter-section">
					<div className="resource-tag-filter-header">
						<h4 className="resource-tag-filter-title">Filter by Tags</h4>
						{selectedTags.size > 0 && (
							<button
								type="button"
								className="btn btn-link btn-sm resource-tag-filter-clear"
								onClick={handleClearAll}
							>
								Clear all ({selectedTags.size})
							</button>
						)}
					</div>

					<div className="resource-tag-filter-tags">
						{/* Render categorized tags */}
						{tagGrouping.categories.map((category) => (
							<div key={category.id} className="tag-category-group">
								<div className="tag-category-header">
									<h5 className="tag-category-title" style={{ color: category.color }}>
										{category.name}
									</h5>
									{category.description && (
										<span className="tag-category-description">
											{category.description}
										</span>
									)}
								</div>
								<div className="tag-category-tags">
									{category.tags.map((tag) => (
										<TagBadge
											key={tag}
											tag={tag}
											variant="filter"
											isSelected={selectedTags.has(tag)}
											onClick={handleTagToggle}
										/>
									))}
								</div>
							</div>
						))}

						{/* Render uncategorized tags if any */}
						{tagGrouping.uncategorizedTags.length > 0 && (
							<div className="tag-category-group">
								<div className="tag-category-header">
									<h5 className="tag-category-title">Other</h5>
									<span className="tag-category-description">
										Additional tags
									</span>
								</div>
								<div className="tag-category-tags">
									{tagGrouping.uncategorizedTags.map((tag) => (
										<TagBadge
											key={tag}
											tag={tag}
											variant="filter"
											isSelected={selectedTags.has(tag)}
											onClick={handleTagToggle}
										/>
									))}
								</div>
							</div>
						)}
					</div>

					{selectedTags.size > 0 && (
						<div className="resource-tag-filter-status">
							<span className="text-muted">
								Showing {resourceCount} of {totalResourceCount} resources
								{selectedTags.size > 0 && (
									<>
										{' '}
										matching:{' '}
										{Array.from(selectedTags)
											.map((tag) => `"${tag}"`)
											.join(', ')}
									</>
								)}
							</span>
						</div>
					)}
				</div>
			)}

			{filteredPostListItems && filteredPostListItems.length > 0 ? (
				<PostList items={filteredPostListItems} />
			) : selectedTags.size > 0 ? (
				<div className="resource-tag-filter-empty">
					<p className="text-muted">
						No resources found matching the selected tags. Try selecting different tags or{' '}
						<button
							type="button"
							className="btn btn-link btn-inline"
							onClick={handleClearAll}
						>
							clear all filters
						</button>
						.
					</p>
				</div>
			) : null}
		</div>
	);
}
