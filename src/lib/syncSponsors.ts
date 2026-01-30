import { supabase, forumEventClient, nonForumEventClient } from './supabase';

export function extractDomain(url: string | null): string {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname;
  } catch {
    return '';
  }
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '').trim();
}

export function formatEventType(eventType: string): string {
  const formatMap: Record<string, string> = {
    'forum': 'Forum',
    'dinner': 'Dinner',
    'vrt': 'VRT',
    'learn_go': 'Learn & Go',
    'activation': 'Activation',
    'veb': 'VEB',
    'other': 'Other'
  };
  return formatMap[eventType] || eventType;
}

export function formatEventTypePlural(eventType: string): string {
  const pluralMap: Record<string, string> = {
    'forum': 'Forums',
    'dinner': 'Dinners',
    'vrt': 'Virtual Roundtables',
    'learn_go': 'Learn and Gos',
    'activation': 'Community Activations',
    'veb': 'VEBs',
    'other': 'Other Events'
  };
  return pluralMap[eventType] || eventType;
}

export function mapEventType(externalType: string | null): string {
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

export async function syncSponsorEventsFromExternal() {
  try {
    console.log('Starting sponsor events sync with new architecture...');

    const { data: localSponsors } = await supabase
      .from('sponsors')
      .select('id, name');

    if (!localSponsors) {
      console.log('No local sponsors found');
      return { success: false, error: 'No sponsors found' };
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
    return { success: true, events: eventsMap.size };
  } catch (error) {
    console.error('Sync events error:', error);
    return { success: false, error };
  }
}

export async function syncSponsorsFromExternal() {
  try {
    console.log('Starting sponsor sync (profiles only)...');

    // Fetch only sponsor profiles from external databases
    const [forumSponsorsResult, eventSponsorsResult] = await Promise.all([
      forumEventClient.from('sponsors').select('*'),
      nonForumEventClient.from('event_sponsors').select('*')
    ]);

    console.log('External data fetched:', {
      forumSponsors: forumSponsorsResult.data?.length || 0,
      eventSponsors: eventSponsorsResult.data?.length || 0,
    });

    // Sync unique sponsors to the sponsors table
    const sponsorsToSync = new Map<string, any>();

    if (forumSponsorsResult.data) {
      console.log('Processing forum sponsors:', forumSponsorsResult.data.length);
      forumSponsorsResult.data.forEach((sponsor: any) => {
        const domain = extractDomain(sponsor.company_url);
        const key = normalizeName(sponsor.name);

        if (!sponsorsToSync.has(key)) {
          sponsorsToSync.set(key, {
            name: sponsor.name,
            url: sponsor.company_url,
            domain,
            logo_url: sponsor.logo_url,
            about: sponsor.about || '',
            sinc_rep: sponsor.sinc_rep,
          });
        } else {
          const existing = sponsorsToSync.get(key);
          if (domain && !existing.domain) {
            existing.domain = domain;
            existing.url = sponsor.company_url;
          }
          if (sponsor.logo_url && !existing.logo_url) {
            existing.logo_url = sponsor.logo_url;
          }
        }
      });
    }

    if (eventSponsorsResult.data) {
      console.log('Processing event sponsors:', eventSponsorsResult.data.length);
      eventSponsorsResult.data.forEach((sponsor: any) => {
        const key = normalizeName(sponsor.name);
        if (!sponsorsToSync.has(key) && sponsor.name) {
          sponsorsToSync.set(key, {
            name: sponsor.name,
            url: null,
            domain: '',
            logo_url: sponsor.logo_url,
            about: sponsor.about || '',
            sinc_rep: null,
          });
        }
      });
      console.log('Total unique sponsors to sync:', sponsorsToSync.size);
    }

    // Get existing sponsors from local DB
    const { data: existingSponsors } = await supabase
      .from('sponsors')
      .select('id, name, domain, url');

    const existingSponsorMap = new Map<string, any>();
    if (existingSponsors) {
      existingSponsors.forEach(s => {
        const key = normalizeName(s.name);
        existingSponsorMap.set(key, s);
      });
    }

    // Upsert sponsors
    for (const [key, sponsor] of sponsorsToSync) {
      const existing = existingSponsorMap.get(key);

      if (existing) {
        const updates: any = {};
        if (sponsor.logo_url && !existing.logo_url) updates.logo_url = sponsor.logo_url;
        if (sponsor.about) updates.about = sponsor.about;
        if (sponsor.sinc_rep && !existing.sinc_rep) updates.sinc_rep = sponsor.sinc_rep;
        if (sponsor.url && !existing.url) updates.url = sponsor.url;

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('sponsors')
            .update(updates)
            .eq('id', existing.id);
        }
      } else {
        await supabase
          .from('sponsors')
          .insert({
            name: sponsor.name,
            url: sponsor.url,
            domain: sponsor.domain,
            logo_url: sponsor.logo_url,
            about: sponsor.about,
            sinc_rep: sponsor.sinc_rep,
          });
      }
    }

    console.log('Sponsor sync complete:', { synced: sponsorsToSync.size });

    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error };
  }
}

export async function syncAttendeesFromExternal() {
  try {
    console.log('Starting attendees sync...');

    const { data: localSponsors } = await supabase
      .from('sponsors')
      .select('id, name');

    if (!localSponsors) {
      console.log('No local sponsors found');
      return { success: false, error: 'No sponsors found' };
    }

    const sponsorMap = new Map<string, string>();
    localSponsors.forEach(s => {
      sponsorMap.set(normalizeName(s.name), s.id);
    });

    const { data: localEvents } = await supabase
      .from('events')
      .select('id, source_event_id, source_database');

    if (!localEvents) {
      console.log('No local events found');
      return { success: false, error: 'No events found' };
    }

    const eventMap = new Map<string, string>();
    localEvents.forEach(e => {
      const key = `${e.source_database}-${e.source_event_id}`;
      eventMap.set(key, e.id);
    });

    const [forumSponsorsResult, forumAttendeesResult, nonForumAttendeesResult] = await Promise.all([
      forumEventClient.from('sponsors').select('*'),
      forumEventClient.from('attendees').select('*'),
      nonForumEventClient.from('attendees').select('*')
    ]);

    console.log('External attendee data fetched:', {
      forumSponsors: forumSponsorsResult.data?.length || 0,
      forumAttendees: forumAttendeesResult.data?.length || 0,
      nonForumAttendees: nonForumAttendeesResult.data?.length || 0,
    });

    let syncedCount = 0;

    if (forumSponsorsResult.data && forumAttendeesResult.data) {
      for (const forumSponsor of forumSponsorsResult.data) {
        const localSponsorId = sponsorMap.get(normalizeName(forumSponsor.name));
        if (!localSponsorId) continue;

        const eventKey = `forum_event-${forumSponsor.forum_id}`;
        const localEventId = eventMap.get(eventKey);
        if (!localEventId) continue;

        for (const attendee of forumAttendeesResult.data) {
          if (attendee.forum_id !== forumSponsor.forum_id) continue;

          const { data: existing } = await supabase
            .from('sponsor_leads')
            .select('id')
            .eq('sponsor_id', localSponsorId)
            .eq('event_id', localEventId)
            .eq('email', attendee.email)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase
              .from('sponsor_leads')
              .insert({
                sponsor_id: localSponsorId,
                event_id: localEventId,
                attendee_id: attendee.id,
                name: attendee.name || `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim(),
                first_name: attendee.first_name,
                last_name: attendee.last_name,
                email: attendee.email,
                alternative_email: attendee.email_2,
                company: attendee.company,
                title: attendee.title,
                register_number: attendee.phone,
                alternative_number: attendee.phone_2,
                wishlist: attendee.wishlist,
                stage: attendee.stage,
                attendance_status: attendee.approval_status === '2' ? 'attended' : 'pending',
                source_database: 'forum_event'
              });

            if (!error) {
              syncedCount++;
            }
          }
        }
      }
    }

    if (nonForumAttendeesResult.data) {
      for (const attendee of nonForumAttendeesResult.data) {
        if (!attendee.event_id) continue;

        const eventKey = `non_forum_event-${attendee.event_id}`;
        const localEventId = eventMap.get(eventKey);
        if (!localEventId) continue;

        if (!attendee.sponsor_name) continue;
        const localSponsorId = sponsorMap.get(normalizeName(attendee.sponsor_name));
        if (!localSponsorId) continue;

        const { data: existing } = await supabase
          .from('sponsor_leads')
          .select('id')
          .eq('sponsor_id', localSponsorId)
          .eq('event_id', localEventId)
          .eq('email', attendee.email)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from('sponsor_leads')
            .insert({
              sponsor_id: localSponsorId,
              event_id: localEventId,
              attendee_id: attendee.id,
              name: attendee.name || `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim(),
              first_name: attendee.first_name,
              last_name: attendee.last_name,
              email: attendee.email,
              alternative_email: attendee.email_2,
              company: attendee.company,
              title: attendee.title,
              register_number: attendee.phone,
              alternative_number: attendee.phone_2,
              wishlist: attendee.wishlist,
              stage: attendee.stage,
              attendance_status: attendee.approval_status === '2' ? 'attended' : 'pending',
              source_database: 'non_forum_event'
            });

          if (!error) {
            syncedCount++;
          }
        }
      }
    }

    console.log('Attendees sync complete:', { synced: syncedCount });
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error('Sync attendees error:', error);
    return { success: false, error };
  }
}
