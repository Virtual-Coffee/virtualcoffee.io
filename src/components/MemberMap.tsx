'use client';

import type { MappableMember } from '@/content/members/types';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

const createClusterCustomIcon = function (cluster: L.MarkerCluster) {
	return L.divIcon({
		html: `<span>${cluster.getChildCount()}</span>`,
		className: 'leaflet-custom-marker',
		iconSize: L.point(33, 33, true),
	});
};

const createCustomIcon = function (avatarUrl?: string) {
	return new L.Icon({
		iconUrl: avatarUrl || 'assets/images/virtual-coffee-mug-circle.svg',
		iconSize: new L.Point(33, 33, true),
		className: 'leaflet-custom-marker',
	});
};

function Markers({ members }: { members: MappableMember[] }) {
	const map = useMap();

	useEffect(() => {
		map.fitBounds(
			members.map(
				(member) => [member.location.latitude, member.location.longitude],
				{
					padding: [25, 25],
				},
			),
		);
	}, [members, map]);

	// avatarUrl

	return (
		<>
			{members?.map((member) => {
				const customIcon = createCustomIcon(member?.avatarUrl);

				return (
					<Marker
						key={member.github}
						position={[member.location?.latitude, member.location?.longitude]}
						icon={customIcon}
					>
						<Popup>
							<a href={`#member_${member.github}`}>{member.name}</a>
							{member.location?.title && (
								<>
									{' - '}
									{member.location?.title}
								</>
							)}
						</Popup>
					</Marker>
				);
			})}
		</>
	);
}

export default function MemberMap({ members }: { members: MappableMember[] }) {
	return (
		<div>
			<MapContainer
				center={[36.674222, -39.082187]}
				zoom={1}
				scrollWheelZoom={true}
				style={{
					aspectRatio: '16/6',
					minHeight: 400,
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MarkerClusterGroup
					chunkedLoading
					iconCreateFunction={createClusterCustomIcon}
					maxClusterRadius={150}
					spiderfyOnMaxZoom={true}
					polygonOptions={{
						fillColor: '#ffffff',
						color: '#d9376e',
						weight: 5,
						opacity: 1,
						fillOpacity: 0.8,
					}}
					showCoverageOnHover={true}
				>
					<Markers members={members} />
				</MarkerClusterGroup>
			</MapContainer>
		</div>
	);
}
