import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LeadRecord {
  name: string;
  title: string;
  org: string;
  email: string;
  phone: string;
  status: 'attended' | 'cancelled';
  event?: string;
}

interface EventData {
  eventName: string;
  eventDate?: string;
  leads: LeadRecord[];
}

async function importHistoricalLeads(
  sponsorName: string,
  eventsData: EventData[]
) {
  const { data: sponsor, error: sponsorError } = await supabase
    .from('sponsors')
    .select('id')
    .ilike('name', sponsorName)
    .maybeSingle();

  if (sponsorError || !sponsor) {
    console.error(`Sponsor not found: ${sponsorName}`);
    return;
  }

  console.log(`Found sponsor: ${sponsorName} (${sponsor.id})`);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const eventData of eventsData) {
    console.log(`\nProcessing event: ${eventData.eventName} (${eventData.leads.length} leads)`);

    const leadsToInsert = eventData.leads.map(lead => ({
      sponsor_id: sponsor.id,
      event_id: `historical-${eventData.eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      attendee_id: `historical-${lead.email}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      company: lead.org || null,
      title: lead.title || null,
      attendance_status: lead.status === 'attended' ? 'attended' : 'no_show',
      source_database: 'historical',
      is_historical: true,
      historical_event_name: eventData.eventName,
      historical_event_date: eventData.eventDate || null,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('sponsor_leads')
      .upsert(leadsToInsert, {
        onConflict: 'sponsor_id,attendee_id,event_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error inserting leads for ${eventData.eventName}:`, error);
      totalSkipped += eventData.leads.length;
    } else {
      console.log(`✓ Inserted ${eventData.leads.length} leads for ${eventData.eventName}`);
      totalInserted += eventData.leads.length;
    }
  }

  console.log(`\n=== Import Summary ===`);
  console.log(`Sponsor: ${sponsorName}`);
  console.log(`Total events: ${eventsData.length}`);
  console.log(`Total leads inserted: ${totalInserted}`);
  console.log(`Total leads skipped: ${totalSkipped}`);
}

async function main() {
  const ringCentralData: EventData[] = [];

  const commvaultData: EventData[] = [];

  await importHistoricalLeads('RingCentral', ringCentralData);
  await importHistoricalLeads('Commvault', commvaultData);

  console.log('\n✅ Import complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});
