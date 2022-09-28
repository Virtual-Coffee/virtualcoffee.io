interface DisplayHtmlProps {
	html: {
		[k: string]: string;
	};
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
				__html: html?.sanitizedHtml || html,
			}}
			{...props}
		/>
	);
}
