import historicalData from './rcvirtualdinnerhistorical.json';
import * as fs from 'fs';

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';
const HISTORICAL_EVENT_ID = '00000000-0000-0000-0000-000000000001';

let counter = 1;
const allLeads = [];

// Collect all leads
for (const event of historicalData) {
  for (const attendee of event.attendees) {
    allLeads.push({
      sponsor_id: RINGCENTRAL_SPONSOR_ID,
      event_id: HISTORICAL_EVENT_ID,
      attendee_id: `hist_rc_${String(counter).padStart(4, '0')}`,
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
    });
    counter++;
  }
}

console.log(`Total leads: ${allLeads.length}`);

// Create compact migrations in batches of 50
const batchSize = 50;
const batches = [];

for (let i = 0; i < allLeads.length; i += batchSize) {
  batches.push(allLeads.slice(i, i + batchSize));
}

console.log(`Creating ${batches.length} migration files...`);

batches.forEach((batch, index) => {
  const batchNum = index + 1;
  const lines = [];

  lines.push(`/*`);
  lines.push(`  # Import RingCentral Historical Leads - Batch ${batchNum}`);
  lines.push(``);
  lines.push(`  Imports ${batch.length} historical lead records for RingCentral`);
  lines.push(`*/`);
  lines.push(``);

  batch.forEach(lead => {
    const sql = `INSERT INTO sponsor_leads (sponsor_id, event_id, attendee_id, source_database, is_historical, name, email, phone, company, title, historical_event_name, historical_event_type, historical_event_city, historical_event_venue, historical_event_date, historical_status) VALUES ('${lead.sponsor_id}', '${lead.event_id}', '${lead.attendee_id}', '${lead.source_database}', ${lead.is_historical}, '${lead.name}', '${lead.email}', '${lead.phone}', '${lead.company}', '${lead.title}', '${lead.historical_event_name}', '${lead.historical_event_type}', '${lead.historical_event_city}', '${lead.historical_event_venue}', '${lead.historical_event_date}', '${lead.historical_status}');`;
    lines.push(sql);
  });

  const filename = `migration_ringcentral_batch_${String(batchNum).padStart(2, '0')}.sql`;
  fs.writeFileSync(filename, lines.join('\n'));
  console.log(`  Created ${filename} with ${batch.length} records`);
});

console.log('Done!');
