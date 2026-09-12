import { useId, type ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';

export function Submit({ text = 'Submit', loadingText = 'Submitting...' }) {
	const { pending } = useFormStatus();
	return (
		<div className="text-end">
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

export function CodeOfConduct({ error }: { error?: string }) {
	const errorId = useId();
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

			<label className="mb-form form-check">
				<input
					type="checkbox"
					name="agree"
					className={`form-check-input${error ? ' is-invalid' : ''}`}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? errorId : undefined}
					required
					value="agree"
				/>
				<span className="form-check-label">
					I've read the Code of Conduct and understand my responsibilities as a
					member of the Virtual Coffee community
				</span>
				{error && (
					<div id={errorId} className="invalid-feedback" role="alert">
						{error}
					</div>
				)}
			</label>
		</fieldset>
	);
}

type FieldChrome = {
	id: string;
	name: string;
	label: string;
	help?: string;
	/** The server's message for this field; outlines the control and shows it beneath. */
	error?: string;
};

/**
 * One labelled Bootstrap control for the public forms. Uncontrolled on
 * purpose: the value lives in the DOM so the form posts without JavaScript
 * and `useFormAction` never has to mirror it.
 */
export function Field({
	id,
	name,
	label,
	help,
	error,
	className,
	...input
}: FieldChrome & Omit<ComponentProps<'input'>, 'id' | 'name'>) {
	const described = describedBy(id, help, error);
	return (
		<div className="mb-form">
			<label htmlFor={id}>{label}</label>
			<input
				type="text"
				{...input}
				id={id}
				name={name}
				className={controlClass(className, error)}
				aria-invalid={error ? true : undefined}
				aria-describedby={described}
			/>
			<Feedback id={id} help={help} error={error} />
		</div>
	);
}

export function TextArea({
	id,
	name,
	label,
	help,
	error,
	className,
	rows = 4,
	...textarea
}: FieldChrome & Omit<ComponentProps<'textarea'>, 'id' | 'name'>) {
	const described = describedBy(id, help, error);
	return (
		<div className="mb-form">
			<label htmlFor={id}>{label}</label>
			<textarea
				{...textarea}
				id={id}
				name={name}
				rows={rows}
				className={controlClass(className, error)}
				aria-invalid={error ? true : undefined}
				aria-describedby={described}
			/>
			<Feedback id={id} help={help} error={error} />
		</div>
	);
}

function controlClass(
	className: string | undefined,
	error: string | undefined,
) {
	return ['form-control', error && 'is-invalid', className]
		.filter(Boolean)
		.join(' ');
}

function describedBy(id: string, help?: string, error?: string) {
	const ids = [error && `${id}Error`, help && `${id}Help`].filter(Boolean);
	return ids.length > 0 ? ids.join(' ') : undefined;
}

function Feedback({
	id,
	help,
	error,
}: {
	id: string;
	help?: string;
	error?: string;
}) {
	return (
		<>
			{error && (
				<div id={`${id}Error`} className="invalid-feedback">
					{error}
				</div>
			)}
			{help && (
				<small id={`${id}Help`} className="form-text text-muted">
					{help}
				</small>
			)}
		</>
	);
}
