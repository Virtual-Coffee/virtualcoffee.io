import type { MappableMember } from 'members/types';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon.Default({
	iconUrl: require('../../public/assets/images/virtual-coffee-mug-circle.svg'),
	iconSize: new L.Point(33, 33, true),
});

const createClusterCustomIcon = function (cluster) {
	return L.divIcon({
		html: `<span>${cluster.getChildCount()}</span>`,
		className: 'custom-marker-cluster',
		iconSize: L.point(33, 33, true),
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

	return (
		<>
			{members.map((member) => (
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
			))}
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
				style={{ aspectRatio: '16/6', minHeight: 400, position: 'relative' }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MarkerClusterGroup
					chunkedLoading
					// onClick={(e) => console.log('onClick', e)}
					iconCreateFunction={createClusterCustomIcon}
					maxClusterRadius={150}
					spiderfyOnMaxZoom={true}
					polygonOptions={{
						fillColor: '#ffffff',
						color: '#f00800',
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
