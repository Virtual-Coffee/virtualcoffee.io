import Image, { type ImageProps } from 'next/image';

/**
 * Aspect ratio of each illustration in `public/assets/svg`, taken from its
 * `viewBox`. `UndrawIllustration` needs concrete dimensions for `next/image`,
 * and reading the files at render time is not an option for a component that
 * ships to the client, so the ratios are recorded here.
 *
 * Regenerate after adding an SVG; an entry missing here falls back to a square,
 * which only reserves space.
 */
const svgAspectRatios = {
	Undraw404: '860.13137 / 571.14799',
	UndrawAddUser: '691.33587 / 489.02997',
	UndrawAgreement: '746 / 721.34323',
	UndrawAppreciation: '924 / 458.12749',
	UndrawArrived: '1034 / 823.8434',
	UndrawAudioPlayer: '757.964 / 743.732',
	UndrawBooks: '713.74209 / 454.87759',
	UndrawCareerProgress: '1094 / 760',
	UndrawCelebration: '949.8 / 661.52',
	UndrawChatWithAI: '800.597 / 566.88',
	UndrawCodeThinking: '1082.43901 / 449.88124',
	UndrawCollaborators: '989.31079 / 623.83577',
	UndrawConference: '860.55448 / 632.26705',
	UndrawConferenceCall: '817.21528 / 523.62072',
	UndrawConversation: '842 / 842.79999',
	UndrawDeveloperActivity: '850.53801 / 740.82953',
	UndrawDreamer: '1188 / 795.33',
	UndrawFeedback: '1048 / 786.03763',
	UndrawFixingBugs: '690 / 448.7592',
	UndrawFolder: '929.54484 / 793.07015',
	UndrawGoodTeam: '1115.91385 / 832.5636',
	UndrawGroupHangout: '1031.79 / 709.36133',
	UndrawGrowthAnalytics: '1028 / 739',
	UndrawHackerMindset: '921.71991 / 653.40956',
	UndrawHangout: '785.77114 / 658',
	UndrawHappyFeeling: '743.40429 / 753.13373',
	UndrawHappyWomenDay: '1106 / 783.42853',
	UndrawInterview: '833.22212 / 633.11008',
	UndrawJobHunt: '726.42275 / 705.12037',
	UndrawJobOffers: '787.3608 / 578.21141',
	UndrawJoin: '808 / 607.0183',
	UndrawJoinThumbUp: '511.56264 / 532.44842',
	UndrawLovingStory: '1126.86988 / 713',
	UndrawMeditating: '853.5621 / 645.77561',
	UndrawNoteList: '790 / 701.99219',
	UndrawOnlineArticles: '808.84067 / 681.8936',
	UndrawOnlinePage: '994.33914 / 584.67154',
	UndrawOnlineVideo: '885.6192 / 579.76496',
	UndrawOperatingSystem: '913.2141 / 482.65195',
	UndrawPowerful: '928.52587 / 635.2126',
	UndrawPresentation: '928.76643 / 735.63906',
	UndrawProductTeardown: '929.68 / 818.68',
	UndrawProgressOverview: '656.81592 / 629.53711',
	UndrawProudCoder: '887.87284 / 569.68008',
	UndrawPumpkin: '485.36914 / 546.10046',
	UndrawQuestions: '844.67538 / 595.26155',
	UndrawQuickChat: '863.91732 / 364.20537',
	UndrawReadingList: '677 / 421.44411',
	UndrawRemoteMeeting: '813.03586 / 658.84956',
	UndrawSentimentAnalysis: '608.1569 / 787.14054',
	UndrawShareOpinion: '965.9983 / 727.77798',
	UndrawShowingSupport: '660.67004 / 513.66796',
	UndrawSocialUser: '770 / 431',
	UndrawSoftwareEngineer: '802.61127 / 507.21869',
	UndrawSuperThankYou: '915.35 / 848.79',
	UndrawTeamCollaboration: '936.13137 / 505.29587',
	UndrawTeamSpirit: '1137.68 / 859.71',
	UndrawToDoList: '848.67538 / 469.44265',
	UndrawUpdateResume: '732.19786 / 575.59415',
	UndrawVersionControl: '1038.23 / 693.31',
	UndrawWalkInTheCity: '955 / 680.5',
	UndrawWorkout: '1027.35 / 798.89',
};

/**
 * The name of an Undraw illustration.
 */
export type UndrawIllustrationName = keyof typeof svgAspectRatios;

type UndrawIllustrationProps = {
	/** Filename of svg file found in [`public/assets/svg`](https://github.com/Virtual-Coffee/virtualcoffee.io/tree/main/public/assets/svg) */
	filename: UndrawIllustrationName;
	style?: React.CSSProperties;
} & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>;

export default function UndrawIllustration({
	filename,
	style = {},
	...props
}: UndrawIllustrationProps) {
	// Typed as possibly missing because `filename` is not always checked: MDX
	// frontmatter supplies it as a plain string via the `hero` field, and a few
	// pages name an illustration that has no SVG file.
	const aspectRatio: string | undefined = svgAspectRatios[filename];
	// `width`/`height` are required but only establish the ratio: these are
	// vector, and `next/image` serves SVG as-is rather than optimizing it.
	const [width, height] = aspectRatio?.split(' / ').map(Number) ?? [1, 1];

	return (
		<Image
			style={{ aspectRatio, ...style }}
			src={`/assets/svg/${filename}.svg`}
			width={width}
			height={height}
			loading="lazy"
			aria-hidden="true"
			alt=""
			{...props}
		/>
	);
}
