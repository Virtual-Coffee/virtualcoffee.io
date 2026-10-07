import type { Route } from 'next';
import Link from 'next/link';
import UndrawIllustration from '@/components/UndrawIllustration';
import type { UndrawIllustrationName } from '@/components/UndrawIllustration';

type HomePageBlockProps<L extends string> = {
	id?: string;
	title: string;
	subtitle: string;
	Hero: UndrawIllustrationName;
	linkTo?: Route<L>;
	footer?: string;
	children: React.ReactNode;
	wide?: boolean;
};

/**
 * A reactive block of content on the Home page.
 */
export default function HomePageBlock<L extends string>({
	id,
	title,
	subtitle,
	Hero,
	linkTo,
	children,
	footer,
	wide,
}: HomePageBlockProps<L>) {
	const titleInner = linkTo ? <Link href={linkTo}>{title}</Link> : title;

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
					<p className="homepageblock-body-foot text-muted fst-italic">
						<Link href={linkTo}>{footer}</Link>
					</p>
				)}
			</div>
		</>
	);
}
