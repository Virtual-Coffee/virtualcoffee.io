import { Link } from '@remix-run/react';
import UndrawIllustration from '~/components/UndrawIllustration';
import type { UndrawIllustrationName } from '~/components/UndrawIllustration';

type HomePageBlockProps = {
	id?: string;
	title: string;
	subtitle: string;
	Hero: UndrawIllustrationName;
	linkTo?: string;
	footer?: string;
	children: React.ReactNode;
	wide?: boolean;
};

/**
 * A reactive block of content on the Home page.
 */
export default function HomePageBlock({
	id,
	title,
	subtitle,
	Hero,
	linkTo,
	children,
	footer,
	wide,
}: HomePageBlockProps) {
	const titleInner = linkTo ? <Link to={linkTo}>{title}</Link> : title;

	return (
		<>
			<div className="homepageblock-hero" {...(id ? { id } : {})}>
				<UndrawIllustration
					className="homepageblock-hero-svg"
					filename={Hero}
				/>
			</div>

			{!wide && (
				<h3 className="text-secondary homepageblock-title">{titleInner}</h3>
			)}
			<div className="homepageblock-body">
				{wide && (
					<h3 className="text-secondary homepageblock-title">{titleInner}</h3>
				)}
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
