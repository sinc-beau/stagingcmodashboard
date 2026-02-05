import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'present' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RINGCENTRAL_SPONSOR_ID = 'f050a185-e395-489e-a46d-83e21e1efa0a';
const PLACEHOLDER_EVENT_ID = '00000000-0000-0000-0000-000000000001';

interface Attendee {
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: string;
}

interface Event {
  event_name: string;
  event_type: string;
  event_date: string;
  event_city?: string;
  event_venue?: string;
  attendees: Attendee[];
}

async function importVirtualDinners() {
  console.log('Loading JSON file...');
  const jsonPath = 'rcvirtualdinnerhistorical copy.json';
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Event[];

  console.log(`Found ${jsonData.length} events to process`);

  let totalProcessed = 0;
  let totalAttended = 0;
  let totalCancelled = 0;

  for (const event of jsonData) {
    console.log(`\nProcessing: ${event.event_name}`);
    console.log(`Type: ${event.event_type}, Date: ${event.event_date}`);
    console.log(`Attendees: ${event.attendees.length}`);

    for (const attendee of event.attendees) {
      const nameParts = attendee.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const attendanceStatus = attendee.status === 'Attended' ? 'attended' : 'no_show';

      if (attendee.status === 'Attended') {
        totalAttended++;
      } else {
        totalCancelled++;
      }

      // Parse date (format: M/D/YY or M/D/YYYY)
      let eventDate: string;
      try {
        const dateParts = event.event_date.split('/');
        let month = dateParts[0].padStart(2, '0');
        let day = dateParts[1].padStart(2, '0');
        let year = dateParts[2];

        // Convert 2-digit year to 4-digit
        if (year.length === 2) {
          year = '20' + year;
        }

        eventDate = `${year}-${month}-${day}`;
      } catch (e) {
        console.error(`Error parsing date: ${event.event_date}`, e);
        eventDate = '2025-01-01'; // fallback
      }

      const { error } = await supabase.from('sponsor_leads').insert({
        sponsor_id: RINGCENTRAL_SPONSOR_ID,
        event_id: PLACEHOLDER_EVENT_ID,
        attendee_id: crypto.randomUUID(),
        name: attendee.name,
        first_name: firstName,
        last_name: lastName,
        email: attendee.email,
        company: attendee.company,
        title: attendee.title,
        phone: attendee.phone,
        is_historical: true,
        historical_event_name: event.event_name,
        historical_event_type: event.event_type,
        historical_event_date: eventDate,
        historical_status: attendee.status,
        attendance_status: attendanceStatus,
        source_database: 'ringcentral',
      });

      if (error && !error.message.includes('duplicate')) {
        console.error(`Error inserting ${attendee.name}:`, error.message);
      }

      totalProcessed++;
    }

    console.log(`✓ Processed ${event.attendees.length} attendees`);
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total Events: ${jsonData.length}`);
  console.log(`Total Attendees Processed: ${totalProcessed}`);
  console.log(`- Attended: ${totalAttended}`);
  console.log(`- Cancelled/No-show: ${totalCancelled}`);
}

importVirtualDinners()
  .then(() => {
    console.log('\n✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
