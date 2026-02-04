import historicalData from './rcvirtualdinnerhistorical.json';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const RINGCENTRAL_SPONSOR_ID = '93110e75-235b-4586-91f2-196deca40133';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function importBatch() {
  console.log('Starting batch import...');

  const allLeads = [];

  for (const event of historicalData) {
    for (const attendee of event.attendees) {
      allLeads.push({
        sponsor_id: RINGCENTRAL_SPONSOR_ID,
        event_id: RINGCENTRAL_SPONSOR_ID,
        attendee_id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      });
    }
  }

  console.log(`Total leads to import: ${allLeads.length}`);

  // Import in batches of 100
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allLeads.length; i += batchSize) {
    const batch = allLeads.slice(i, i + batchSize);
    console.log(`\nImporting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allLeads.length / batchSize)} (${batch.length} records)...`);

    // Build raw SQL for each record
    const sqlStatements = batch.map(lead => {
      const escape = (str: string) => str.replace(/'/g, "''");
      return `INSERT INTO sponsor_leads (sponsor_id, event_id, attendee_id, source_database, is_historical, name, email, phone, company, title, historical_event_name, historical_event_type, historical_event_city, historical_event_venue, historical_event_date, historical_status) VALUES ('${lead.sponsor_id}', '${lead.event_id}', '${lead.attendee_id}', '${lead.source_database}', ${lead.is_historical}, '${escape(lead.name)}', '${escape(lead.email)}', '${escape(lead.phone)}', '${escape(lead.company)}', '${escape(lead.title)}', '${escape(lead.historical_event_name)}', '${escape(lead.historical_event_type)}', '${escape(lead.historical_event_city)}', '${escape(lead.historical_event_venue)}', '${lead.historical_event_date}', '${escape(lead.historical_status)}');`;
    }).join('\n');

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: sqlStatements });

      if (error) {
        console.error(`  ❌ Error:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`  ✅ Imported ${batch.length} records`);
        successCount += batch.length;
      }
    } catch (err: any) {
      console.error(`  ❌ Exception:`, err.message);
      errorCount += batch.length;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total processed: ${allLeads.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

importBatch().catch(console.error);
