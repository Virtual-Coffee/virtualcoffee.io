'use client';

import { useState } from 'react';

import type { Draft } from '@/lib/events/eventDraft';

/**
 * The Draft both Events forms hold. `set` patches fields; `touched` says
 * whether anything has been edited yet, which is what decides if the form may
 * show what is still missing. The pages key the form on the etag, so a refresh
 * after a save starts a new Draft.
 */
export function useEventDraft(initial: Draft) {
	const [draft, setDraft] = useState(initial);
	const [touched, setTouched] = useState(false);

	function set(patch: Partial<Draft>) {
		setTouched(true);
		setDraft((current) => ({ ...current, ...patch }));
	}

	return { draft, set, touched };
}
