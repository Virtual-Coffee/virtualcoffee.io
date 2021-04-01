// for a full working demo of Netlify Identity + Functions, see https://netlify-gotrue-in-react.netlify.com/

require('dotenv').config();

const MEETING_ID = '81323022832';
const EVENT_PARTICIPANT_JOINED = 'meeting.participant_joined';
const EVENT_PARTICIPANT_LEFT = 'meeting.participant_left';

// returns a roomInstance record, or undefined.
// Will retry 5 times, pausing 1 second between tries.
const findRoomInstance = async function (base, instanceId) {
  async function tryFind() {
    const resultArray = await base('room_instances')
      .select({
        // Selecting the first 1 records in Grid view:
        maxRecords: 1,
        view: 'Grid view',
        filterByFormula: `instance_uuid='${instanceId}'`,
      })
      .firstPage();

    return resultArray[0];
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let roomInstance = await tryFind();
  let count = 0;
  while (count < 5 && !roomInstance) {
    console.log('trying again');
    count++;
    await sleep(1000);
    roomInstance = await tryFind();
  }

  return roomInstance;
};

const handler = async function (event, context) {
  try {
    const request = JSON.parse(event.body);

    // check our meeting ID. The meeting ID never changes, but the uuid is different for each instance
    if (
      request.payload.object.id === MEETING_ID &&
      (request.event === EVENT_PARTICIPANT_JOINED ||
        request.event === EVENT_PARTICIPANT_LEFT)
    ) {
      // load up airtable and select our base
      const Airtable = require('airtable');
      const base = new Airtable().base('appSpqfQzw0FMWhRT');

      let roomInstance = await findRoomInstance(
        base,
        request.payload.object.uuid
      );

      if (roomInstance) {
        // create room event record
        console.log(`found room instance ${roomInstance.getId()}`);

        base('room_events').create(
          [
            {
              fields: {
                event_type: request.event,
                user_id: request.payload.object.participant.user_id,
                user_name: request.payload.object.participant.user_name,
                time: request.payload.object.start_time,
                room_instance: [roomInstance.getId()],
              },
            },
          ],
          function (err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function (record) {
              console.log(`created room_event ${record.getId()}`);
            });
          }
        );
      }

      // find the room_instance record
    }

    // const response = await fetch('https://api.chucknorris.io/jokes/random')
    // if (!response.ok) {
    //   // NOT res.status >= 200 && res.status < 300
    //   return { statusCode: response.status, body: response.statusText }
    // }
    // const data = await response.json()

    return {
      statusCode: 200,
      body: '',
      // body: JSON.stringify({ identity, user, msg: data.value }),
    };
  } catch (error) {
    // output to netlify function log
    console.log(error);
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    };
  }
};

module.exports = { handler };
