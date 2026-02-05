import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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
  attendees: Attendee[];
  event_type: string;
  event_city: string;
  event_venue: string;
  event_date: string;
}

async function importHistoricalAttendees() {
  console.log('Starting import of historical attendees...');

  const fileContent = readFileSync('./rcvirtualdinnerhistorical.json', 'utf-8');
  const events: Event[] = JSON.parse(fileContent);

  console.log(`Found ${events.length} events`);

  let totalAttendees = 0;
  let importedCount = 0;
  let errorCount = 0;

  for (const event of events) {
    console.log(`\nProcessing event: ${event.event_name}`);
    console.log(`  Event type: ${event.event_type}, Date: ${event.event_date}`);
    console.log(`  Attendees: ${event.attendees.length}`);

    for (const attendee of event.attendees) {
      totalAttendees++;

      let sponsorId: string | null = null;

      if (attendee.company && attendee.company.trim() !== '') {
        const { data: sponsors, error: sponsorError } = await supabase
          .from('sponsors')
          .select('id, name')
          .ilike('name', `%${attendee.company.trim()}%`)
          .limit(1)
          .maybeSingle();

        if (sponsorError) {
          console.error(`Error finding sponsor for ${attendee.company}:`, sponsorError);
        } else if (sponsors) {
          sponsorId = sponsors.id;
        }
      }

      const notes = `Venue: ${event.event_venue}, City: ${event.event_city}`;

      const attendanceStatus = attendee.status.toLowerCase()
        .replace('declined by client', 'cancelled')
        .replace('waitlisted', 'pending');

      const historicalRecord = {
        sponsor_id: sponsorId,
        name: attendee.name || '',
        email: attendee.email || '',
        phone: attendee.phone || null,
        company: attendee.company || null,
        title: attendee.title || null,
        attendance_status: attendanceStatus,
        event_name: event.event_name,
        event_type: event.event_type,
        event_date: event.event_date ? new Date(event.event_date).toISOString() : null,
        source_database: 'ringcentral_events',
        notes: notes,
      };

      const { error: insertError } = await supabase
        .from('historical_attendees')
        .insert(historicalRecord);

      if (insertError) {
        console.error(`Error inserting attendee ${attendee.name}:`, insertError);
        errorCount++;
      } else {
        importedCount++;
      }
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total attendees processed: ${totalAttendees}`);
  console.log(`Successfully imported: ${importedCount}`);
  console.log(`Errors: ${errorCount}`);
}

importHistoricalAttendees()
  .then(() => {
    console.log('\nImport completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
