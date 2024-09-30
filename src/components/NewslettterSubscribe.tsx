export default function NewsletterSubscribe({
	header = 'Subscribe to the Virtual Coffee Newsletter',
}) {
	return (
		<>
			<h2>{header}</h2>
			<p className="lead">
				<a
					href="https://virtualcoffeeio.beehiiv.com/subscribe"
					target="_blank"
					rel="noopener noreferrer"
				>
					Subscribe to the Virtual Coffee Newsletter on beehiiv!
				</a>
			</p>
		</>
	);
}
