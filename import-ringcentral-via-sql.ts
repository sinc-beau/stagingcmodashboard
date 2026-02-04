import historicalData from './rcvirtualdinnerhistorical.json';
import * as fs from 'fs';

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';
const HISTORICAL_EVENT_ID = '00000000-0000-0000-0000-000000000001';

function generateSQLInserts() {
  const sqlStatements: string[] = [];

  for (const event of historicalData) {
    for (const attendee of event.attendees) {
      const values = {
        sponsor_id: RINGCENTRAL_SPONSOR_ID,
        event_id: HISTORICAL_EVENT_ID,
        attendee_id: `historical_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        source_database: 'non_forum_event',
        is_historical: true,
        name: (attendee.name || '').replace(/'/g, "''"),
        email: (attendee.email || '').replace(/'/g, "''"),
        phone: (attendee.phone || '').replace(/'/g, "''"),
        company: (attendee.company || '').replace(/'/g, "''"),
        title: (attendee.title || '').replace(/'/g, "''"),
        historical_event_name: (event.event_name || '').replace(/'/g, "''"),
        historical_event_type: (event.event_type || '').replace(/'/g, "''"),
        historical_event_city: (event.event_city || '').replace(/'/g, "''"),
        historical_event_venue: (event.event_venue || '').replace(/'/g, "''"),
        historical_event_date: event.event_date,
        historical_status: (attendee.status || '').replace(/'/g, "''")
      };

      const sql = `
INSERT INTO sponsor_leads (
  sponsor_id, event_id, attendee_id, source_database, is_historical,
  name, email, phone, company, title,
  historical_event_name, historical_event_type, historical_event_city,
  historical_event_venue, historical_event_date, historical_status
) VALUES (
  '${values.sponsor_id}', '${values.event_id}', '${values.attendee_id}', '${values.source_database}', ${values.is_historical},
  '${values.name}', '${values.email}', '${values.phone}', '${values.company}', '${values.title}',
  '${values.historical_event_name}', '${values.historical_event_type}', '${values.historical_event_city}',
  '${values.historical_event_venue}', '${values.historical_event_date}', '${values.historical_status}'
);`;

      sqlStatements.push(sql);
    }
  }

  return sqlStatements.join('\n');
}

const sql = generateSQLInserts();
fs.writeFileSync('ringcentral-import.sql', sql);

console.log(`Generated SQL file with ${historicalData.reduce((sum, e) => sum + e.attendees.length, 0)} INSERT statements`);
console.log('File saved as: ringcentral-import.sql');
