'use client';

import dynamic from 'next/dynamic';

export const MapLoader = dynamic(() => import('@/components/MemberMap'), {
	loading: () => (
		<div style={{ aspectRatio: '16/9', minHeight: 400 }}>Loading...</div>
	),
	ssr: false,
});
