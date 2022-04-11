import { Link } from 'remix';
import * as Svgs from '~/svg';
import LazyIcon from '~/svg/lazy';

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
				<LazyIcon className="homepageblock-hero-svg" filename={Hero} />
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
