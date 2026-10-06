import challengeJson from '@/data/monthlyChallenges/data/jan-2021.json';

export default function LearningResources() {
	const list = challengeJson.challengedata.sort((a, b) =>
		a.name.localeCompare(b.name),
	);

	return (
		<>
			<h2 className="mb-4">Resources Recommended by Our Members:</h2>
			{list.map((person, i) => (
				<div className="p-3 bg-light rounded mb-3 shadow-sm" key={i}>
					<h3 className="h4">{person.name}:</h3>
					{person.resources.map((resource, j) => (
						<div className="card mb-4" key={j}>
							<div className="card-body">
								<h5 className="card-title">
									<a href={resource.resourceLink}>{resource.title}</a>
								</h5>
								<h6 className="card-subtitle mb-2 text-muted">
									<strong>Cost</strong>: {resource.price}
								</h6>
								<p className="card-text">{resource.description}</p>
								<a href={resource.resourceLink}>Learn More</a>
							</div>
						</div>
					))}
				</div>
			))}
		</>
	);
}
