export function Default({ Hero, heroHeader, heroSubheader, children }) {
	return (
		<>
			{Hero && heroHeader ? (
				<div className="py-4">
					<div className="container">
						<div className="row align-items-center">
							<div className="col-sm-4">
								<Hero ariaHidden />
							</div>
							<div className="col-sm-8">
								<h1 className="display-4">{heroHeader}</h1>
								{heroSubheader && <p className="lead">{heroSubheader}</p>}
							</div>
						</div>
					</div>
				</div>
			) : heroHeader ? (
				<div className="container bodycopy pt-5">
					<h1 className="display-4">{heroHeader}</h1>
					{heroSubheader && <p className="lead">{heroSubheader}</p>}
				</div>
			) : null}
			<main id="maincontent">{children}</main>
		</>
	);
}
