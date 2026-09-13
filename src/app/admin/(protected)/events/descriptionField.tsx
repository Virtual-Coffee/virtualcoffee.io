'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { TextAreaField } from './fields';

const MarkdownEditor = dynamic(() => import('./markdownEditor'), {
	ssr: false,
	loading: () => (
		<textarea className="form-control form-control-sm" rows={5} disabled />
	),
});

/**
 * A Markdown description, edited as rich text (docs/adr/0014). The form still
 * holds a Markdown string, so nothing downstream changes. When the editor's
 * parser rejects what the calendar holds, the plain textarea takes over with
 * the value untouched.
 */
export function DescriptionField({
	id,
	label,
	help,
	value,
	onChange,
	disabled,
}: {
	id: string;
	label: string;
	help?: string;
	value: string;
	onChange: (value: string) => void;
	disabled: boolean;
}) {
	const [fallback, setFallback] = useState(false);

	if (fallback) {
		return (
			<TextAreaField
				id={id}
				label={label}
				value={value}
				onChange={onChange}
				help="The editor could not read this description; edit it as text."
			/>
		);
	}

	return (
		<div className="mb-3">
			<div className="form-label small fw-semibold" id={`${id}-label`}>
				{label}
			</div>
			<div aria-labelledby={`${id}-label`}>
				<MarkdownEditor
					value={value}
					onChange={onChange}
					onError={() => setFallback(true)}
					disabled={disabled}
				/>
			</div>
			{help && <div className="form-text">{help}</div>}
		</div>
	);
}
