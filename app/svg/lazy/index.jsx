import React, { Suspense, useMemo, useEffect, useState } from 'react';

const svgs = {
	UndrawCelebration: {
		Icon: React.lazy(() => import(`~/svg/UndrawCelebration`)),
		aspectRatio: '949.8 / 661.52',
	},

	UndrawWalkInTheCity: {
		Icon: React.lazy(() => import(`~/svg/UndrawWalkInTheCity`)),
		aspectRatio: '955 / 680.5',
	},

	UndrawConferenceCall: {
		Icon: React.lazy(() => import(`~/svg/UndrawConferenceCall`)),
		aspectRatio: '817.21528 / 523.62072',
	},

	UndrawFolder: {
		Icon: React.lazy(() => import(`~/svg/UndrawFolder`)),
		aspectRatio: '929.54484 / 793.07015',
	},

	UndrawArrived: {
		Icon: React.lazy(() => import(`~/svg/UndrawArrived`)),
		aspectRatio: '1034 / 823.8434',
	},

	UndrawGoodTeam: {
		Icon: React.lazy(() => import(`~/svg/UndrawGoodTeam`)),
		aspectRatio: '1115.91385 / 832.5636',
	},
};

export default function LazyIcon({ filename, className }) {
	const [isClient, setIsClient] = useState(false);
	const { Icon, aspectRatio } = svgs[filename];
	useEffect(() => {
		if (typeof document !== 'undefined') {
			setIsClient(true);
		}
	}, []);

	return (
		<div
			style={{
				aspectRatio,
			}}
			className={className}
		>
			<img src={`/assets/svg/${filename}.svg`} loading="lazy" />
		</div>
	);
}
