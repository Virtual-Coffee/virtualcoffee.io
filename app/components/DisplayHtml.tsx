interface DisplayHtmlProps {
	html:
		| {
				sanitizedHtml: string;
		  }
		| string;
	[k: string]: any;
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
				__html: typeof html === 'string' ? html : html.sanitizedHtml || '',
			}}
			{...props}
		/>
	);
}
