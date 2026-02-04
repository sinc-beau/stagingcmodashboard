import historicalData from './rcvirtualdinnerhistorical.json';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importRingCentralLeads() {
  console.log('Starting RingCentral historical leads import...');
  console.log(`Using RingCentral sponsor ID: ${RINGCENTRAL_SPONSOR_ID}`);

  let totalLeads = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const event of historicalData) {
    console.log(`\nProcessing event: ${event.event_name}`);
    console.log(`  Type: ${event.event_type}, City: ${event.event_city}, Date: ${event.event_date}`);
    console.log(`  Attendees: ${event.attendees.length}`);

    const leadsToInsert = event.attendees.map(attendee => ({
      sponsor_id: RINGCENTRAL_SPONSOR_ID,
      event_id: RINGCENTRAL_SPONSOR_ID,
      attendee_id: `historical_${RINGCENTRAL_SPONSOR_ID}_${attendee.email || Math.random()}`,
      source_database: 'historical_import',
      is_historical: true,
      name: attendee.name || '',
      email: attendee.email || '',
      phone: attendee.phone || '',
      company: attendee.company || '',
      title: attendee.title || '',
      historical_event_name: event.event_name,
      historical_event_type: event.event_type,
      historical_event_city: event.event_city,
      historical_event_venue: event.event_venue,
      historical_event_date: event.event_date,
      historical_status: attendee.status
    }));

    totalLeads += leadsToInsert.length;

    const { data, error: insertError } = await supabase
      .from('sponsor_leads')
      .insert(leadsToInsert)
      .select();

    if (insertError) {
      errorCount += leadsToInsert.length;
      errors.push(`Event "${event.event_name}": ${insertError.message}`);
      console.error(`  ❌ Error inserting batch:`, insertError.message);
    } else {
      successCount += leadsToInsert.length;
      console.log(`  ✅ Successfully inserted ${leadsToInsert.length} leads`);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total events processed: ${historicalData.length}`);
  console.log(`Total leads processed: ${totalLeads}`);
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach(err => console.log(`  - ${err}`));
  }
}

importRingCentralLeads().catch(console.error);
