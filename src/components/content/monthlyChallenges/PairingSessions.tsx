import challengeJson from '@/data/monthlyChallenges/data/dec-2020.json';

export default function PairingSessions() {
	const { challengedata: list } = challengeJson;

	const totals: Record<string, number> = {};

	list.forEach((challenge) => {
		challenge.participants.forEach((p) => {
			if (p in totals) {
				totals[p] = totals[p] + 1;
			} else {
				totals[p] = 1;
			}
		});
	});

	return (
		<>
			<table className="table mt-5" style={{ maxWidth: '600px' }}>
				<thead className="table-dark">
					<tr>
						<th scope="col">Pairing topic</th>
						<th scope="col" className="text-end">
							Members
						</th>
					</tr>
				</thead>
				<tbody>
					{list.map((challenge, i) => (
						<tr key={i}>
							<td>{challenge.theme}</td>
							<td className="text-end">{challenge.participants.join(', ')}</td>
						</tr>
					))}
				</tbody>
			</table>

			<hr />

			<h4 className="mt-5">Overview</h4>
			<table className="table" style={{ maxWidth: '600px' }}>
				<thead>
					<tr>
						<th scope="col">Member</th>
						<th scope="col" className="text-end">
							Number of pairing sessions
						</th>
					</tr>
				</thead>
				<tbody>
					{Object.keys(totals).map((person, i) => {
						const num = totals[person];
						return (
							<tr key={i}>
								<td>{person}</td>
								<td className="text-end">
									{num} event{num > 1 ? 's' : ''}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</>
	);
}
