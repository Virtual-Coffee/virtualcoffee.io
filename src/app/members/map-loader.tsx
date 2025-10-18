'use client';

import dynamic from 'next/dynamic';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import type { MappableMember } from '@/content/members/types';

const loaderStyle: CSSProperties = {
	aspectRatio: '16/6',
	minHeight: 400,
	position: 'relative',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export function MapLoaderDev({ members }: { members: MappableMember[] }) {
	const [toLoad, setToLoad] = useState(false);
	const hasLoadedOnce = useRef(false);

	useEffect(() => {
		if (!hasLoadedOnce.current && typeof window !== 'undefined') {
			window.setTimeout(() => {
				setToLoad(true);
			}, 4000);
			hasLoadedOnce.current = true;
		}
	}, []);

	if (toLoad) {
		return <MapDynamicLoader members={members} />;
	}

	return <div style={loaderStyle}>Loading...</div>;
}

export const MapDynamicLoader = dynamic(
	() => import('@/components/MemberMap'),
	{
		loading: () => <div style={loaderStyle}>Loading...</div>,
		ssr: false,
	},
);

export const MapLoader = dynamic(() => import('@/components/MemberMap'), {
	loading: () => <div style={loaderStyle}>Loading...</div>,
	ssr: false,
});
