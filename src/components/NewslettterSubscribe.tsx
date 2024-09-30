export default function NewsletterSubscribe({
	header = 'Subscribe to the Virtual Coffee Newsletter',
}) {
	return (
		<>
			<h2>{header}</h2>
			<form
				action="https://virtualcoffeeio.beehiiv.com/subscribe"
				method="post"
				name="mc-embedded-subscribe-form"
				style={{ maxWidth: '500px' }}
			>
				<div className="form-group">
					<label htmlFor="mce-EMAIL">Email Address:</label>
					<input
						type="email"
						className="form-control"
						id="mce-EMAIL"
						name="EMAIL"
						aria-describedby="nameHelp"
						required
					/>
					<small id="nameHelp" className="form-text text-muted">
						Required
					</small>
				</div>

				<div
					style={{ position: 'absolute', left: '-5000px' }}
					aria-hidden="true"
				>
					<label htmlFor="honeypot">Please leave this field empty</label>
					<input
						type="text"
						name="b_e52b6b09f8fe23f8277bfbe66_d0267c9b8e"
						tabIndex={-1}
						id="honeypot"
					/>
				</div>
				<div className="text-right">
					<input
						type="submit"
						value="Subscribe"
						name="subscribe"
						id="mc-embedded-subscribe"
						className="btn btn-primary btn-lg"
					/>
				</div>
			</form>
		</>
	);
}
