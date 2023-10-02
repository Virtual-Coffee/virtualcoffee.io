import type { MappableMember } from 'members/types';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';

function Markers({ members }: { members: MappableMember[] }) {
	const map = useMap();

	useEffect(() => {
		map.fitBounds(
			members.map((member) => [
				member.location.latitude,
				member.location.longitude,
			]),
		);
	}, [members, map]);

	return (
		<>
			{members.map((member) => (
				<Marker
					key={member.github}
					position={[member.location?.latitude, member.location?.longitude]}
				>
					<Popup>
						{member.name}
						{member.location?.title && (
							<>
								{' - '}
								{member.location?.title}
							</>
						)}
					</Popup>
				</Marker>
			))}
		</>
	);
}

export default function MemberMap({ members }: { members: MappableMember[] }) {
	return (
		<div style={{ aspectRatio: '16/6', minHeight: 400, position: 'relative' }}>
			<MapContainer
				center={[36.674222, -39.082187]}
				zoom={1}
				scrollWheelZoom={false}
				style={{ aspectRatio: '16/6', minHeight: 400, position: 'relative' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Markers members={members} />
			</MapContainer>
		</div>
	);
}
