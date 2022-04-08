import { Link } from 'remix';

export default function HomePageBlock({
	id,
	title,
	subtitle,
	Hero,
	linkTo,
	children,
	footer,
}) {
	const titleInner = linkTo ? <Link to={linkTo}>{title}</Link> : title;

	return (
		<>
			<div className="homepageblock-hero" {...(id ? { id } : {})}>
				{Hero && <Hero ariaHidden />}
			</div>

			<h3 className="text-secondary homepageblock-title">{titleInner}</h3>
			<div className="homepageblock-body">
				{subtitle && <p className="lead">{subtitle}</p>}
				{children}
				{footer && linkTo && (
					<p className="homepageblock-body-foot text-muted font-italic">
						<Link to={linkTo}>{footer}</Link>
					</p>
				)}
			</div>
		</>
	);
}
