import { ElementType } from 'react';

interface DisplayHtmlProps {
	html:
		| {
				renderHtml: string;
		  }
		| string;
	as: ElementType;
	[k: string]: unknown;
}

export default function DisplayHtml({
	html,
	as = 'div',
	...props
}: DisplayHtmlProps) {
	const Component = as;
	return (
		<Component
			dangerouslySetInnerHTML={{
				__html: typeof html === 'string' ? html : html.renderHtml || '',
			}}
			{...props}
		/>
	);
}
