import {
	getTotalPairingSessions,
	pairingChallengeYear,
} from '@/data/monthlyChallenges/pairing-challenge';

export default function PairingSessionTotal() {
	return (
		<>
			{getTotalPairingSessions().toLocaleString()} pairing sessions in{' '}
			{pairingChallengeYear}
		</>
	);
}
