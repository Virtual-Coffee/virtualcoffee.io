export default function EventsLoading() {
	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex align-items-center gap-2 mb-1">
				<h1 className="h4 mb-0">Events</h1>
				<div
					className="spinner-border spinner-border-sm text-secondary"
					role="status"
				>
					<span className="visually-hidden">Loading</span>
				</div>
			</div>
			<p className="text-body-secondary">Loading the Events Calendar…</p>
		</div>
	);
}
