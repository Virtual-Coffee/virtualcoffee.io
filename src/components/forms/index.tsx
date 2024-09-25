import { useFormStatus } from 'react-dom';

export function Submit({ text = 'Submit', loadingText = 'Submitting...' }) {
	const { pending } = useFormStatus();
	return (
		<div className="text-right">
			<button
				type="submit"
				className="btn btn-primary btn-lg"
				disabled={pending}
			>
				{pending ? loadingText : text}
			</button>
		</div>
	);
}

export function CodeOfConduct() {
	return (
		<fieldset>
			<p className="lead">
				Just a reminder that all talks, events, group meetings, and other
				activities need to adhere to our{' '}
				<a href="/code-of-conduct" target="_blank" rel="noopener noreferrer">
					Code of Conduct
				</a>
				.
			</p>

			<label className="form-group form-check">
				<input
					type="checkbox"
					name="agree"
					className="form-check-input"
					required
					value="agree"
				/>
				<span className="form-check-label">
					I've read the Code of Conduct and understand my responsibilities as a
					member of the Virtual Coffee community
				</span>
			</label>
		</fieldset>
	);
}
