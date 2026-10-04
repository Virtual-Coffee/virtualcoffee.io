type TextContainerProps = {
	children?: React.ReactNode;
	background?: 'white' | 'light';
	showBackToTopLink?: boolean;
};

export default function TextContainer({
	children,
	background = 'white',
	showBackToTopLink = true,
}: TextContainerProps) {
	return (
		<div className={`bg-${background} py-3`}>
			<div className="container prose">
				{children}

				{showBackToTopLink && (
					<p className="text-end">
						<a href="#top">Back to Top</a>
					</p>
				)}
			</div>
		</div>
	);
}
