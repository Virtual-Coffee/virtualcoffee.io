import type { Room } from '../_shared/types/room';
import type Airtable from 'airtable';

type AirtableBase = ReturnType<InstanceType<typeof Airtable>['base']>;

// returns a roomInstance record, or undefined.
// Will retry 5 times, pausing 1 second between tries.
export async function findRoomInstance(
	room: Room,
	base: AirtableBase,
	instanceId: string,
) {
	async function tryFind() {
		const resultArray = await base('room_instances')
			.select({
				// Selecting the first 1 records in Grid view:
				maxRecords: 1,
				view: 'Grid view',
				filterByFormula: `AND(RoomZoomMeetingId='${room.ZoomMeetingId}',instance_uuid='${instanceId}')`,
			})
			.firstPage();

		return resultArray[0];
	}
	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	let roomInstance = await tryFind();
	let count = 0;
	while (count < 5 && !roomInstance) {
		count++;
		await sleep(400 * count);
		roomInstance = await tryFind();
	}

	if (!roomInstance) {
		console.log(`room instance ${instanceId} not found`);
	}

	return roomInstance;
}
