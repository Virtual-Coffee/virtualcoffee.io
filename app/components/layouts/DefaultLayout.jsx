import { useMemo } from 'react';
import { json, Outlet, useLoaderData, useMatches } from 'remix';

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

		return {
			heroHeader: heroHeader || firstHero?.heroHeader || firstMeta?.title,

			heroSubheader:
				heroSubheader || firstHero?.heroSubheader || firstMeta?.description,

			Hero: Hero || firstHero?.Hero,
		};
	}, [Hero, heroHeader, heroSubheader, matches]);
}

export default function DefaultLayout({
	Hero,
	heroHeader,
	heroSubheader,
	simple = false,
	children,
}) {
	const heroData = useHeroData({ Hero, heroHeader, heroSubheader });

	const HeroComponent =
		typeof heroData.Hero === 'string' ? Svgs[heroData.Hero] : heroData.Hero;

	return (
		<>
			{HeroComponent && heroData.heroHeader ? (
				<div className="py-4">
					<div className="container">
						<div className="row align-items-center">
							<div className="col-sm-4">
								<HeroComponent ariaHidden />
							</div>
							<div className="col-sm-8">
								<h1 className="display-4">{heroData.heroHeader}</h1>
								{heroData.heroSubheader && (
									<p className="lead">{heroData.heroSubheader}</p>
								)}
							</div>
						</div>
					</div>
				</div>
			) : heroData.heroHeader ? (
				<div className={`container pt-5${simple ? ' container-simple' : ''}`}>
					<h1 className="display-4">{heroData.heroHeader}</h1>
					{heroData.heroSubheader && (
						<p className="lead">{heroData.heroSubheader}</p>
					)}
				</div>
			) : null}
			<main
				id="maincontent"
				className={simple ? 'container container-simple prose py-5' : ''}
			>
				{children}
			</main>
		</>
	);
}
