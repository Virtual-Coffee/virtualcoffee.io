'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MdxFile } from '@/util/loadMdx.server';

type Props = {
	resources: MdxFile[];
};

export default function ResourceIndex({ resources }: Props) {
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// Collect all unique tags
	const allTags = Array.from(
		new Set(resources.flatMap((r) => r.meta?.tags ?? [])),
	).sort();

	// Filter logic
	const filteredResources = selectedTag
		? resources.filter((r) => r.meta?.tags?.includes(selectedTag))
		: resources;

	return (
		<div className="container py-6">
			{/* Tag filter */}
			{allTags.length > 0 && (
				<div className="mb-6 flex flex-wrap gap-2">
					<button
						onClick={() => setSelectedTag(null)}
						className={`btn btn-sm ${
							selectedTag === null ? 'btn-primary' : 'btn-outline'
						}`}
					>
						All
					</button>

					{allTags.map((tag) => (
						<button
							key={tag}
							onClick={() => setSelectedTag(tag)}
							aria-pressed={selectedTag === tag}
							className={`btn btn-sm ${
								selectedTag === tag ? 'btn-primary' : 'btn-outline'
							}`}
						>
							{tag}
						</button>
					))}
				</div>
			)}

			{/* Resource list */}
			{filteredResources.length === 0 ? (
				<p>No resources found for this tag.</p>
			) : (
				<ul className="grid gap-4">
					{filteredResources.map((file) => (
						<li key={file.slug}>
							<Link
								href={`/${file.slug.replace('content/', '')}`}
								className="text-lg font-semibold underline"
							>
								{file.meta.title}
							</Link>

							{file.meta.description && (
								<p className="text-muted">{file.meta.description}</p>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
