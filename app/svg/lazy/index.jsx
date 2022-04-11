const svgs = {
	UndrawCelebration: {
		aspectRatio: '949.8 / 661.52',
	},

	UndrawWalkInTheCity: {
		aspectRatio: '955 / 680.5',
	},

	UndrawConferenceCall: {
		aspectRatio: '817.21528 / 523.62072',
	},

	UndrawFolder: {
		aspectRatio: '929.54484 / 793.07015',
	},

	UndrawArrived: {
		aspectRatio: '1034 / 823.8434',
	},

	UndrawGoodTeam: {
		aspectRatio: '1115.91385 / 832.5636',
	},
};

export default function LazyIcon({ filename, className }) {
	const { aspectRatio } = svgs[filename];

	return (
		<div
			style={{
				aspectRatio,
			}}
			className={className}
		>
			<img
				style={{ aspectRatio }}
				src={`/assets/svg/${filename}.svg`}
				loading="lazy"
			/>
		</div>
	);
}
