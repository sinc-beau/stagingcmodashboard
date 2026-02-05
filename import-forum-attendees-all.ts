import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';

async function importForumAttendees() {
  console.log('Loading forum attendees JSON...');

  // Read the JSON file
  const jsonData = JSON.parse(
    fs.readFileSync('all_events_all_attendees.json', 'utf-8')
  );

  console.log(`Total events: ${jsonData.total_events}`);
  console.log(`Total attendees across all events: ${jsonData.total_attendees_all_events}`);

  let totalInserted = 0;
  let totalErrors = 0;

  for (const event of jsonData.events) {
    console.log(`\n Processing: ${event.forum_name}`);
    console.log(`  Attendees: ${event.total_attendees} (${event.attended_count} attended, ${event.cancelled_count} cancelled)`);

    const records = event.attendees.map((attendee: any) => ({
      sponsor_id: RINGCENTRAL_SPONSOR_ID,
      name: `${attendee['First Name']} ${attendee['Last Name']}`,
      email: attendee.Email || null,
      phone: attendee.Cellphone || null,
      company: attendee.Company || null,
      title: attendee.Title || null,
      attendance_status: attendee.Status || 'unknown',
      event_name: event.forum_name,
      event_type: 'forum',
      source_database: 'ringcentral',
      notes: [
        attendee.Linkedin ? `LinkedIn: ${attendee.Linkedin}` : null,
        attendee['Company Size'] ? `Company Size: ${attendee['Company Size']}` : null,
        attendee.Industry ? `Industry: ${attendee.Industry}` : null,
      ].filter(Boolean).join(', ')
    }));

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('historical_attendees')
        .insert(batch);

      if (error) {
        console.error(`  Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        totalErrors += batch.length;
      } else {
        totalInserted += batch.length;
        console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
      }
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total errors: ${totalErrors}`);

  // Verify the count
  const { count, error } = await supabase
    .from('historical_attendees')
    .select('*', { count: 'exact', head: true })
    .eq('source_database', 'ringcentral');

  if (error) {
    console.error('Error counting records:', error);
  } else {
    console.log(`Total records in database: ${count}`);
  }
}

importForumAttendees().catch(console.error);
