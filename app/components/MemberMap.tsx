import type { FixedUpUser, Location, MemberList } from 'members/types';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';

function Markers({ members }: { members: MemberList }) {
	const map = useMap();

	useEffect(() => {
		const filtered = members.filter(
			(member): member is FixedUpUser & { location: Location } => {
				return !!(member && member.location);
			},
		);

		map.fitBounds(
			filtered.map((member) => [
				member.location.latitude,
				member.location.longitude,
			]),
		);
	}, [members, map]);

	return (
		<>
			{members.map((member) =>
				!member ||
				!member.location?.latitude ||
				!member.location?.longitude ? null : (
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
				),
			)}
		</>
	);
}

export default function MemberMap({ members }: { members: MemberList }) {
	return (
		<div style={{ height: '50vh', position: 'relative' }}>
			<MapContainer
				center={[36.674222, -39.082187]}
				zoom={1}
				scrollWheelZoom={false}
				style={{ height: '50vh', position: 'relative' }}
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
