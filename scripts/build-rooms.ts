import 'dotenv/config';
import Airtable from 'airtable';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const outDir = path.join('.', 'data');
const outFile = path.join(outDir, 'rooms.json');

async function main() {
	mkdirSync(outDir, { recursive: true });

	if (!process.env.AIRTABLE_COWORKING_BASE) {
		console.warn(
			'[build-rooms] AIRTABLE_COWORKING_BASE not set — writing empty rooms.json. The zoom-meeting-webhook-handler will not match any meetings until this is configured.',
		);
		writeFileSync(outFile, '[]\n');
		return;
	}

	console.log('Building rooms');
	const base = new Airtable().base(process.env.AIRTABLE_COWORKING_BASE);
	const results = await base('rooms').select().all();

	const rooms = results.map((record) => ({
		...record.fields,
		record_id: record.id,
	}));

	writeFileSync(outFile, JSON.stringify(rooms, null, 2));
	console.log(`Done building ${rooms.length} rooms`);
}

main();
