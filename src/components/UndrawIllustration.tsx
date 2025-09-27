const svgAspectRatios = {
	Undraw404: '860.13137 / 571.14799',

	UndrawAddUser: '691.33587 / 489.02997',

	UndrawAppreciation: '924 / 458.12749',

	UndrawArrived: '1034 / 823.8434',

	UndrawAudioPlayer: '757.964 / 743.732',

	UndrawCelebration: '949.8 / 661.52',

	UndrawCodeThinking: '1082.43901 / 449.88124',

	UndrawConferenceCall: '817.21528 / 523.62072',

	UndrawDreamer: '1188 / 795.33',

	UndrawFeedback: '1048 / 786.03763',

	UndrawFixingBugs: '690 / 448.7592',

	UndrawFolder: '929.54484 / 793.07015',

	UndrawGoodTeam: '1115.91385 / 832.5636',

	UndrawGroupHangout: '1031.79 / 709.36133',

	UndrawGrowthAnalytics: '1028 / 739',

	UndrawHackerMindset: '921.71991 / 653.40956',

	UndrawHappyFeeling: '743.40429 / 753.13373',

	UndrawHappyWomenDay: '1106 / 783.42853',

	UndrawJoin: '808 / 607.0183',

	UndrawLovingStory: '1126.86988 / 713',

	UndrawOnlineVideo: '885.6192 / 579.76496',

	UndrawPresentation: '928.76643 / 735.63906',

	UndrawProductTeardown: '929.68 / 818.68',

	UndrawProudCoder: '887.87284 / 569.68008',

	UndrawQuestions: '844.67538 / 595.26155',

	UndrawQuickChat: '863.91732 / 364.20537',

	UndrawSuperThankYou: '915.35 / 848.79',

	UndrawTeamSpirit: '1137.68 / 859.71',

	UndrawToDoList: '848.67538 / 469.44265',

	UndrawVersionControl: '1038.23 / 693.31',

	UndrawWalkInTheCity: '955 / 680.5',

	UndrawPowerful: '928.52587 / 635.2126',

	UndrawConversation: '842 / 842.79999',

	UndrawShowingSupport: '660.67004 / 513.66796',

	NetworkingGuide: '790/705',
};

/**
 * The name of an Undraw illustration.
 */
export type UndrawIllustrationName = keyof typeof svgAspectRatios;

type UndrawIllustrationProps = {
	/** Filename of svg file found in [`public/assets/svg`](https://github.com/Virtual-Coffee/virtualcoffee.io/tree/main/public/assets/svg) */
	filename: UndrawIllustrationName;
	style?: React.CSSProperties;
} & React.ImgHTMLAttributes<HTMLImageElement>;

export default function UndrawIllustration({
	filename,
	style = {},
	...props
}: UndrawIllustrationProps): React.ReactElement<'img'> {
	const aspectRatio = svgAspectRatios[filename];

	return (
		<img
			style={{ aspectRatio, ...style }}
			src={`/assets/svg/${filename}.svg`}
			loading="lazy"
			aria-hidden="true"
			alt=""
			{...props}
		/>
	);
}
