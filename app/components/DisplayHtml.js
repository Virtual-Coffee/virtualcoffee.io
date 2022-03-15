export default function DisplayHtml({ html, as: Component = 'div', ...props }) {
	return (
		<Component
			dangerouslySetInnerHTML={{
				__html: html?.sanitizedHtml || html,
			}}
			{...props}
		/>
	);
}
