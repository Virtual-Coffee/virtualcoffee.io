type TextContainerProps = {
	children?: React.ReactNode;
	background: 'white' | 'light';
	showBackToTopLink: boolean;
};

// <TextContainer >dffs</TextContainer>

export default function TextContainer({
	children,
	background,
	showBackToTopLink,
}: TextContainerProps) {
	return (
		<div className={`bg-${background} py-5`}>
			<div className="container prose">
				{children}

				{showBackToTopLink && (
					<p className="text-right">
						<a href="#top">Back to Top</a>
					</p>
				)}
			</div>
		</div>
	);
}

const defaultProps: TextContainerProps = {
	background: 'white',
	showBackToTopLink: true,
};

TextContainer.defaultProps = defaultProps;
