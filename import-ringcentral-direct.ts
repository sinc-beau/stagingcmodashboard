import historicalData from './rcvirtualdinnerhistorical.json';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';
const HISTORICAL_EVENT_ID = '00000000-0000-0000-0000-000000000001';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

console.log('Using service role key:', supabaseServiceKey ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importAllLeads() {
  console.log('Starting RingCentral historical leads import...');
  console.log('');

  const allLeads = [];

  for (const event of historicalData) {
    for (const attendee of event.attendees) {
      allLeads.push({
        sponsor_id: RINGCENTRAL_SPONSOR_ID,
        event_id: HISTORICAL_EVENT_ID,
        attendee_id: `hist_rc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source_database: 'non_forum_event',
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
      });
    }
  }

  console.log(`Total leads to import: ${allLeads.length}`);
  console.log('');

  // Import in batches
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allLeads.length; i += batchSize) {
    const batch = allLeads.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(allLeads.length / batchSize);

    console.log(`[${batchNum}/${totalBatches}] Importing batch of ${batch.length} records...`);

    const { data, error } = await supabase
      .from('sponsor_leads')
      .insert(batch);

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount += batch.length;

      // Try individual inserts
      console.log(`  Trying individual inserts...`);
      for (const lead of batch) {
        const { error: indivError } = await supabase
          .from('sponsor_leads')
          .insert(lead);

        if (indivError) {
          errorCount++;
          if (errorCount <= 5) {
            console.log(`    ❌ ${lead.name}: ${indivError.message}`);
          }
        } else {
          successCount++;
        }
      }
    } else {
      successCount += batch.length;
      console.log(`  ✅ Imported ${batch.length} records`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('');
  console.log('=== Import Summary ===');
  console.log(`Total leads processed: ${allLeads.length}`);
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  // Verify final count
  console.log('');
  console.log('Verifying import...');
  const { count, error: countError } = await supabase
    .from('sponsor_leads')
    .select('*', { count: 'exact', head: true })
    .eq('is_historical', true)
    .eq('sponsor_id', RINGCENTRAL_SPONSOR_ID);

  if (!countError) {
    console.log(`✅ Final count: ${count} RingCentral historical leads in database`);
  } else {
    console.error(`Error verifying count: ${countError.message}`);
  }
}

importAllLeads().catch(console.error);
