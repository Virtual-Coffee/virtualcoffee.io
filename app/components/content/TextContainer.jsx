import PropTypes from 'prop-types';

export default function TextContainer({
	children,
	background,
	showBackToTopLink,
}) {
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

TextContainer.defaultProps = {
	background: 'white',
	showBackToTopLink: true,
};

TextContainer.propTypes = {
	background: PropTypes.oneOf(['white', 'light']),
	showBackToTopLink: PropTypes.bool,
};
