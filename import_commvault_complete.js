import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const SPONSOR_ID = '6e048704-504b-474c-93bc-8c1e5feb265d';

// Read the full JSON file with all attendee data
const jsonData = JSON.parse(fs.readFileSync('commvault_data.json', 'utf8'));

async function importAllAttendees() {
  console.log('Starting complete Commvault import...\n');

  // Check what's already imported
  const { data: existing, error: checkError } = await supabase
    .from('historical_attendees')
    .select('event_name, name')
    .eq('sponsor_id', SPONSOR_ID);

  if (checkError) {
    console.error('Error checking existing records:', checkError);
    return;
  }

  const existingNames = new Set(existing.map(r => `${r.event_name}|${r.name}`));
  console.log(`Found ${existing.length} existing Commvault records`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const event of jsonData.events) {
    console.log(`\nProcessing ${event.forum_name}...`);

    const toInsert = [];

    for (const attendee of event.attendees) {
      const firstName = attendee['First Name'] || '';
      const lastName = attendee['Last Name'] || '';
      const name = `${firstName} ${lastName}`.trim();
      const key = `${event.forum_name}|${name}`;

      if (existingNames.has(key)) {
        totalSkipped++;
        continue;
      }

      toInsert.push({
        sponsor_id: SPONSOR_ID,
        name,
        email: attendee.Email || null,
        phone: attendee.Cellphone || null,
        company: attendee.Company || null,
        title: attendee.Title || null,
        attendance_status: attendee.Status === 'cancelled' ? 'cancelled' : attendee.Status,
        event_name: event.forum_name,
        event_type: 'forum',
        event_date: event.event_date,
        source_database: 'commvault',
        notes: attendee.Linkedin ? `LinkedIn: ${attendee.Linkedin}` : null
      });
    }

    console.log(`  New records to insert: ${toInsert.length}`);

    // Insert in batches of 30
    for (let i = 0; i < toInsert.length; i += 30) {
      const batch = toInsert.slice(i, i + 30);

      const { error } = await supabase.rpc('insert_historical_attendees_batch', {
        attendees_json: JSON.stringify(batch)
      });

      if (error) {
        console.error(`  Error on batch ${Math.floor(i/30) + 1}:`, error.message);
        totalErrors += batch.length;
      } else {
        totalInserted += batch.length;
        console.log(`  ✓ Batch ${Math.floor(i/30) + 1} inserted (${batch.length} records)`);
      }
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total skipped (already exists): ${totalSkipped}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`\nFinal count should be 261 total attendees for Commvault`);
}

importAllAttendees().catch(console.error);
