import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function extractDomain(url: string | null): string {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname;
  } catch {
    return '';
  }
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '').trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const preview = body.preview === true;

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

    console.log('Starting sponsor sync (profiles only)...');

    const [forumSponsorsResult, eventSponsorsResult] = await Promise.all([
      forumEventClient.from('sponsors').select('*'),
      nonForumEventClient.from('event_sponsors').select('*')
    ]);

    console.log('External data fetched:', {
      forumSponsors: forumSponsorsResult.data?.length || 0,
      eventSponsors: eventSponsorsResult.data?.length || 0,
    });

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

    const newSponsors: any[] = [];
    const updatedSponsors: any[] = [];

    for (const [key, sponsor] of sponsorsToSync) {
      const existing = existingSponsorMap.get(key);

      if (existing) {
        const updates: any = {};
        if (sponsor.logo_url && !existing.logo_url) updates.logo_url = sponsor.logo_url;
        if (sponsor.about) updates.about = sponsor.about;
        if (sponsor.sinc_rep && !existing.sinc_rep) updates.sinc_rep = sponsor.sinc_rep;
        if (sponsor.url && !existing.url) updates.url = sponsor.url;

        if (Object.keys(updates).length > 0) {
          updatedSponsors.push({
            name: sponsor.name,
            updates: Object.keys(updates)
          });

          if (!preview) {
            await supabase
              .from('sponsors')
              .update(updates)
              .eq('id', existing.id);
          }
        }
      } else {
        newSponsors.push({
          name: sponsor.name,
          url: sponsor.url,
          logo_url: sponsor.logo_url,
          sinc_rep: sponsor.sinc_rep
        });

        if (!preview) {
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
    }

    console.log('Sponsor sync complete:', { synced: sponsorsToSync.size, preview });

    return new Response(
      JSON.stringify({
        success: true,
        preview,
        synced: sponsorsToSync.size,
        newSponsors,
        updatedSponsors
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
