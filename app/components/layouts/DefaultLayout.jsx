import { useMemo } from 'react';
import { useMatches } from 'remix';
import * as Svgs from '~/svg';

function useHeroData({ Hero, heroHeader, heroSubheader }) {
	const matches = useMatches().reverse();
	return useMemo(() => {
		let firstHero = matches.find((match) => !!match.handle?.hero)?.handle.hero;
		if (!firstHero) {
			firstHero = matches.find((match) => !!match.data?.hero)?.data.hero;
		}

		let firstMeta = matches.find((match) => !!match.handle?.meta)?.handle.meta;
		if (!firstMeta) {
			firstMeta = matches.find((match) => !!match.data?.meta)?.data.meta;
		}

		const returnObject = {
			Hero: Hero || firstHero?.Hero,
		};

		// allow for setting to ''
		if (typeof heroHeader !== 'undefined') {
			returnObject.heroHeader = heroHeader;
		}
		// allow for setting to ''
		else if (firstHero && typeof firstHero.heroHeader !== 'undefined') {
			returnObject.heroHeader = firstHero.heroHeader;
		} else {
			returnObject.heroHeader = firstMeta?.title;
		}

		// allow for setting to ''
		if (typeof heroSubheader !== 'undefined') {
			returnObject.heroSubheader = heroSubheader;
		}
		// allow for setting to ''
		else if (firstHero && typeof firstHero.heroSubheader !== 'undefined') {
			returnObject.heroSubheader = firstHero.heroSubheader;
		} else {
			returnObject.heroSubheader = firstMeta?.description;
		}

		return returnObject;
	}, [Hero, heroHeader, heroSubheader, matches]);
}

export function HeroHead({ Hero, heroHeader, heroSubheader, simple }) {
	const heroData = useHeroData({ Hero, heroHeader, heroSubheader });

	const HeroComponent =
		typeof heroData.Hero === 'string' ? Svgs[heroData.Hero] : heroData.Hero;

	if (HeroComponent && heroData.heroHeader) {
		return (
			<div className="py-4">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-sm-4">
							<HeroComponent ariaHidden />
						</div>
						<div className="col-sm-8">
							<h1 className="display-4">{heroData.heroHeader}</h1>
							{heroData.heroSubheader && (
								<div className="lead">{heroData.heroSubheader}</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
	if (heroData.heroHeader) {
		return (
			<div className={`container pt-5${simple ? ' container-simple' : ''}`}>
				<h1 className="display-4">{heroData.heroHeader}</h1>
				{heroData.heroSubheader && (
					<p className="lead">{heroData.heroSubheader}</p>
				)}
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
}) {
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
