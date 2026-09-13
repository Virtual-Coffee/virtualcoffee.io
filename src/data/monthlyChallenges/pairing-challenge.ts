import rows from './data/pairing-challenge-2023.json';

/**
 * The Pairing challenge, frozen at its final 2023 result.
 *
 * This used to read Airtable through a view name built from the current year
 * (`${year} Pairing Challenge Results`). Only the 2022 and 2023 views were ever
 * created, so from 1 January 2024 every render asked for a view that does not
 * exist — and with no `try`/`catch`, that threw. The challenge has not run
 * since, so the honest fix is to record what it finished on rather than to keep
 * presenting a live counter.
 *
 * Snapshot: `scripts/airtable/snapshotChallenges.ts`.
 */

export type PairingChallengeRow = {
	'Pairing Participants': string;
	Topic?: string;
	'Pairing Sessions': number;
};

export const pairingChallengeYear = 2023;

export function getPairingChallengeData(): PairingChallengeRow[] {
	return rows as PairingChallengeRow[];
}

export function getTotalPairingSessions(): number {
	return getPairingChallengeData().reduce(
		(total, row) => total + row['Pairing Sessions'],
		0,
	);
}
