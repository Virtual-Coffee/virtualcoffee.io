import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from './spamGuard';

/**
 * The hidden half of the spam guard, rendered inside every public form.
 *
 * The token is passed in rather than generated here: these are client
 * components, and the signing secret must not reach the browser. The page
 * calls `issueTimestamp()` on the server and hands the result down — which is
 * also why the form pages are `force-dynamic`. Statically prerendering them
 * would bake one token into the cached HTML and every submission after the
 * token aged out would be bounced back for a retry. The form passes the
 * state's `spamToken` over the page's once an error has re-rendered it.
 *
 * The honeypot is hidden from sight *and* from assistive technology, and taken
 * out of the tab order, so nobody filling the form in can trip it by accident.
 */
export function SpamGuardFields({ token }: { token: string }) {
	return (
		<div aria-hidden="true" style={{ display: 'none' }}>
			<label htmlFor={HONEYPOT_FIELD}>Leave this field blank</label>
			<input
				type="text"
				id={HONEYPOT_FIELD}
				name={HONEYPOT_FIELD}
				tabIndex={-1}
				autoComplete="off"
				defaultValue=""
			/>
			<input type="hidden" name={TIMESTAMP_FIELD} value={token} />
		</div>
	);
}
