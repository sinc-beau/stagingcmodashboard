import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '').trim();
}

function mapEventType(externalType: string | null): string {
  if (!externalType) return 'other';

  const type = externalType.toLowerCase().trim();

  const typeMap: Record<string, string> = {
    'dinner': 'dinner',
    'vrt': 'vrt',
    'virtual roundtable': 'vrt',
    'learn & go': 'learn_go',
    'learn and go': 'learn_go',
    'learn go': 'learn_go',
    'learn_go': 'learn_go',
    'learngo': 'learn_go',
    'activation': 'activation',
    'community activation': 'activation',
    'veb': 'veb',
    'forum': 'forum',
  };

  const mapped = typeMap[type];
  if (mapped) return mapped;

  if (type.includes('learn') && (type.includes('go') || type.includes('and go'))) {
    return 'learn_go';
  }
  if (type.includes('roundtable') || type.includes('vrt')) {
    return 'vrt';
  }
  if (type.includes('activation')) {
    return 'activation';
  }
  if (type.includes('dinner')) {
    return 'dinner';
  }

  console.warn(`Unknown event type: "${externalType}" - mapping to 'other'`);
  return 'other';
}

function getDefaultMinimumAttendees(eventType: string): number {
  const typeMap: Record<string, number> = {
    'forum': 60,
    'dinner': 8,
    'vrt': 8,
    'learn_go': 8,
    'activation': 30,
    'veb': 8,
    'other': 8
  };
  return typeMap[eventType] || 8;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const forumEventClient = createClient(
      Deno.env.get('FORUM_EVENT_URL')!,
      Deno.env.get('FORUM_EVENT_ANON_KEY')!
    );

    const nonForumEventClient = createClient(
      Deno.env.get('NON_FORUM_EVENT_URL')!,
      Deno.env.get('NON_FORUM_EVENT_ANON_KEY')!
    );

    console.log('Starting sponsor events sync with new architecture...');

    const { data: localSponsors } = await supabase
      .from('sponsors')
      .select('id, name');

    if (!localSponsors) {
      console.log('No local sponsors found');
      return new Response(
        JSON.stringify({ success: false, error: 'No sponsors found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const sponsorMap = new Map<string, string>();
    localSponsors.forEach(s => {
      sponsorMap.set(normalizeName(s.name), s.id);
    });

    const [forumSponsorsResult, forumEventsResult, nonForumSponsorsResult, nonForumEventsResult] = await Promise.all([
      forumEventClient.from('sponsors').select('*'),
      forumEventClient.from('forums').select('*'),
      nonForumEventClient.from('event_sponsors').select('*'),
      nonForumEventClient.from('events').select('*')
    ]);

    console.log('External data fetched:', {
      forumSponsors: forumSponsorsResult.data?.length || 0,
      forumEvents: forumEventsResult.data?.length || 0,
      nonForumSponsors: nonForumSponsorsResult.data?.length || 0,
      nonForumEvents: nonForumEventsResult.data?.length || 0,
    });

    interface EventData {
      event_name: string;
      event_type: string;
      event_date: string | null;
      event_location: string | null;
      event_venue: string | null;
      event_brand: string | null;
      source_event_id: string;
      source_database: string;
      minimum_attendees: number;
      sponsors: string[];
    }

    const eventsMap = new Map<string, EventData>();

    if (forumSponsorsResult.data && forumEventsResult.data) {
      const forumEventsById = new Map(forumEventsResult.data.map((e: any) => [e.id, e]));

      forumSponsorsResult.data.forEach((fs: any) => {
        const forum = forumEventsById.get(fs.forum_id);
        if (!forum) return;

        const sponsorKey = normalizeName(fs.name);
        const localSponsorId = sponsorMap.get(sponsorKey);

        if (!localSponsorId) return;

        const eventKey = `forum_event-${forum.id}`;

        if (!eventsMap.has(eventKey)) {
          const eventType = 'forum';
          eventsMap.set(eventKey, {
            event_name: forum.name,
            event_type: eventType,
            event_date: forum.date,
            event_location: forum.city,
            event_venue: forum.venue,
            event_brand: forum.brand,
            source_event_id: forum.id,
            source_database: 'forum_event',
            minimum_attendees: getDefaultMinimumAttendees(eventType),
            sponsors: []
          });
        }

        const eventData = eventsMap.get(eventKey)!;
        if (!eventData.sponsors.includes(localSponsorId)) {
          eventData.sponsors.push(localSponsorId);
        }
      });
    }

    if (nonForumSponsorsResult.data && nonForumEventsResult.data) {
      const nonForumEventsById = new Map(nonForumEventsResult.data.map((e: any) => [e.id, e]));

      nonForumSponsorsResult.data.forEach((es: any) => {
        const event = nonForumEventsById.get(es.event_id);
        if (!event) return;

        const sponsorKey = normalizeName(es.name);
        const localSponsorId = sponsorMap.get(sponsorKey);

        if (!localSponsorId) return;

        const eventKey = `non_forum_event-${event.id}`;

        if (!eventsMap.has(eventKey)) {
          const eventType = mapEventType(event.type || 'other');
          eventsMap.set(eventKey, {
            event_name: event.title || event.name || 'Unnamed Event',
            event_type: eventType,
            event_date: event.date,
            event_location: event.city || event.location,
            event_venue: event.venue,
            event_brand: event.brand,
            source_event_id: event.id,
            source_database: 'non_forum_event',
            minimum_attendees: getDefaultMinimumAttendees(eventType),
            sponsors: []
          });
        }

        const eventData = eventsMap.get(eventKey)!;
        if (!eventData.sponsors.includes(localSponsorId)) {
          eventData.sponsors.push(localSponsorId);
        }
      });
    }

    console.log('Unique events found:', eventsMap.size);

    const { data: existingEvents } = await supabase
      .from('events')
      .select('id, source_event_id, source_database');

    const existingEventMap = new Map<string, string>();
    if (existingEvents) {
      existingEvents.forEach(e => {
        const key = `${e.source_database}-${e.source_event_id}`;
        existingEventMap.set(key, e.id);
      });
    }

    const eventIdMap = new Map<string, string>();

    for (const [eventKey, eventData] of eventsMap) {
      const lookupKey = `${eventData.source_database}-${eventData.source_event_id}`;
      const existingId = existingEventMap.get(lookupKey);

      let eventId: string;

      if (existingId) {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            event_name: eventData.event_name,
            event_type: eventData.event_type,
            event_date: eventData.event_date,
            event_location: eventData.event_location,
            event_venue: eventData.event_venue,
            event_brand: eventData.event_brand,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId);

        if (updateError) {
          console.error('Error updating event:', updateError);
          continue;
        }
        eventId = existingId;
      } else {
        const { data: newEvent, error: insertError } = await supabase
          .from('events')
          .insert({
            event_name: eventData.event_name,
            event_type: eventData.event_type,
            event_date: eventData.event_date,
            event_location: eventData.event_location,
            event_venue: eventData.event_venue,
            event_brand: eventData.event_brand,
            source_event_id: eventData.source_event_id,
            source_database: eventData.source_database,
            minimum_attendees: eventData.minimum_attendees
          })
          .select('id')
          .single();

        if (insertError || !newEvent) {
          console.error('Error inserting event:', insertError, eventData);
          continue;
        }
        eventId = newEvent.id;
      }

      eventIdMap.set(eventKey, eventId);

      const { data: existingSponsorEvents, error: queryError } = await supabase
        .from('sponsor_events')
        .select('sponsor_id')
        .eq('event_id', eventId);

      if (queryError) {
        console.error('Error querying sponsor_events:', queryError);
        continue;
      }

      const existingSponsorIds = new Set(
        existingSponsorEvents?.map(se => se.sponsor_id) || []
      );

      for (const sponsorId of eventData.sponsors) {
        if (!existingSponsorIds.has(sponsorId)) {
          const { error: insertError } = await supabase
            .from('sponsor_events')
            .insert({
              sponsor_id: sponsorId,
              event_id: eventId,
              is_published: true
            });

          if (insertError) {
            console.error('Error inserting sponsor_event:', insertError, { sponsorId, eventId });
          } else {
            console.log('Successfully created sponsor_event:', { sponsorId, eventId, event_name: eventData.event_name });
          }
        }
      }
    }

    console.log('Sponsor events sync complete');
    return new Response(
      JSON.stringify({ success: true, events: eventsMap.size }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Sync events error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
