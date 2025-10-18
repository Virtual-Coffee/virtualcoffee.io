import { ReactNode } from 'react';
import type { UndrawIllustrationName } from '@/components/UndrawIllustration';
import UndrawIllustration from '@/components/UndrawIllustration';

export function HeroHead({
	Hero,
	heroHeader,
	heroSubheader,
	simple,
}: Pick<
	DefaultLayoutProps,
	'Hero' | 'heroHeader' | 'heroSubheader' | 'simple'
>) {
	if (Hero && heroHeader) {
		return (
			<div className="py-4">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-4 text-center">
							<UndrawIllustration
								loading="eager"
								style={{ width: '100%', maxWidth: '300px' }}
								filename={Hero}
							/>
						</div>
						<div className="col-md-8">
							<h1 className="display-4 mt-3 mt-md-0">{heroHeader}</h1>
							{heroSubheader && <div className="lead">{heroSubheader}</div>}
						</div>
					</div>
				</div>
			</div>
		);
	}
	if (heroHeader) {
		return (
			<div className={`container pt-5${simple ? ' container-simple' : ''}`}>
				<h1 className="display-4">{heroHeader}</h1>
				{heroSubheader && <div className="lead">{heroSubheader}</div>}
			</div>
		);
	}

	return null;
}

export default function DefaultLayout({
	Hero,
	heroHeader,
	heroSubheader,
	simple = false,
	showHero = true,
	children,
}: DefaultLayoutProps) {
	return (
		<>
			{showHero && (
				<HeroHead
					Hero={Hero}
					heroHeader={heroHeader}
					heroSubheader={heroSubheader}
					simple={simple}
				/>
			)}
			<main
				id="maincontent"
				className={simple ? 'container container-simple prose py-5' : ''}
			>
				{children}
			</main>
		</>
	);
}

type DefaultLayoutProps = {
	/** This is the name of the illustration you want to use. */
	Hero?: UndrawIllustrationName;
	/** The header text for the hero section */
	heroHeader?: ReactNode;
	/** This is the subheader that will be displayed under the heroHeader. */
	heroSubheader?: ReactNode;
	/** If true, the hero will be a simple hero with no background image. */
	simple?: boolean;
	/** This is a boolean that determines whether or not the hero component is shown. */
	showHero?: boolean;
	/** This is the content that will be rendered inside the HeroData component. */
	children?: ReactNode;
};
