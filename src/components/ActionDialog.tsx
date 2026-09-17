'use client';

import { useState, type ReactNode } from 'react';

import { AdminDialog } from '@/components/AdminDialog';
import type { ActionResult, EmailActionResult } from '@/lib/admin/actionResult';
import { useAction } from '@/util/forms/useAction';
import { useModalDialog } from '@/util/useModalDialog';

type Result = ActionResult | EmailActionResult;

/** What `errorDetail` is handed: a result that came back refused. */
export type ActionFailure = Extract<Result, { ok: false }>;

/**
 * Every confirmation in `/admin` and `/invites`: the trigger button, the
 * dialog it opens, the action it runs and the outcome. One component rather
 * than a `window.confirm` in each `onClick`, because the thing worth
 * confirming is usually the email about to go out or the note that lands on
 * the record, and a native prompt can show neither.
 *
 * The lock while the action runs is the point of the pairing. A success
 * closes the dialog and the message lands beside the trigger; a failure
 * leaves it open, unlocked, with the error under the body — read it, then
 * cancel or confirm again. Nothing the body collects lives here: a note, a
 * copy-me tick or a time draft is the caller's state, closed over by
 * `action` and reset in `onClose`.
 *
 * `submit` makes the body a form, so Enter in a field confirms.
 * `triggerType: 'submit'` does the same for the trigger, for a card whose own
 * form is what opens the dialog. `showFeedback={false}` is for a trigger that
 * disappears on success — the status it changed is what decides whether it
 * renders — where the caller shows the message somewhere that survives, and
 * clears it again in `onOpen`.
 */
export function ActionDialog({
	className,
	label,
	title,
	confirmLabel = label,
	pendingLabel = 'Working…',
	danger = false,
	submit = false,
	triggerType = 'button',
	disabled = false,
	showFeedback = true,
	action,
	onSuccess,
	onOpen,
	onClose,
	refresh,
	errorDetail,
	children,
}: {
	/** Classes for the trigger button. */
	className: string;
	label: ReactNode;
	title: ReactNode;
	confirmLabel?: ReactNode;
	pendingLabel?: ReactNode;
	danger?: boolean;
	submit?: boolean;
	triggerType?: 'button' | 'submit';
	disabled?: boolean;
	showFeedback?: boolean;
	action: () => Promise<Result>;
	onSuccess?: (result: Extract<Result, { ok: true }>) => void;
	onOpen?: () => void;
	onClose?: () => void;
	refresh?: 'on-success' | 'always';
	/** Added to the error alert — what the failure means for a retry. */
	errorDetail?: (result: ActionFailure) => ReactNode;
	children: ReactNode;
}) {
	const { run, pending, result, feedback, clear } = useAction<Result>();
	const [open, setOpen] = useState(false);

	// Every close comes through here — Cancel, Escape, the backdrop and the
	// close on success — so it is the one place the caller's draft resets.
	const dialog = useModalDialog(
		open,
		() => {
			setOpen(false);
			onClose?.();
		},
		pending,
	);

	const failure = result && !result.ok ? result : null;

	function confirm() {
		run(action, {
			onSuccess: (outcome) => {
				setOpen(false);
				onSuccess?.(outcome);
			},
			refresh,
		});
	}

	return (
		<>
			<button
				type={triggerType}
				className={className}
				disabled={disabled || pending}
				onClick={(event) => {
					event.preventDefault();
					// A submit trigger keeps its form's validation: the browser
					// reports the first bad field rather than previewing it.
					if (
						triggerType === 'submit' &&
						event.currentTarget.form?.reportValidity() === false
					) {
						return;
					}
					// Last time's outcome is not this time's.
					clear();
					onOpen?.();
					setOpen(true);
				}}
			>
				{label}
			</button>

			{showFeedback && result?.ok ? feedback : null}

			<AdminDialog
				dialog={dialog}
				title={title}
				pending={pending}
				onCancel={() => setOpen(false)}
				onSubmit={submit ? confirm : undefined}
				confirm={
					<button
						type={submit ? 'submit' : 'button'}
						className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
						onClick={submit ? undefined : confirm}
						disabled={pending}
					>
						{pending ? pendingLabel : confirmLabel}
					</button>
				}
			>
				{children}

				{failure && (
					<div className="alert alert-danger mt-3" role="alert">
						<p className={errorDetail ? 'mb-1' : 'mb-0'}>{failure.message}</p>
						{errorDetail?.(failure)}
					</div>
				)}
			</AdminDialog>
		</>
	);
}
